package br.org.ens.email;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "config_email")
public class EmailConfig {

    @Id
    private String id;
    private String metodo; // SMTP ou OAUTH2
    private String remetenteEmail;
    private String remetenteNome;

    // Campos SMTP
    private String smtpHost;
    private Integer smtpPorta;
    private String smtpUsuario;
    private String senhaAppCifrada;
    private Boolean usaTls;

    // Campos OAuth2 Google Workspace
    private String oauthClientId;
    private String oauthClientSecretCifrado;
    private Boolean oauthConectado;

    // Status de Operação
    private Boolean ativo;
    private Instant atualizadoEm;
    private Instant ultimoTesteEm;
    private Boolean ultimoTesteSucesso;
    private String ultimaMensagemTeste;

    public EmailConfig() {
        this.metodo = "SMTP";
        this.remetenteEmail = "notificacoes.ens@gmail.com";
        this.remetenteNome = "Equipes de Nossa Senhora";
        this.smtpHost = "smtp.gmail.com";
        this.smtpPorta = 587;
        this.smtpUsuario = "notificacoes.ens@gmail.com";
        this.usaTls = true;
        this.ativo = true;
        this.atualizadoEm = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public String getRemetenteEmail() {
        return remetenteEmail;
    }

    public void setRemetenteEmail(String remetenteEmail) {
        this.remetenteEmail = remetenteEmail;
    }

    public String getRemetenteNome() {
        return remetenteNome;
    }

    public void setRemetenteNome(String remetenteNome) {
        this.remetenteNome = remetenteNome;
    }

    public String getSmtpHost() {
        return smtpHost;
    }

    public void setSmtpHost(String smtpHost) {
        this.smtpHost = smtpHost;
    }

    public Integer getSmtpPorta() {
        return smtpPorta;
    }

    public void setSmtpPorta(Integer smtpPorta) {
        this.smtpPorta = smtpPorta;
    }

    public String getSmtpUsuario() {
        return smtpUsuario;
    }

    public void setSmtpUsuario(String smtpUsuario) {
        this.smtpUsuario = smtpUsuario;
    }

    public String getSenhaAppCifrada() {
        return senhaAppCifrada;
    }

    public void setSenhaAppCifrada(String senhaAppCifrada) {
        this.senhaAppCifrada = senhaAppCifrada;
    }

    public Boolean getUsaTls() {
        return usaTls;
    }

    public void setUsaTls(Boolean usaTls) {
        this.usaTls = usaTls;
    }

    public String getOauthClientId() {
        return oauthClientId;
    }

    public void setOauthClientId(String oauthClientId) {
        this.oauthClientId = oauthClientId;
    }

    public String getOauthClientSecretCifrado() {
        return oauthClientSecretCifrado;
    }

    public void setOauthClientSecretCifrado(String oauthClientSecretCifrado) {
        this.oauthClientSecretCifrado = oauthClientSecretCifrado;
    }

    public Boolean getOauthConectado() {
        return oauthConectado;
    }

    public void setOauthConectado(Boolean oauthConectado) {
        this.oauthConectado = oauthConectado;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public Instant getUltimoTesteEm() {
        return ultimoTesteEm;
    }

    public void setUltimoTesteEm(Instant ultimoTesteEm) {
        this.ultimoTesteEm = ultimoTesteEm;
    }

    public Boolean getUltimoTesteSucesso() {
        return ultimoTesteSucesso;
    }

    public void setUltimoTesteSucesso(Boolean ultimoTesteSucesso) {
        this.ultimoTesteSucesso = ultimoTesteSucesso;
    }

    public String getUltimaMensagemTeste() {
        return ultimaMensagemTeste;
    }

    public void setUltimaMensagemTeste(String ultimaMensagemTeste) {
        this.ultimaMensagemTeste = ultimaMensagemTeste;
    }
}

