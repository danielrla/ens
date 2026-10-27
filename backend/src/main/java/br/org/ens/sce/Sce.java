package br.org.ens.sce;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("sacerdotes")
public class Sce {

    @Id
    private String id;

    @Indexed
    private String nomeCompleto;

    private TituloSce titulo;

    private String dioceseCongregacao;

    private String paroquia;

    private List<String> telefones = new ArrayList<>();

    private String email;

    private String fotoUrl;

    private LocalDate dataNascimento;

    private LocalDate dataOrdenacaoConsagracao;

    @Indexed
    private String status = "ATIVO";

    public Sce() {
    }

    public Sce(String id, String nomeCompleto, TituloSce titulo, String dioceseCongregacao,
               String paroquia, List<String> telefones, String email,
               LocalDate dataNascimento, LocalDate dataOrdenacaoConsagracao, String status) {
        this.id = id;
        this.nomeCompleto = nomeCompleto;
        this.titulo = titulo;
        this.dioceseCongregacao = dioceseCongregacao;
        this.paroquia = paroquia;
        this.telefones = telefones != null ? telefones : new ArrayList<>();
        this.email = email;
        this.dataNascimento = dataNascimento;
        this.dataOrdenacaoConsagracao = dataOrdenacaoConsagracao;
        this.status = status != null ? status : "ATIVO";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public TituloSce getTitulo() {
        return titulo;
    }

    public void setTitulo(TituloSce titulo) {
        this.titulo = titulo;
    }

    public String getDioceseCongregacao() {
        return dioceseCongregacao;
    }

    public void setDioceseCongregacao(String dioceseCongregacao) {
        this.dioceseCongregacao = dioceseCongregacao;
    }

    public String getParoquia() {
        return paroquia;
    }

    public void setParoquia(String paroquia) {
        this.paroquia = paroquia;
    }

    public List<String> getTelefones() {
        return telefones;
    }

    public void setTelefones(List<String> telefones) {
        this.telefones = telefones;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public LocalDate getDataOrdenacaoConsagracao() {
        return dataOrdenacaoConsagracao;
    }

    public void setDataOrdenacaoConsagracao(LocalDate dataOrdenacaoConsagracao) {
        this.dataOrdenacaoConsagracao = dataOrdenacaoConsagracao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
