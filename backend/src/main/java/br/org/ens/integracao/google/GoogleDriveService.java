package br.org.ens.integracao.google;

import br.org.ens.equipe.Equipe;
import br.org.ens.equipe.EquipeRepository;
import br.org.ens.integracao.google.dto.SincronizacaoResultadoDto;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class GoogleDriveService {

    private static final Logger log = LoggerFactory.getLogger(GoogleDriveService.class);
    private static final String APP_NAME = "ENS-Gestao";
    private static final String FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
    private static final String PASTA_RAIZ_PADRAO = "ENS - Documentos";

    private final GoogleAuthService authService;
    private final EquipeRepository equipeRepository;

    public GoogleDriveService(GoogleAuthService authService, EquipeRepository equipeRepository) {
        this.authService = authService;
        this.equipeRepository = equipeRepository;
    }

    public SincronizacaoResultadoDto provisionarEstruturaDrive(String casalId, String equipeId) {
        ConexaoGoogle conexao = authService.buscarConexao(casalId)
                .orElseThrow(() -> new IllegalStateException("Conta Google não conectada."));

        GoogleCredential credential = authService.obterCredencialValida(casalId);

        Drive driveService = new Drive.Builder(
                authService.getHttpTransport(),
                authService.getJsonFactory(),
                credential)
                .setApplicationName(APP_NAME)
                .build();

        try {
            List<String> detalhes = new ArrayList<>();
            int total = 0;

            // 1. Cria ou obtém a pasta raiz "ENS - Documentos"
            String pastaRaizId = obterOuCriarPasta(driveService, PASTA_RAIZ_PADRAO, "root");
            detalhes.add("Pasta principal verificada: " + PASTA_RAIZ_PADRAO);
            total++;

            // 2. Cria ou obtém a pasta da equipe
            String nomePastaEquipe = "ENS - Equipe";
            if (equipeId != null && !equipeId.isBlank()) {
                nomePastaEquipe = equipeRepository.findById(equipeId)
                        .map(eq -> "ENS - " + eq.getNomeDevocao())
                        .orElse("ENS - Equipe");
            }
            String pastaEquipeId = obterOuCriarPasta(driveService, nomePastaEquipe, pastaRaizId);
            detalhes.add("Pasta da equipe verificada: " + nomePastaEquipe);
            total++;

            // 3. Subpastas da equipe
            String pastaRoteirosId = obterOuCriarPasta(driveService, "Roteiros Litúrgicos", pastaEquipeId);
            detalhes.add("Subpasta verificada: Roteiros Litúrgicos");
            total++;

            String pastaMuralId = obterOuCriarPasta(driveService, "Fotos do Mural", pastaEquipeId);
            detalhes.add("Subpasta verificada: Fotos do Mural");
            total++;

            // Atualiza metadados na conexão
            conexao.setDrivePastaRaizId(pastaRaizId);
            conexao.setDrivePastaRoteirosId(pastaRoteirosId);
            conexao.setDrivePastaMuralId(pastaMuralId);
            conexao.setUltimaSincronizacaoDrive(Instant.now());
            authService.atualizarConexao(conexao);

            return SincronizacaoResultadoDto.sucesso(
                    "Estrutura do Google Drive provisionada com sucesso.",
                    total,
                    detalhes
            );
        } catch (IOException e) {
            log.error("Erro ao provisionar pastas no Google Drive", e);
            return SincronizacaoResultadoDto.erro("Falha ao comunicar com a Google Drive API: " + e.getMessage(), List.of());
        }
    }

    private String obterOuCriarPasta(Drive drive, String nomePasta, String parentFolderId) throws IOException {
        String query = String.format("mimeType='%s' and name='%s' and '%s' in parents and trashed=false",
                FOLDER_MIME_TYPE, nomePasta.replace("'", "\\'"), parentFolderId);

        FileList resultado = drive.files().list()
                .setQ(query)
                .setSpaces("drive")
                .setFields("files(id, name)")
                .execute();

        if (resultado.getFiles() != null && !resultado.getFiles().isEmpty()) {
            return resultado.getFiles().get(0).getId();
        }

        File metadata = new File();
        metadata.setName(nomePasta);
        metadata.setMimeType(FOLDER_MIME_TYPE);
        if (parentFolderId != null && !parentFolderId.isBlank()) {
            metadata.setParents(Collections.singletonList(parentFolderId));
        }

        File criada = drive.files().create(metadata)
                .setFields("id, name")
                .execute();

        log.info("Pasta criada no Google Drive: {} (id: {}) sob {}", criada.getName(), criada.getId(), parentFolderId);
        return criada.getId();
    }
}
