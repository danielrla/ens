package br.org.ens.usuario;

import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UsuarioSeed implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UsuarioSeed.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioSeed(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario(
                    "admin@ens.org.br",
                    passwordEncoder.encode("Admin@ENS2026"),
                    "Administrador do Sistema",
                    TipoUsuario.INDIVIDUAL,
                    Set.of(PerfilUsuario.ADMINISTRADOR)
            );
            usuarioRepository.save(admin);
            log.info("=== SEED EXECUTADO: Usuário administrador criado (admin@ens.org.br / Admin@ENS2026) ===");
        }
    }
}

