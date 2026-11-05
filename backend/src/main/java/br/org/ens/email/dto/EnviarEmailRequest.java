package br.org.ens.email.dto;

public record EnviarEmailRequest(
        String destinatario,
        String assunto,
        String corpo,
        String tipo
) {}

