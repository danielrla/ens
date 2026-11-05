package br.org.ens.email;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "logs_email")
public class LogEnvioEmail {

    @Id
    private String id;
    private String destinatario;
    private String assunto;
    private String tipo; // TESTE, AVISO_SEMANAL, AVISO_VESPERA_D1, AVISO_IMEDIATO_H4
    private Boolean sucesso;
    private Instant dataHora;
    private String detalhes;

    public LogEnvioEmail() {
        this.dataHora = Instant.now();
    }

    public LogEnvioEmail(String destinatario, String assunto, String tipo, Boolean sucesso, String detalhes) {
        this.destinatario = destinatario;
        this.assunto = assunto;
        this.tipo = tipo;
        this.sucesso = sucesso;
        this.detalhes = detalhes;
        this.dataHora = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDestinatario() {
        return destinatario;
    }

    public void setDestinatario(String destinatario) {
        this.destinatario = destinatario;
    }

    public String getAssunto() {
        return assunto;
    }

    public void setAssunto(String assunto) {
        this.assunto = assunto;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Boolean getSucesso() {
        return sucesso;
    }

    public void setSucesso(Boolean sucesso) {
        this.sucesso = sucesso;
    }

    public Instant getDataHora() {
        return dataHora;
    }

    public void setDataHora(Instant dataHora) {
        this.dataHora = dataHora;
    }

    public String getDetalhes() {
        return detalhes;
    }

    public void setDetalhes(String detalhes) {
        this.detalhes = detalhes;
    }
}

