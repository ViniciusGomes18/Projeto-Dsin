using System;
using DSIN.Business.DTOs;

namespace DSIN.Business.Validator;

public static class TicketValidator
{
    public static void ValidateAnalyzeRequest(Guid agentId, string imageBase64, CancellationToken ct)
    {
        if (agentId == Guid.Empty)
            throw new ArgumentException("AgentId inválido.", nameof(agentId));

        if (string.IsNullOrWhiteSpace(imageBase64))
            throw new ArgumentException("ImageBase64 é obrigatório.", nameof(imageBase64));

        if (ct.IsCancellationRequested)
            throw new OperationCanceledException("A requisição foi cancelada.");
    }

    public static void ValidatePlate(string? plate)
    {
        if (string.IsNullOrWhiteSpace(plate))
            throw new InvalidOperationException("OCR não retornou placa do veículo.");
    }

    public static string Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? "Desconhecido" : value;

    public static int NormalizeTake(int take)
    {
        if (take <= 0) return 50;
        if (take > 200) return 200;
        return take;
    }
}