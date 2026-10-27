package br.org.ens.mandato;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("mandatos")
@CompoundIndex(name = "instancia_funcao_status_idx", def = "{'instanciaId': 1, 'funcao': 1, 'status': 1}")
public class Mandato {

    @Id
    private String id;

    @Indexed
    private String casalId;

    private String sceId;

    private FuncaoMandato funcao;

    private NivelInstancia nivelInstancia;

    @Indexed
    private String instanciaId;

    private LocalDate dataInicio;

    private LocalDate dataPrevistaTermino;

    private LocalDate dataEncerramentoEfetivo;

    @Indexed
    private StatusMandato status = StatusMandato.VIGENTE;

    private String observacoes;

    public Mandato() {
    }

    public Mandato(String id, String casalId, String sceId, FuncaoMandato funcao,
                   NivelInstancia nivelInstancia, String instanciaId, LocalDate dataInicio,
                   LocalDate dataPrevistaTermino, LocalDate dataEncerramentoEfetivo,
                   StatusMandato status, String observacoes) {
        this.id = id;
        this.casalId = casalId;
        this.sceId = sceId;
        this.funcao = funcao;
        this.nivelInstancia = nivelInstancia;
        this.instanciaId = instanciaId;
        this.dataInicio = dataInicio;
        this.dataPrevistaTermino = dataPrevistaTermino;
        this.dataEncerramentoEfetivo = dataEncerramentoEfetivo;
        this.status = status != null ? status : StatusMandato.VIGENTE;
        this.observacoes = observacoes;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCasalId() {
        return casalId;
    }

    public void setCasalId(String casalId) {
        this.casalId = casalId;
    }

    public String getSceId() {
        return sceId;
    }

    public void setSceId(String sceId) {
        this.sceId = sceId;
    }

    public FuncaoMandato getFuncao() {
        return funcao;
    }

    public void setFuncao(FuncaoMandato funcao) {
        this.funcao = funcao;
    }

    public NivelInstancia getNivelInstancia() {
        return nivelInstancia;
    }

    public void setNivelInstancia(NivelInstancia nivelInstancia) {
        this.nivelInstancia = nivelInstancia;
    }

    public String getInstanciaId() {
        return instanciaId;
    }

    public void setInstanciaId(String instanciaId) {
        this.instanciaId = instanciaId;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataPrevistaTermino() {
        return dataPrevistaTermino;
    }

    public void setDataPrevistaTermino(LocalDate dataPrevistaTermino) {
        this.dataPrevistaTermino = dataPrevistaTermino;
    }

    public LocalDate getDataEncerramentoEfetivo() {
        return dataEncerramentoEfetivo;
    }

    public void setDataEncerramentoEfetivo(LocalDate dataEncerramentoEfetivo) {
        this.dataEncerramentoEfetivo = dataEncerramentoEfetivo;
    }

    public StatusMandato getStatus() {
        return status;
    }

    public void setStatus(StatusMandato status) {
        this.status = status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
