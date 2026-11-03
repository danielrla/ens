import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../layout.service';
import { CasalService } from '../../core/casal.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
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

        <!-- Central de Notificações / Alertas -->
        <div class="notificacoes-wrapper">
          <button
            type="button"
            class="btn-notificacao"
            (click)="toggleNotificacoes()"
            title="Alertas de mandatos e avisos"
            aria-haspopup="true"
            [attr.aria-expanded]="notificacoesAbertas()"
          >
            <span class="icone-sino">🔔</span>
            @if (alertas().length > 0) {
              <span class="badge-alerta">{{ alertas().length }}</span>
            }
          </button>

          @if (notificacoesAbertas()) {
            <div class="dropdown-notificacoes cartao" role="menu">
              <div class="drop-cabecalho">
                <strong>Alertas e Mandatos</strong>
                @if (alertas().length > 0) {
                  <small class="badge badge-dourado">{{ alertas().length }} pendência(s)</small>
                }
              </div>
              @if (alertas().length > 0) {
                <ul class="lista-avisos">
                  @for (alerta of alertas(); track alerta) {
                    <li>{{ alerta }}</li>
                  }
                </ul>
              } @else {
                <p class="sem-alertas">Nenhum alerta ou pendência estatutária no momento.</p>
              }
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
              <hr class="divisor" />
              <button type="button" class="drop-item item-sair">🚪 Sair do Sistema</button>
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
    .dropdown-notificacoes,
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
      align-items: center;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--borda);
    }
    .lista-avisos {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      font-size: 0.825rem;
      color: var(--texto);
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

    @media (max-width: 768px) {
      .breadcrumbs,
      .seletor-ano .rotulo-ano,
      .papel-usuario {
        display: none;
      }
    }
  `,
})
export class Header {
  private readonly layoutService = inject(LayoutService);
  private readonly casalService = inject(CasalService);

  protected readonly breadcrumbs = this.layoutService.breadcrumbs;
  protected readonly anoPastoral = this.layoutService.anoPastoral;

  protected readonly notificacoesAbertas = signal<boolean>(false);
  protected readonly perfilAberto = signal<boolean>(false);
  protected readonly alertas = signal<string[]>([]);
  protected readonly casal = this.casalService.casalLogado;

  constructor() {
    this.casalService.obterPerfil().subscribe({
      error: () => {
        // Fallback silencioso se o perfil não puder ser recuperado de imediato
      },
    });
  }

  obterIniciais(): string {
    const c = this.casal();
    if (!c) return 'AD';
    const esp = c.esposo?.nomeCompleto?.trim().charAt(0) || '';
    const espa = c.esposa?.nomeCompleto?.trim().charAt(0) || '';
    return (espa + esp).toUpperCase() || 'AD';
  }

  obterNomesResumidos(): string {
    const c = this.casal();
    if (!c) return 'Aline & Daniel';
    const espPrimeiro = c.esposo?.nomeCompleto?.trim().split(' ')[0] || 'Esposo';
    const espaPrimeiro = c.esposa?.nomeCompleto?.trim().split(' ')[0] || 'Esposa';
    return `${espaPrimeiro} & ${espPrimeiro}`;
  }

  obterNomesCompletos(): string {
    const c = this.casal();
    if (!c) return 'Daniel Rios & Aline Freire';
    return `${c.esposo?.nomeCompleto || ''} & ${c.esposa?.nomeCompleto || ''}`;
  }

  obterDescricaoEquipe(): string {
    const c = this.casal();
    return c?.nomeEquipe || 'Membro • Equipe Aparecida';
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

  togglePerfil(): void {
    this.perfilAberto.update((v) => !v);
    this.notificacoesAbertas.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notificacoes-wrapper')) {
      this.notificacoesAbertas.set(false);
    }
    if (!target.closest('.perfil-wrapper')) {
      this.perfilAberto.set(false);
    }
  }
}
