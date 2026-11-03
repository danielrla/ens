package br.org.ens.usuario;

import br.org.ens.comum.EmailService;
import br.org.ens.comum.NegocioException;
import br.org.ens.usuario.dto.AtualizarPerfisRequest;
import br.org.ens.usuario.dto.CriarUsuarioRequest;
import br.org.ens.usuario.dto.UsuarioDto;
import java.security.SecureRandom;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public UsuarioAdminService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public Page<UsuarioDto> listar(String busca, Pageable pageable) {
        if (busca != null && !busca.isBlank()) {
            return usuarioRepository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(busca.trim(), busca.trim(), pageable)
                    .map(UsuarioDto::fromEntity);
        }
        return usuarioRepository.findAll(pageable)
                .map(UsuarioDto::fromEntity);
    }

    public UsuarioDto obterPorId(String id) {
        return usuarioRepository.findById(id)
                .map(UsuarioDto::fromEntity)
                .orElseThrow(() -> new NegocioException("Usuário não encontrado: " + id));
    }

    public UsuarioDto criar(CriarUsuarioRequest req) {
        if (usuarioRepository.existsByEmailIgnoreCase(req.email().trim())) {
            throw new NegocioException("Já existe um usuário cadastrado com o e-mail: " + req.email());
        }

        String senhaPlana = (req.senha() != null && !req.senha().isBlank())
                ? req.senha().trim()
                : gerarSenhaTemporaria();

        TipoUsuario tipo = calcularTipoUsuario(req.perfis());

        Usuario usuario = new Usuario(
                req.email().trim().toLowerCase(),
                passwordEncoder.encode(senhaPlana),
                req.nome().trim(),
                tipo,
                req.perfis()
        );

        usuario.setCasalId(req.casalId());
        usuario.setSceId(req.sceId());
        usuario.setEquipeId(req.equipeId());
        usuario.setSetorId(req.setorId());
        usuario.setRegiaoId(req.regiaoId());

        Usuario salvo = usuarioRepository.save(usuario);

        emailService.enviarEmail(
                salvo.getEmail(),
                "Acesso criado no Portal ENS",
                "Olá, " + salvo.getNome() + "!\n\n"
                        + "Seu usuário de acesso ao Portal das Equipes de Nossa Senhora foi criado.\n"
                        + "E-mail de acesso: " + salvo.getEmail() + "\n"
                        + "Senha temporária: " + senhaPlana + "\n\n"
                        + "Recomendamos que você altere sua senha no primeiro acesso.\n\n"
                        + "Equipes de Nossa Senhora"
        );

        return UsuarioDto.fromEntity(salvo);
    }

    public UsuarioDto atualizarPerfis(String id, AtualizarPerfisRequest req) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NegocioException("Usuário não encontrado: " + id));

        usuario.setPerfis(req.perfis());
        usuario.setTipoUsuario(calcularTipoUsuario(req.perfis()));

        return UsuarioDto.fromEntity(usuarioRepository.save(usuario));
    }

    public UsuarioDto alterarStatus(String id, StatusUsuario novoStatus) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NegocioException("Usuário não encontrado: " + id));

        usuario.setStatus(novoStatus);
        return UsuarioDto.fromEntity(usuarioRepository.save(usuario));
    }

    public String resetarSenha(String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NegocioException("Usuário não encontrado: " + id));

        String novaSenhaTemp = gerarSenhaTemporaria();
        usuario.setSenhaHash(passwordEncoder.encode(novaSenhaTemp));
        usuario.setTokenResetSenha(null);
        usuario.setExpiracaoTokenReset(null);
        usuarioRepository.save(usuario);

        emailService.enviarEmail(
                usuario.getEmail(),
                "Sua senha foi redefinida - ENS",
                "Olá, " + usuario.getNome() + "!\n\n"
                        + "Um administrador redefiniu a sua senha no Portal ENS.\n"
                        + "Sua nova senha temporária é: " + novaSenhaTemp + "\n\n"
                        + "Faça login e altere sua senha para sua segurança.\n\n"
                        + "Equipes de Nossa Senhora"
        );

        return novaSenhaTemp;
    }

    private TipoUsuario calcularTipoUsuario(Set<PerfilUsuario> perfis) {
        if (perfis == null || perfis.isEmpty()) {
            return TipoUsuario.CASAL;
        }
        boolean apenasIndividuais = perfis.stream().allMatch(p -> p == PerfilUsuario.ADMINISTRADOR || p == PerfilUsuario.SACERDOTE);
        return apenasIndividuais ? TipoUsuario.INDIVIDUAL : TipoUsuario.CASAL;
    }

    private String gerarSenhaTemporaria() {
        int numero = 100000 + random.nextInt(900000);
        return "ENS@" + numero;
    }
}

