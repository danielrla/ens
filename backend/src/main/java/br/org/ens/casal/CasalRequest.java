package br.org.ens.casal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record CasalRequest(
        @NotNull(message = "Esposo é obrigatório") @Valid Pessoa esposo,
        @NotNull(message = "Esposa é obrigatória") @Valid Pessoa esposa,
        LocalDate dataMatrimonio,
        String paroquiaCasamento,
        String recebeCartaMensal,
        Endereco endereco,
        StatusCasal status,
        String equipeId,
        String fotoUrl,
        List<Filho> filhos) {
}
