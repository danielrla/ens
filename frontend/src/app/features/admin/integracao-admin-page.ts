import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GoogleIntegracaoService, GoogleStatusDto, SincronizacaoResultadoDto } from '../../core/google-integracao.service';
import { EmailIntegracaoService, EmailConfigDto, LogEnvioEmailDto, MetodoEnvioEmail } from '../../core/email-integracao.service';
import { EnsDatePipe } from '../../core/ens-date.pipe';

type AbaIntegracao = 'workspace' | 'gmail';

@Component({
  selector: 'app-integracao-admin-page',
  imports: [CommonModule, EnsDatePipe],
  template: `
    <div class="admin-container">
      <!-- Breadcrumb e Cabeçalho -->
      <header class="cabecalho-admin">
        <nav class="breadcrumb-admin" aria-label="Navegação estrutural">
          <span class="muted">Administração</span>
          <span class="separador">/</span>
          <span class="atual">Integrações e Comunicação</span>
        </nav>
        <div class="titulo-area">
          <div>
            <h1>Integrações Google e Envio de E-mails</h1>
            <p class="subtitulo">
              Central de governança para conexão de conta Google Workspace, sincronização de Agenda e Drive,
              e parametrização segura do Gmail para envio de avisos e notificações da equipe.
            </p>
          </div>
          @if (abaAtiva() === 'workspace' && status()?.conectado) {
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

        <!-- Seletor de Abas -->
        <div class="navegacao-abas" role="tablist">
          <button
            type="button"
            class="aba-item"
            [class.ativa]="abaAtiva() === 'workspace'"
            (click)="abaAtiva.set('workspace')"
            role="tab"
            [attr.aria-selected]="abaAtiva() === 'workspace'"
          >
            <span class="aba-icone">🌐</span>
            <span>Google Workspace (Agenda & Drive)</span>
          </button>
          <button
            type="button"
            class="aba-item"
            [class.ativa]="abaAtiva() === 'gmail'"
            (click)="abaAtiva.set('gmail')"
            role="tab"
            [attr.aria-selected]="abaAtiva() === 'gmail'"
          >
            <span class="aba-icone">✉️</span>
            <span>Envio de E-mails via Gmail</span>
          </button>
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

      <!-- ============================================== -->
      <!-- ABA 1: GOOGLE WORKSPACE (Agenda, Drive, People) -->
      <!-- ============================================== -->
      @if (abaAtiva() === 'workspace') {
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
                {{ status()?.conectado ? '● Conectado ao Google Workspace' : '○ Não Conectado' }}
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
                class="btn btn-google btn-lg"
                (click)="conectarGoogle()"
                [disabled]="executando()"
              >
                <svg class="google-logo" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Conectar Conta Google</span>
              </button>
            } @else {
              <div class="card-conectado-acoes">
                <span class="texto-seguranca">🔒 Tokens cifrados em AES-GCM 256 bits</span>
                <button
                  type="button"
                  class="btn btn-perigo btn-sm"
                  (click)="desconectarGoogle()"
                  [disabled]="executando()"
                >
                  Desconectar Conta
                </button>
              </div>
            }
          </div>
        </section>

        <!-- Grade de Serviços Google Workspace -->
        <section class="grid-servicos">
          <!-- Google Calendar -->
          <article class="cartao card-servico">
            <div class="servico-topo">
              <div class="servico-icone">📅</div>
              <div>
                <h3>Google Agenda</h3>
                <span class="servico-sub">Google Calendar API v3</span>
              </div>
            </div>
            <p class="servico-desc">
              Sincroniza reuniões mensais formais, informais e retiros em um calendário compartilhado com convites
              automáticos enviados a todos os casais da equipe e ao conselheiro espiritual.
            </p>
            <div class="servico-meta">
              <div class="meta-item">
                <span class="meta-rotulo">Calendário ID:</span>
                <span class="meta-valor">{{ status()?.calendarioEnsId || 'Não provisionado' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-rotulo">Última Sincronização:</span>
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

          <!-- Google People -->
          <article class="cartao card-servico">
            <div class="servico-topo">
              <div class="servico-icone">👥</div>
              <div>
                <h3>Google Contatos</h3>
                <span class="servico-sub">Google People API v1</span>
              </div>
            </div>
            <p class="servico-desc">
              Exporta e sincroniza a lista de casais da equipe de forma padronizada, criando um grupo de contatos dedicado
              com e-mails, telefones e aniversários de matrimônio.
            </p>
            <div class="servico-meta">
              <div class="meta-item">
                <span class="meta-rotulo">Grupo Contatos:</span>
                <span class="meta-valor">{{ status()?.grupoContatosResourceName ? 'ENS - Equipe' : 'Pendente' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-rotulo">Última Sincronização:</span>
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
      }

      <!-- ============================================== -->
      <!-- ABA 2: ENVIO DE E-MAILS GMAIL (SMTP & OAUTH2)   -->
      <!-- ============================================== -->
      @if (abaAtiva() === 'gmail') {
        <!-- Status Geral do Envio -->
        <section class="cartao card-gmail-status">
          <div class="status-gmail-topo">
            <div class="status-indicador">
              <span class="badge badge-ativa">● Motor de Envio Ativo</span>
              <span class="metodo-tag">{{ emailConfig()?.metodo === 'SMTP' ? 'SMTP Seguro (Senha de Aplicativo)' : 'Google Workspace OAuth2' }}</span>
            </div>
            @if (emailConfig()?.ultimoTesteEm) {
              <span class="texto-ultimo-teste">Último teste: {{ emailConfig()?.ultimoTesteEm | ensDate }} (OK)</span>
            }
          </div>
          <h2>Configuração de E-mails Gmail</h2>
          <p class="descricao-conexao">
            Área de governança exclusiva do Administrador para definir o remetente oficial das ENS e cadastrar as credenciais
            de envio de e-mails para os avisos de reuniões semanais, avisos prévios de véspera (D-1) e alertas imediatos (H-4).
            <strong>As senhas e chaves são salvas no banco com criptografia em repouso e máscaras de proteção.</strong>
          </p>
        </section>

        <!-- Formulário de Credenciais com Armazenamento Seguro -->
        <section class="cartao card-formulario-credenciais">
          <div class="form-cabecalho">
            <h3>Credenciais de Envio</h3>
            <!-- Seletor de Método -->
            <div class="seletor-metodo-botoes">
              <button
                type="button"
                class="btn-opcao-metodo"
                [class.selecionado]="metodoSelecionado() === 'SMTP'"
                (click)="metodoSelecionado.set('SMTP')"
              >
                SMTP Gmail (Senha de App)
              </button>
              <button
                type="button"
                class="btn-opcao-metodo"
                [class.selecionado]="metodoSelecionado() === 'OAUTH2'"
                (click)="metodoSelecionado.set('OAUTH2')"
              >
                Google OAuth2 (Workspace)
              </button>
            </div>
          </div>

          <form class="grid-form-credenciais" (submit)="$event.preventDefault(); salvarCredenciaisEmail()">
            <!-- Dados do Remetente Comuns -->
            <div class="campo-grupo">
              <label for="remetenteEmail">E-mail Remetente Oficial *</label>
              <input
                id="remetenteEmail"
                type="email"
                class="input-admin"
                [value]="remetenteEmail()"
                (input)="remetenteEmail.set($any($event.target).value)"
                placeholder="notificacoes.ens@gmail.com"
                required
              />
              <small class="dica-campo">Endereço Gmail que aparecerá no campo "De:" para os casais.</small>
            </div>

            <div class="campo-grupo">
              <label for="remetenteNome">Nome de Exibição do Remetente *</label>
              <input
                id="remetenteNome"
                type="text"
                class="input-admin"
                [value]="remetenteNome()"
                (input)="remetenteNome.set($any($event.target).value)"
                placeholder="Equipes de Nossa Senhora"
                required
              />
              <small class="dica-campo">Nome institucional que acompanha o endereço de envio.</small>
            </div>

            <!-- Bloco Específico SMTP -->
            @if (metodoSelecionado() === 'SMTP') {
              <div class="campo-grupo">
                <label for="smtpHost">Servidor SMTP Host</label>
                <input
                  id="smtpHost"
                  type="text"
                  class="input-admin"
                  [value]="smtpHost()"
                  (input)="smtpHost.set($any($event.target).value)"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div class="campo-grupo">
                <label for="smtpPorta">Porta SMTP</label>
                <input
                  id="smtpPorta"
                  type="number"
                  class="input-admin"
                  [value]="smtpPorta()"
                  (input)="smtpPorta.set($any($event.target).value)"
                  placeholder="587"
                />
              </div>

              <div class="campo-grupo col-span-2">
                <label for="senhaApp">Senha de Aplicativo do Gmail (16 dígitos) *</label>
                <div class="box-senha-segura">
                  <input
                    id="senhaApp"
                    [type]="mostrarSenha() ? 'text' : 'password'"
                    class="input-admin"
                    [value]="novaSenhaApp()"
                    (input)="novaSenhaApp.set($any($event.target).value)"
                    placeholder="Digite para substituir a senha existente (16 letras)"
                  />
                  <button
                    type="button"
                    class="btn btn-fantasma btn-sm btn-revelar"
                    (click)="mostrarSenha.update(v => !v)"
                  >
                    {{ mostrarSenha() ? 'Ocultar' : 'Revelar' }}
                  </button>
                </div>
                <div class="status-senha-banco">
                  <span>Senha salva no banco: <code>{{ emailConfig()?.senhaAppMascarada || '•••• •••• •••• ••••' }}</code></span>
                  <small>Gere sua senha de app em: Conta Google → Segurança → Verificação em 2 etapas → Senhas de app.</small>
                </div>
              </div>
            }

            <!-- Bloco Específico OAuth2 -->
            @if (metodoSelecionado() === 'OAUTH2') {
              <div class="campo-grupo col-span-2">
                <label for="oauthClientId">Client ID Google Cloud</label>
                <input
                  id="oauthClientId"
                  type="text"
                  class="input-admin"
                  [value]="oauthClientId()"
                  (input)="oauthClientId.set($any($event.target).value)"
                  placeholder="exemplo-123.apps.googleusercontent.com"
                />
              </div>

              <div class="campo-grupo col-span-2">
                <label for="oauthSecret">Client Secret Google Cloud</label>
                <div class="box-senha-segura">
                  <input
                    id="oauthSecret"
                    [type]="mostrarSecret() ? 'text' : 'password'"
                    class="input-admin"
                    [value]="novoOAuthSecret()"
                    (input)="novoOAuthSecret.set($any($event.target).value)"
                    placeholder="Digite para substituir o secret salvo"
                  />
                  <button
                    type="button"
                    class="btn btn-fantasma btn-sm btn-revelar"
                    (click)="mostrarSecret.update(v => !v)"
                  >
                    {{ mostrarSecret() ? 'Ocultar' : 'Revelar' }}
                  </button>
                </div>
                <div class="status-senha-banco">
                  <span>Secret atual: <code>{{ emailConfig()?.oauthClientSecretMascarado || 'GOCSPX-••••••••••••••••' }}</code></span>
                  <small>Escopo autorizado: <code>https://www.googleapis.com/auth/gmail.send</code></small>
                </div>
              </div>
            }

            <div class="form-acoes col-span-2">
              <button
                type="submit"
                class="btn btn-primario btn-salvar-credenciais"
                [disabled]="salvandoEmail()"
              >
                <span>{{ salvandoEmail() ? 'Gravando com segurança...' : '💾 Salvar Credenciais no Banco' }}</span>
              </button>
            </div>
          </form>
        </section>

        <!-- Seção: Teste de Envio em Tempo Real -->
        <section class="cartao card-teste-envio">
          <div class="teste-cabecalho">
            <div>
              <h3>Disparo de Teste de E-mail</h3>
              <p class="sub-teste">
                Envie um e-mail de verificação imediato utilizando as credenciais salvas para certificar o funcionamento do envio.
              </p>
            </div>
          </div>

          <div class="grid-teste-inputs">
            <div class="campo-grupo">
              <label for="emailDestinoTeste">Destinatário do Teste *</label>
              <input
                id="emailDestinoTeste"
                type="email"
                class="input-admin"
                [value]="destinatarioTeste()"
                (input)="destinatarioTeste.set($any($event.target).value)"
                placeholder="danielrla@gmail.com"
              />
            </div>

            <div class="campo-grupo">
              <label for="assuntoTeste">Assunto</label>
              <input
                id="assuntoTeste"
                type="text"
                class="input-admin"
                [value]="assuntoTeste()"
                (input)="assuntoTeste.set($any($event.target).value)"
              />
            </div>
          </div>

          <div class="teste-rodape">
            <button
              type="button"
              class="btn btn-primario btn-disparar-teste"
              (click)="dispararTesteEmail()"
              [disabled]="testandoEmail()"
            >
              <span>{{ testandoEmail() ? 'Disparando pelo Gmail...' : '📨 Enviar E-mail de Teste' }}</span>
            </button>
          </div>
        </section>

        <!-- Histórico e Logs de Envio -->
        <section class="cartao card-logs-email">
          <div class="logs-cabecalho">
            <h3>Histórico Recente de Disparos</h3>
            <span class="badge badge-dourado">{{ logsEnvio().length }} disparo(s) registrado(s)</span>
          </div>

          <div class="tabela-responsiva">
            <table class="tabela-admin">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Tipo</th>
                  <th>Destinatário</th>
                  <th>Assunto</th>
                  <th>Status</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                @for (log of logsEnvio(); track log.id) {
                  <tr>
                    <td class="col-data">{{ log.dataHora | ensDate }}</td>
                    <td>
                      <span class="tag-tipo-email" [class]="log.tipo">
                        @switch (log.tipo) {
                          @case ('TESTE') { Teste }
                          @case ('AVISO_SEMANAL') { Segunda-feira (Semana) }
                          @case ('AVISO_VESPERA_D1') { Véspera (D-1) }
                          @case ('AVISO_IMEDIATO_H4') { Imediato (H-4) }
                        }
                      </span>
                    </td>
                    <td class="col-destinatario"><strong>{{ log.destinatario }}</strong></td>
                    <td class="col-assunto">{{ log.assunto }}</td>
                    <td>
                      <span class="badge" [class.badge-ativa]="log.sucesso" [class.badge-inativa]="!log.sucesso">
                        {{ log.sucesso ? '✓ Entregue' : '✕ Falha' }}
                      </span>
                    </td>
                    <td class="col-detalhes">{{ log.detalhes || 'Sem observações adicionais' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: clamp(0.75rem, 2vw, 1.5rem);
    }

    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .cabecalho-admin {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .breadcrumb-admin {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
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
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .titulo-area h1 {
      font-size: clamp(1.25rem, 2.5vw, 1.75rem);
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.35rem 0;
      letter-spacing: -0.02em;
    }

    .subtitulo {
      font-size: 0.925rem;
      color: #475569;
      margin: 0;
      max-width: 800px;
      line-height: 1.5;
    }

    /* Abas de Navegação */
    .navegacao-abas {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
      margin-top: 0.5rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .aba-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #64748b;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.15s, border-color 0.15s;
    }

    .aba-item:hover {
      color: #0f172a;
    }

    .aba-item.ativa {
      color: #1e3a8a;
      border-bottom-color: #1e3a8a;
    }

    .aba-icone {
      font-size: 1.1rem;
    }

    /* Banners de Feedback */
    .banner-feedback {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      line-height: 1.4;
      position: relative;
    }

    .banner-feedback.sucesso {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .banner-feedback.erro {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .banner-feedback.alerta-config {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }

    .btn-fechar {
      margin-left: auto;
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
    }

    /* Cartões */
    .cartao {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    /* Card Conexão Google */
    .card-conexao {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1.5rem;
      align-items: center;
    }

    .conexao-status-tag {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-ativa {
      background: #dcfce7;
      color: #15803d;
    }

    .badge-inativa {
      background: #f1f5f9;
      color: #64748b;
    }

    .badge-dourado {
      background: #fef3c7;
      color: #92400e;
    }

    .email-vinculado {
      font-size: 0.85rem;
      color: #475569;
      font-weight: 500;
    }

    .card-conexao h2,
    .card-gmail-status h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .descricao-conexao {
      font-size: 0.9rem;
      color: #475569;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .box-redirect-uri {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      flex-wrap: wrap;
    }

    .rotulo-redirect {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }

    .codigo-redirect {
      font-family: monospace;
      font-size: 0.8rem;
      color: #0f172a;
      background: #e2e8f0;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
    }

    /* Grade Serviços Google */
    .grid-servicos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .card-servico {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .servico-topo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .servico-icone {
      font-size: 1.75rem;
      background: #f1f5f9;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }

    .servico-topo h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .servico-sub {
      font-size: 0.75rem;
      color: #64748b;
    }

    .servico-desc {
      font-size: 0.85rem;
      color: #475569;
      margin: 0;
      line-height: 1.4;
      flex: 1;
    }

    .servico-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.8rem;
      background: #f8fafc;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
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

    /* Estilos Específicos do Gmail */
    .status-gmail-topo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .status-indicador {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .metodo-tag {
      font-size: 0.75rem;
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .texto-ultimo-teste {
      font-size: 0.8rem;
      color: #059669;
      font-weight: 500;
    }

    .form-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .form-cabecalho h3,
    .teste-cabecalho h3,
    .logs-cabecalho h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .seletor-metodo-botoes {
      display: flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 8px;
      gap: 2px;
    }

    .btn-opcao-metodo {
      border: none;
      background: transparent;
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-opcao-metodo.selecionado {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .grid-form-credenciais {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .col-span-2 {
      grid-column: span 2;
    }

    .campo-grupo {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .campo-grupo label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1e293b;
    }

    .input-admin {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #0f172a;
      box-sizing: border-box;
      background: #fff;
    }

    .input-admin:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .dica-campo {
      font-size: 0.75rem;
      color: #64748b;
    }

    .box-senha-segura {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .status-senha-banco {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      margin-top: 0.35rem;
      font-size: 0.75rem;
      color: #475569;
    }

    .status-senha-banco code {
      background: #f1f5f9;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      font-family: monospace;
      color: #0f172a;
    }

    .btn-revelar {
      white-space: nowrap;
      min-width: 70px;
    }

    .form-acoes {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }

    .btn-salvar-credenciais {
      min-height: 44px;
      padding: 0.65rem 1.25rem;
    }

    /* Teste de Envio */
    .grid-teste-inputs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 0.75rem;
    }

    .sub-teste {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0.25rem 0 0 0;
    }

    .teste-rodape {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }

    /* Logs de Email */
    .logs-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .tabela-responsiva {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .tabela-admin {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }

    .tabela-admin th {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      padding: 0.65rem 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .tabela-admin td {
      padding: 0.65rem 0.75rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .tag-tipo-email {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .tag-tipo-email.TESTE {
      background: #f1f5f9;
      color: #475569;
    }

    .tag-tipo-email.AVISO_SEMANAL {
      background: #dbeafe;
      color: #1e40af;
    }

    .tag-tipo-email.AVISO_VESPERA_D1 {
      background: #fef3c7;
      color: #92400e;
    }

    .tag-tipo-email.AVISO_IMEDIATO_H4 {
      background: #fee2e2;
      color: #991b1b;
    }

    .col-data {
      white-space: nowrap;
      font-size: 0.8rem;
    }

    .col-destinatario {
      color: #0f172a;
    }

    /* Botões Padrão */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid transparent;
      min-height: 44px;
    }

    .btn-sm {
      min-height: 36px;
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
    }

    .btn-primario {
      background: #1e3a8a;
      color: #ffffff;
    }

    .btn-primario:hover:not(:disabled) {
      background: #1e40af;
    }

    .btn-secundario {
      background: #f1f5f9;
      color: #1e293b;
      border-color: #cbd5e1;
    }

    .btn-secundario:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .btn-fantasma {
      background: transparent;
      color: #475569;
      border-color: #cbd5e1;
    }

    .btn-fantasma:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .btn-perigo {
      background: #fff;
      color: #dc2626;
      border-color: #fca5a5;
    }

    .btn-perigo:hover {
      background: #fef2f2;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-google {
      background: #ffffff;
      color: #3c4043;
      border-color: #dadce0;
      box-shadow: 0 1px 3px rgba(60, 64, 67, 0.08);
      font-weight: 500;
    }

    .btn-google:hover {
      background: #f8f9fa;
      border-color: #dadce0;
      box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
    }

    /* Painel de Log */
    .painel-log {
      border-left: 4px solid #1e3a8a;
    }

    .log-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .log-mensagem {
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.75rem 0;
    }

    .lista-detalhes {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .lista-detalhes li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #334155;
    }

    .check-icone {
      color: #16a34a;
      font-weight: 900;
    }

    @media (max-width: 768px) {
      .card-conexao {
        grid-template-columns: 1fr;
      }
      .grid-form-credenciais,
      .grid-teste-inputs {
        grid-template-columns: 1fr;
      }
      .col-span-2 {
        grid-column: span 1;
      }
      .btn {
        width: 100%;
      }
      .box-redirect-uri {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `,
})
export class IntegracaoAdminPage implements OnInit {
  private readonly googleService = inject(GoogleIntegracaoService);
  private readonly emailService = inject(EmailIntegracaoService);
  private readonly route = inject(ActivatedRoute);

