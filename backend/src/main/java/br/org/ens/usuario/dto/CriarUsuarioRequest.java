package br.org.ens.usuario.dto;

import br.org.ens.usuario.PerfilUsuario;
import br.org.ens.usuario.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

public record CriarUsuarioRequest(
        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        String senha,

        TipoUsuario tipoUsuario,

        String casalId,
        String sceId,
        String equipeId,
        String setorId,
        String regiaoId,

        @NotEmpty(message = "Pelo menos um perfil deve ser informado")
        Set<PerfilUsuario> perfis
) {
}

