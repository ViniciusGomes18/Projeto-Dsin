using DSIN.Business.DTOs;
using DSIN.Business.Interfaces.IRepositories;
using DSIN.Business.Interfaces.IServices;
using DSIN.Business.Models;
using DSIN.Business.Validator;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace DSIN.Business.Services;

public sealed class TicketBookService : ITicketBookService
{
    private readonly IOcrClient _ocr;
    private readonly ITicketBookRepository _tickets;
    private readonly IVehicleRepository _vehicles;
    private readonly IDriverRepository _drivers;
    private readonly IUnitOfWork _uow;

    public TicketBookService(
        IOcrClient ocr,
        ITicketBookRepository tickets,
        IVehicleRepository vehicles,
        IDriverRepository drivers,
        IUnitOfWork uow)
    {
        _ocr = ocr;
        _tickets = tickets;
        _vehicles = vehicles;
        _drivers = drivers;
        _uow = uow;
    }

    public async Task<TicketBookResponseDto> AnalyzeAsync(Guid agentId, string imageBase64, CancellationToken ct)
    {
        TicketValidator.ValidateAnalyzeRequest(agentId, imageBase64, ct);

        var ocr = await _ocr.AnalyzeAsync(new OcrExternalRequestDto { ImageBase64 = imageBase64 }, ct);
        TicketValidator.ValidatePlate(ocr.Plate);

        var vehicle = await _vehicles.GetByPlateAsync(ocr.Plate!, ct);
        if (vehicle == null)
        {
            vehicle = new Vehicle(Guid.NewGuid(), ocr.Plate!,
                TicketValidator.Normalize(ocr.VehicleColor),
                TicketValidator.Normalize(ocr.VehicleModel));

            await _vehicles.AddAsync(vehicle, ct);
        }

        Driver? driver = null;
        if (!string.IsNullOrWhiteSpace(ocr.DriverCpf))
            driver = await _drivers.GetByCpfAsync(ocr.DriverCpf, ct);

        if (driver == null && !string.IsNullOrWhiteSpace(ocr.DriverName))
        {
            driver = new Driver(Guid.NewGuid(), ocr.DriverName, ocr.DriverCpf);
            await _drivers.AddAsync(driver, ct);
        }

        var ticket = new TicketBook(Guid.NewGuid(), agentId, vehicle.Id, driver?.Id,
            ocr.Plate, ocr.VehicleModel, ocr.VehicleColor,
            ocr.DriverName, ocr.DriverCpf,
            ocr.ViolationCode, ocr.ViolationDescription,
            ocr.OccurredAt, ocr.Location, imageBase64);

        await _tickets.AddAsync(ticket, ct);
        await _uow.SaveChangesAsync(ct);

        return TicketBookMapper.ToResponse(ticket);
    }

    public async Task<PagedResult<TicketBookSummaryDto>> ListByAgentAsync(Guid agentId, int skip, int take, CancellationToken ct)
    {
        if (agentId == Guid.Empty)
            throw new ArgumentException("AgentId inválido.", nameof(agentId));

        take = TicketValidator.NormalizeTake(take);

        var total = await _tickets.CountByAgentAsync(agentId, ct);
        var items = await _tickets.ListByAgentAsync(agentId, skip, take, ct);

        return new PagedResult<TicketBookSummaryDto>
        {
            Total = total,
            Items = items.Select(TicketBookMapper.ToSummary).ToList()
        };
    }

    public async Task<TicketBookDetailsDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Ticket Guid inválido.", nameof(id));

        var ticket = await _tickets.GetByIdAsync(id, ct);
        return ticket == null ? null : TicketBookMapper.ToDetails(ticket);
    }
}