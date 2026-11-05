package br.org.ens.comum;

import br.org.ens.email.EmailAdminService;
import br.org.ens.email.dto.EnviarEmailRequest;
import br.org.ens.email.dto.TesteEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final EmailAdminService emailAdminService;

    public EmailService(@Autowired(required = false) EmailAdminService emailAdminService) {
        this.emailAdminService = emailAdminService;
    }

    public void enviarEmail(String destinatario, String assunto, String conteudo) {
        log.info("Tentando enviar e-mail para [{}]: Assunto: {}", destinatario, assunto);
        if (emailAdminService != null) {
            try {
                TesteEmailResponse resp = emailAdminService.enviarEmail(new EnviarEmailRequest(
                        destinatario,
                        assunto,
                        conteudo,
                        "AVISO_REUNIAO"
                ));
                if (resp.sucesso()) {
                    log.info("E-mail enviado e registrado com sucesso via EmailAdminService para [{}]", destinatario);
                    return;
                } else {
                    log.warn("Falha no disparo via credenciais do banco: {}", resp.mensagem());
                }
            } catch (Exception ex) {
                log.warn("Falha ao enviar via EmailAdminService ({}), utilizando log de fallback.", ex.getMessage());
            }
        }
        // Fallback para desenvolvimento e ambientes locais
        log.info("=== [NOTIFICAÇÃO ENS / E-MAIL SIMULADO] ===");
        log.info("Para: {}", destinatario);
        log.info("Assunto: {}", assunto);
        log.info("Mensagem:\n{}", conteudo);
        log.info("===========================================");
    }
}
