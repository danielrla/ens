package br.org.ens.equipe;

import java.time.LocalDate;

public record Vinculo(
        String casalId,
        PapelVinculo papel,
        LocalDate desde) {
}
