package br.org.ens.casal;

import jakarta.validation.constraints.NotBlank;

public record InativacaoRequest(
        @NotBlank(message = "Motivo da inativação é obrigatório") String motivo) {
}
