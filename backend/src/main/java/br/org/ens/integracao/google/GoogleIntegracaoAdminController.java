package br.org.ens.integracao.google;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalRepository;
import br.org.ens.casal.StatusCasal;
import br.org.ens.integracao.google.dto.GoogleAuthUrlResponse;
import br.org.ens.integracao.google.dto.GoogleCallbackRequest;
import br.org.ens.integracao.google.dto.GoogleStatusDto;
import br.org.ens.integracao.google.dto.SincronizacaoResultadoDto;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/admin/integracoes/google")
public class GoogleIntegracaoAdminController {

    private final GoogleAuthService authService;
    private final GoogleCalendarService calendarService;
    private final GoogleContactsService contactsService;
    private final GoogleDriveService driveService;
    private final CasalRepository casalRepository;

    public GoogleIntegracaoAdminController(
            GoogleAuthService authService,
            GoogleCalendarService calendarService,
            GoogleContactsService contactsService,
            GoogleDriveService driveService,
            CasalRepository casalRepository) {
        this.authService = authService;
        this.calendarService = calendarService;
        this.contactsService = contactsService;
        this.driveService = driveService;
        this.casalRepository = casalRepository;
    }

    @GetMapping("/status")
    public GoogleStatusDto obterStatus() {
        Casal casal = obterCasalAtivo();
        return authService.obterStatus(casal != null ? casal.getId() : null);
    }

    @GetMapping("/auth-url")
    public GoogleAuthUrlResponse obterAuthUrl(@RequestParam(required = false) String state) {
        return authService.gerarAuthUrl(state);
    }

    @PostMapping("/callback")
    public GoogleStatusDto processarCallback(@Valid @RequestBody GoogleCallbackRequest request) {
        Casal casal = obterCasalAtivoOuFalhar();
        return authService.processarCallback(request.code(), casal.getId());
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> processarCallbackGet(
            @RequestParam(name = "code", required = false) String code,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "error", required = false) String error) {
        if (error != null && !error.isBlank()) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:4200/admin/integracao?erro=" + error))
                    .build();
        }
        if (code == null || code.isBlank()) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:4200/admin/integracao?erro=codigo_ausente"))
                    .build();
        }
        try {
            Casal casal = obterCasalAtivoOuFalhar();
            authService.processarCallback(code, casal.getId());
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:4200/admin/integracao?conectado=sucesso"))
                    .build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:4200/admin/integracao?erro=" + e.getMessage()))
                    .build();
        }
    }

    @DeleteMapping("/desconectar")
    @ResponseStatus(HttpStatus.OK)
    public GoogleStatusDto desconectar() {
        Casal casal = obterCasalAtivoOuFalhar();
        return authService.desconectar(casal.getId());
    }

    @PostMapping("/agenda/sincronizar")
    public SincronizacaoResultadoDto sincronizarAgenda() {
        Casal casal = obterCasalAtivoOuFalhar();
        return calendarService.sincronizarAgenda(casal.getId(), casal.getEquipeId());
    }

    @PostMapping("/contatos/sincronizar")
    public SincronizacaoResultadoDto sincronizarContatos() {
        Casal casal = obterCasalAtivoOuFalhar();
        return contactsService.sincronizarContatos(casal.getId(), casal.getEquipeId());
    }

    @PostMapping("/drive/sincronizar")
    public SincronizacaoResultadoDto sincronizarDrive() {
        Casal casal = obterCasalAtivoOuFalhar();
        return driveService.provisionarEstruturaDrive(casal.getId(), casal.getEquipeId());
    }

    @PostMapping("/sincronizar-tudo")
    public SincronizacaoResultadoDto sincronizarTudo() {
        Casal casal = obterCasalAtivoOuFalhar();
        List<String> detalhes = new ArrayList<>();
        int total = 0;

        SincronizacaoResultadoDto resDrive = driveService.provisionarEstruturaDrive(casal.getId(), casal.getEquipeId());
        detalhes.addAll(resDrive.detalhes());
        total += resDrive.itensSincronizados();

        SincronizacaoResultadoDto resAgenda = calendarService.sincronizarAgenda(casal.getId(), casal.getEquipeId());
        detalhes.addAll(resAgenda.detalhes());
        total += resAgenda.itensSincronizados();

        SincronizacaoResultadoDto resContatos = contactsService.sincronizarContatos(casal.getId(), casal.getEquipeId());
        detalhes.addAll(resContatos.detalhes());
        total += resContatos.itensSincronizados();

        return SincronizacaoResultadoDto.sucesso(
                "Sincronização em lote com Google Workspace finalizada.",
                total,
                detalhes
        );
    }

    private Casal obterCasalAtivo() {
        return casalRepository.findFirstByEsposoEmail("danielrla@gmail.com")
                .or(() -> casalRepository.findAll().stream().filter(c -> c.getStatus() == StatusCasal.ATIVO).findFirst())
                .orElse(null);
    }

    private Casal obterCasalAtivoOuFalhar() {
        Casal casal = obterCasalAtivo();
        if (casal == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum perfil de casal ativo encontrado.");
        }
        return casal;
    }
}
