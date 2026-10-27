package br.org.ens.mandato;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record MandatoRequest(
        String casalId,
        String sceId,
        @NotNull(message = "Função é obrigatória") FuncaoMandato funcao,
        @NotNull(message = "Nível da instância é obrigatório") NivelInstancia nivelInstancia,
        @NotNull(message = "ID da instância é obrigatório") String instanciaId,
        @NotNull(message = "Data de início é obrigatória") LocalDate dataInicio,
        LocalDate dataPrevistaTermino,
        String observacoes) {
}
