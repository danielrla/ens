package br.org.ens.email;

import br.org.ens.email.dto.EmailConfigDto;
import br.org.ens.email.dto.EnviarEmailRequest;
import br.org.ens.email.dto.LogEnvioEmailDto;
import br.org.ens.email.dto.SalvarEmailConfigRequest;
import br.org.ens.email.dto.TesteEmailRequest;
import br.org.ens.email.dto.TesteEmailResponse;
import br.org.ens.seguranca.CriptografiaService;
import java.time.Instant;
import java.util.List;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailAdminService {

    private static final Logger log = LoggerFactory.getLogger(EmailAdminService.class);

    private final EmailConfigRepository configRepository;
    private final LogEnvioEmailRepository logRepository;
    private final CriptografiaService criptografiaService;

    public EmailAdminService(
            EmailConfigRepository configRepository,
            LogEnvioEmailRepository logRepository,
            CriptografiaService criptografiaService) {
        this.configRepository = configRepository;
        this.logRepository = logRepository;
        this.criptografiaService = criptografiaService;
    }

    public EmailConfig obterEntidadeConfig() {
        return configRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> configRepository.save(new EmailConfig()));
    }

    public EmailConfigDto obterConfiguracao() {
        EmailConfig config = obterEntidadeConfig();
        return toDto(config);
    }

    public EmailConfigDto salvarConfiguracao(SalvarEmailConfigRequest req) {
        EmailConfig config = obterEntidadeConfig();

        if (req.metodo() != null && !req.metodo().isBlank()) {
            config.setMetodo(req.metodo());
        }
        if (req.remetenteEmail() != null && !req.remetenteEmail().isBlank()) {
            config.setRemetenteEmail(req.remetenteEmail().trim());
        }
        if (req.remetenteNome() != null && !req.remetenteNome().isBlank()) {
            config.setRemetenteNome(req.remetenteNome().trim());
        }
        if (req.smtpHost() != null && !req.smtpHost().isBlank()) {
            config.setSmtpHost(req.smtpHost().trim());
        }
        if (req.smtpPorta() != null && req.smtpPorta() > 0) {
            config.setSmtpPorta(req.smtpPorta());
        }
        if (req.smtpUsuario() != null && !req.smtpUsuario().isBlank()) {
            config.setSmtpUsuario(req.smtpUsuario().trim());
        } else if (req.remetenteEmail() != null) {
            config.setSmtpUsuario(req.remetenteEmail().trim());
        }
        if (req.usaTls() != null) {
            config.setUsaTls(req.usaTls());
        }
        if (req.oauthClientId() != null) {
            config.setOauthClientId(req.oauthClientId().trim());
        }

        // Cifragem segura de credenciais sensíveis
        if (req.senhaAppReal() != null && !req.senhaAppReal().isBlank()) {
            config.setSenhaAppCifrada(criptografiaService.cifrar(req.senhaAppReal().trim()));
        }
        if (req.oauthClientSecretReal() != null && !req.oauthClientSecretReal().isBlank()) {
            config.setOauthClientSecretCifrado(criptografiaService.cifrar(req.oauthClientSecretReal().trim()));
        }

        config.setAtualizadoEm(Instant.now());
        EmailConfig salvo = configRepository.save(config);
        log.info("Configuração de e-mail atualizada com sucesso no MongoDB para o remetente [{}]", salvo.getRemetenteEmail());
        return toDto(salvo);
    }

    public TesteEmailResponse testarEnvio(TesteEmailRequest req) {
        EmailConfig config = obterEntidadeConfig();
        String destinatario = req.destinatario() != null && !req.destinatario().isBlank()
                ? req.destinatario().trim()
                : "danielrla@gmail.com";
        String assunto = req.assunto() != null && !req.assunto().isBlank()
                ? req.assunto()
                : "Equipes de Nossa Senhora: Teste de Conexão Oficial";
        String corpo = req.mensagem() != null && !req.mensagem().isBlank()
                ? req.mensagem()
                : "Mensagem automática de validação das credenciais do Gmail das Equipes de Nossa Senhora.";

        boolean sucesso = false;
        String mensagemResultado;
        String detalhes = null;

        try {
            if ("SMTP".equalsIgnoreCase(config.getMetodo())) {
                String senhaDecifrada = criptografiaService.decifrar(config.getSenhaAppCifrada());
                if (senhaDecifrada == null || senhaDecifrada.isBlank()) {
                    mensagemResultado = "Nenhuma senha de aplicativo cadastrada. Salve a senha de app antes de testar.";
                    detalhes = "Campo senhaAppCifrada vazio no banco.";
                } else {
                    JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
                    mailSender.setHost(config.getSmtpHost());
                    mailSender.setPort(config.getSmtpPorta() != null ? config.getSmtpPorta() : 587);
                    mailSender.setUsername(config.getSmtpUsuario());
                    mailSender.setPassword(senhaDecifrada);

                    Properties props = mailSender.getJavaMailProperties();
                    props.put("mail.transport.protocol", "smtp");
                    props.put("mail.smtp.auth", "true");
                    props.put("mail.smtp.starttls.enable", "true");
                    props.put("mail.smtp.connectiontimeout", "7000");
                    props.put("mail.smtp.timeout", "7000");

                    SimpleMailMessage msg = new SimpleMailMessage();
                    msg.setFrom(config.getRemetenteEmail());
                    msg.setTo(destinatario);
                    msg.setSubject(assunto);
                    msg.setText(corpo);

                    mailSender.send(msg);
                    sucesso = true;
                    mensagemResultado = "E-mail de verificação enviado com sucesso para " + destinatario;
                    detalhes = "Disparo via SMTP Gmail (" + config.getSmtpHost() + ":" + config.getSmtpPorta() + ").";
                }
            } else {
                mensagemResultado = "Envio via Google OAuth2 requer consentimento prévio do Workspace.";
                detalhes = "Client ID configurado: " + config.getOauthClientId();
            }
        } catch (Exception ex) {
            log.error("Erro ao enviar e-mail de teste: {}", ex.getMessage());
            mensagemResultado = "Falha no envio de e-mail: " + ex.getMessage();
            detalhes = ex.toString();
        }

        // Registrar no log persistido
        LogEnvioEmail logRegistro = new LogEnvioEmail(destinatario, assunto, "TESTE", sucesso, detalhes);
        logRepository.save(logRegistro);

        // Atualizar status no config
        config.setUltimoTesteEm(Instant.now());
        config.setUltimoTesteSucesso(sucesso);
        config.setUltimaMensagemTeste(mensagemResultado);
        configRepository.save(config);

        return new TesteEmailResponse(sucesso, mensagemResultado, Instant.now(), detalhes);
    }

    public List<LogEnvioEmailDto> obterLogs() {
        return logRepository.findTop50ByOrderByDataHoraDesc().stream()
                .map(l -> new LogEnvioEmailDto(
                        l.getId(),
                        l.getDestinatario(),
                        l.getAssunto(),
                        l.getTipo(),
                        l.getSucesso(),
                        l.getDataHora(),
                        l.getDetalhes()))
                .toList();
    }

    public TesteEmailResponse enviarEmail(EnviarEmailRequest req) {
        EmailConfig config = obterEntidadeConfig();
        boolean sucesso = false;
        String mensagemResultado;
        String detalhes = null;

        try {
            String senhaDecifrada = criptografiaService.decifrar(config.getSenhaAppCifrada());
            if (senhaDecifrada != null && !senhaDecifrada.isBlank()) {
                JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
                mailSender.setHost(config.getSmtpHost());
                mailSender.setPort(config.getSmtpPorta() != null ? config.getSmtpPorta() : 587);
                mailSender.setUsername(config.getSmtpUsuario());
                mailSender.setPassword(senhaDecifrada);

                Properties props = mailSender.getJavaMailProperties();
                props.put("mail.transport.protocol", "smtp");
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");

                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(config.getRemetenteEmail());
                msg.setTo(req.destinatario());
                msg.setSubject(req.assunto());
                msg.setText(req.corpo());

                mailSender.send(msg);
                sucesso = true;
                mensagemResultado = "E-mail entregue com sucesso.";
            } else {
                mensagemResultado = "Senha de aplicativo não configurada.";
            }
        } catch (Exception ex) {
            mensagemResultado = "Erro de entrega: " + ex.getMessage();
            detalhes = ex.toString();
        }

        logRepository.save(new LogEnvioEmail(
                req.destinatario(),
                req.assunto(),
                req.tipo() != null ? req.tipo() : "AVISO",
                sucesso,
                detalhes
        ));

        return new TesteEmailResponse(sucesso, mensagemResultado, Instant.now(), detalhes);
    }

    private EmailConfigDto toDto(EmailConfig c) {
        String senhaMascarada = (c.getSenhaAppCifrada() != null && !c.getSenhaAppCifrada().isBlank())
                ? "•••• •••• •••• •••• (Senha salva no banco)"
                : null;
        String secretMascarado = (c.getOauthClientSecretCifrado() != null && !c.getOauthClientSecretCifrado().isBlank())
                ? "GOCSPX-•••••••••••••••• (Secret salvo no banco)"
                : null;

        return new EmailConfigDto(
                c.getMetodo(),
                c.getRemetenteEmail(),
                c.getRemetenteNome(),
                c.getSmtpHost(),
                c.getSmtpPorta(),
                c.getSmtpUsuario(),
                senhaMascarada,
                c.getUsaTls(),
                c.getOauthClientId(),
                secretMascarado,
                c.getOauthConectado(),
                c.getAtivo(),
                c.getUltimoTesteEm(),
                c.getUltimoTesteSucesso(),
                c.getUltimaMensagemTeste()
        );
    }
}

