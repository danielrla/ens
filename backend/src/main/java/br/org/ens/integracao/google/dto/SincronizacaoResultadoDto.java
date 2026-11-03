package br.org.ens.integracao.google.dto;

import java.util.List;

public record SincronizacaoResultadoDto(
        boolean sucesso,
        String mensagem,
        int itensSincronizados,
        List<String> detalhes
) {
    public static SincronizacaoResultadoDto sucesso(String mensagem, int total, List<String> detalhes) {
        return new SincronizacaoResultadoDto(true, mensagem, total, detalhes != null ? detalhes : List.of());
    }

    public static SincronizacaoResultadoDto erro(String mensagem, List<String> detalhes) {
        return new SincronizacaoResultadoDto(false, mensagem, 0, detalhes != null ? detalhes : List.of());
    }
}
