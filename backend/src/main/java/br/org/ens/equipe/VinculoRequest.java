package br.org.ens.equipe;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VinculoRequest(
        @NotBlank(message = "ID do casal é obrigatório") String casalId,
        @NotNull(message = "Papel é obrigatório") PapelVinculo papel) {
}
