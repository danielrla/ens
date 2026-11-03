package br.org.ens.comum;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmail(String destinatario, String assunto, String conteudo) {
        log.info("Tentando enviar e-mail para [{}]: Assunto: {}", destinatario, assunto);
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(destinatario);
                message.setSubject(assunto);
                message.setText(conteudo);
                mailSender.send(message);
                log.info("E-mail enviado com sucesso via SMTP para [{}]", destinatario);
                return;
            } catch (Exception ex) {
                log.warn("Falha ao enviar via SMTP ({}), utilizando fallback de log local.", ex.getMessage());
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

