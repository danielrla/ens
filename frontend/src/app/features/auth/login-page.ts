import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <img src="/logo-ens.png" alt="Logo ENS" class="logo-ens" />
          <h1>Equipes de Nossa Senhora</h1>
          <p class="subtitulo">Portal de Gestão e Vida de Equipe</p>
        </div>

        @if (mensagemErro()) {
          <div class="alerta-erro" role="alert">
            <span>⚠️</span>
            <div>{{ mensagemErro() }}</div>
          </div>
        }

        <form (ngSubmit)="entrar()" class="login-form">
          <div class="campo-grupo">
            <label for="email">E-mail de acesso</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              placeholder="seu.email@exemplo.com"
              autocomplete="email"
              [disabled]="carregando()"
            />
          </div>

          <div class="campo-grupo">
            <div class="label-com-link">
              <label for="senha">Senha</label>
              <a routerLink="/esqueci-senha" class="link-recuperar">Esqueceu a senha?</a>
            </div>
            <div class="input-senha-wrapper">
              <input
                [type]="mostrarSenha() ? 'text' : 'password'"
                id="senha"
                name="senha"
                [(ngModel)]="senha"
                required
                placeholder="••••••••"
                autocomplete="current-password"
                [disabled]="carregando()"
              />
              <button
                type="button"
                class="btn-toggle-senha"
                (click)="toggleMostrarSenha()"
                tabindex="-1"
                [title]="mostrarSenha() ? 'Ocultar senha' : 'Ver senha'"
              >
                {{ mostrarSenha() ? '👁️' : '🔒' }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn-login"
            [disabled]="carregando() || !email.trim() || !senha.trim()"
          >
            @if (carregando()) {
              <span class="spinner"></span> Entrando...
            } @else {
              Entrar no Sistema
            }
          </button>
        </form>

        <div class="login-rodape">
          <small>Aplicativo PWA • Instale no seu smartphone ou tablet</small>
        </div>
      </div>
    </div>
  `,
  styles: `
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .login-card {
      background: #ffffff;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 420px;
      padding: 2.5rem 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-ens {
      width: 72px;
      height: 72px;
      margin-bottom: 1rem;
      object-fit: contain;
    }

    .login-header h1 {
      font-size: 1.35rem;
      color: #0f172a;
      margin: 0 0 0.4rem 0;
      font-weight: 700;
    }

    .subtitulo {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }

    .alerta-erro {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .campo-grupo {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .campo-grupo label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .label-com-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .link-recuperar {
      font-size: 0.8rem;
      color: #2563eb;
      text-decoration: none;
    }

    .link-recuperar:hover {
      text-decoration: underline;
    }

    .input-senha-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .campo-grupo input {
      width: 100%;
      padding: 0.75rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      color: #0f172a;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-sizing: border-box;
    }

    .input-senha-wrapper input {
      padding-right: 2.75rem;
    }

    .campo-grupo input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .btn-toggle-senha {
      position: absolute;
      right: 0.5rem;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.4rem;
    }

    .btn-login {
      margin-top: 0.5rem;
      background: #1e3a8a;
      color: #ffffff;
      border: none;
      padding: 0.85rem;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.15s, transform 0.05s;
    }

    .btn-login:hover:not(:disabled) {
      background: #1e40af;
    }

    .btn-login:active:not(:disabled) {
      transform: scale(0.99);
    }

    .btn-login:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-rodape {
      text-align: center;
      margin-top: 2rem;
      color: #94a3b8;
      font-size: 0.8rem;
    }
  `,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected senha = '';
  protected mostrarSenha = signal<boolean>(false);
  protected carregando = signal<boolean>(false);
  protected mensagemErro = signal<string | null>(null);

  toggleMostrarSenha(): void {
    this.mostrarSenha.update((v) => !v);
  }

  entrar(): void {
    if (!this.email.trim() || !this.senha.trim()) return;

    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.authService
      .login({ email: this.email.trim(), senha: this.senha })
      .subscribe({
        next: (res) => {
          this.carregando.set(false);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else {
            // Se for membro de equipe, vai direto para as reuniões da equipe
            if (res.perfis.includes('MEMBRO_EQUIPE') && res.perfis.length === 1) {
              this.router.navigate(['/reunioes']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        },
        error: (err) => {
          this.carregando.set(false);
          const msg =
            err.error?.mensagem ||
            err.error?.message ||
            'Não foi possível realizar o login. Verifique seu e-mail e senha.';
          this.mensagemErro.set(msg);
        },
      });
  }
}

