package br.org.ens.mural;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record MomentoMuralDto(
        String id,
        String equipeId,
        String titulo,
        LocalDate data,
        String categoria,
        String descricao,
        List<String> fotos,
        String autorCasalId,
        String autorNome,
        LocalDateTime criadoEm) {

    public static MomentoMuralDto from(MomentoMural m) {
        return new MomentoMuralDto(
                m.getId(),
                m.getEquipeId(),
                m.getTitulo(),
                m.getData(),
                m.getCategoria(),
                m.getDescricao(),
                m.getFotos(),
                m.getAutorCasalId(),
                m.getAutorNome(),
                m.getCriadoEm());
    }
}
