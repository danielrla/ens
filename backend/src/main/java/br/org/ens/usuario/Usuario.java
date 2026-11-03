package br.org.ens.usuario;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("usuarios")
public class Usuario {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String senhaHash;

    private String nome;

    private TipoUsuario tipoUsuario = TipoUsuario.CASAL;

    private String casalId;

    private String sceId;

    private String equipeId;

    private String setorId;

    private String regiaoId;

    private Set<PerfilUsuario> perfis = new HashSet<>();

    private StatusUsuario status = StatusUsuario.ATIVO;

    private String tokenResetSenha;

    private Instant expiracaoTokenReset;

    private Instant criadoEm = Instant.now();

    private Instant ultimoAcessoEm;

    public Usuario() {
    }

    public Usuario(String email, String senhaHash, String nome, TipoUsuario tipoUsuario, Set<PerfilUsuario> perfis) {
        this.email = email;
        this.senhaHash = senhaHash;
        this.nome = nome;
        this.tipoUsuario = tipoUsuario != null ? tipoUsuario : TipoUsuario.CASAL;
        this.perfis = perfis != null ? perfis : new HashSet<>();
        this.status = StatusUsuario.ATIVO;
        this.criadoEm = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public TipoUsuario getTipoUsuario() {
        return tipoUsuario;
    }

    public void setTipoUsuario(TipoUsuario tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
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

    public String getEquipeId() {
        return equipeId;
    }

    public void setEquipeId(String equipeId) {
        this.equipeId = equipeId;
    }

    public String getSetorId() {
        return setorId;
    }

    public void setSetorId(String setorId) {
        this.setorId = setorId;
    }

    public String getRegiaoId() {
        return regiaoId;
    }

    public void setRegiaoId(String regiaoId) {
        this.regiaoId = regiaoId;
    }

    public Set<PerfilUsuario> getPerfis() {
        return perfis;
    }

    public void setPerfis(Set<PerfilUsuario> perfis) {
        this.perfis = perfis != null ? perfis : new HashSet<>();
    }

    public StatusUsuario getStatus() {
        return status;
    }

    public void setStatus(StatusUsuario status) {
        this.status = status;
    }

    public String getTokenResetSenha() {
        return tokenResetSenha;
    }

    public void setTokenResetSenha(String tokenResetSenha) {
        this.tokenResetSenha = tokenResetSenha;
    }

    public Instant getExpiracaoTokenReset() {
        return expiracaoTokenReset;
    }

    public void setExpiracaoTokenReset(Instant expiracaoTokenReset) {
        this.expiracaoTokenReset = expiracaoTokenReset;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getUltimoAcessoEm() {
        return ultimoAcessoEm;
    }

    public void setUltimoAcessoEm(Instant ultimoAcessoEm) {
        this.ultimoAcessoEm = ultimoAcessoEm;
    }
}

