using DSIN.Business.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace DSIN.Business.Security;

public sealed class JwtTokenGenerator
{
    private readonly IConfiguration _config;

    public JwtTokenGenerator(IConfiguration config)
    {
        _config = config;
    }

    public string Generate(Agent agent, DateTime nowUtc, out DateTime expiresUtc)
    {
        var issuer = _config["Jwt:Issuer"] ?? "DSIN.Api";
        var audience = _config["Jwt:Audience"] ?? "DSIN.Client";
        var keyStr = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
        var minutes = int.TryParse(_config["Jwt:ExpiresMinutes"], out var m) ? m : 60;

        expiresUtc = nowUtc.AddMinutes(minutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, agent.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, agent.Id.ToString()),
            new Claim(ClaimTypes.Name, agent.Name),
            new Claim(ClaimTypes.Email, agent.Email),
            new Claim(ClaimTypes.Email, agent.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: nowUtc,
            expires: expiresUtc,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}