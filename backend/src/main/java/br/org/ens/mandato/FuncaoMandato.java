package br.org.ens.mandato;

public enum FuncaoMandato {
    CRE(1),
    CL(3),
    CRS(3),
    CRR(4),
    CRP(5),
    CRSR(5),
    ERI(6);

    private final int prazoEstatutarioAnos;

    FuncaoMandato(int prazoEstatutarioAnos) {
        this.prazoEstatutarioAnos = prazoEstatutarioAnos;
    }

    public int getPrazoEstatutarioAnos() {
        return prazoEstatutarioAnos;
    }
}
