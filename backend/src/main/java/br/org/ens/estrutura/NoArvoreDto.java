package br.org.ens.estrutura;

import java.util.List;

public record NoArvoreDto(
        String id,
        String nome,
        NivelEstrutura nivel,
        String paiId,
        int totalFilhos,
        List<NoArvoreDto> filhos) {
}
