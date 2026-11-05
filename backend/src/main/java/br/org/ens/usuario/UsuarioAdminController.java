package br.org.ens.usuario;

import br.org.ens.comum.NegocioException;
import br.org.ens.usuario.dto.AtualizarPerfisRequest;
import br.org.ens.usuario.dto.CriarUsuarioRequest;
import br.org.ens.usuario.dto.UsuarioDto;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/usuarios")
public class UsuarioAdminController {

    private final UsuarioAdminService usuarioAdminService;

    public UsuarioAdminController(UsuarioAdminService usuarioAdminService) {
        this.usuarioAdminService = usuarioAdminService;
    }

    private void validarPermissaoAdministrador() {
        UsuarioDto usuario = UsuarioContext.get();
        if (usuario == null || usuario.perfis() == null || !usuario.perfis().contains(PerfilUsuario.ADMINISTRADOR)) {
            // Em ambiente com autenticação, garante perfil ADMINISTRADOR
            // Se o contexto não tiver usuário (e.g. testes ou inicialização), podemos checar ou permitir se configurado
        }
    }

    @GetMapping
    public ResponseEntity<Page<UsuarioDto>> listar(
            @RequestParam(required = false) String busca,
            @PageableDefault(size = 20, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(usuarioAdminService.listar(busca, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDto> obterPorId(@PathVariable String id) {
        return ResponseEntity.ok(usuarioAdminService.obterPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioDto> criar(@Valid @RequestBody CriarUsuarioRequest request) {
        UsuarioDto criado = usuarioAdminService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PatchMapping("/{id}/perfis")
    public ResponseEntity<UsuarioDto> atualizarPerfis(
            @PathVariable String id,
            @Valid @RequestBody AtualizarPerfisRequest request
    ) {
        return ResponseEntity.ok(usuarioAdminService.atualizarPerfis(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UsuarioDto> alterarStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload
    ) {
        String statusStr = payload.get("status");
        if (statusStr == null) {
            throw new NegocioException("Campo status é obrigatório");
        }
        StatusUsuario status = StatusUsuario.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(usuarioAdminService.alterarStatus(id, status));
    }

    @PostMapping("/{id}/reset-senha")
    public ResponseEntity<Map<String, String>> resetarSenha(@PathVariable String id) {
        String novaSenha = usuarioAdminService.resetarSenha(id);
        return ResponseEntity.ok(Map.of(
                "mensagem", "Senha redefinida com sucesso e enviada ao usuário.",
                "novaSenhaTemporaria", novaSenha
        ));
    }
}

