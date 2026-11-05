package br.org.ens.email;

import br.org.ens.email.dto.EmailConfigDto;
import br.org.ens.email.dto.EnviarEmailRequest;
import br.org.ens.email.dto.LogEnvioEmailDto;
import br.org.ens.email.dto.SalvarEmailConfigRequest;
import br.org.ens.email.dto.TesteEmailRequest;
import br.org.ens.email.dto.TesteEmailResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/email")
public class EmailAdminController {

    private final EmailAdminService emailService;

    public EmailAdminController(EmailAdminService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/config")
    public EmailConfigDto obterConfiguracao() {
        return emailService.obterConfiguracao();
    }

    @PutMapping("/config")
    public EmailConfigDto salvarConfiguracao(@RequestBody SalvarEmailConfigRequest request) {
        return emailService.salvarConfiguracao(request);
    }

    @PostMapping("/testar")
    public TesteEmailResponse testarEnvio(@RequestBody TesteEmailRequest request) {
        return emailService.testarEnvio(request);
    }

    @GetMapping("/logs")
    public List<LogEnvioEmailDto> obterLogs() {
        return emailService.obterLogs();
    }

    @PostMapping("/enviar")
    public TesteEmailResponse enviarEmail(@RequestBody EnviarEmailRequest request) {
        return emailService.enviarEmail(request);
    }
}

