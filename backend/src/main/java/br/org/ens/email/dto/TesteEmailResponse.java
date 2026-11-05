package br.org.ens.email.dto;

import java.time.Instant;

public record TesteEmailResponse(
        boolean sucesso,
        String mensagem,
        Instant timestamp,
        String detalhes
) {}

