package br.org.ens.usuario;

import br.org.ens.usuario.dto.UsuarioDto;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AutenticacaoFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public AutenticacaoFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            try {
                if (jwtService.tokenValido(token)) {
                    Claims claims = jwtService.validarETrazerClaims(token);
                    String userId = claims.getSubject();

                    usuarioRepository.findById(userId).ifPresent(usuario -> {
                        if (usuario.getStatus() == StatusUsuario.ATIVO) {
                            UsuarioDto dto = UsuarioDto.fromEntity(usuario);
                            UsuarioContext.set(dto);
                            request.setAttribute("USUARIO_LOGADO", dto);
                        }
                    });
                }
            } catch (Exception ignored) {
                // Token inválido ou expirado, segue sem autenticar
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            UsuarioContext.clear();
        }
    }
}