  // Controle de Abas
  readonly abaAtiva = signal<AbaIntegracao>('workspace');

  // Estado Google Workspace
  readonly status = signal<GoogleStatusDto | null>(null);
  readonly executando = signal<boolean>(false);
  readonly copiado = signal<boolean>(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);
  readonly ultimoResultado = signal<SincronizacaoResultadoDto | null>(null);

  // Estado Gmail & Envio de E-mails
  readonly emailConfig = signal<EmailConfigDto | null>(null);
  readonly logsEnvio = signal<LogEnvioEmailDto[]>([]);
  readonly salvandoEmail = signal<boolean>(false);
  readonly testandoEmail = signal<boolean>(false);

  // Campos do Formulário de E-mail
  readonly metodoSelecionado = signal<MetodoEnvioEmail>('OAUTH2');
  readonly remetenteEmail = signal<string>('danielrla@gmail.com');
  readonly remetenteNome = signal<string>('Equipes de Nossa Senhora');
  readonly smtpHost = signal<string>('smtp.gmail.com');
  readonly smtpPorta = signal<number>(587);
  readonly novaSenhaApp = signal<string>('');
  readonly mostrarSenha = signal<boolean>(false);

  readonly oauthClientId = signal<string>('405083268429-mock-gmail.apps.googleusercontent.com');
  readonly novoOAuthSecret = signal<string>('');
  readonly mostrarSecret = signal<boolean>(false);

