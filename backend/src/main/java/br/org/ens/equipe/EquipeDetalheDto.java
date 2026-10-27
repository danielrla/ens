package br.org.ens.equipe;

import br.org.ens.estrutura.NoEstrutura;
import java.time.LocalDate;
import java.util.List;

public record EquipeDetalheDto(
        String id,
        Integer numero,
        String nomeDevocao,
        StatusEquipe status,
        Boolean emPilotagem,
        NoEstrutura superRegiao,
        NoEstrutura provincia,
        NoEstrutura regiao,
        NoEstrutura setor,
        String nomeSce,
        String sceId,
        String cre,
        String creCasalId,
        String casalPilotoId,
        String nomeCasalPiloto,
        SituacaoMandato situacaoMandatoCre,
        AlertaMandato alertaMandato,
        Integer totalCasais,
        LocalDate dataFundacao,
        LocalDate dataInicioPilotagem,
        LocalDate dataTerminoPilotagem,
        List<VinculoDto> vinculos,
        String estado,
        String municipio,
        String temaEstudoAno,
        List<TemaAno> temasAnuais) {
}
