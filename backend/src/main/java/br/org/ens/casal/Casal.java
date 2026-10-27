package br.org.ens.casal;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("casais")
public class Casal {

    @Id
    private String id;

    private Pessoa esposo;
    private Pessoa esposa;
    private LocalDate dataMatrimonio;
    private String paroquiaCasamento;
    private String recebeCartaMensal;
    private Endereco endereco;

    @Indexed
    private StatusCasal status = StatusCasal.ATIVO;

    @Indexed
    private String equipeId;

    private String fotoUrl;
    private String motivoInativacao;

    private List<Filho> filhos = new ArrayList<>();

    public Casal() {
    }

    public Casal(String id, Pessoa esposo, Pessoa esposa, LocalDate dataMatrimonio,
                 String paroquiaCasamento, String recebeCartaMensal, Endereco endereco,
                 StatusCasal status, String equipeId, String fotoUrl, String motivoInativacao,
                 List<Filho> filhos) {
        this.id = id;
        this.esposo = esposo;
        this.esposa = esposa;
        this.dataMatrimonio = dataMatrimonio;
        this.paroquiaCasamento = paroquiaCasamento;
        this.recebeCartaMensal = recebeCartaMensal;
        this.endereco = endereco;
        this.status = status != null ? status : StatusCasal.ATIVO;
        this.equipeId = equipeId;
        this.fotoUrl = fotoUrl;
        this.motivoInativacao = motivoInativacao;
        this.filhos = filhos != null ? filhos : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Pessoa getEsposo() {
        return esposo;
    }

    public void setEsposo(Pessoa esposo) {
        this.esposo = esposo;
    }

    public Pessoa getEsposa() {
        return esposa;
    }

    public void setEsposa(Pessoa esposa) {
        this.esposa = esposa;
    }

    public LocalDate getDataMatrimonio() {
        return dataMatrimonio;
    }

    public void setDataMatrimonio(LocalDate dataMatrimonio) {
        this.dataMatrimonio = dataMatrimonio;
    }

    public String getParoquiaCasamento() {
        return paroquiaCasamento;
    }

    public void setParoquiaCasamento(String paroquiaCasamento) {
        this.paroquiaCasamento = paroquiaCasamento;
    }

    public String getRecebeCartaMensal() {
        return recebeCartaMensal;
    }

    public void setRecebeCartaMensal(String recebeCartaMensal) {
        this.recebeCartaMensal = recebeCartaMensal;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }

    public StatusCasal getStatus() {
        return status;
    }

    public void setStatus(StatusCasal status) {
        this.status = status;
    }

    public String getEquipeId() {
        return equipeId;
    }

    public void setEquipeId(String equipeId) {
        this.equipeId = equipeId;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public String getMotivoInativacao() {
        return motivoInativacao;
    }

    public void setMotivoInativacao(String motivoInativacao) {
        this.motivoInativacao = motivoInativacao;
    }

    public List<Filho> getFilhos() {
        return filhos;
    }

    public void setFilhos(List<Filho> filhos) {
        this.filhos = filhos != null ? filhos : new ArrayList<>();
    }
}
