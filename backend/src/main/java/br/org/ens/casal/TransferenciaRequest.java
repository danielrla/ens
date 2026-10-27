package br.org.ens.casal;

import br.org.ens.equipe.PapelVinculo;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record TransferenciaRequest(
        @NotBlank(message = "Equipe de destino é obrigatória") String equipeDestinoId,
        PapelVinculo papel,
        LocalDate dataEfetiva,
        String motivo) {
}
