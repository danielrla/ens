package br.org.ens.reuniao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalRepository;
import br.org.ens.casal.Pessoa;
import br.org.ens.casal.StatusCasal;
import br.org.ens.comum.EmailService;
import br.org.ens.equipe.Equipe;
import br.org.ens.equipe.EquipeRepository;
import br.org.ens.sce.Sce;
import br.org.ens.sce.SceRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReuniaoAlertaSchedulerTest {

    private ReuniaoRepository reuniaoRepository;
    private EquipeRepository equipeRepository;
    private CasalRepository casalRepository;
    private SceRepository sceRepository;
    private EmailService emailService;
    private ReuniaoAlertaScheduler scheduler;

    @BeforeEach
    void setUp() {
        reuniaoRepository = mock(ReuniaoRepository.class);
        equipeRepository = mock(EquipeRepository.class);
        casalRepository = mock(CasalRepository.class);
        sceRepository = mock(SceRepository.class);
        emailService = mock(EmailService.class);

        scheduler = new ReuniaoAlertaScheduler(
                reuniaoRepository,
                equipeRepository,
                casalRepository,
                sceRepository,
                emailService
        );
    }

    @Test
    void deveEnviarAlertasDMenosUmParaCasaisESce() {
        LocalDate dataAmanha = LocalDate.now().plusDays(1);
        Reuniao r = new Reuniao();
        r.setId("r1");
        r.setEquipeId("eq1");
        r.setData(dataAmanha);
        r.setHorario("20:00");
        r.setTema("Oração em Família");

        when(reuniaoRepository.findByData(dataAmanha)).thenReturn(List.of(r));

        Equipe equipe = new Equipe();
        equipe.setId("eq1");
        equipe.setNomeDevocao("Nossa Senhora da Guia");
        equipe.setSceId("sce1");
        when(equipeRepository.findById("eq1")).thenReturn(Optional.of(equipe));

        Sce sce = new Sce();
        sce.setId("sce1");
        sce.setNomeCompleto("Pe. Paulo");
        sce.setEmail("pe.paulo@ens.org.br");
        when(sceRepository.findById("sce1")).thenReturn(Optional.of(sce));

        Casal casal = new Casal();
        casal.setId("c1");
        casal.setStatus(StatusCasal.ATIVO);
        casal.setEsposo(new Pessoa("João Silva", null, "joao@email.com", "65999990001", null, null, null));
        casal.setEsposa(new Pessoa("Maria Silva", null, "maria@email.com", "65999990002", null, null, null));
        when(casalRepository.findByEquipeId("eq1")).thenReturn(List.of(casal));

        int enviados = scheduler.enviarAlertasParaData(dataAmanha);

        // 2 cônjuges + 1 SCE = 3 e-mails
        assertEquals(3, enviados);
        verify(emailService, times(3)).enviarEmail(any(), any(), any());
    }
}
