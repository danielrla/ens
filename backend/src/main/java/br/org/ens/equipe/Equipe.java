package br.org.ens.equipe;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("equipes")
@CompoundIndex(name = "hierarquia_status_idx", def = "{'superRegiaoId': 1, 'provinciaId': 1, 'regiaoId': 1, 'setorId': 1, 'status': 1}")
public class Equipe {

    @Id
    private String id;

    @Indexed
    private Integer numero;

    private String nomeDevocao;

    @Indexed
    private String superRegiaoId;

    @Indexed
    private String provinciaId;

    @Indexed
    private String regiaoId;

    @Indexed
    private String setorId;

    @Indexed
    private StatusEquipe status = StatusEquipe.ATIVA;

    private LocalDate dataFundacao;
    private LocalDate dataInicioPilotagem;
    private LocalDate dataTerminoPilotagem;

    @Indexed
    private String casalPilotoId;

    @Indexed
    private String sceId;

    private String estado;
    private String municipio;

    private String temaEstudoAno;
    private List<TemaAno> temasAnuais = new ArrayList<>();

    private List<Vinculo> vinculos = new ArrayList<>();

    public Equipe() {
    }

    public Equipe(String id, Integer numero, String nomeDevocao, String superRegiaoId, String provinciaId,
                  String regiaoId, String setorId, StatusEquipe status, LocalDate dataFundacao,
                  LocalDate dataTerminoPilotagem, String sceId, List<Vinculo> vinculos) {
        this.id = id;
        this.numero = numero;
        this.nomeDevocao = nomeDevocao;
        this.superRegiaoId = superRegiaoId;
        this.provinciaId = provinciaId;
        this.regiaoId = regiaoId;
        this.setorId = setorId;
        this.status = status != null ? status : StatusEquipe.ATIVA;
        this.dataFundacao = dataFundacao;
        this.dataTerminoPilotagem = dataTerminoPilotagem;
        this.sceId = sceId;
        this.vinculos = vinculos != null ? vinculos : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getNomeDevocao() {
        return nomeDevocao;
    }

    public void setNomeDevocao(String nomeDevocao) {
        this.nomeDevocao = nomeDevocao;
    }

    public String getSuperRegiaoId() {
        return superRegiaoId;
    }

    public void setSuperRegiaoId(String superRegiaoId) {
        this.superRegiaoId = superRegiaoId;
    }

    public String getProvinciaId() {
        return provinciaId;
    }

    public void setProvinciaId(String provinciaId) {
        this.provinciaId = provinciaId;
    }

    public String getRegiaoId() {
        return regiaoId;
    }

    public void setRegiaoId(String regiaoId) {
        this.regiaoId = regiaoId;
    }

    public String getSetorId() {
        return setorId;
    }

    public void setSetorId(String setorId) {
        this.setorId = setorId;
    }

    public StatusEquipe getStatus() {
        return status;
    }

    public void setStatus(StatusEquipe status) {
        this.status = status;
    }

    public LocalDate getDataFundacao() {
        return dataFundacao;
    }

    public void setDataFundacao(LocalDate dataFundacao) {
        this.dataFundacao = dataFundacao;
    }

    public LocalDate getDataInicioPilotagem() {
        return dataInicioPilotagem;
    }

    public void setDataInicioPilotagem(LocalDate dataInicioPilotagem) {
        this.dataInicioPilotagem = dataInicioPilotagem;
    }

    public LocalDate getDataTerminoPilotagem() {
        return dataTerminoPilotagem;
    }

    public void setDataTerminoPilotagem(LocalDate dataTerminoPilotagem) {
        this.dataTerminoPilotagem = dataTerminoPilotagem;
    }

    public String getCasalPilotoId() {
        return casalPilotoId;
    }

    public void setCasalPilotoId(String casalPilotoId) {
        this.casalPilotoId = casalPilotoId;
    }

    public String getSceId() {
        return sceId;
    }

    public void setSceId(String sceId) {
        this.sceId = sceId;
    }

    public List<Vinculo> getVinculos() {
        return vinculos;
    }

    public void setVinculos(List<Vinculo> vinculos) {
        this.vinculos = vinculos;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getTemaEstudoAno() {
        return temaEstudoAno;
    }

    public void setTemaEstudoAno(String temaEstudoAno) {
        this.temaEstudoAno = temaEstudoAno;
    }

    public List<TemaAno> getTemasAnuais() {
        return temasAnuais != null ? temasAnuais : new ArrayList<>();
    }

    public void setTemasAnuais(List<TemaAno> temasAnuais) {
        this.temasAnuais = temasAnuais != null ? new ArrayList<>(temasAnuais) : new ArrayList<>();
        if (!this.temasAnuais.isEmpty()) {
            this.temasAnuais.sort((a, b) -> Integer.compare(b.ano(), a.ano()));
            if (this.temaEstudoAno == null || this.temaEstudoAno.isBlank()) {
                this.temaEstudoAno = this.temasAnuais.get(0).tema();
            }
        }
    }

    public String obterTemaDoAno(int ano) {
        if (temasAnuais != null && !temasAnuais.isEmpty()) {
            for (TemaAno t : temasAnuais) {
                if (t.ano() != null && t.ano() == ano) {
                    return t.tema();
                }
            }
        }
        return temaEstudoAno;
    }
}