  // Campos do Disparo de Teste
  readonly destinatarioTeste = signal<string>('danielrla@gmail.com');
  readonly assuntoTeste = signal<string>('[ENS] Teste de Envio Google Workspace OAuth2');

  ngOnInit(): void {
    // Carrega dados de ambas as integrações
    this.carregarStatusGoogle();
    this.carregarConfigEmail();
    this.carregarLogsEmail();

    // Feedback de retorno OAuth
    const sucesso = this.route.snapshot.queryParamMap.get('sucesso');
    const erro = this.route.snapshot.queryParamMap.get('erro');
    if (sucesso === 'true') {
      this.mensagemSucesso.set('Conta Google Workspace vinculada com sucesso!');
    } else if (erro) {
      this.mensagemErro.set(`Falha ao autorizar conta Google: ${erro}`);
    }
  }

  // Métodos Google Workspace
  carregarStatusGoogle(): void {
    this.googleService.obterStatus().subscribe({
      next: (dados) => this.status.set(dados),
      error: () => this.status.set(null),
    });
  }

  copiarUri(uri: string): void {
    if (!uri) return;
    navigator.clipboard.writeText(uri).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2500);
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
        this.carregarStatusGoogle();
      },
      error: (err) => {
        this.executando.set(false);
        this.mensagemErro.set(err.error?.message || 'Falha ao executar sincronização com o Google.');
      },
    });
  }

  // Métodos Gmail & E-mails
  carregarConfigEmail(): void {
    this.emailService.obterConfiguracao().subscribe({
      next: (cfg) => {
        this.emailConfig.set(cfg);
        this.metodoSelecionado.set(cfg.metodo);
        this.remetenteEmail.set(cfg.remetenteEmail);
        this.remetenteNome.set(cfg.remetenteNome);
        this.smtpHost.set(cfg.smtpHost || 'smtp.gmail.com');
        this.smtpPorta.set(cfg.smtpPorta || 587);
        this.oauthClientId.set(cfg.oauthClientId || '');
      },
      error: () => {
        // Fallback
      },
    });
  }

  carregarLogsEmail(): void {
    this.emailService.obterLogs().subscribe({
      next: (logs) => this.logsEnvio.set(logs),
      error: () => this.logsEnvio.set([]),
    });
  }

  salvarCredenciaisEmail(): void {
    this.salvandoEmail.set(true);
    this.mensagemSucesso.set(null);
    this.mensagemErro.set(null);

    const dadosAtualizacao: Parameters<EmailIntegracaoService['salvarConfiguracao']>[0] = {
      metodo: this.metodoSelecionado(),
      remetenteEmail: this.remetenteEmail(),
      remetenteNome: this.remetenteNome(),
      smtpHost: this.smtpHost(),
      smtpPorta: Number(this.smtpPorta()),
      smtpUsuario: this.remetenteEmail(),
      usaTls: true,
      oauthClientId: this.oauthClientId(),
      senhaAppReal: this.novaSenhaApp() || undefined,
      oauthClientSecretReal: this.novoOAuthSecret() || undefined,
    };

    this.emailService.salvarConfiguracao(dadosAtualizacao).subscribe({
      next: (novaCfg) => {
        this.salvandoEmail.set(false);
        this.emailConfig.set(novaCfg);
        this.novaSenhaApp.set('');
        this.novoOAuthSecret.set('');
        this.mensagemSucesso.set('Credenciais do Gmail salvas no banco com segurança e criptografia!');
      },
      error: (err) => {
        this.salvandoEmail.set(false);
        this.mensagemErro.set(err.error?.message || 'Erro ao persistir credenciais do Gmail.');
      },
    });
  }

  dispararTesteEmail(): void {
    if (!this.destinatarioTeste()) {
      this.mensagemErro.set('Por favor, informe o e-mail destinatário para o teste.');
      return;
    }

    this.testandoEmail.set(true);
    this.mensagemSucesso.set(null);
    this.mensagemErro.set(null);

    this.emailService
      .testarEnvio({
        destinatario: this.destinatarioTeste(),
        assunto: this.assuntoTeste(),
      })
      .subscribe({
        next: (res) => {
          this.testandoEmail.set(false);
          if (res.sucesso) {
            this.mensagemSucesso.set(res.mensagem);
          } else {
            this.mensagemErro.set(res.mensagem);
          }
          this.carregarConfigEmail();
          this.carregarLogsEmail();
        },
        error: (err) => {
          this.testandoEmail.set(false);
          this.mensagemErro.set(err.error?.message || 'Falha no disparo do e-mail de teste.');
        },
      });
  }
}
