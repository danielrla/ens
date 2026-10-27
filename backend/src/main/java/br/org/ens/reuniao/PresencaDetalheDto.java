package br.org.ens.reuniao;

public record PresencaDetalheDto(
        String casalId,
        String nomeCasal,
        StatusPresenca status,
        String observacao) {
}
