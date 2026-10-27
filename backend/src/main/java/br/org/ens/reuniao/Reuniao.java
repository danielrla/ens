package br.org.ens.reuniao;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("reunioes")
public class Reuniao {

    @Id
    private String id;

    @Indexed
    private String equipeId;

    private LocalDate data;

    private String horario;

    private TipoReuniao tipo = TipoReuniao.FORMAL;

    private String casalAnimadorId;

    private String tema;

    private String casalAnfitriaoId;

    private String localObservacao;

    private boolean scePresente;

    private List<PresencaCasal> presencas = new ArrayList<>();

    private String anotacoesCre;

    private List<String> fotos = new ArrayList<>();

    public Reuniao() {
    }

    public Reuniao(String id, String equipeId, LocalDate data, String horario, TipoReuniao tipo,
                   String casalAnimadorId, String tema, String casalAnfitriaoId, String localObservacao,
                   boolean scePresente, List<PresencaCasal> presencas, String anotacoesCre, List<String> fotos) {
        this.id = id;
        this.equipeId = equipeId;
        this.data = data;
        this.horario = horario;
        this.tipo = tipo != null ? tipo : TipoReuniao.FORMAL;
        this.casalAnimadorId = casalAnimadorId;
        this.tema = tema;
        this.casalAnfitriaoId = casalAnfitriaoId;
        this.localObservacao = localObservacao;
        this.scePresente = scePresente;
        this.presencas = presencas != null ? presencas : new ArrayList<>();
        this.anotacoesCre = anotacoesCre;
        this.fotos = fotos != null ? fotos : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEquipeId() {
        return equipeId;
    }

    public void setEquipeId(String equipeId) {
        this.equipeId = equipeId;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }

    public String getCasalAnfitriaoId() {
        return casalAnfitriaoId;
    }

    public void setCasalAnfitriaoId(String casalAnfitriaoId) {
        this.casalAnfitriaoId = casalAnfitriaoId;
    }

    public String getLocalObservacao() {
        return localObservacao;
    }

    public void setLocalObservacao(String localObservacao) {
        this.localObservacao = localObservacao;
    }

    public boolean isScePresente() {
        return scePresente;
    }

    public void setScePresente(boolean scePresente) {
        this.scePresente = scePresente;
    }

    public List<PresencaCasal> getPresencas() {
        return presencas;
    }

    public void setPresencas(List<PresencaCasal> presencas) {
        this.presencas = presencas != null ? presencas : new ArrayList<>();
    }

    public String getAnotacoesCre() {
        return anotacoesCre;
    }

    public void setAnotacoesCre(String anotacoesCre) {
        this.anotacoesCre = anotacoesCre;
    }

    public TipoReuniao getTipo() {
        return tipo;
    }

    public void setTipo(TipoReuniao tipo) {
        this.tipo = tipo != null ? tipo : TipoReuniao.FORMAL;
    }

    public String getCasalAnimadorId() {
        return casalAnimadorId;
    }

    public void setCasalAnimadorId(String casalAnimadorId) {
        this.casalAnimadorId = casalAnimadorId;
    }

    public List<String> getFotos() {
        return fotos;
    }

    public void setFotos(List<String> fotos) {
        this.fotos = fotos != null ? fotos : new ArrayList<>();
    }
}
