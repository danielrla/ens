package br.org.ens.email.dto;

public record SalvarEmailConfigRequest(
        String metodo,
        String remetenteEmail,
        String remetenteNome,
        String smtpHost,
        Integer smtpPorta,
        String smtpUsuario,
        Boolean usaTls,
        String oauthClientId,
        String senhaAppReal,
        String oauthClientSecretReal
) {}

