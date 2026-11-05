package br.org.ens.usuario.dto;

import br.org.ens.usuario.PerfilUsuario;
import br.org.ens.usuario.StatusUsuario;
import br.org.ens.usuario.TipoUsuario;
import br.org.ens.usuario.Usuario;
import java.time.Instant;
import java.util.Set;

public record UsuarioDto(
        String id,
        String email,
        String nome,
        TipoUsuario tipoUsuario,
        String casalId,
        String sceId,
        String equipeId,
        String setorId,
        String regiaoId,
        Set<PerfilUsuario> perfis,
        StatusUsuario status,
        Instant criadoEm,
        Instant ultimoAcessoEm
) {
    public static UsuarioDto fromEntity(Usuario u) {
        return new UsuarioDto(
                u.getId(),
                u.getEmail(),
                u.getNome(),
                u.getTipoUsuario(),
                u.getCasalId(),
                u.getSceId(),
                u.getEquipeId(),
                u.getSetorId(),
                u.getRegiaoId(),
                u.getPerfis(),
                u.getStatus(),
                u.getCriadoEm(),
                u.getUltimoAcessoEm()
        );
    }
}

