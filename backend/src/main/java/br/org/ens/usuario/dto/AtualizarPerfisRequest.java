package br.org.ens.usuario.dto;

import br.org.ens.usuario.PerfilUsuario;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

public record AtualizarPerfisRequest(
        @NotEmpty(message = "Pelo menos um perfil deve ser informado")
        Set<PerfilUsuario> perfis
) {
}

