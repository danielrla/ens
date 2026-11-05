import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../layout.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-bottom-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="mobile-bottom-nav" aria-label="Navegação Principal Móvel">
      <!-- 1. Início / Dashboard -->
      <a
        [routerLink]="rotaInicio()"
        routerLinkActive="ativo"
        class="nav-tab-btn"
        aria-label="Início"
      >
        <span class="icone-tab">🏠</span>
        <span class="label-tab">Início</span>
      </a>

      <!-- 2. Equipes -->
      <a
        routerLink="/equipes"
        routerLinkActive="ativo"
        class="nav-tab-btn"
        aria-label="Equipes"
      >
        <span class="icone-tab">👥</span>
        <span class="label-tab">Equipes</span>
      </a>

      <!-- 3. Reuniões -->
      <a
        routerLink="/reunioes"
        routerLinkActive="ativo"
        class="nav-tab-btn"
        aria-label="Reuniões"
      >
        <span class="icone-tab">📅</span>
        <span class="label-tab">Reuniões</span>
      </a>

      <!-- 4. Meu Perfil & Segurança -->
      <a
        routerLink="/perfil"
        routerLinkActive="ativo"
        class="nav-tab-btn"
        aria-label="Meu Perfil e Segurança"
      >
        <span class="icone-tab">👤</span>
        <span class="label-tab">Perfil</span>
      </a>

      <!-- 5. Mais Opções (Gaveta) -->
      <button
        type="button"
        class="nav-tab-btn btn-mais"
        (click)="abrirMenuCompleto()"
        aria-label="Abrir menu de navegação completo"
      >
        <span class="icone-tab">☰</span>
        <span class="label-tab">Mais</span>
      </button>
    </nav>
  `,
  styles: `
    .mobile-bottom-nav {
      display: none;
    }

    @media (max-width: 1023px) {
      .mobile-bottom-nav {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
        z-index: 990;
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }

      .nav-tab-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: var(--cinza-medio, #64748b);
        min-height: 48px;
        min-width: 44px;
        padding: 4px 2px;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: color 0.15s ease, transform 0.15s ease;
        -webkit-tap-highlight-color: transparent;
      }

      .nav-tab-btn:active {
        transform: scale(0.94);
      }

      .icone-tab {
        font-size: 1.25rem;
        line-height: 1;
        margin-bottom: 2px;
      }

      .label-tab {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 1;
      }

      .nav-tab-btn.ativo {
        color: var(--azul-ens, #002B49);
      }

      .nav-tab-btn.ativo .icone-tab {
        transform: translateY(-1px);
      }

      .nav-tab-btn.ativo .label-tab {
        color: var(--azul-ens, #002B49);
        font-weight: 700;
      }
    }
  `,
})
export class BottomNav {
  private readonly layoutService = inject(LayoutService);
  private readonly authService = inject(AuthService);

  rotaInicio(): string {
    return this.authService.podeAcessarRota('/dashboard') ? '/dashboard' : '/equipes';
  }

  abrirMenuCompleto(): void {
    this.layoutService.openMobileDrawer();
  }
}
