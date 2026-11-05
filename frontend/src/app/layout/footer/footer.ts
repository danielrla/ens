import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="app-footer">
      <div class="footer-esquerda">
        <span class="versao">v0.1.0</span>
      </div>
    </footer>
  `,
  styles: `
    .app-footer {
      height: 52px;
      background: #ffffff;
      border-top: 1px solid var(--borda);
      padding: 0 clamp(1rem, 3vw, 2rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.775rem;
      color: var(--texto-suave);
      flex-shrink: 0;
    }
    .footer-esquerda,
    .footer-direita {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .separador {
      color: var(--borda);
    }
    .versao {
      font-weight: 600;
      color: var(--azul-900);
    }
    .footer-link {
      color: var(--texto-suave);
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer-link:hover {
      color: var(--azul-600);
    }
    .status-online {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 500;
      color: #16a34a;
    }
    .ponto-verde {
      font-size: 0.65rem;
    }
    @media (max-width: 640px) {
      .app-footer {
        height: auto;
        padding: 0.75rem 1rem;
        flex-direction: column;
        gap: 0.4rem;
        text-align: center;
      }
    }
  `,
})
export class Footer { }
