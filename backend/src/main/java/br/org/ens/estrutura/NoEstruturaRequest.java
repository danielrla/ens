package br.org.ens.estrutura;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NoEstruturaRequest(
        @NotBlank(message = "Nome é obrigatório") String nome,
        @NotNull(message = "Nível é obrigatório") NivelEstrutura nivel,
        String paiId) {
}
