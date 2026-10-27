package br.org.ens.equipe;

import br.org.ens.estrutura.NoEstrutura;

public record EquipeResumoDto(
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
        String cre,
        String casalPilotoId,
        String nomeCasalPiloto,
        SituacaoMandato situacaoMandatoCre,
        AlertaMandato alertaMandato,
        Integer totalCasais,
        String estado,
        String municipio) {
}
