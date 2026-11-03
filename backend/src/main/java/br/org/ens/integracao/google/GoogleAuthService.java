package br.org.ens.integracao.google;

import br.org.ens.integracao.google.dto.GoogleAuthUrlResponse;
import br.org.ens.integracao.google.dto.GoogleStatusDto;
import br.org.ens.seguranca.CriptografiaService;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private static final List<String> SCOPES = List.of(
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/contacts",
            "https://www.googleapis.com/auth/drive.file"
    );

    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final ConexaoGoogleRepository conexaoRepository;
    private final CriptografiaService criptografiaService;
    private final HttpTransport httpTransport;

    public GoogleAuthService(
            @Value("${integracoes.google.client-id:}") String clientId,
            @Value("${integracoes.google.client-secret:}") String clientSecret,
            @Value("${integracoes.google.redirect-uri:http://localhost:4200/admin/integracao/callback}") String redirectUri,
            ConexaoGoogleRepository conexaoRepository,
            CriptografiaService criptografiaService) {
        this.clientId = clientId != null ? clientId.trim() : "";
        this.clientSecret = clientSecret != null ? clientSecret.trim() : "";
        this.redirectUri = redirectUri != null ? redirectUri.trim() : "";
        this.conexaoRepository = conexaoRepository;
        this.criptografiaService = criptografiaService;
        try {
            this.httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        } catch (GeneralSecurityException | IOException e) {
            throw new IllegalStateException("Falha ao inicializar HttpTransport para APIs Google", e);
        }
    }

    public boolean isConfigurado() {
        return !clientId.isBlank() && !clientSecret.isBlank();
    }

    public GoogleAuthUrlResponse gerarAuthUrl(String state) {
        if (!isConfigurado()) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED,
                    "Credenciais do Google não foram configuradas no arquivo de ambiente (.env).");
        }

        GoogleAuthorizationCodeRequestUrl urlBuilder = new GoogleAuthorizationCodeRequestUrl(
                clientId,
                redirectUri,
                SCOPES
        ).setAccessType("offline").set("prompt", "consent");

        if (state != null && !state.isBlank()) {
            urlBuilder.setState(state);
        }

        return new GoogleAuthUrlResponse(urlBuilder.build());
    }

    public GoogleStatusDto processarCallback(String code, String casalId) {
        if (!isConfigurado()) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED,
                    "Credenciais do Google ausentes no servidor.");
        }

        try {
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    httpTransport,
                    JSON_FACTORY,
                    clientId,
                    clientSecret,
                    SCOPES
            ).setAccessType("offline").build();

            GoogleTokenResponse response = flow.newTokenRequest(code)
                    .setRedirectUri(redirectUri)
                    .execute();

            String accessToken = response.getAccessToken();
            String refreshToken = response.getRefreshToken();
            Long expiresInSeconds = response.getExpiresInSeconds();
            Instant expiracao = expiresInSeconds != null
                    ? Instant.now().plusSeconds(expiresInSeconds)
                    : Instant.now().plusSeconds(3600);

            GoogleIdToken idToken = response.parseIdToken();
            String email = "integracao@ens.org.br";
            String nome = "Conta Google ENS";
            if (idToken != null && idToken.getPayload() != null) {
                if (idToken.getPayload().getEmail() != null) {
                    email = idToken.getPayload().getEmail();
                }
                Object nameObj = idToken.getPayload().get("name");
                if (nameObj != null) {
                    nome = nameObj.toString();
                }
            }

            ConexaoGoogle conexao = conexaoRepository.findByCasalId(casalId)
                    .orElseGet(() -> new ConexaoGoogle(casalId, null, null));

            conexao.setEmailGoogle(email);
            conexao.setNomeGoogle(nome);
            conexao.setAccessTokenCifrado(criptografiaService.cifrar(accessToken));
            if (refreshToken != null && !refreshToken.isBlank()) {
                conexao.setRefreshTokenCifrado(criptografiaService.cifrar(refreshToken));
            }
            conexao.setExpiracaoToken(expiracao);

            ConexaoGoogle salva = conexaoRepository.save(conexao);
            log.info("Conexão com Google Workspace estabelecida para o casal {}: {}", casalId, email);

            return toDto(salva);
        } catch (IOException e) {
            log.error("Erro ao processar callback de autenticação do Google", e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao autenticar com o Google: " + e.getMessage());
        }
    }

    public GoogleCredential obterCredencialValida(String casalId) {
        ConexaoGoogle conexao = conexaoRepository.findByCasalId(casalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Nenhuma conta Google conectada para o casal atual. Conecte sua conta em Administração > Integração."));

        String accessToken = criptografiaService.decifrar(conexao.getAccessTokenCifrado());
        String refreshToken = criptografiaService.decifrar(conexao.getRefreshTokenCifrado());

        GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(httpTransport)
                .setJsonFactory(JSON_FACTORY)
                .setClientSecrets(clientId, clientSecret)
                .build();

        credential.setAccessToken(accessToken);
        credential.setRefreshToken(refreshToken);

        // Se o token estiver expirado ou perto de expirar (menos de 2 minutos), renova
        if (conexao.getExpiracaoToken() == null || Instant.now().isAfter(conexao.getExpiracaoToken().minusSeconds(120))) {
            if (refreshToken != null && !refreshToken.isBlank()) {
                try {
                    boolean sucesso = credential.refreshToken();
                    if (sucesso) {
                        conexao.setAccessTokenCifrado(criptografiaService.cifrar(credential.getAccessToken()));
                        Long expiresIn = credential.getExpiresInSeconds();
                        conexao.setExpiracaoToken(expiresIn != null ? Instant.now().plusSeconds(expiresIn) : Instant.now().plusSeconds(3600));
                        conexaoRepository.save(conexao);
                        log.info("Access token do Google renovado com sucesso via refresh token para o casal {}", casalId);
                    }
                } catch (IOException e) {
                    log.error("Falha ao renovar token OAuth do Google", e);
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão do Google expirada. Por favor, reconecte sua conta.");
                }
            }
        }

        return credential;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public GoogleStatusDto obterStatus(String casalId) {
        boolean configurado = isConfigurado();
        if (casalId == null) {
            return GoogleStatusDto.desconectado(configurado, redirectUri);
        }
        return conexaoRepository.findByCasalId(casalId)
                .map(this::toDto)
                .orElse(GoogleStatusDto.desconectado(configurado, redirectUri));
    }

    public GoogleStatusDto desconectar(String casalId) {
        conexaoRepository.deleteByCasalId(casalId);
        log.info("Conexão com Google Workspace removida para o casal {}", casalId);
        return GoogleStatusDto.desconectado(isConfigurado(), redirectUri);
    }

    public void atualizarConexao(ConexaoGoogle conexao) {
        conexaoRepository.save(conexao);
    }

    public Optional<ConexaoGoogle> buscarConexao(String casalId) {
        return conexaoRepository.findByCasalId(casalId);
    }

    public HttpTransport getHttpTransport() {
        return httpTransport;
    }

    public GsonFactory getJsonFactory() {
        return JSON_FACTORY;
    }

    private GoogleStatusDto toDto(ConexaoGoogle c) {
        return new GoogleStatusDto(
                c.getAccessTokenCifrado() != null,
                isConfigurado(),
                c.getEmailGoogle(),
                c.getNomeGoogle(),
                c.getCalendarioEnsId(),
                c.getGrupoContatosResourceName(),
                c.getDrivePastaRaizId(),
                c.getUltimaSincronizacaoAgenda(),
                c.getUltimaSincronizacaoContatos(),
                c.getUltimaSincronizacaoDrive(),
                redirectUri
        );
    }
}
