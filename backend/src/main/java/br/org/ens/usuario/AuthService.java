package br.org.ens.usuario;

import br.org.ens.comum.EmailService;
import br.org.ens.comum.NegocioException;
import br.org.ens.usuario.dto.EsqueciSenhaRequest;
import br.org.ens.usuario.dto.LoginRequest;
import br.org.ens.usuario.dto.LoginResponse;
import br.org.ens.usuario.dto.ResetSenhaRequest;
import br.org.ens.usuario.dto.UsuarioDto;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final String appFrontendUrl;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            @Value("${app.frontend.url:http://localhost:4200}") String appFrontendUrl
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.appFrontendUrl = appFrontendUrl;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new NegocioException("Credenciais inválidas"));

        if (usuario.getStatus() == StatusUsuario.BLOQUEADO) {
            throw new NegocioException("Usuário bloqueado. Entre em contato com a administração.");
        }

        if (!passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            throw new NegocioException("Credenciais inválidas");
        }

        usuario.setUltimoAcessoEm(Instant.now());
        usuarioRepository.save(usuario);

        String token = jwtService.gerarToken(usuario);

        return new LoginResponse(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario(),
                usuario.getPerfis(),
                usuario.getCasalId(),
                usuario.getSceId(),
                usuario.getEquipeId(),
                usuario.getSetorId(),
                usuario.getRegiaoId()
        );
    }

    public void solicitarResetSenha(EsqueciSenhaRequest request) {
        usuarioRepository.findByEmailIgnoreCase(request.email().trim()).ifPresent(usuario -> {
            String token = UUID.randomUUID().toString();
            usuario.setTokenResetSenha(token);
            usuario.setExpiracaoTokenReset(Instant.now().plus(2, ChronoUnit.HOURS));
            usuarioRepository.save(usuario);

            String linkReset = appFrontendUrl + "/reset-senha?token=" + token;
            String mensagem = "Olá, " + usuario.getNome() + "!\n\n"
                    + "Você solicitou a redefinição de senha para o portal ENS.\n"
                    + "Clique no link abaixo ou cole no seu navegador para cadastrar uma nova senha:\n"
                    + linkReset + "\n\n"
                    + "Token de verificação: " + token + "\n"
                    + "Este link expira em 2 horas.\n\n"
                    + "Se você não solicitou esta alteração, desconsidere este e-mail.\n\n"
                    + "Equipes de Nossa Senhora";

            emailService.enviarEmail(usuario.getEmail(), "Recuperação de Senha - ENS", mensagem);
        });
    }

    public void redefinirSenha(ResetSenhaRequest request) {
        Usuario usuario = usuarioRepository.findByTokenResetSenha(request.token().trim())
                .orElseThrow(() -> new NegocioException("Token de recuperação inválido ou expirado"));

        if (usuario.getExpiracaoTokenReset() == null || usuario.getExpiracaoTokenReset().isBefore(Instant.now())) {
            throw new NegocioException("Token de recuperação expirado. Solicite uma nova redefinição.");
        }

        usuario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        usuario.setTokenResetSenha(null);
        usuario.setExpiracaoTokenReset(null);
        usuarioRepository.save(usuario);
    }

    public UsuarioDto obterUsuarioLogado(String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NegocioException("Usuário não encontrado"));
        return UsuarioDto.fromEntity(usuario);
    }
}

