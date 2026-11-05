import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../layout.service';
import { CasalService } from '../../core/casal.service';
import { AuthService } from '../../core/auth.service';
import { NotificacaoService } from '../../core/notificacao.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <header class="topbar-header">
      <!-- Lado Esquerdo: Toggle e Breadcrumbs -->
      <div class="bloco-esquerdo">
        <button
          type="button"
          class="btn-hamburguer"
          (click)="toggleSidebar()"
          aria-label="Abrir ou fechar menu lateral"
          title="Alternar menu lateral"
        >
          <span class="icone-hamburguer">☰</span>
        </button>

        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
              <li>
                @if (crumb.route && !last) {
                  <a [routerLink]="crumb.route">{{ crumb.label }}</a>
                  <span class="separador">/</span>
                } @else {
                  <span class="atual" aria-current="page">{{ crumb.label }}</span>
                }
              </li>
            }
          </ol>
        </nav>
      </div>

      <!-- Lado Direito: Ciclo pastoral, Notificações e Perfil -->
      <div class="bloco-direito">
        <!-- Seletor Rápido de Ano Pastoral -->
        <div class="seletor-ano" title="Ano Pastoral Vigente">
          <span class="rotulo-ano">Ano Pastoral:</span>
          <select
            [value]="anoPastoral()"
            (change)="alterarAno($any($event.target).value)"
            class="select-ano"
          >
            <option [value]="2026">2026</option>
            <option [value]="2025">2025</option>
            <option [value]="2024">2024</option>
          </select>
        </div>

        <!-- Central de Notificações / Alertas da Equipe -->
        <div class="notificacoes-wrapper">
          <button
            type="button"
            class="btn-notificacao"
            (click)="toggleNotificacoes()"
            title="Avisos e Lembretes da Equipe"
            aria-haspopup="true"
            [attr.aria-expanded]="notificacoesAbertas()"
          >
            <span class="icone-sino">🔔</span>
            @if (naoLidasCount() > 0) {
              <span class="badge-alerta">{{ naoLidasCount() }}</span>
            }
          </button>

          @if (notificacoesAbertas()) {
            <!-- Backdrop Overlay móvel para fechamento suave -->
            <div
              class="backdrop-notificacoes"
              (click)="fecharNotificacoes()"
              aria-hidden="true"
            ></div>

            <div class="dropdown-notificacoes cartao" role="dialog" aria-modal="true" aria-label="Avisos da sua Equipe">
              <!-- Alça de arrasto do Bottom Sheet (Mobile) -->
              <div class="bottom-sheet-handle-container" (click)="fecharNotificacoes()">
                <div class="bottom-sheet-handle"></div>
              </div>

              <div class="drop-cabecalho">
                <div class="drop-cabecalho-texto">
                  <span class="icone-alerta-cabecalho">🔔</span>
                  <div>
                    <strong>Avisos da sua Equipe</strong>
                    <span class="sub-equipe-alerta">Filtro exclusivo da equipe</span>
                  </div>
                </div>
                <div class="drop-cabecalho-acoes">
                  @if (naoLidasCount() > 0) {
                    <button type="button" class="btn-link-limpar" (click)="marcarTodasComoLidas()">
                      Marcar lidas
                    </button>
                  }
                  <button type="button" class="btn-fechar-alerta-painel" (click)="fecharNotificacoes()" title="Fechar avisos" aria-label="Fechar avisos">
                    ✕
                  </button>
                </div>
              </div>

              @if (alertasReuniao().length > 0) {
                <div class="lista-alertas-equipe">
                  @for (alerta of alertasReuniao(); track alerta.id) {
                    <div class="card-alerta-item" [class.nao-lida]="!alerta.lida" [class.alerta-h4]="alerta.tipo === 'AVISO_IMEDIATO_H4'">
                      <div class="alerta-item-topo">
                        <span class="tipo-tag" [class]="alerta.tipo">
                          @switch (alerta.tipo) {
                            @case ('AVISO_IMEDIATO_H4') { 🚨 Daqui a 4h (Hoje) }
                            @case ('AVISO_VESPERA_D1') { 📅 Amanhã (D-1) }
                            @case ('AVISO_SEMANAL') { 🗓️ Segunda (Semana) }
                          }
                        </span>
                        @if (!alerta.lida) {
                          <button type="button" class="btn-check-lida" (click)="marcarComoLida(alerta.id)" title="Marcar como lida">
                            ✓
                          </button>
                        }
                      </div>

                      <strong class="titulo-alerta">{{ alerta.titulo }}</strong>
                      <p class="mensagem-alerta">{{ alerta.mensagem }}</p>

                      @if (alerta.emailEnviado) {
                        <div class="status-email-enviado">
                          <span>✉️ E-mail disparado via Gmail</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="sem-alertas-container">
                  <span class="icone-vazio-alerta">🕊️</span>
                  <p class="sem-alertas">Nenhum compromisso pendente para a sua equipe no momento.</p>
                </div>
              }

              <div class="drop-rodape">
                <button type="button" class="btn-verificar-agora" (click)="testarRotinaAvisos()">
                  ⚡ Reavaliar Avisos da Semana
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Avatar do Casal / Perfil -->
        <div class="perfil-wrapper">
          <button
            type="button"
            class="btn-perfil"
            (click)="togglePerfil()"
            aria-haspopup="true"
            [attr.aria-expanded]="perfilAberto()"
          >
            @if (casal()?.fotoUrl) {
              <img [src]="casal()!.fotoUrl" [alt]="obterNomesResumidos()" class="avatar-foto-img" />
            } @else {
              <div class="avatar-circulo">{{ obterIniciais() }}</div>
            }
            <div class="dados-usuario">
              <span class="nome-usuario">{{ obterNomesResumidos() }}</span>
              <small class="papel-usuario">{{ obterDescricaoEquipe() }}</small>
            </div>
            <span class="seta-usuario">▾</span>
          </button>

          @if (perfilAberto()) {
            <div class="dropdown-perfil cartao" role="menu">
              <div class="perfil-info">
                <strong>{{ obterNomesCompletos() }}</strong>
                <small>{{ obterDescricaoEquipe() }}</small>
              </div>
              <hr class="divisor" />
              <button type="button" class="drop-item" routerLink="/perfil" (click)="togglePerfil()">
                👤 Meu Perfil e Dados do Casal
              </button>
              <button type="button" class="drop-item" routerLink="/perfil" [queryParams]="{ foco: 'seguranca' }" (click)="togglePerfil()">
                🔐 Trocar Senha e Biometria
              </button>
              <hr class="divisor" />
              <button type="button" class="drop-item item-sair" (click)="fazerLogout()">🚪 Sair do Sistema</button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: `
    .topbar-header {
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid var(--borda);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      position: sticky;
      top: 0;
      z-index: 30;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    /* Esquerda */
    .bloco-esquerdo {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }
    .btn-hamburguer {
      background: transparent;
      border: 1px solid var(--borda);
      color: var(--azul-900);
      font-size: 1.2rem;
      width: 38px;
      height: 38px;
      border-radius: var(--raio-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .btn-hamburguer:hover {
      background: var(--fundo-claro);
      border-color: var(--azul-600);
    }
    .breadcrumbs ol {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.5rem;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .breadcrumbs a {
      color: var(--texto-suave);
      text-decoration: none;
      transition: color 0.15s;
    }
    .breadcrumbs a:hover {
      color: var(--azul-600);
    }
    .breadcrumbs .separador {
      color: var(--borda);
      margin-left: 0.5rem;
    }
    .breadcrumbs .atual {
      color: var(--azul-900);
      font-weight: 600;
    }

    /* Direita */
    .bloco-direito {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .seletor-ano {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
    }
    .rotulo-ano {
      color: var(--texto-suave);
      font-size: 0.8rem;
    }
    .select-ano {
      font: inherit;
      padding: 0.35rem 0.6rem;
      border-radius: var(--raio-sm);
      border: 1px solid var(--borda);
      background: var(--fundo-claro);
      color: var(--azul-900);
      font-weight: 600;
      cursor: pointer;
    }
    .notificacoes-wrapper,
    .perfil-wrapper {
      position: relative;
    }
    .btn-notificacao {
      background: transparent;
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: background 0.15s;
    }
    .btn-notificacao:hover {
      background: var(--fundo-claro);
    }
    .icone-sino {
      font-size: 1.1rem;
    }
    .badge-alerta {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--ambar-500);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: bold;
      border-radius: 999px;
      padding: 0.1rem 0.4rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    /* Dropdowns */
    .dropdown-notificacoes {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 360px;
      max-width: 90vw;
      background: #ffffff;
      border: 1px solid var(--borda);
      border-radius: var(--raio);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      z-index: 100;
      padding: 0.875rem;
      animation: fadeIn 0.15s ease-out;
    }
    .dropdown-perfil {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 300px;
      background: #ffffff;
      border: 1px solid var(--borda);
      border-radius: var(--raio);
      box-shadow: var(--sombra-lg);
      z-index: 50;
      padding: 0.75rem;
      animation: fadeIn 0.15s ease-out;
    }
    .drop-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--borda);
    }
    .sub-equipe-alerta {
      display: block;
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 2px;
    }
    .btn-link-limpar {
      background: none;
      border: none;
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
    }
    .btn-link-limpar:hover {
      text-decoration: underline;
    }
    .lista-alertas-equipe {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      max-height: 380px;
      overflow-y: auto;
      padding-right: 2px;
    }
    .card-alerta-item {
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      transition: background 0.15s, border-color 0.15s;
    }
    .card-alerta-item.nao-lida {
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    .card-alerta-item.alerta-h4 {
      background: #fffbeb;
      border-color: #fde68a;
    }
    .alerta-item-topo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }
    .tipo-tag {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e2e8f0;
      color: #334155;
    }
    .tipo-tag.AVISO_IMEDIATO_H4 {
      background: #fee2e2;
      color: #991b1b;
    }
    .tipo-tag.AVISO_VESPERA_D1 {
      background: #fef3c7;
      color: #92400e;
    }
    .tipo-tag.AVISO_SEMANAL {
      background: #dbeafe;
      color: #1e40af;
    }
    .btn-check-lida {
      background: none;
      border: 1px solid #cbd5e1;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: #64748b;
      cursor: pointer;
    }
    .btn-check-lida:hover {
      background: #22c55e;
      border-color: #22c55e;
      color: #fff;
    }
    .titulo-alerta {
      display: block;
      font-size: 0.85rem;
      color: #0f172a;
      line-height: 1.25;
      margin-bottom: 0.25rem;
    }
    .mensagem-alerta {
      font-size: 0.78rem;
      color: #475569;
      line-height: 1.35;
      margin: 0;
    }
    .status-email-enviado {
      font-size: 0.7rem;
      color: #059669;
      font-weight: 500;
      margin-top: 0.35rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .drop-rodape {
      margin-top: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--borda);
    }
    .btn-verificar-agora {
      width: 100%;
      background: #f1f5f9;
      border: 1px dashed #cbd5e1;
      color: #334155;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.45rem;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
    }
    .btn-verificar-agora:hover {
      background: #e2e8f0;
      border-color: #94a3b8;
    }

    /* Perfil */
    .btn-perfil {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.35rem 0.5rem;
      border-radius: var(--raio-sm);
      transition: background 0.15s;
    }
    .btn-perfil:hover {
      background: var(--fundo-claro);
    }
    .avatar-circulo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--azul-900), var(--azul-600));
      color: #ffffff;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
    .avatar-foto-img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--ouro-500, #d97706);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
    .dados-usuario {
      display: flex;
      flex-direction: column;
      text-align: left;
      line-height: 1.2;
    }
    .nome-usuario {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--azul-900);
    }
    .papel-usuario {
      font-size: 0.725rem;
      color: var(--texto-suave);
    }
    .seta-usuario {
      color: var(--texto-suave);
      font-size: 0.75rem;
    }
    .perfil-info {
      padding: 0.5rem 0.25rem;
      display: flex;
      flex-direction: column;
    }
    .perfil-info strong {
      font-size: 0.9rem;
      color: var(--azul-900);
    }
    .perfil-info small {
      color: var(--texto-suave);
      font-size: 0.75rem;
    }
    .divisor {
      margin: 0.5rem 0;
      border: 0;
      border-top: 1px solid var(--borda);
    }
    .drop-item {
      width: 100%;
      text-align: left;
      background: transparent;
      border: none;
      padding: 0.5rem 0.6rem;
      font: inherit;
      font-size: 0.825rem;
      border-radius: var(--raio-sm);
      cursor: pointer;
      color: var(--texto);
      transition: background 0.15s;
    }
    .drop-item:hover {
      background: var(--fundo-claro);
      color: var(--azul-600);
    }
    .item-sair {
      color: var(--erro);
    }
    .item-sair:hover {
      background: #fee2e2;
      color: var(--erro);
    }

    .backdrop-notificacoes {
      display: none;
    }
    .bottom-sheet-handle-container {
      display: none;
    }
    .btn-fechar-alerta-painel {
      display: none;
    }
    .drop-cabecalho-texto {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .icone-alerta-cabecalho {
      font-size: 1.15rem;
    }
    .drop-cabecalho-acoes {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .sem-alertas-container {
      padding: 1.75rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .icone-vazio-alerta {
      font-size: 2rem;
    }

    @media (max-width: 1023px) {
      .topbar-header {
        height: 54px;
        padding: 0 0.75rem;
      }
      .btn-hamburguer {
        width: 44px;
        height: 44px;
        font-size: 1.35rem;
      }
      .btn-usuario {
        min-height: 44px;
        padding: 0.25rem 0.4rem;
      }
      .breadcrumbs,
      .seletor-ano .rotulo-ano,
      .papel-usuario {
        display: none;
      }
      .dropdown-perfil {
        right: 0.5rem;
        width: calc(100vw - 1rem);
        max-width: 320px;
      }

      /* Transformação em Bottom Sheet no Mobile */
      .backdrop-notificacoes {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 999;
        animation: fadeIn 0.2s ease-out;
      }

      .dropdown-notificacoes {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        top: auto !important;
        width: 100vw !important;
        max-width: 100vw !important;
        border-radius: 24px 24px 0 0 !important;
        border: none !important;
        border-top: 1px solid rgba(226, 232, 240, 0.9) !important;
        box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.25) !important;
        z-index: 1000 !important;
        padding: 0.6rem 1rem 1.75rem 1rem !important;
        padding-bottom: max(1.75rem, env(safe-area-inset-bottom, 20px)) !important;
        max-height: 85vh !important;
        display: flex !important;
        flex-direction: column !important;
        box-sizing: border-box !important;
        animation: slideUpSheet 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .bottom-sheet-handle-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0 0.6rem 0;
        cursor: pointer;
      }

      .bottom-sheet-handle {
        width: 44px;
        height: 5px;
        border-radius: 999px;
        background: #cbd5e1;
      }

      .btn-fechar-alerta-painel {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f1f5f9;
        border: none;
        color: #64748b;
        font-size: 1.1rem;
        cursor: pointer;
      }

      .lista-alertas-equipe {
        max-height: 55vh !important;
        overscroll-behavior: contain;
      }

      .card-alerta-item {
        padding: 0.85rem 1rem !important;
      }

      .titulo-alerta {
        font-size: 0.95rem !important;
      }

      .mensagem-alerta {
        font-size: 0.85rem !important;
        line-height: 1.45 !important;
      }

      .btn-verificar-agora {
        min-height: 46px !important;
        font-size: 0.925rem !important;
      }
    }

    @keyframes slideUpSheet {
      from {
        transform: translateY(100%);
        opacity: 0.7;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
})
export class Header {
  private readonly layoutService = inject(LayoutService);
  private readonly casalService = inject(CasalService);
  private readonly authService = inject(AuthService);
  private readonly notificacaoService = inject(NotificacaoService);

  protected readonly breadcrumbs = this.layoutService.breadcrumbs;
  protected readonly anoPastoral = this.layoutService.anoPastoral;

  protected readonly notificacoesAbertas = signal<boolean>(false);
  protected readonly perfilAberto = signal<boolean>(false);
  protected readonly alertasReuniao = this.notificacaoService.alertas;
  protected readonly naoLidasCount = this.notificacaoService.naoLidasCount;
  protected readonly casal = this.casalService.casalLogado;
  protected readonly usuarioAtual = this.authService.usuarioAtual;

  constructor() {
    this.casalService.obterPerfil().subscribe({
      error: () => {
        // Fallback silencioso se o perfil não puder ser recuperado de imediato
      },
    });
  }

  obterIniciais(): string {
    const user = this.usuarioAtual();
    if (user && user.perfis?.includes('ADMINISTRADOR')) {
      return 'AD';
    }
    const c = this.casal();
    if (!c) return 'AD';
    const esp = c.esposo?.nomeCompleto?.trim().charAt(0) || '';
    const espa = c.esposa?.nomeCompleto?.trim().charAt(0) || '';
    return (espa + esp).toUpperCase() || 'AD';
  }

  obterNomesResumidos(): string {
    const user = this.usuarioAtual();
    if (user && user.perfis?.includes('ADMINISTRADOR')) {
      return 'Administrador';
    }
    const c = this.casal();
    if (!c) return 'Aline & Daniel';
    const espPrimeiro = c.esposo?.nomeCompleto?.trim().split(' ')[0] || 'Esposo';
    const espaPrimeiro = c.esposa?.nomeCompleto?.trim().split(' ')[0] || 'Esposa';
    return `${espaPrimeiro} & ${espPrimeiro}`;
  }

  obterNomesCompletos(): string {
    const user = this.usuarioAtual();
    if (user && user.perfis?.includes('ADMINISTRADOR')) {
      return user.nome || 'Super Administrador ENS';
    }
    const c = this.casal();
    if (!c) return 'Daniel Rios & Aline Freire';
    return `${c.esposo?.nomeCompleto || ''} & ${c.esposa?.nomeCompleto || ''}`;
  }

  obterDescricaoEquipe(): string {
    const user = this.usuarioAtual();
    if (user && user.perfis?.includes('ADMINISTRADOR')) {
      return 'Gestão & Administração Global';
    }
    const c = this.casal();
    return c?.nomeEquipe || 'Membro • Equipe Aparecida';
  }

  fazerLogout(): void {
    this.perfilAberto.set(false);
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  alterarAno(anoStr: string): void {
    this.layoutService.setAnoPastoral(parseInt(anoStr, 10));
  }

  toggleNotificacoes(): void {
    this.notificacoesAbertas.update((v) => !v);
    this.perfilAberto.set(false);
  }

  fecharNotificacoes(): void {
    this.notificacoesAbertas.set(false);
  }

  togglePerfil(): void {
    this.perfilAberto.update((v) => !v);
    this.notificacoesAbertas.set(false);
  }

  marcarComoLida(id: string): void {
    this.notificacaoService.marcarComoLida(id);
  }

  marcarTodasComoLidas(): void {
    this.notificacaoService.marcarTodasComoLidas();
  }

  testarRotinaAvisos(): void {
    this.notificacaoService.simularVerificacaoAgendador();
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notificacoes-wrapper') && !target.closest('.backdrop-notificacoes')) {
      this.notificacoesAbertas.set(false);
    }
    if (!target.closest('.perfil-wrapper')) {
      this.perfilAberto.set(false);
    }
  }
}
