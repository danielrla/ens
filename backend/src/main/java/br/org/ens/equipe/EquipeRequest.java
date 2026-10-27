package br.org.ens.equipe;

import java.time.LocalDate;
import java.util.List;

public record EquipeRequest(
        Integer numero,
        String nomeDevocao,
        String superRegiaoId,
        String provinciaId,
        String regiaoId,
        String setorId,
        LocalDate dataFundacao,
        Boolean emPilotagem,
        LocalDate dataInicioPilotagem,
        LocalDate dataTerminoPilotagem,
        String casalPilotoId,
        String casalResponsavelId,
        StatusEquipe status,
        String sceId,
        String estado,
        String municipio,
        String temaEstudoAno,
        List<TemaAno> temasAnuais) {
}
