package br.org.ens.integracao.google;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalRepository;
import br.org.ens.casal.StatusCasal;
import br.org.ens.equipe.Equipe;
import br.org.ens.equipe.EquipeRepository;
import br.org.ens.integracao.google.dto.SincronizacaoResultadoDto;
import br.org.ens.reuniao.Reuniao;
import br.org.ens.reuniao.ReuniaoRepository;
import br.org.ens.reuniao.TipoReuniao;
import br.org.ens.sce.Sce;
import br.org.ens.sce.SceRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.CalendarList;
import com.google.api.services.calendar.model.CalendarListEntry;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class GoogleCalendarService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarService.class);
    private static final String APP_NAME = "ENS-Gestao";
    private static final String CALENDAR_TITLE_PADRAO = "ENS - Minha Equipe";
    private static final ZoneId ZONE_CUIABA = ZoneId.of("America/Cuiaba");

    private final GoogleAuthService authService;
    private final ReuniaoRepository reuniaoRepository;
    private final CasalRepository casalRepository;
    private final EquipeRepository equipeRepository;
    private final SceRepository sceRepository;

    public GoogleCalendarService(
            GoogleAuthService authService,
            ReuniaoRepository reuniaoRepository,
            CasalRepository casalRepository,
            EquipeRepository equipeRepository,
            SceRepository sceRepository) {
        this.authService = authService;
        this.reuniaoRepository = reuniaoRepository;
        this.casalRepository = casalRepository;
        this.equipeRepository = equipeRepository;
        this.sceRepository = sceRepository;
    }

    public SincronizacaoResultadoDto sincronizarAgenda(String casalId, String equipeId) {
        ConexaoGoogle conexao = authService.buscarConexao(casalId)
                .orElseThrow(() -> new IllegalStateException("Conta Google não conectada."));

        GoogleCredential credential = authService.obterCredencialValida(casalId);

        Calendar calendarService = new Calendar.Builder(
                authService.getHttpTransport(),
                authService.getJsonFactory(),
                credential)
                .setApplicationName(APP_NAME)
                .build();

        try {
            String calendarId = obterOuCriarCalendarioEns(calendarService, conexao, equipeId);
            List<String> detalhes = new ArrayList<>();
            int totalSincronizados = 0;

            // 1. Sincronização de Reuniões da Equipe
            if (equipeId != null && !equipeId.isBlank()) {
                List<Reuniao> reunioes = reuniaoRepository.findByEquipeIdOrderByDataDesc(equipeId);
                for (Reuniao reuniao : reunioes) {
                    if (reuniao.getData() == null) continue;
                    Event evento = montarEventoReuniao(reuniao, equipeId);
                    if (reuniao.getGoogleEventId() != null && !reuniao.getGoogleEventId().isBlank()) {
                        try {
                            calendarService.events().update(calendarId, reuniao.getGoogleEventId(), evento)
                                    .setSendUpdates("all")
                                    .execute();
                            detalhes.add("Reunião de " + reuniao.getData() + " atualizada no calendário.");
                        } catch (IOException e) {
                            Event criado = calendarService.events().insert(calendarId, evento)
                                    .setSendUpdates("all")
                                    .execute();
                            reuniao.setGoogleEventId(criado.getId());
                            reuniaoRepository.save(reuniao);
                            detalhes.add("Reunião de " + reuniao.getData() + " recriada no calendário.");
                        }
                    } else {
                        Event criado = calendarService.events().insert(calendarId, evento)
                                .setSendUpdates("all")
                                .execute();
                        reuniao.setGoogleEventId(criado.getId());
                        reuniaoRepository.save(reuniao);
                        detalhes.add("Reunião de " + reuniao.getData() + " inserida no calendário.");
                    }
                    totalSincronizados++;
                }

                // 2. Sincronização de Aniversários dos Casais da Equipe
                List<Casal> casais = casalRepository.findByEquipeId(equipeId).stream()
                        .filter(c -> c.getStatus() == StatusCasal.ATIVO)
                        .toList();

                for (Casal c : casais) {
                    if (c.getDataMatrimonio() != null && c.getEsposo() != null && c.getEsposa() != null) {
                        Event eventoCasamento = montarEventoAniversarioMatrimonio(c);
                        calendarService.events().insert(calendarId, eventoCasamento).execute();
                        totalSincronizados++;
                        detalhes.add("Aniversário de matrimônio de " + c.getEsposo().nomeCompleto() + " & " + c.getEsposa().nomeCompleto() + " inserido.");
                    }
                }
            }

            conexao.setCalendarioEnsId(calendarId);
            conexao.setUltimaSincronizacaoAgenda(Instant.now());
            authService.atualizarConexao(conexao);

            return SincronizacaoResultadoDto.sucesso(
                    "Sincronização com Google Agenda concluída com sucesso.",
                    totalSincronizados,
                    detalhes
            );
        } catch (IOException e) {
            log.error("Erro ao sincronizar eventos com o Google Calendar", e);
            return SincronizacaoResultadoDto.erro("Falha ao comunicar com a Google Calendar API: " + e.getMessage(), List.of());
        }
    }

    private String obterOuCriarCalendarioEns(Calendar service, ConexaoGoogle conexao, String equipeId) {
        String tituloDesejado = CALENDAR_TITLE_PADRAO;
        if (equipeId != null && !equipeId.isBlank()) {
            tituloDesejado = equipeRepository.findById(equipeId)
                    .map(eq -> "ENS - " + eq.getNomeDevocao())
                    .orElse(CALENDAR_TITLE_PADRAO);
        }

        if (conexao.getCalendarioEnsId() != null && !conexao.getCalendarioEnsId().isBlank()) {
            try {
                com.google.api.services.calendar.model.Calendar existente = service.calendars().get(conexao.getCalendarioEnsId()).execute();
                if (existente != null && existente.getId() != null) {
                    return existente.getId();
                }
            } catch (Exception e) {
                log.warn("Calendário anterior não encontrado ({}), buscando por título ou criando novo.", conexao.getCalendarioEnsId());
            }
        }

        try {
            CalendarList calendarList = service.calendarList().list().execute();
            if (calendarList.getItems() != null) {
                for (CalendarListEntry entry : calendarList.getItems()) {
                    if (tituloDesejado.equalsIgnoreCase(entry.getSummary()) || CALENDAR_TITLE_PADRAO.equalsIgnoreCase(entry.getSummary())) {
                        return entry.getId();
                    }
                }
            }

            com.google.api.services.calendar.model.Calendar novo = new com.google.api.services.calendar.model.Calendar();
            novo.setSummary(tituloDesejado);
            novo.setTimeZone("America/Cuiaba");
            novo.setDescription("Calendário oficial de reuniões e celebrações das Equipes de Nossa Senhora");

            com.google.api.services.calendar.model.Calendar criado = service.calendars().insert(novo).execute();
            log.info("Calendário secundário criado no Google Calendar: {} ({})", criado.getSummary(), criado.getId());
            return criado.getId();
        } catch (Exception e) {
            log.warn("Permissão restrita para listar ou criar calendário secundário ({}), utilizando calendário principal 'primary' como fallback.", e.getMessage());
            return "primary";
        }
    }

    public void sincronizarEventoReuniao(Reuniao reuniao, String equipeId) {
        if (reuniao == null || reuniao.getData() == null) {
            return;
        }
        // Identifica conexão ativa do casal logado ou qualquer casal conectado da equipe
        Optional<ConexaoGoogle> optConexao = authService.buscarConexao("danielrla@gmail.com")
                .or(() -> authService.buscarConexao(obterCasalIdConectado()));

        if (optConexao.isEmpty()) {
            log.info("Nenhuma conta Google conectada para sincronização em tempo real da reunião {}", reuniao.getId());
            return;
        }

        ConexaoGoogle conexao = optConexao.get();
        try {
            GoogleCredential credential = authService.obterCredencialValida(conexao.getCasalId());
            Calendar calendarService = new Calendar.Builder(
                    authService.getHttpTransport(),
                    authService.getJsonFactory(),
                    credential)
                    .setApplicationName(APP_NAME)
                    .build();

            String calendarId = obterOuCriarCalendarioEns(calendarService, conexao, equipeId);
            Event evento = montarEventoReuniao(reuniao, equipeId);

            if (reuniao.getGoogleEventId() != null && !reuniao.getGoogleEventId().isBlank()) {
                try {
                    calendarService.events().update(calendarId, reuniao.getGoogleEventId(), evento)
                            .setSendUpdates("all")
                            .execute();
                    log.info("Evento da reunião {} atualizado no Google Calendar: {}", reuniao.getId(), reuniao.getGoogleEventId());
                } catch (IOException e) {
                    Event criado = calendarService.events().insert(calendarId, evento)
                            .setSendUpdates("all")
                            .execute();
                    reuniao.setGoogleEventId(criado.getId());
                    reuniaoRepository.save(reuniao);
                    log.info("Evento da reunião {} recriado no Google Calendar: {}", reuniao.getId(), criado.getId());
                }
            } else {
                Event criado = calendarService.events().insert(calendarId, evento)
                        .setSendUpdates("all")
                        .execute();
                reuniao.setGoogleEventId(criado.getId());
                reuniaoRepository.save(reuniao);
                log.info("Evento da reunião {} inserido no Google Calendar: {}", reuniao.getId(), criado.getId());
            }
        } catch (Exception e) {
            log.warn("Falha ao sincronizar evento da reunião {} com o Google Calendar: {}", reuniao.getId(), e.getMessage());
        }
    }

    public void excluirEventoReuniao(Reuniao reuniao, String equipeId) {
        if (reuniao == null || reuniao.getGoogleEventId() == null || reuniao.getGoogleEventId().isBlank()) {
            return;
        }
        Optional<ConexaoGoogle> optConexao = authService.buscarConexao("danielrla@gmail.com")
                .or(() -> authService.buscarConexao(obterCasalIdConectado()));

        if (optConexao.isEmpty()) {
            return;
        }
        ConexaoGoogle conexao = optConexao.get();
        try {
            GoogleCredential credential = authService.obterCredencialValida(conexao.getCasalId());
            Calendar calendarService = new Calendar.Builder(
                    authService.getHttpTransport(),
                    authService.getJsonFactory(),
                    credential)
                    .setApplicationName(APP_NAME)
                    .build();

            String calendarId = obterOuCriarCalendarioEns(calendarService, conexao, equipeId);
            calendarService.events().delete(calendarId, reuniao.getGoogleEventId())
                    .setSendUpdates("all")
                    .execute();
            log.info("Evento {} excluído do Google Calendar com sucesso.", reuniao.getGoogleEventId());
        } catch (Exception e) {
            log.warn("Falha ao excluir evento {} do Google Calendar: {}", reuniao.getGoogleEventId(), e.getMessage());
        }
    }

    private String obterCasalIdConectado() {
        return casalRepository.findFirstByEsposoEmail("danielrla@gmail.com")
                .or(() -> casalRepository.findAll().stream().filter(c -> c.getStatus() == StatusCasal.ATIVO).findFirst())
                .map(Casal::getId)
                .orElse(null);
    }

    private Event montarEventoReuniao(Reuniao reuniao, String equipeId) {
        Event evento = new Event();
        TipoReuniao tipo = reuniao.getTipo() != null ? reuniao.getTipo() : TipoReuniao.FORMAL;

        // 1. Título do Evento
        String titulo;
        if (tipo == TipoReuniao.OUTROS) {
            titulo = (reuniao.getTema() != null && !reuniao.getTema().isBlank())
                    ? "ENS - " + reuniao.getTema()
                    : "ENS - Encontro / Outros";
        } else if (tipo == TipoReuniao.INFORMAL) {
            titulo = (reuniao.getTema() != null && !reuniao.getTema().isBlank())
                    ? "ENS - Reunião Informal: " + reuniao.getTema()
                    : "ENS - Reunião Informal";
        } else {
            titulo = (reuniao.getTema() != null && !reuniao.getTema().isBlank())
                    ? "ENS - Reunião Mensal: " + reuniao.getTema()
                    : "ENS - Reunião Mensal";
        }
        evento.setSummary(titulo);

        // 2. Descrição do Evento
        StringBuilder desc = new StringBuilder();
        if (tipo == TipoReuniao.OUTROS) {
            if (reuniao.getAnotacoesCre() != null && !reuniao.getAnotacoesCre().isBlank()) {
                desc.append("Descrição / Pauta: ").append(reuniao.getAnotacoesCre()).append("\n\n");
            }
            if (reuniao.getLocalObservacao() != null && !reuniao.getLocalObservacao().isBlank()) {
                desc.append("Local: ").append(reuniao.getLocalObservacao()).append("\n");
            }
        } else {
            desc.append("Tipo: ").append(tipo).append("\n");
            if (reuniao.getTema() != null && !reuniao.getTema().isBlank()) {
                desc.append("Tema: ").append(reuniao.getTema()).append("\n");
            }
            if (reuniao.isScePresente()) {
                desc.append("Presença confirmada do SCE / Conselheiro Espiritual.\n");
            }
            if (reuniao.getLocalObservacao() != null && !reuniao.getLocalObservacao().isBlank()) {
                desc.append("Observações de Local: ").append(reuniao.getLocalObservacao()).append("\n");
            }
            if (reuniao.getAnotacoesCre() != null && !reuniao.getAnotacoesCre().isBlank()) {
                desc.append("Anotações da Equipe: ").append(reuniao.getAnotacoesCre()).append("\n");
            }
        }
        evento.setDescription(desc.toString());

        // 3. Localização
        if (reuniao.getLocalObservacao() != null && !reuniao.getLocalObservacao().isBlank()) {
            evento.setLocation(reuniao.getLocalObservacao());
        }

        // 4. Data e Horário
        LocalDate data = reuniao.getData();
        if (reuniao.getHorario() != null && reuniao.getHorario().matches("\\d{2}:\\d{2}")) {
            LocalTime hora = LocalTime.parse(reuniao.getHorario());
            ZonedDateTime inicio = data.atTime(hora).atZone(ZONE_CUIABA);
            ZonedDateTime fim = inicio.plusHours(2);
            evento.setStart(new EventDateTime().setDateTime(new DateTime(inicio.toInstant().toEpochMilli())).setTimeZone("America/Cuiaba"));
            evento.setEnd(new EventDateTime().setDateTime(new DateTime(fim.toInstant().toEpochMilli())).setTimeZone("America/Cuiaba"));
        } else {
            DateTime dataDia = new DateTime(data.toString());
            evento.setStart(new EventDateTime().setDate(dataDia));
            evento.setEnd(new EventDateTime().setDate(dataDia));
        }

        // 5. Convidados (Attendees): Membros ativos da equipe + Sacerdote/SCE
        List<EventAttendee> attendees = new ArrayList<>();
        if (equipeId != null && !equipeId.isBlank()) {
            List<Casal> casais = casalRepository.findByEquipeId(equipeId).stream()
                    .filter(c -> c.getStatus() == StatusCasal.ATIVO)
                    .toList();

            for (Casal c : casais) {
                if (c.getEsposo() != null && c.getEsposo().email() != null && !c.getEsposo().email().isBlank()) {
                    attendees.add(new EventAttendee()
                            .setEmail(c.getEsposo().email())
                            .setDisplayName(c.getEsposo().nomeCompleto()));
                }
                if (c.getEsposa() != null && c.getEsposa().email() != null && !c.getEsposa().email().isBlank()) {
                    attendees.add(new EventAttendee()
                            .setEmail(c.getEsposa().email())
                            .setDisplayName(c.getEsposa().nomeCompleto()));
                }
            }

            equipeRepository.findById(equipeId).ifPresent(eq -> {
                if (eq.getSceId() != null && !eq.getSceId().isBlank()) {
                    sceRepository.findById(eq.getSceId()).ifPresent(sce -> {
                        if (sce.getEmail() != null && !sce.getEmail().isBlank()) {
                            attendees.add(new EventAttendee()
                                    .setEmail(sce.getEmail())
                                    .setDisplayName(sce.getNomeCompleto() + " (SCE)"));
                        }
                    });
                }
            });
        }

        if (!attendees.isEmpty()) {
            evento.setAttendees(attendees);
        }

        return evento;
    }

    private Event montarEventoAniversarioMatrimonio(Casal casal) {
        Event evento = new Event();
        String nomes = casal.getEsposo().nomeCompleto() + " & " + casal.getEsposa().nomeCompleto();
        evento.setSummary("🎂 Aniversário de Casamento - " + nomes);
        evento.setDescription("Celebração do sacramento do matrimônio da equipe ENS.");

        LocalDate data = casal.getDataMatrimonio();
        evento.setStart(new EventDateTime().setDate(new DateTime(data.toString())));
        evento.setEnd(new EventDateTime().setDate(new DateTime(data.toString())));
        evento.setRecurrence(List.of("RRULE:FREQ=YEARLY"));
        return evento;
    }
}
