package br.org.ens.integracao.google;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("conexoes_google")
public class ConexaoGoogle {

    @Id
    private String id;

    @Indexed(unique = true)
    private String casalId;

    private String emailGoogle;
    private String nomeGoogle;

    private String accessTokenCifrado;
    private String refreshTokenCifrado;
    private Instant expiracaoToken;

    private String calendarioEnsId;
    private String grupoContatosResourceName;

    private String drivePastaRaizId;
    private String drivePastaRoteirosId;
    private String drivePastaMuralId;

    private Instant ultimaSincronizacaoAgenda;
    private Instant ultimaSincronizacaoContatos;
    private Instant ultimaSincronizacaoDrive;

    public ConexaoGoogle() {
    }

    public ConexaoGoogle(String casalId, String emailGoogle, String nomeGoogle) {
        this.casalId = casalId;
        this.emailGoogle = emailGoogle;
        this.nomeGoogle = nomeGoogle;
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

    public String getEmailGoogle() {
        return emailGoogle;
    }

    public void setEmailGoogle(String emailGoogle) {
        this.emailGoogle = emailGoogle;
    }

    public String getNomeGoogle() {
        return nomeGoogle;
    }

    public void setNomeGoogle(String nomeGoogle) {
        this.nomeGoogle = nomeGoogle;
    }

    public String getAccessTokenCifrado() {
        return accessTokenCifrado;
    }

    public void setAccessTokenCifrado(String accessTokenCifrado) {
        this.accessTokenCifrado = accessTokenCifrado;
    }

    public String getRefreshTokenCifrado() {
        return refreshTokenCifrado;
    }

    public void setRefreshTokenCifrado(String refreshTokenCifrado) {
        this.refreshTokenCifrado = refreshTokenCifrado;
    }

    public Instant getExpiracaoToken() {
        return expiracaoToken;
    }

    public void setExpiracaoToken(Instant expiracaoToken) {
        this.expiracaoToken = expiracaoToken;
    }

    public String getCalendarioEnsId() {
        return calendarioEnsId;
    }

    public void setCalendarioEnsId(String calendarioEnsId) {
        this.calendarioEnsId = calendarioEnsId;
    }

    public String getGrupoContatosResourceName() {
        return grupoContatosResourceName;
    }

    public void setGrupoContatosResourceName(String grupoContatosResourceName) {
        this.grupoContatosResourceName = grupoContatosResourceName;
    }

    public String getDrivePastaRaizId() {
        return drivePastaRaizId;
    }

    public void setDrivePastaRaizId(String drivePastaRaizId) {
        this.drivePastaRaizId = drivePastaRaizId;
    }

    public String getDrivePastaRoteirosId() {
        return drivePastaRoteirosId;
    }

    public void setDrivePastaRoteirosId(String drivePastaRoteirosId) {
        this.drivePastaRoteirosId = drivePastaRoteirosId;
    }

    public String getDrivePastaMuralId() {
        return drivePastaMuralId;
    }

    public void setDrivePastaMuralId(String drivePastaMuralId) {
        this.drivePastaMuralId = drivePastaMuralId;
    }

    public Instant getUltimaSincronizacaoAgenda() {
        return ultimaSincronizacaoAgenda;
    }

    public void setUltimaSincronizacaoAgenda(Instant ultimaSincronizacaoAgenda) {
        this.ultimaSincronizacaoAgenda = ultimaSincronizacaoAgenda;
    }

    public Instant getUltimaSincronizacaoContatos() {
        return ultimaSincronizacaoContatos;
    }

    public void setUltimaSincronizacaoContatos(Instant ultimaSincronizacaoContatos) {
        this.ultimaSincronizacaoContatos = ultimaSincronizacaoContatos;
    }

    public Instant getUltimaSincronizacaoDrive() {
        return ultimaSincronizacaoDrive;
    }

    public void setUltimaSincronizacaoDrive(Instant ultimaSincronizacaoDrive) {
        this.ultimaSincronizacaoDrive = ultimaSincronizacaoDrive;
    }
}

