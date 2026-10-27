package br.org.ens.mural;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record MomentoMuralRequest(
        @NotBlank(message = "Título do momento é obrigatório")
        String titulo,

        @NotNull(message = "Data do momento é obrigatória")
        LocalDate data,

        String categoria,

        String descricao,

        List<String> fotos,

        String autorCasalId,

        String autorNome) {
}
