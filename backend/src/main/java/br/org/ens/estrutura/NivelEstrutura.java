package br.org.ens.estrutura;

public enum NivelEstrutura {
    SUPER_REGIAO,
    PROVINCIA,
    REGIAO,
    SETOR,
    EQUIPE;

    /** Nível imediatamente acima na hierarquia, ou null para a Super-Região. */
    public NivelEstrutura pai() {
        return ordinal() == 0 ? null : values()[ordinal() - 1];
    }
}
