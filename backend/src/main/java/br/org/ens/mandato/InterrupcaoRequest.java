package br.org.ens.mandato;

import jakarta.validation.constraints.NotBlank;

public record InterrupcaoRequest(
        @NotBlank(message = "Motivo da interrupção é obrigatório") String motivo) {
}
