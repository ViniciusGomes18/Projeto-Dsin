using static BCrypt.Net.BCrypt;
using DSIN.Business.DTOs;
using DSIN.Business.Interfaces.IRepositories;
using DSIN.Business.Interfaces.IServices;
using DSIN.Business.Models;
using DSIN.Business.Security;

namespace DSIN.Business.Services;

public sealed class AgentService : IAgentService
{
    private readonly IAgentRepository _agents;
    private readonly JwtTokenGenerator _jwt;

    public AgentService(
        IAgentRepository agents,
        JwtTokenGenerator jwtTokenGenerator)
    {
        _agents = agents;
        _jwt = jwtTokenGenerator;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, CancellationToken ct)
    {
        var agent = await _agents.GetByEmailAsync(request.Email, ct);
        if (agent is null) return null;

        if (!Verify(request.Password, agent.PasswordHash))
            return null;

        var now = DateTime.UtcNow;
        var token = _jwt.Generate(agent, now, out var exp);

        return new LoginResponseDto
        {
            AccessToken = token,
            ExpiresInSeconds = (int)(exp - now).TotalSeconds,
            Agent = new { agent.Id, agent.Name, agent.Email }
        };
    }
}