import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { AuthService } from './core/auth.service';

import { BottomNav } from './layout/bottom-nav/bottom-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, Footer, BottomNav],
  template: `
    @if (authService.isLogado()) {
      <div class="app-layout">
        <!-- Sidebar Retrátil / Recursiva -->
        <app-sidebar />

        <!-- Invólucro Principal da Aplicação -->
        <div class="main-wrapper">
          <!-- Topbar / Header Fixo -->
          <app-header />

          <!-- Área Principal de Dados com rolagem independente -->
          <main class="main-content-area" id="main-content">
            <div class="conteudo-container">
              <router-outlet />
            </div>
          </main>

          <!-- Rodapé Discreto -->
          <app-footer />

          <!-- Barra de Navegação Inferior Móvel -->
          <app-bottom-nav />
        </div>
      </div>
    } @else {
      <!-- Layout de Autenticação (Página Cheia) -->
      <div class="auth-fullscreen-layout">
        <router-outlet />
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }

    .app-layout {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background: var(--fundo-claro);
      position: relative;
      align-items: stretch;
    }

    .main-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      min-height: 100vh;
      position: relative;
    }

    .main-content-area {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      scroll-behavior: smooth;
      display: flex;
      flex-direction: column;
    }

    .conteudo-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: clamp(1rem, 2.5vw, 2rem);
      box-sizing: border-box;
      flex: 1;
    }

    @media (max-width: 1023px) {
      .app-layout {
        display: block !important;
        width: 100% !important;
        max-width: 100vw !important;
        overflow-x: hidden !important;
      }

      .main-wrapper {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100vw !important;
        flex: none !important;
      }

      .conteudo-container {
        padding: 0.875rem 0.875rem 5.5rem 0.875rem !important;
        max-width: 100% !important;
      }
    }

    .auth-fullscreen-layout {
      width: 100%;
      min-height: 100vh;
      background: var(--fundo-claro);
      display: flex;
      flex-direction: column;
    }
  `,
})
export class App {
  readonly authService = inject(AuthService);
}
