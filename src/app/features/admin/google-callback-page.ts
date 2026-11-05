import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GoogleIntegracaoService } from '../../core/google-integracao.service';

@Component({
  selector: 'app-google-callback-page',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="callback-container">
      <div class="callback-card cartao">
        @if (carregando()) {
          <div class="spinner-wrapper">
            <div class="spinner"></div>
            <h2>Conectando ao Google Workspace...</h2>
            <p>Estamos autorizando o acesso e configurando suas credenciais com segurança.</p>
          </div>
        } @else if (erro()) {
          <div class="erro-wrapper">
            <span class="icone-alerta">⚠️</span>
            <h2>Falha na Autorização</h2>
            <p>{{ erro() }}</p>
            <a routerLink="/admin/integracao" class="btn btn-primario">Voltar para Integração</a>
          </div>
        } @else {
          <div class="sucesso-wrapper">
            <span class="icone-sucesso">✅</span>
            <h2>Conta Conectada com Sucesso!</h2>
            <p>Sua conta Google foi vinculada ao ENS. Redirecionando para a área administrativa...</p>
            <a routerLink="/admin/integracao" class="btn btn-primario">Ir para Administração</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 3rem 1.5rem;
    }

    .callback-container {
      max-width: 540px;
      margin: 0 auto;
    }

    .callback-card {
      padding: 3rem 2rem;
      text-align: center;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    }

    .spinner-wrapper h2,
    .erro-wrapper h2,
    .sucesso-wrapper h2 {
      margin-top: 1.25rem;
      font-size: 1.5rem;
      color: #0f172a;
      font-weight: 700;
    }

    .spinner-wrapper p,
    .erro-wrapper p,
    .sucesso-wrapper p {
      margin: 0.75rem 0 1.5rem;
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #0284c7;
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .icone-alerta {
      font-size: 3rem;
    }

    .icone-sucesso {
      font-size: 3rem;
    }
  `,
})
export class GoogleCallbackPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly googleService = inject(GoogleIntegracaoService);

  protected readonly carregando = signal<boolean>(true);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.carregando.set(false);
      this.erro.set('Acesso recusado ou cancelado no Google: ' + error);
      return;
    }

    if (!code) {
      this.carregando.set(false);
      this.erro.set('Código de autorização não recebido na resposta do Google.');
      return;
    }

    this.googleService.processarCallback(code, state || undefined).subscribe({
      next: () => {
        this.carregando.set(false);
        setTimeout(() => {
          this.router.navigate(['/admin/integracao'], {
            queryParams: { conectado: 'sucesso' },
          });
        }, 1500);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err.error?.message || 'Erro ao processar as credenciais com o servidor.');
      },
    });
  }
}
