package br.org.ens.usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expiracaoHoras;

    public JwtService(
            @Value("${seguranca.jwt.secret}") String secret,
            @Value("${seguranca.jwt.expiracao-horas:24}") long expiracaoHoras
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiracaoHoras = expiracaoHoras;
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        Instant exp = agora.plus(expiracaoHoras, ChronoUnit.HOURS);

        List<String> perfisStr = usuario.getPerfis().stream()
                .map(Enum::name)
                .toList();

        return Jwts.builder()
                .subject(usuario.getId())
                .claim("email", usuario.getEmail())
                .claim("nome", usuario.getNome())
                .claim("tipoUsuario", usuario.getTipoUsuario() != null ? usuario.getTipoUsuario().name() : null)
                .claim("perfis", perfisStr)
                .claim("casalId", usuario.getCasalId())
                .claim("sceId", usuario.getSceId())
                .claim("equipeId", usuario.getEquipeId())
                .claim("setorId", usuario.getSetorId())
                .claim("regiaoId", usuario.getRegiaoId())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(exp))
                .signWith(signingKey)
                .compact();
    }

    public Claims validarETrazerClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean tokenValido(String token) {
        try {
            Claims claims = validarETrazerClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }
}

