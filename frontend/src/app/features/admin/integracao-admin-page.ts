import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GoogleIntegracaoService, GoogleStatusDto, SincronizacaoResultadoDto } from '../../core/google-integracao.service';
import { EnsDatePipe } from '../../core/ens-date.pipe';

@Component({
  selector: 'app-integracao-admin-page',
  standalone: true,
  imports: [CommonModule, EnsDatePipe],
  template: `
    <div class="admin-container">
      <!-- Breadcrumb e Cabeçalho -->
      <header class="cabecalho-admin">
        <nav class="breadcrumb-admin" aria-label="Navegação estrutural">
          <span class="muted">Administração</span>
          <span class="separador">/</span>
          <span class="atual">Integração</span>
        </nav>
        <div class="titulo-area">
          <div>
            <h1>Integração Google Workspace</h1>
            <p class="subtitulo">
              Central de governança para conexão de conta Google, sincronização do Google Agenda,
              gerenciamento de contatos no Google People e provisionamento de pastas no Google Drive.
            </p>
          </div>
          @if (status()?.conectado) {
            <button
              type="button"
              class="btn btn-primario btn-sync-tudo"
              (click)="sincronizarTudo()"
              [disabled]="executando()"
            >
              <span class="icone">{{ executando() ? '⏳' : '⚡' }}</span>
              <span>{{ executando() ? 'Sincronizando...' : 'Sincronizar Tudo' }}</span>
            </button>
          }
        </div>
      </header>

      <!-- Mensagens de Alerta ou Sucesso -->
      @if (mensagemSucesso()) {
        <div class="banner-feedback sucesso" role="alert">
          <span class="icone-feedback">✅</span>
          <div class="texto-feedback">
            <strong>Sucesso</strong>
            <p>{{ mensagemSucesso() }}</p>
          </div>
          <button type="button" class="btn-fechar" (click)="mensagemSucesso.set(null)">✕</button>
        </div>
      }

      @if (mensagemErro()) {
        <div class="banner-feedback erro" role="alert">
          <span class="icone-feedback">⚠️</span>
          <div class="texto-feedback">
            <strong>Atenção</strong>
            <p>{{ mensagemErro() }}</p>
          </div>
          <button type="button" class="btn-fechar" (click)="mensagemErro.set(null)">✕</button>
        </div>
      }

      @if (status() && !status()!.configurado) {
        <div class="banner-feedback alerta-config" role="alert">
          <span class="icone-feedback">⚙️</span>
          <div class="texto-feedback">
            <strong>Credenciais Não Detectadas</strong>
            <p>
              As variáveis <code>client-id</code> e <code>client-secret</code> precisam ser configuradas
              no arquivo <code>.env</code> na raiz do projeto para permitir a autorização OAuth com o Google.
            </p>
          </div>
        </div>
      }

      <!-- Card Principal: Status da Conexão OAuth -->
      <section class="cartao card-conexao">
        <div class="conexao-info">
          <div class="conexao-status-tag">
            <span class="badge" [class.badge-ativa]="status()?.conectado" [class.badge-inativa]="!status()?.conectado">
              {{ status()?.conectado ? '● Conectado ao Google' : '○ Não Conectado' }}
            </span>
            @if (status()?.emailGoogle) {
              <span class="email-vinculado">{{ status()?.emailGoogle }}</span>
            }
          </div>
          <h2>Conexão de Conta Google</h2>
          <p class="descricao-conexao">
            Ao conectar sua conta, o sistema ENS obtém autorização segura sob demanda para gerenciar o calendário da equipe,
            organizar os contatos dos cônjuges e criar pastas exclusivas para roteiros litúrgicos e momentos do mural.
          </p>

          @if (status()?.redirectUri) {
            <div class="box-redirect-uri">
              <div class="redirect-info">
                <span class="rotulo-redirect">URI de Redirecionamento (Google Cloud Console):</span>
                <code class="codigo-redirect">{{ status()?.redirectUri }}</code>
              </div>
              <button type="button" class="btn btn-fantasma btn-sm btn-copiar" (click)="copiarUri(status()!.redirectUri!)">
                {{ copiado() ? '✓ Copiado!' : 'Copiar URI' }}
              </button>
            </div>
          }
        </div>

        <div class="conexao-acoes">
          @if (!status()?.conectado) {
            <button
              type="button"
              class="btn btn-primario btn-conectar"
              (click)="conectarGoogle()"
              [disabled]="executando() || !status()?.configurado"
            >
              <span class="logo-google">G</span>
              <span>Conectar Conta Google</span>
            </button>
          } @else {
            <button
              type="button"
              class="btn btn-perigo btn-sm"
              (click)="desconectarGoogle()"
              [disabled]="executando()"
            >
              Desconectar Conta
            </button>
          }
        </div>
      </section>

      <!-- Grade dos 3 Serviços: Agenda, Contatos, Drive -->
      <section class="grid-servicos">
        <!-- Google Agenda -->
        <article class="cartao card-servico">
          <div class="servico-topo">
            <div class="servico-icone">📅</div>
            <div>
              <h3>Google Agenda</h3>
              <span class="servico-sub">Google Calendar API</span>
            </div>
          </div>
          <p class="servico-desc">
            Sincroniza reuniões mensais da equipe e aniversários de casamento em um calendário dedicado intitulado
            <strong>ENS - Minha Equipe</strong>, isolando a vida pastoral da agenda pessoal.
          </p>
          <div class="servico-meta">
            <div class="meta-item">
              <span class="meta-rotulo">Calendário Vinculado:</span>
              <span class="meta-valor">{{ status()?.calendarioEnsId ? 'ENS - Minha Equipe' : 'Pendente de sincronização' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-rotulo">Último Envio:</span>
              <span class="meta-valor">{{ status()?.ultimaSincronizacaoAgenda ? (status()?.ultimaSincronizacaoAgenda | ensDate) : 'Nunca' }}</span>
            </div>
          </div>
          <div class="servico-rodape">
            <button
              type="button"
              class="btn btn-secundario btn-sm"
              (click)="sincronizarAgenda()"
              [disabled]="!status()?.conectado || executando()"
            >
              Sincronizar Agenda
            </button>
          </div>
        </article>

        <!-- Google Contatos -->
        <article class="cartao card-servico">
          <div class="servico-topo">
            <div class="servico-icone">👥</div>
            <div>
              <h3>Google Contatos</h3>
              <span class="servico-sub">Google People API</span>
            </div>
          </div>
          <p class="servico-desc">
            Cadastra os membros da equipe no Google Contatos sob o marcador <strong>ENS - Equipe</strong>,
            com registros individualizados para cada cônjuge, telefones de WhatsApp e endereços.
          </p>
          <div class="servico-meta">
            <div class="meta-item">
              <span class="meta-rotulo">Marcador da Equipe:</span>
              <span class="meta-valor">{{ status()?.grupoContatosResourceName ? 'Marcador Ativo' : 'Pendente de sincronização' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-rotulo">Último Envio:</span>
              <span class="meta-valor">{{ status()?.ultimaSincronizacaoContatos ? (status()?.ultimaSincronizacaoContatos | ensDate) : 'Nunca' }}</span>
            </div>
          </div>
          <div class="servico-rodape">
            <button
              type="button"
              class="btn btn-secundario btn-sm"
              (click)="sincronizarContatos()"
              [disabled]="!status()?.conectado || executando()"
            >
              Sincronizar Contatos
            </button>
          </div>
        </article>

        <!-- Google Drive -->
        <article class="cartao card-servico">
          <div class="servico-topo">
            <div class="servico-icone">📁</div>
            <div>
              <h3>Google Drive</h3>
              <span class="servico-sub">Google Drive API</span>
            </div>
          </div>
          <p class="servico-desc">
            Cria e gerencia a estrutura de pastas na nuvem: pasta raiz <strong>ENS - Documentos</strong> com
            subpastas <em>Roteiros Litúrgicos</em> e <em>Fotos do Mural</em> da equipe.
          </p>
          <div class="servico-meta">
            <div class="meta-item">
              <span class="meta-rotulo">Pasta Raiz:</span>
              <span class="meta-valor">{{ status()?.drivePastaRaizId ? 'ENS - Documentos' : 'Pendente de criação' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-rotulo">Último Envio:</span>
              <span class="meta-valor">{{ status()?.ultimaSincronizacaoDrive ? (status()?.ultimaSincronizacaoDrive | ensDate) : 'Nunca' }}</span>
            </div>
          </div>
          <div class="servico-rodape">
            <button
              type="button"
              class="btn btn-secundario btn-sm"
              (click)="sincronizarDrive()"
              [disabled]="!status()?.conectado || executando()"
            >
              Provisionar no Drive
            </button>
          </div>
        </article>
      </section>

      <!-- Painel de Relatório / Detalhes de Sincronização -->
      @if (ultimoResultado()) {
        <section class="cartao painel-log">
          <div class="log-cabecalho">
            <h3>Resultado da Sincronização</h3>
            <span class="badge" [class.badge-ativa]="ultimoResultado()?.sucesso" [class.badge-inativa]="!ultimoResultado()?.sucesso">
              {{ ultimoResultado()?.itensSincronizados }} item(ns) processado(s)
            </span>
          </div>
          <p class="log-mensagem">{{ ultimoResultado()?.mensagem }}</p>
          @if (ultimoResultado()?.detalhes?.length) {
            <ul class="lista-detalhes">
              @for (detalhe of ultimoResultado()!.detalhes; track $index) {
                <li>
                  <span class="check-icone">✓</span>
                  <span>{{ detalhe }}</span>
                </li>
              }
            </ul>
          }
        </section>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem;
    }

    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .cabecalho-admin {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .breadcrumb-admin {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .breadcrumb-admin .separador {
      color: #cbd5e1;
    }

    .breadcrumb-admin .atual {
      color: #0f172a;
      font-weight: 600;
    }

    .titulo-area {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .titulo-area h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .subtitulo {
      font-size: 0.95rem;
      color: #475569;
      margin: 0;
      max-width: 760px;
      line-height: 1.5;
    }

    .btn-sync-tudo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .banner-feedback {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      border: 1px solid transparent;
      animation: fadeIn 0.2s ease-in-out;
    }

    .banner-feedback.sucesso {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }

    .banner-feedback.erro {
      background: #fef2f2;
      border-color: #fecaca;
      color: #991b1b;
    }

    .banner-feedback.alerta-config {
      background: #fffbeb;
      border-color: #fde68a;
      color: #92400e;
    }

    .texto-feedback strong {
      display: block;
      font-size: 0.95rem;
      margin-bottom: 0.2rem;
    }

    .texto-feedback p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .btn-fechar {
      background: none;
      border: none;
      font-size: 1.1rem;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
      margin-left: auto;
    }

    .btn-fechar:hover {
      opacity: 1;
    }

    /* Card Conexao */
    .card-conexao {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      padding: 1.75rem 2rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      flex-wrap: wrap;
    }

    .conexao-status-tag {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .badge-ativa {
      background: #dcfce7;
      color: #15803d;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.8rem;
    }

    .badge-inativa {
      background: #f1f5f9;
      color: #64748b;
      font-weight: 500;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.8rem;
    }

    .email-vinculado {
      font-size: 0.9rem;
      color: #0284c7;
      font-weight: 600;
    }

    .card-conexao h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .descricao-conexao {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
      max-width: 680px;
      line-height: 1.5;
    }

    .box-redirect-uri {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-top: 1rem;
      max-width: 720px;
    }

    .redirect-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .rotulo-redirect {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .codigo-redirect {
      font-family: monospace;
      font-size: 0.85rem;
      color: #0f172a;
      background: #ffffff;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      word-break: break-all;
    }

    .btn-copiar {
      white-space: nowrap;
      font-size: 0.8rem;
    }

    .btn-conectar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .logo-google {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: #ffffff;
      color: #0f172a;
      border-radius: 50%;
      font-weight: 900;
      font-size: 0.85rem;
    }

    /* Grid Servicos */
    .grid-servicos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .card-servico {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .card-servico:hover {
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
    }

    .servico-topo {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .servico-icone {
      font-size: 2rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .servico-topo h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .servico-sub {
      font-size: 0.8rem;
      color: #64748b;
    }

    .servico-desc {
      font-size: 0.9rem;
      color: #475569;
      line-height: 1.5;
      margin: 0 0 1.25rem 0;
      flex: 1;
    }

    .servico-meta {
      background: #f8fafc;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
      border: 1px solid #f1f5f9;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .meta-rotulo {
      color: #64748b;
    }

    .meta-valor {
      color: #0f172a;
      font-weight: 600;
    }

    .servico-rodape {
      margin-top: auto;
    }

    .servico-rodape button {
      width: 100%;
    }

    /* Painel Log */
    .painel-log {
      padding: 1.5rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .log-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .log-cabecalho h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .log-mensagem {
      font-size: 0.95rem;
      color: #334155;
      margin: 0 0 1rem 0;
      font-weight: 500;
    }

    .lista-detalhes {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      max-height: 240px;
      overflow-y: auto;
    }

    .lista-detalhes li {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.875rem;
      color: #475569;
      background: #f8fafc;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
    }

    .check-icone {
      color: #16a34a;
      font-weight: 700;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class IntegracaoAdminPage implements OnInit {
  private readonly googleService = inject(GoogleIntegracaoService);
  private readonly route = inject(ActivatedRoute);

  protected readonly status = signal<GoogleStatusDto | null>(null);
  protected readonly executando = signal<boolean>(false);
  protected readonly copiado = signal<boolean>(false);
  protected readonly mensagemSucesso = signal<string | null>(null);
  protected readonly mensagemErro = signal<string | null>(null);
  protected readonly ultimoResultado = signal<SincronizacaoResultadoDto | null>(null);

  ngOnInit(): void {
    this.carregarStatus();
    const conectado = this.route.snapshot.queryParamMap.get('conectado');
    const erroParam = this.route.snapshot.queryParamMap.get('erro');

    if (conectado === 'sucesso') {
      this.mensagemSucesso.set('Conta Google conectada e credenciais autorizadas com sucesso.');
    } else if (erroParam) {
      this.mensagemErro.set('Retorno de autorização com erro: ' + erroParam + '. Verifique se a URI de redirecionamento está devidamente cadastrada no Google Cloud Console.');
    }
  }

  copiarUri(uri: string): void {
    if (!uri) return;
    navigator.clipboard.writeText(uri).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2500);
    });
  }

  carregarStatus(): void {
    this.googleService.obterStatus().subscribe({
      next: (dados) => this.status.set(dados),
      error: () => this.status.set(null),
    });
  }

  conectarGoogle(): void {
    this.mensagemErro.set(null);
    this.executando.set(true);

    this.googleService.obterAuthUrl().subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: (err) => {
        this.executando.set(false);
        this.mensagemErro.set(err.error?.message || 'Erro ao gerar URL de autorização do Google.');
      },
    });
  }

  desconectarGoogle(): void {
    if (!confirm('Deseja realmente desconectar a conta do Google Workspace? As sincronizações serão interrompidas.')) {
      return;
    }
    this.executando.set(true);
    this.googleService.desconectar().subscribe({
      next: (novoStatus) => {
        this.status.set(novoStatus);
        this.executando.set(false);
        this.mensagemSucesso.set('Conta Google desconectada com sucesso.');
        this.ultimoResultado.set(null);
      },
      error: (err) => {
        this.executando.set(false);
        this.mensagemErro.set(err.error?.message || 'Erro ao desconectar conta Google.');
      },
    });
  }

  sincronizarAgenda(): void {
    this.executarSincronizacao(this.googleService.sincronizarAgenda());
  }

  sincronizarContatos(): void {
    this.executarSincronizacao(this.googleService.sincronizarContatos());
  }

  sincronizarDrive(): void {
    this.executarSincronizacao(this.googleService.sincronizarDrive());
  }

  sincronizarTudo(): void {
    this.executarSincronizacao(this.googleService.sincronizarTudo());
  }

  private executarSincronizacao(observable: ReturnType<GoogleIntegracaoService['sincronizarTudo']>): void {
    this.executando.set(true);
    this.mensagemSucesso.set(null);
    this.mensagemErro.set(null);

    observable.subscribe({
      next: (resultado) => {
        this.executando.set(false);
        this.ultimoResultado.set(resultado);
        if (resultado.sucesso) {
          this.mensagemSucesso.set(resultado.mensagem);
        } else {
          this.mensagemErro.set(resultado.mensagem);
        }
        this.carregarStatus();
      },
      error: (err) => {
        this.executando.set(false);
        this.mensagemErro.set(err.error?.message || 'Falha ao executar sincronização com o Google.');
      },
    });
  }
}
