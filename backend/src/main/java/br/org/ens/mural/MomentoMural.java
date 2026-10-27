package br.org.ens.mural;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("mural_momentos")
public class MomentoMural {

    @Id
    private String id;

    @Indexed
    private String equipeId;

    private String titulo;

    private LocalDate data;

    private String categoria;

    private String descricao;

    private List<String> fotos = new ArrayList<>();

    private String autorCasalId;

    private String autorNome;

    private LocalDateTime criadoEm;

    public MomentoMural() {
    }

    public MomentoMural(String id, String equipeId, String titulo, LocalDate data, String categoria,
                        String descricao, List<String> fotos, String autorCasalId, String autorNome,
                        LocalDateTime criadoEm) {
        this.id = id;
        this.equipeId = equipeId;
        this.titulo = titulo;
        this.data = data;
        this.categoria = categoria;
        this.descricao = descricao;
        this.fotos = fotos != null ? fotos : new ArrayList<>();
        this.autorCasalId = autorCasalId;
        this.autorNome = autorNome;
        this.criadoEm = criadoEm;
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

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public List<String> getFotos() {
        return fotos;
    }

    public void setFotos(List<String> fotos) {
        this.fotos = fotos != null ? fotos : new ArrayList<>();
    }

    public String getAutorCasalId() {
        return autorCasalId;
    }

    public void setAutorCasalId(String autorCasalId) {
        this.autorCasalId = autorCasalId;
    }

    public String getAutorNome() {
        return autorNome;
    }

    public void setAutorNome(String autorNome) {
        this.autorNome = autorNome;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
