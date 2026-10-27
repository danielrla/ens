package br.org.ens.casal.movimentacao;

import java.time.LocalDate;

public record MovimentacaoDto(
        String id,
        String casalId,
        TipoMovimentacao tipo,
        String equipeOrigemId,
        String nomeEquipeOrigem,
        String equipeDestinoId,
        String nomeEquipeDestino,
        LocalDate data,
        String motivo,
        String observacoes) {

    public static MovimentacaoDto from(MovimentacaoCasal m, String nomeEquipeOrigem, String nomeEquipeDestino) {
        return new MovimentacaoDto(
                m.getId(),
                m.getCasalId(),
                m.getTipo(),
                m.getEquipeOrigemId(),
                nomeEquipeOrigem,
                m.getEquipeDestinoId(),
                nomeEquipeDestino,
                m.getData(),
                m.getMotivo(),
                m.getObservacoes());
    }
}
