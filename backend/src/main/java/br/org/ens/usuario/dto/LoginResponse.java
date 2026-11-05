package br.org.ens.usuario.dto;

import br.org.ens.usuario.PerfilUsuario;
import br.org.ens.usuario.TipoUsuario;
import java.util.Set;

public record LoginResponse(
        String token,
        String usuarioId,
        String nome,
        String email,
        TipoUsuario tipoUsuario,
        Set<PerfilUsuario> perfis,
        String casalId,
        String sceId,
        String equipeId,
        String setorId,
        String regiaoId
) {
}

