package br.org.ens.integracao.google.dto;

import java.time.Instant;

public record GoogleStatusDto(
        boolean conectado,
        boolean configurado,
        String emailGoogle,
        String nomeGoogle,
        String calendarioEnsId,
        String grupoContatosResourceName,
        String drivePastaRaizId,
        Instant ultimaSincronizacaoAgenda,
        Instant ultimaSincronizacaoContatos,
        Instant ultimaSincronizacaoDrive,
        String redirectUri
) {
    public static GoogleStatusDto desconectado(boolean configurado, String redirectUri) {
        return new GoogleStatusDto(false, configurado, null, null, null, null, null, null, null, null, redirectUri);
    }
}
