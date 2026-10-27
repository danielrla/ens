package br.org.ens.casal;

public record Endereco(
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        String cep,
        Double latitude,
        Double longitude) {
}
