package br.org.ens.reuniao;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalRepository;
import br.org.ens.casal.StatusCasal;
import br.org.ens.comum.EmailService;
import br.org.ens.equipe.Equipe;
import br.org.ens.equipe.EquipeRepository;
import br.org.ens.sce.Sce;
import br.org.ens.sce.SceRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReuniaoAlertaScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReuniaoAlertaScheduler.class);
    private static final ZoneId ZONE_CUIABA = ZoneId.of("America/Cuiaba");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ReuniaoRepository reuniaoRepository;
    private final EquipeRepository equipeRepository;
    private final CasalRepository casalRepository;
    private final SceRepository sceRepository;
    private final EmailService emailService;

    public ReuniaoAlertaScheduler(
            ReuniaoRepository reuniaoRepository,
            EquipeRepository equipeRepository,
            CasalRepository casalRepository,
            SceRepository sceRepository,
            EmailService emailService
    ) {
        this.reuniaoRepository = reuniaoRepository;
        this.equipeRepository = equipeRepository;
        this.casalRepository = casalRepository;
        this.sceRepository = sceRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 8 * * *", zone = "America/Cuiaba")
    public void enviarAlertasDMenosUmAgendado() {
        log.info("Executando verificação agendada de lembretes D-1 para reuniões de amanhã.");
        enviarAlertasParaData(LocalDate.now(ZONE_CUIABA).plusDays(1));
    }

    public int enviarAlertasParaData(LocalDate dataAlvo) {
        List<Reuniao> reunioes = reuniaoRepository.findByData(dataAlvo);
        if (reunioes.isEmpty()) {
            log.info("Nenhuma reunião agendada para a data alvo: {}", dataAlvo);
            return 0;
        }

        int totalEmailsEnviados = 0;

        for (Reuniao r : reunioes) {
            String equipeNome = "Equipe ENS";
            String sceEmail = null;
            String sceNome = null;

            if (r.getEquipeId() != null && !r.getEquipeId().isBlank()) {
                Equipe eq = equipeRepository.findById(r.getEquipeId()).orElse(null);
                if (eq != null) {
                    equipeNome = "Equipe " + eq.getNomeDevocao();
                    if (eq.getSceId() != null && !eq.getSceId().isBlank()) {
                        Sce sce = sceRepository.findById(eq.getSceId()).orElse(null);
                        if (sce != null) {
                            sceEmail = sce.getEmail();
                            sceNome = sce.getNomeCompleto();
                        }
                    }
                }
            }

            String titulo = (r.getTema() != null && !r.getTema().isBlank()) ? r.getTema() : "Reunião de Equipe";
            String horario = (r.getHorario() != null && !r.getHorario().isBlank()) ? r.getHorario() : "Horário a confirmar";
            String local = (r.getLocalObservacao() != null && !r.getLocalObservacao().isBlank()) ? r.getLocalObservacao() : "Local a confirmar";

            String assunto = "🔔 Lembrete: " + titulo + " amanhã (" + dataAlvo.format(DATE_FORMATTER) + ") - " + equipeNome;

            StringBuilder mensagem = new StringBuilder();
            mensagem.append("Paz e Bem!\n\n");
            mensagem.append("Este é um lembrete de que sua equipe tem um encontro agendado para amanhã:\n\n");
            mensagem.append("• Equipe: ").append(equipeNome).append("\n");
            mensagem.append("• Tipo: ").append(r.getTipo()).append("\n");
            mensagem.append("• Título / Tema: ").append(titulo).append("\n");
            mensagem.append("• Data: ").append(dataAlvo.format(DATE_FORMATTER)).append("\n");
            mensagem.append("• Horário: ").append(horario).append("\n");
            mensagem.append("• Local: ").append(local).append("\n");

            if (r.getAnotacoesCre() != null && !r.getAnotacoesCre().isBlank()) {
                mensagem.append("• Observações / Pauta: ").append(r.getAnotacoesCre()).append("\n");
            }

            mensagem.append("\nContamos com a presença e oração de todos os casais e do nosso conselheiro espiritual!\n\n");
            mensagem.append("Equipes de Nossa Senhora");

            String corpo = mensagem.toString();

            // Destinatários: casais ativos da equipe
            if (r.getEquipeId() != null) {
                List<Casal> casais = casalRepository.findByEquipeId(r.getEquipeId()).stream()
                        .filter(c -> c.getStatus() == StatusCasal.ATIVO)
                        .toList();

                for (Casal c : casais) {
                    if (c.getEsposo() != null && c.getEsposo().email() != null && !c.getEsposo().email().isBlank()) {
                        emailService.enviarEmail(c.getEsposo().email(), assunto, corpo);
                        totalEmailsEnviados++;
                    }
                    if (c.getEsposa() != null && c.getEsposa().email() != null && !c.getEsposa().email().isBlank()) {
                        emailService.enviarEmail(c.getEsposa().email(), assunto, corpo);
                        totalEmailsEnviados++;
                    }
                }
            }

            // Sacerdote / SCE
            if (sceEmail != null && !sceEmail.isBlank()) {
                emailService.enviarEmail(sceEmail, assunto, corpo);
                totalEmailsEnviados++;
            }
        }

        log.info("Lembretes D-1 finalizados para data {}. Total de notificações disparadas: {}", dataAlvo, totalEmailsEnviados);
        return totalEmailsEnviados;
    }
}

