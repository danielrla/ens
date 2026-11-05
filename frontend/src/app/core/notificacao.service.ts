import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ReuniaoDto, ReuniaoService } from './reuniao.service';
import { EmailIntegracaoService } from './email-integracao.service';
import { UsuarioLogado } from './auth.model';

export type TipoNotificacao = 'AVISO_SEMANAL' | 'AVISO_VESPERA_D1' | 'AVISO_IMEDIATO_H4';

export interface AlertaReuniao {
  id: string;
  reuniaoId: string;
  equipeId: string;
  nomeEquipe?: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  dataReuniao: string;
  horarioReuniao: string;
  tema?: string;
  nomeAnfitriao?: string;
  endereco?: string;
  prioridade: 'ALTA' | 'MEDIA' | 'NORMAL';
  criadoEm: string;
  lida: boolean;
  emailEnviado?: boolean;
}

const STORAGE_KEY = 'ens_notificacoes_alertas_v1';

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  private readonly authService = inject(AuthService);
  private readonly reuniaoService = inject(ReuniaoService);
  private readonly emailService = inject(EmailIntegracaoService);

  readonly alertas = signal<AlertaReuniao[]>(this.carregarAlertasIniciais());

  readonly naoLidasCount = computed(() => {
    return this.alertas().filter((a) => !a.lida).length;
  });

  readonly alertaPrioritario = computed(() => {
    // Alerta mais urgente e não lido
    const lista = this.alertas().filter((a) => !a.lida);
    return (
      lista.find((a) => a.tipo === 'AVISO_IMEDIATO_H4') ||
      lista.find((a) => a.tipo === 'AVISO_VESPERA_D1') ||
      lista.find((a) => a.tipo === 'AVISO_SEMANAL') ||
      null
    );
  });

  constructor() {
    // Executa a checagem ao inicializar
    this.processarAlertasEquipe();
  }

  /**
   * Avalia as reuniões da base aplicando rigorosamente o filtro por equipe
   * e as três regras temporais solicitadas:
   * 1. Segunda-feira: compromissos da semana.
   * 2. Véspera (D-1): aviso um dia antes.
   * 3. No dia, 4 horas antes (H-4): aviso imediato.
   */
  processarAlertasEquipe(): void {
    const usuario = this.authService.usuarioAtual();
    if (!usuario) return;

    // Se usuário não tiver equipeId vinculada, busca equipe do casal
    const equipeUsuarioId = usuario.equipeId || (usuario.tipoUsuario === 'CASAL' ? '6ae08c88ca048c6290d5fdcc' : null);

    this.reuniaoService.listarMinhaEquipe().subscribe({
      next: (reunioes) => {
        // FILTRO RÍGIDO: Somente reuniões da equipe do usuário!
        const reunioesEquipe = reunioes.filter((r) => {
          if (!equipeUsuarioId) return false;
          return r.equipeId === equipeUsuarioId;
        });

        const novosAlertas = this.computarRegrasTemporais(reunioesEquipe, usuario);
        this.mesclarAlertas(novosAlertas);
      },
      error: () => {
        // Modo resiliente offline
      },
    });
  }

  private computarRegrasTemporais(reunioes: ReuniaoDto[], usuario: UsuarioLogado): AlertaReuniao[] {
    const agora = new Date();
    const diaDaSemana = agora.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const alertasGerados: AlertaReuniao[] = [];

    const formatarEndereco = (end?: any, localObs?: string): string => {
      if (localObs) return localObs;
      if (!end) return 'Residência do Casal Anfitrião';
      if (typeof end === 'string') return end;
      const partes = [end.logradouro, end.numero, end.bairro, end.municipio].filter(Boolean);
      return partes.length > 0 ? partes.join(', ') : 'Residência do Casal Anfitrião';
    };

    for (const reuniao of reunioes) {
      if (!reuniao.data) continue;

      const horario = reuniao.horario || '19:30';
      const enderecoFormatado = formatarEndereco(reuniao.enderecoAnfitriao, reuniao.localObservacao);

      const [ano, mes, dia] = reuniao.data.split('-').map(Number);
      const [hora, min] = horario.split(':').map(Number);
      const dataHoraReuniao = new Date(ano, mes - 1, dia, hora || 19, min || 30);

      const diffMs = dataHoraReuniao.getTime() - agora.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);
      const diffDias = Math.round((new Date(ano, mes - 1, dia).getTime() - new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime()) / (1000 * 60 * 60 * 24));

      // REGRA 3: No dia, ~4 horas antes (H-4)
      if (diffDias === 0 && diffHoras > 0 && diffHoras <= 4.5) {
        alertasGerados.push({
          id: `h4-${reuniao.id}-${reuniao.data}`,
          reuniaoId: reuniao.id,
          equipeId: reuniao.equipeId,
          nomeEquipe: 'Equipe 01 - Nossa Senhora Aparecida',
          tipo: 'AVISO_IMEDIATO_H4',
          titulo: '🚨 Reunião da sua Equipe em 4 Horas!',
          mensagem: `A reunião da sua equipe começa hoje às ${horario}. Anfitrião: ${reuniao.nomeCasalAnfitriao || 'Casal da equipe'}. Endereço: ${enderecoFormatado}.`,
          dataReuniao: reuniao.data,
          horarioReuniao: horario,
          tema: reuniao.tema,
          nomeAnfitriao: reuniao.nomeCasalAnfitriao,
          endereco: enderecoFormatado,
          prioridade: 'ALTA',
          criadoEm: agora.toISOString(),
          lida: false,
        });
      }

      // REGRA 2: Um dia antes (D-1)
      if (diffDias === 1) {
        alertasGerados.push({
          id: `d1-${reuniao.id}-${reuniao.data}`,
          reuniaoId: reuniao.id,
          equipeId: reuniao.equipeId,
          nomeEquipe: 'Equipe 01 - Nossa Senhora Aparecida',
          tipo: 'AVISO_VESPERA_D1',
          titulo: '📅 Lembrete: Reunião da sua Equipe Amanhã',
          mensagem: `Amanhã (${reuniao.data}) às ${horario} acontecerá a reunião da sua equipe. Tema de estudo: "${reuniao.tema || 'Tema Litúrgico'}". Casal Animador: ${reuniao.nomeCasalAnimador || 'Animadores da Equipe'}.`,
          dataReuniao: reuniao.data,
          horarioReuniao: horario,
          tema: reuniao.tema,
          nomeAnfitriao: reuniao.nomeCasalAnfitriao,
          endereco: enderecoFormatado,
          prioridade: 'MEDIA',
          criadoEm: agora.toISOString(),
          lida: false,
        });
      }

      // REGRA 1: Toda segunda-feira (ou compromisso da semana corrente)
      if (diffDias >= 0 && diffDias <= 7) {
        alertasGerados.push({
          id: `sem-${reuniao.id}-${reuniao.data}`,
          reuniaoId: reuniao.id,
          equipeId: reuniao.equipeId,
          nomeEquipe: 'Equipe 01 - Nossa Senhora Aparecida',
          tipo: 'AVISO_SEMANAL',
          titulo: '🗓️ Compromisso da Semana na sua Equipe',
          mensagem: `Esta semana sua equipe tem reunião agendada para ${reuniao.data} às ${horario}. Tema: "${reuniao.tema || 'Tema Litúrgico'}". Anfitrião: ${reuniao.nomeCasalAnfitriao || 'Casal da equipe'}.`,
          dataReuniao: reuniao.data,
          horarioReuniao: horario,
          tema: reuniao.tema,
          nomeAnfitriao: reuniao.nomeCasalAnfitriao,
          endereco: enderecoFormatado,
          prioridade: 'NORMAL',
          criadoEm: agora.toISOString(),
          lida: false,
        });
      }
    }

    return alertasGerados;
  }

  private mesclarAlertas(novos: AlertaReuniao[]): void {
    const atuais = [...this.alertas()];
    let houveModificacao = false;

    for (const novo of novos) {
      const jaExiste = atuais.find((a) => a.id === novo.id);
      if (!jaExiste) {
        atuais.unshift(novo);
        houveModificacao = true;
        // Dispara envio por e-mail automaticamente em segundo plano
        this.dispararEnvioEmail(novo);
      }
    }

    if (houveModificacao) {
      this.alertas.set(atuais);
      this.salvarNoStorage(atuais);
    }
  }

  private dispararEnvioEmail(alerta: AlertaReuniao): void {
    const usuario = this.authService.usuarioAtual();
    const destinatario = usuario?.email || 'danielrla@gmail.com';

    this.emailService
      .enviarEmail({
        destinatario,
        assunto: `[ENS] ${alerta.titulo}`,
        corpo: alerta.mensagem,
        tipo: alerta.tipo,
      })
      .subscribe({
        next: () => {
          alerta.emailEnviado = true;
          this.salvarNoStorage(this.alertas());
        },
        error: () => {
          // fallback silencioso
        },
      });
  }

  marcarComoLida(id: string): void {
    const atualizados = this.alertas().map((a) => (a.id === id ? { ...a, lida: true } : a));
    this.alertas.set(atualizados);
    this.salvarNoStorage(atualizados);
  }

  marcarTodasComoLidas(): void {
    const atualizados = this.alertas().map((a) => ({ ...a, lida: true }));
    this.alertas.set(atualizados);
    this.salvarNoStorage(atualizados);
  }

  /**
   * Permite ao usuário forçar o teste da rotina de alertas da semana
   */
  simularVerificacaoAgendador(): void {
    this.processarAlertasEquipe();
  }

  private carregarAlertasIniciais(): AlertaReuniao[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.alertasMockIniciais();
    }
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : this.alertasMockIniciais();
    } catch {
      return this.alertasMockIniciais();
    }
  }

  private salvarNoStorage(lista: AlertaReuniao[]): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
      // ignore
    }
  }

  private alertasMockIniciais(): AlertaReuniao[] {
    const hojeStr = new Date().toISOString().substring(0, 10);
    return [
      {
        id: 'mock-aviso-segunda',
        reuniaoId: 'reun-1',
        equipeId: '6ae08c88ca048c6290d5fdcc',
        nomeEquipe: 'Equipe 01 - Nossa Senhora Aparecida',
        tipo: 'AVISO_SEMANAL',
        titulo: '🗓️ Aviso Semanal: Reunião de Equipe',
        mensagem: 'Toda segunda-feira informamos seus compromissos: Reunião mensal agendada para sábado às 19:30 no casal anfitrião Daniel & Aline.',
        dataReuniao: hojeStr,
        horarioReuniao: '19:30',
        tema: 'Capítulo 7: O Dever de Sentar-se e a Escuta Mútua',
        nomeAnfitriao: 'Daniel e Aline',
        endereco: 'Rua das Flores, 120 - Jardim Cuiabá',
        prioridade: 'NORMAL',
        criadoEm: new Date().toISOString(),
        lida: false,
        emailEnviado: true,
      },
      {
        id: 'mock-aviso-d1',
        reuniaoId: 'reun-1',
        equipeId: '6ae08c88ca048c6290d5fdcc',
        nomeEquipe: 'Equipe 01 - Nossa Senhora Aparecida',
        tipo: 'AVISO_VESPERA_D1',
        titulo: '📅 Aviso de Véspera: Reunião Amanhã!',
        mensagem: 'Lembrete da sua equipe: Amanhã às 19:30 teremos nossa Reunião Formal. Não esqueçam de revisar o tema e orações.',
        dataReuniao: hojeStr,
        horarioReuniao: '19:30',
        tema: 'Capítulo 7: O Dever de Sentar-se e a Escuta Mútua',
        nomeAnfitriao: 'Daniel e Aline',
        endereco: 'Rua das Flores, 120 - Jardim Cuiabá',
        prioridade: 'MEDIA',
        criadoEm: new Date(Date.now() - 3600000).toISOString(),
        lida: false,
        emailEnviado: true,
      },
    ];
  }
}
