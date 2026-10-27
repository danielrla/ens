package br.org.ens.casal;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record Pessoa(
        @NotBlank(message = "Nome completo é obrigatório") String nomeCompleto,
        String cpf,
        String email,
        String celular,
        LocalDate dataNascimento,
        String profissao,
        LocalDate dataFalecimento) {

    public boolean isFalecido() {
        return dataFalecimento != null;
    }
}
