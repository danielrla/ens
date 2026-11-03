package br.org.ens.integracao.google.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleCallbackRequest(
        @NotBlank(message = "O código de autorização é obrigatório")
        String code,
        String state
) {
}
