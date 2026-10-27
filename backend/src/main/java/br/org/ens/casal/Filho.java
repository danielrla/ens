package br.org.ens.casal;

import java.time.LocalDate;
import java.time.Period;

public record Filho(
        String nome,
        LocalDate dataNascimento,
        String fotoUrl) {

    public Filho(String nome, LocalDate dataNascimento) {
        this(nome, dataNascimento, null);
    }

    public Integer getIdade() {
        if (dataNascimento == null) {
            return null;
        }
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }
}
