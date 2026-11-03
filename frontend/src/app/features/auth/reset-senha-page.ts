import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-senha-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/logo-ens.png" alt="Logo ENS" class="logo-ens" />
          <h1>Criar Nova Senha</h1>
          <p class="subtitulo">Defina sua nova credencial de acesso</p>
        </div>

        @if (mensagemSucesso()) {
          <div class="alerta-sucesso" role="alert">
            <span>✅</span>
            <div>{{ mensagemSucesso() }}</div>
          </div>
          <div class="link-voltar-centro">
            <a routerLink="/login" class="btn-acao">Ir para o Login</a>
          </div>
        } @else {
          @if (mensagemErro()) {
            <div class="alerta-erro" role="alert">
              <span>⚠️</span>
              <div>{{ mensagemErro() }}</div>
            </div>
          }

          <form (ngSubmit)="confirmarRedefinicao()" class="auth-form">
            <div class="campo-grupo">
              <label for="token">Token de Recuperação</label>
              <input
                type="text"
                id="token"
                name="token"
                [(ngModel)]="token"
                required
                placeholder="Cole o token recebido por e-mail"
                [disabled]="carregando()"
              />
            </div>

            <div class="campo-grupo">
              <label for="novaSenha">Nova Senha (mínimo 6 caracteres)</label>
              <input
                type="password"
                id="novaSenha"
                name="novaSenha"
                [(ngModel)]="novaSenha"
                required
                minlength="6"
                placeholder="••••••••"
                [disabled]="carregando()"
              />
            </div>

            <div class="campo-grupo">
              <label for="confirmarSenha">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                [(ngModel)]="confirmarSenha"
                required
                placeholder="••••••••"
                [disabled]="carregando()"
              />
            </div>

            <button
              type="submit"
              class="btn-acao"
              [disabled]="carregando() || !token.trim() || novaSenha.length < 6 || novaSenha !== confirmarSenha"
            >
              @if (carregando()) {
                <span class="spinner"></span> Atualizando...
              } @else {
                Salvar Nova Senha
              }
            </button>
          </form>

          <div class="link-voltar-centro">
            <a routerLink="/login" class="link-voltar">← Cancelar e voltar ao login</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .auth-card {
      background: #ffffff;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 420px;
      padding: 2.5rem 2rem;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-ens {
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
      object-fit: contain;
    }

    .auth-header h1 {
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

    .alerta-sucesso {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 0.85rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      display: flex;
      gap: 0.5rem;
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

    .auth-form {
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

    .campo-grupo input {
      width: 100%;
      padding: 0.75rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }

    .campo-grupo input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .btn-acao {
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
      text-decoration: none;
      transition: background 0.15s;
    }

    .btn-acao:hover:not(:disabled) {
      background: #1e40af;
    }

    .btn-acao:disabled {
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

    .link-voltar-centro {
      text-align: center;
      margin-top: 1.5rem;
    }

    .link-voltar {
      color: #64748b;
      font-size: 0.85rem;
      text-decoration: none;
    }

    .link-voltar:hover {
      color: #0f172a;
      text-decoration: underline;
    }
  `,
})
export class ResetSenhaPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected token = '';
  protected novaSenha = '';
  protected confirmarSenha = '';
  protected carregando = signal<boolean>(false);
  protected mensagemSucesso = signal<string | null>(null);
  protected mensagemErro = signal<string | null>(null);

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParams['token'];
    if (tokenParam) {
      this.token = tokenParam;
    }
  }

  confirmarRedefinicao(): void {
    if (!this.token.trim()) {
      this.mensagemErro.set('O token de verificação é obrigatório.');
      return;
    }

    if (this.novaSenha.length < 6) {
      this.mensagemErro.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.mensagemErro.set('As senhas informadas não conferem.');
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.authService
      .redefinirSenha({ token: this.token.trim(), novaSenha: this.novaSenha })
      .subscribe({
        next: (res) => {
          this.carregando.set(false);
          this.mensagemSucesso.set(res.mensagem || 'Senha redefinida com sucesso! Você já pode entrar.');
        },
        error: (err) => {
          this.carregando.set(false);
          this.mensagemErro.set(
            err.error?.mensagem ||
              err.error?.message ||
              'Token inválido ou expirado. Solicite uma nova recuperação.'
          );
        },
      });
  }
}

