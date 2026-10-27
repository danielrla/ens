package br.org.ens.reuniao;

public record PresencaCasal(
        String casalId,
        StatusPresenca status,
        String observacao) {
}
