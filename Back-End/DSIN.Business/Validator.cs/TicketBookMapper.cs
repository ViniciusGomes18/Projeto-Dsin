using DSIN.Business.DTOs;
using DSIN.Business.Models;

namespace DSIN.Business.Validator;

public static class TicketBookMapper
{
    public static TicketBookSummaryDto ToSummary(TicketBook t) => new()
    {
        Id = t.Id,
        AgentId = t.AgentId,
        VehicleId = t.VehicleId,
        DriverId = t.DriverId,
        Plate = t.PlateSnapshot,
        VehicleModel = t.VehicleModelSnapshot,
        VehicleColor = t.VehicleColorSnapshot,
        DriverName = t.DriverNameSnapshot,
        DriverCpf = t.DriverCpfSnapshot,
        ViolationCode = t.ViolationCode,
        ViolationDescription = t.ViolationDescription,
        OccurredAt = t.OccurredAt,
        Location = t.Location
    };

    public static TicketBookDetailsDto ToDetails(TicketBook t) => new()
    {
        Id = t.Id,
        AgentId = t.AgentId,
        VehicleId = t.VehicleId,
        DriverId = t.DriverId,
        Plate = t.PlateSnapshot,
        VehicleModel = t.VehicleModelSnapshot,
        VehicleColor = t.VehicleColorSnapshot,
        DriverName = t.DriverNameSnapshot,
        DriverCpf = t.DriverCpfSnapshot,
        ViolationCode = t.ViolationCode,
        ViolationDescription = t.ViolationDescription,
        OccurredAt = t.OccurredAt,
        Location = t.Location,
        TicketImageBase64 = t.TicketImageBase64
    };

    public static TicketBookResponseDto ToResponse(TicketBook t) => new()
    {
        AgentId = t.AgentId,
        Plate = t.PlateSnapshot,
        VehicleModel = t.VehicleModelSnapshot,
        VehicleColor = t.VehicleColorSnapshot,
        ViolationCode = t.ViolationCode,
        ViolationDescription = t.ViolationDescription,
        OccurredAt = t.OccurredAt,
        Location = t.Location,
        DriverName = t.DriverNameSnapshot,
        DriverCpf = t.DriverCpfSnapshot
    };
}