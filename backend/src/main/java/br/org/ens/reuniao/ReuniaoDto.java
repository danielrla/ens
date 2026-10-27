package br.org.ens.reuniao;

import br.org.ens.casal.Endereco;
import java.time.LocalDate;
import java.util.List;

public record ReuniaoDto(
        String id,
        String equipeId,
        LocalDate data,
        String horario,
        TipoReuniao tipo,
        String casalAnimadorId,
        String nomeCasalAnimador,
        String tema,
        String casalAnfitriaoId,
        String nomeCasalAnfitriao,
        Endereco enderecoAnfitriao,
        String localObservacao,
        boolean scePresente,
        List<PresencaDetalheDto> presencas,
        String anotacoesCre,
        List<String> fotos,
        int totalPresentes,
        int totalFaltas,
        int totalJustificadas) {
}
