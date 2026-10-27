package br.org.ens.casal.movimentacao;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("movimentacoes_casal")
public class MovimentacaoCasal {

    @Id
    private String id;

    @Indexed
    private String casalId;

    private TipoMovimentacao tipo;

    private String equipeOrigemId;

    private String equipeDestinoId;

    private LocalDate data;

    private String motivo;

    private String observacoes;

    public MovimentacaoCasal() {
    }

    public MovimentacaoCasal(String id, String casalId, TipoMovimentacao tipo,
                             String equipeOrigemId, String equipeDestinoId,
                             LocalDate data, String motivo, String observacoes) {
        this.id = id;
        this.casalId = casalId;
        this.tipo = tipo;
        this.equipeOrigemId = equipeOrigemId;
        this.equipeDestinoId = equipeDestinoId;
        this.data = data != null ? data : LocalDate.now();
        this.motivo = motivo;
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

    public TipoMovimentacao getTipo() {
        return tipo;
    }

    public void setTipo(TipoMovimentacao tipo) {
        this.tipo = tipo;
    }

    public String getEquipeOrigemId() {
        return equipeOrigemId;
    }

    public void setEquipeOrigemId(String equipeOrigemId) {
        this.equipeOrigemId = equipeOrigemId;
    }

    public String getEquipeDestinoId() {
        return equipeDestinoId;
    }

    public void setEquipeDestinoId(String equipeDestinoId) {
        this.equipeDestinoId = equipeDestinoId;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
