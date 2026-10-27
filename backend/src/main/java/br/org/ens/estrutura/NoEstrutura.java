package br.org.ens.estrutura;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Nó das instâncias acima da Equipe (Super-Região, Província, Região, Setor),
 * numa única coleção. A Equipe tem coleção própria por concentrar mais dados.
 */
@Document("estrutura")
@CompoundIndex(name = "nivel_pai_idx", def = "{'nivel': 1, 'paiId': 1}")
public record NoEstrutura(
        @Id String id,
        String nome,
        NivelEstrutura nivel,
        String paiId) {
}
