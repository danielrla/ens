package br.org.ens.equipe;

import java.time.LocalDate;

public record VinculoDto(
        String casalId,
        String nomeCasal,
        PapelVinculo papel,
        LocalDate desde) {
}
