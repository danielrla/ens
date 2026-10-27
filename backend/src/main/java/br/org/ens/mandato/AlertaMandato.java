package br.org.ens.mandato;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public enum AlertaMandato {
    NENHUM,
    DOURADO,
    LARANJA,
    VERMELHO;

    public static AlertaMandato calcular(LocalDate dataPrevistaTermino, StatusMandato status) {
        if (status != StatusMandato.VIGENTE || dataPrevistaTermino == null) {
            return NENHUM;
        }
        LocalDate hoje = LocalDate.now();
        long dias = ChronoUnit.DAYS.between(hoje, dataPrevistaTermino);
        if (dias < 0) {
            return VERMELHO;
        } else if (dias <= 30) {
            return LARANJA;
        } else if (dias <= 90) {
            return DOURADO;
        }
        return NENHUM;
    }
}
