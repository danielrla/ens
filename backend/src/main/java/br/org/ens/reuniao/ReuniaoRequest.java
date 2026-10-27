package br.org.ens.reuniao;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record ReuniaoRequest(
        @NotNull(message = "Data da reunião é obrigatória") LocalDate data,
        String horario,
        TipoReuniao tipo,
        String casalAnimadorId,
        String tema,
        String casalAnfitriaoId,
        String localObservacao,
        Boolean scePresente,
        List<PresencaCasal> presencas,
        String anotacoesCre,
        List<String> fotos) {
}
