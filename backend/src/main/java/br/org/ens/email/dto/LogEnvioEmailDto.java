package br.org.ens.email.dto;

import java.time.Instant;

public record LogEnvioEmailDto(
        String id,
        String destinatario,
        String assunto,
        String tipo,
        Boolean sucesso,
        Instant dataHora,
        String detalhes
) {}

