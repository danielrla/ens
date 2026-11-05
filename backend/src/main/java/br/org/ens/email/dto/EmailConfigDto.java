package br.org.ens.email.dto;

import java.time.Instant;

public record EmailConfigDto(
        String metodo,
        String remetenteEmail,
        String remetenteNome,
        String smtpHost,
        Integer smtpPorta,
        String smtpUsuario,
        String senhaAppMascarada,
        Boolean usaTls,
        String oauthClientId,
        String oauthClientSecretMascarado,
        Boolean oauthConectado,
        Boolean ativo,
        Instant ultimoTesteEm,
        Boolean ultimoTesteSucesso,
        String ultimaMensagemTeste
) {}

