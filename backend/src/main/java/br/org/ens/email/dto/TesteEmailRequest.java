package br.org.ens.email.dto;

public record TesteEmailRequest(
        String destinatario,
        String assunto,
        String mensagem
) {}

