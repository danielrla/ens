import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, Footer],
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
        </div>
      </div>
    } @else {
      <div class="auth-layout">
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
      overflow-x: hidden;
      position: relative;
    }

    .auth-layout {
      min-height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%);
    }

    .main-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      min-height: 100vh;
      overflow-x: hidden;
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
  `,
})
export class App {
  protected readonly authService = inject(AuthService);
}
