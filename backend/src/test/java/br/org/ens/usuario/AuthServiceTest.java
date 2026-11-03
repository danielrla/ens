package br.org.ens.usuario;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import br.org.ens.comum.EmailService;
import br.org.ens.usuario.dto.LoginRequest;
import br.org.ens.usuario.dto.LoginResponse;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private EmailService emailService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService("ens-super-secret-key-jwt-antigravity-2026-cuiaba-token-32b!", 24);
        emailService = mock(EmailService.class);
        authService = new AuthService(usuarioRepository, passwordEncoder, jwtService, emailService, "http://localhost:4200");
    }

    @Test
    void deveFazerLoginComSucesso() {
        Usuario usuario = new Usuario(
                "usuario@ens.org.br",
                passwordEncoder.encode("senha123"),
                "José e Maria",
                TipoUsuario.CASAL,
                Set.of(PerfilUsuario.MEMBRO_EQUIPE)
        );
        usuario.setEquipeId("eq-1");

        when(usuarioRepository.findByEmailIgnoreCase("usuario@ens.org.br"))
                .thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        LoginResponse resp = authService.login(new LoginRequest("usuario@ens.org.br", "senha123"));

        assertNotNull(resp);
        assertNotNull(resp.token());
        assertEquals("usuario@ens.org.br", resp.email());
        assertEquals("José e Maria", resp.nome());
        assertTrue(resp.perfis().contains(PerfilUsuario.MEMBRO_EQUIPE));
        assertTrue(jwtService.tokenValido(resp.token()));
    }
}

