package br.org.ens.usuario;

import br.org.ens.comum.NegocioException;
import br.org.ens.usuario.dto.EsqueciSenhaRequest;
import br.org.ens.usuario.dto.LoginRequest;
import br.org.ens.usuario.dto.LoginResponse;
import br.org.ens.usuario.dto.ResetSenhaRequest;
import br.org.ens.usuario.dto.UsuarioDto;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<Map<String, String>> esqueciSenha(@Valid @RequestBody EsqueciSenhaRequest request) {
        authService.solicitarResetSenha(request);
        return ResponseEntity.ok(Map.of("mensagem", "Se o e-mail estiver cadastrado, as instruções foram enviadas."));
    }

    @PostMapping("/reset-senha")
    public ResponseEntity<Map<String, String>> resetSenha(@Valid @RequestBody ResetSenhaRequest request) {
        authService.redefinirSenha(request);
        return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso. Faça login com a nova senha."));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDto> me() {
        UsuarioDto usuarioDto = UsuarioContext.get();
        if (usuarioDto == null) {
            throw new NegocioException("Não autenticado");
        }
        return ResponseEntity.ok(authService.obterUsuarioLogado(usuarioDto.id()));
    }
}

