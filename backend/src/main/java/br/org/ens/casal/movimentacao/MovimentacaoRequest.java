package br.org.ens.casal.movimentacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record MovimentacaoRequest(
        @NotNull(message = "Tipo da movimentação é obrigatório") TipoMovimentacao tipo,
        String equipeDestinoId,
        @NotBlank(message = "Motivo da movimentação é obrigatório") String motivo,
        LocalDate data,
        String observacoes) {
}
