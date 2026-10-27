import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FiltroEstrutura } from './filtro-estrutura';
import { EquipeDetalheDto, EquipeRequest, EquipeResumoDto, EquipeService, TemaAno } from '../../core/equipe.service';
import { SceDto, SceService } from '../../core/sce.service';
import { CasalDto, CasalService } from '../../core/casal.service';
import { mascararTelefone } from '../../core/mascara.util';
import { EnsDatePipe } from '../../core/ens-date.pipe';

@Component({
  selector: 'app-equipes-page',
  imports: [CommonModule, FormsModule, FiltroEstrutura, EnsDatePipe],
  template: `
    <header class="cabecalho">
      <div>
        <h1>Equipes de Nossa Senhora</h1>
        <p class="serifa">“Onde dois ou três estiverem reunidos em meu nome, eu estou aí no meio deles.” (Mt 18,20)</p>
      </div>
      <button type="button" class="btn btn-primario" (click)="abrirModalNova()">
        + Nova Equipe
      </button>
    </header>

    <app-filtro-estrutura />

    <!-- Listagem de Equipes -->
    <section class="cartao container-tabela">
      @if (carregando()) {
        <p class="estado-info">Carregando equipes...</p>
      } @else if (equipes().length === 0) {
        <div class="estado-vazio">
          <p>Nenhuma equipe encontrada para os filtros selecionados.</p>
        </div>
      } @else {
        <div class="tabela-responsiva">
          <table class="tabela-ens">
            <thead>
              <tr>
                <th>Nome de Devoção</th>
                <th>Localidade</th>
                <th>Casal Responsável (CRE)</th>
                <th>Conselheiro Espiritual (SCE)</th>
                <th>Estrutura</th>
                <th>Casais</th>
                <th>Status</th>
                <th class="texto-direita">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (eq of equipes(); track eq.id) {
                <tr>
                  <td>
                    <div class="bloco-devocao-equipe">
                      <strong class="nome-devocao-principal">{{ eq.nomeDevocao || 'Equipe ' + (eq.numero | number:'2.0-0') }}</strong>
                      <div class="meta-equipe-linha">
                        <span class="badge-numero-sutil">Eq. {{ eq.numero | number:'2.0-0' }}</span>
                        @if (eq.emPilotagem) {
                          <span class="badge badge-pilotagem">Pilotagem</span>
                        }
                      </div>
                    </div>
                    @if (eq.nomeCasalPiloto) {
                      <div class="texto-suave texto-piloto">Piloto: {{ eq.nomeCasalPiloto }}</div>
                    }
                  </td>
                  <td>
                    @if (eq.municipio || eq.estado) {
                      <span>📍 {{ eq.municipio ? eq.municipio : '' }}{{ eq.municipio && eq.estado ? ' / ' : '' }}{{ eq.estado ? eq.estado : '' }}</span>
                    } @else {
                      <span class="texto-suave">—</span>
                    }
                  </td>
                  <td>
                    @if (eq.cre) {
                      <strong>{{ eq.cre }}</strong>
                    } @else {
                      <span class="texto-suave">A definir</span>
                    }
                  </td>
                  <td>
                    @if (eq.nomeSce) {
                      <span class="badge-sce">✝️ {{ eq.nomeSce }}</span>
                    } @else {
                      <span class="texto-suave">Não vinculado</span>
                    }
                  </td>
                  <td>
                    <div class="caminho-estrutura">
                      <small>{{ eq.setor?.nome || 'Setor' }} / {{ eq.regiao?.nome || 'Região' }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge">{{ eq.totalCasais }} casais</span>
                  </td>
                  <td>
                    <span class="badge" [class.badge-dourado]="eq.status === 'ATIVA'" [class.badge-inativo]="eq.status === 'INATIVA'">
                      {{ eq.status }}
                    </span>
                  </td>
                  <td class="texto-direita acoes-linha">
                    <button type="button" class="btn-acao-icone" title="Visualizar Equipe e Casais" (click)="abrirModalVisualizacao(eq)">
                      👁️ Visualizar
                    </button>
                    <button type="button" class="btn-icone" title="Editar Equipe" (click)="abrirModalEdicao(eq)">✏️</button>
                    @if (eq.status !== 'INATIVA') {
                      <button type="button" class="btn-icone" title="Arquivar" (click)="arquivar(eq)">📁</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    <!-- Modal Nova / Edição de Equipe -->
    @if (modalAberto()) {
      <div class="overlay-modal" (click)="fecharModal()">
        <div class="modal-dialog cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <h2>{{ modoEdicao() ? 'Editar Equipe' : 'Cadastrar Nova Equipe' }}</h2>
            <button type="button" class="btn-fechar" (click)="fecharModal()">✕</button>
          </div>
          <form (submit)="salvarEquipe($event)" class="form-grid">
            <div class="campo">
              <label>Nome de Devoção / Padroeiro</label>
              <input [(ngModel)]="novaEquipe.nomeDevocao" name="nomeDevocao" placeholder="Ex: Nossa Senhora Aparecida" />
            </div>

            <div class="linha-dupla">
              <div class="campo">
                <label>Estado (UF)</label>
                <select [(ngModel)]="novaEquipe.estado" name="estado">
                  <option value="">Selecione o Estado</option>
                  @for (uf of ufs; track uf) {
                    <option [value]="uf">{{ uf }}</option>
                  }
                </select>
              </div>
              <div class="campo">
                <label>Município</label>
                <input [(ngModel)]="novaEquipe.municipio" name="municipio" placeholder="Ex: Cuiabá" />
              </div>
            </div>

            <div class="campo">
              <label>Casal Responsável de Equipe (CRE)</label>
              <select [(ngModel)]="novaEquipe.casalResponsavelId" name="casalResponsavelId">
                <option value="">Nenhum / Definir posteriormente</option>
                @for (c of todosCasais(); track c.id) {
                  <option [value]="c.id">{{ c.esposo.nomeCompleto }} & {{ c.esposa.nomeCompleto }}</option>
                }
              </select>
            </div>

            <div class="linha-dupla">
              <div class="campo">
                <label>Conselheiro Espiritual (SCE) <span class="obrigatorio">*</span></label>
                <select [(ngModel)]="novaEquipe.sceId" name="sceId">
                  <option value="">Selecione o Sacerdote vinculado</option>
                  @for (s of sacerdotesAtivos(); track s.id) {
                    <option [value]="s.id">{{ s.titulo }} {{ s.nomeCompleto }} ({{ s.paroquia || 'Sem paróquia' }})</option>
                  }
                </select>
              </div>
              <div class="campo">
                <label>Status</label>
                <select [(ngModel)]="novaEquipe.status" name="status">
                  <option value="ATIVA">Ativa</option>
                  <option value="EM_PILOTAGEM">Em Pilotagem</option>
                  <option value="EM_REESTRUTURACAO">Em Reestruturação</option>
                </select>
              </div>
            </div>

            <div class="campo-checkbox">
              <label>
                <input type="checkbox" [(ngModel)]="novaEquipe.emPilotagem" name="emPilotagem" (change)="aoMudarPilotagem()" />
                Esta é uma equipe em fase de pilotagem
              </label>
            </div>

            <div class="linha-dupla">
              <div class="campo">
                <label>Início da Pilotagem</label>
                <input type="date" [disabled]="!novaEquipe.emPilotagem" [(ngModel)]="novaEquipe.dataInicioPilotagem" name="dataInicioPilotagem" />
              </div>
              <div class="campo">
                <label>Previsão de Término da Pilotagem</label>
                <input type="date" [disabled]="!novaEquipe.emPilotagem" [(ngModel)]="novaEquipe.dataTerminoPilotagem" name="dataTerminoPilotagem" />
              </div>
            </div>

            @if (novaEquipe.emPilotagem) {
              <div class="campo">
                <label>Casal Piloto da Equipe</label>
                <select [(ngModel)]="novaEquipe.casalPilotoId" name="casalPilotoId">
                  <option value="">Selecione o Casal Piloto...</option>
                  @for (c of todosCasais(); track c.id) {
                    <option [value]="c.id">{{ c.esposo.nomeCompleto }} & {{ c.esposa.nomeCompleto }}</option>
                  }
                </select>
              </div>
            }

            <div class="campo">
              <label>Data de Fundação</label>
              <input type="date" [(ngModel)]="novaEquipe.dataFundacao" name="dataFundacao" />
            </div>

            <div class="campo secao-temas-anuais">
              <label>Temas de Estudo por Ano</label>
              <div class="linha-adicionar-tema">
                <input type="number" [(ngModel)]="novoTemaAno" name="novoAno" placeholder="Ano (ex: 2026)" class="input-ano" />
                <input type="text" [(ngModel)]="novoTemaTexto" name="novoTexto" placeholder="Tema de estudo do ano..." class="input-tema" />
                <button type="button" class="btn btn-secundario btn-sm" (click)="adicionarTemaAno()">+ Adicionar</button>
              </div>
              @if (temasAnuaisLista().length > 0) {
                <div class="lista-temas-cadastrados">
                  @for (t of temasAnuaisLista(); track t.ano; let idx = $index) {
                    <div class="item-tema-ano">
                      <span class="badge-ano">{{ t.ano }}</span>
                      <span class="texto-tema-item">{{ t.tema }}</span>
                      <button type="button" class="btn-remover-tema" (click)="removerTemaAno(idx)" title="Remover este ano">✕</button>
                    </div>
                  }
                </div>
              } @else {
                <small class="texto-suave">Nenhum tema anual cadastrado. Adicione o ano e o tema acima.</small>
              }
            </div>

            <div class="modal-acoes">
              <button type="button" class="btn btn-fantasma" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn btn-primario">
                {{ modoEdicao() ? 'Salvar Alterações' : 'Criar Equipe' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Visualizar Equipe e Casais Vinculados -->
    @if (modalVisualizacaoAberto() && equipeDetalheVisualizacao()) {
      <div class="overlay-modal" (click)="fecharModalVisualizacao()">
        <div class="modal-dialog modal-largo cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <div>
              <h2>Equipe {{ equipeDetalheVisualizacao()?.numero | number:'2.0-0' }} — {{ equipeDetalheVisualizacao()?.nomeDevocao || 'Nossa Senhora' }}</h2>
              <p class="texto-suave">
                {{ equipeDetalheVisualizacao()?.setor?.nome || 'Setor' }} • {{ equipeDetalheVisualizacao()?.regiao?.nome || 'Região' }} • {{ equipeDetalheVisualizacao()?.provincia?.nome || 'Província' }}
              </p>
            </div>
            <button type="button" class="btn-fechar" (click)="fecharModalVisualizacao()">✕</button>
          </div>

          <!-- Informações Gerais da Equipe -->
          <div class="ficha-equipe-grid">
            <div class="ficha-item">
              <span class="rotulo-suave">Casal Responsável (CRE):</span>
              <strong>{{ equipeDetalheVisualizacao()?.cre || 'A definir' }}</strong>
            </div>
            <div class="ficha-item">
              <span class="rotulo-suave">Conselheiro Espiritual (SCE):</span>
              <span class="badge-sce">✝️ {{ equipeDetalheVisualizacao()?.nomeSce || 'Não vinculado' }}</span>
            </div>
            <div class="ficha-item ficha-item-largo">
              <span class="rotulo-suave">Temas de Estudo por Ano:</span>
              @if (equipeDetalheVisualizacao()?.temasAnuais && equipeDetalheVisualizacao()!.temasAnuais!.length > 0) {
                <div class="chips-temas-visualizacao">
                  @for (t of equipeDetalheVisualizacao()!.temasAnuais!; track t.ano) {
                    <div class="chip-tema">
                      <span class="badge-ano-sm">{{ t.ano }}</span>
                      <span class="texto-tema-chip">{{ t.tema }}</span>
                    </div>
                  }
                </div>
              } @else if (equipeDetalheVisualizacao()?.temaEstudoAno) {
                <strong class="texto-dourado">{{ equipeDetalheVisualizacao()?.temaEstudoAno }}</strong>
              } @else {
                <span class="texto-suave">Não cadastrado</span>
              }
            </div>
            <div class="ficha-item">
              <span class="rotulo-suave">Status da Equipe:</span>
              <span class="badge" [class.badge-dourado]="equipeDetalheVisualizacao()?.status === 'ATIVA'">
                {{ equipeDetalheVisualizacao()?.status }}
              </span>
            </div>
            <div class="ficha-item">
              <span class="rotulo-suave">Localidade:</span>
              <span>📍 {{ equipeDetalheVisualizacao()?.municipio || '—' }} / {{ equipeDetalheVisualizacao()?.estado || '—' }}</span>
            </div>
            <div class="ficha-item">
              <span class="rotulo-suave">Data de Fundação:</span>
              <span>{{ equipeDetalheVisualizacao()?.dataFundacao | ensDate }}</span>
            </div>
            <div class="ficha-item">
              <span class="rotulo-suave">Total de Casais:</span>
              <span class="badge badge-dourado">{{ casaisVisualizacao().length }} casais</span>
            </div>
          </div>

          <!-- Tabela com Todos os Casais da Equipe -->
          <section class="secao-casais-equipe">
            <div class="topo-secao-casais">
              <h3>Casais Integrantes da Equipe</h3>
              <span class="texto-suave">{{ casaisVisualizacao().length }} membros cadastrados</span>
            </div>

            @if (carregandoCasaisVisualizacao()) {
              <p class="estado-info">Carregando casais da equipe...</p>
            } @else if (casaisVisualizacao().length === 0) {
              <p class="texto-suave texto-centro">Nenhum casal vinculado a esta equipe no momento.</p>
            } @else {
              <div class="tabela-responsiva">
                <table class="tabela-ens">
                  <thead>
                    <tr>
                      <th>Casal (Esposo & Esposa)</th>
                      <th>Papel na Equipe</th>
                      <th>Contatos / WhatsApp</th>
                      <th>Matrimônio</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of casaisVisualizacao(); track c.id) {
                      <tr>
                        <td>
                          <div class="col-casal-container">
                            @if (c.fotoUrl) {
                              <img [src]="c.fotoUrl" [alt]="c.esposo.nomeCompleto" class="avatar-casal" />
                            } @else {
                              <div class="avatar-casal avatar-casal-padrao">👥</div>
                            }
                            <div>
                              <strong>{{ c.esposo.nomeCompleto }} & {{ c.esposa.nomeCompleto }}</strong>
                              <div class="datas-aniversario">
                                @if (c.esposo.dataNascimento) {
                                  <small class="texto-suave">Nasc. Ele: {{ c.esposo.dataNascimento | ensDate }}</small>
                                }
                                @if (c.esposa.dataNascimento) {
                                  <small class="texto-suave"> | Nasc. Ela: {{ c.esposa.dataNascimento | ensDate }}</small>
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          @if (c.id === equipeDetalheVisualizacao()?.creCasalId) {
                            <span class="badge badge-cre">👑 CRE</span>
                          } @else {
                            <span class="badge">Membro</span>
                          }
                        </td>
                        <td>
                          <div class="contatos-linha">
                            @if (c.esposo.celular) {
                              <a [href]="gerarLinkWhatsApp(c.esposo.celular)" target="_blank" class="link-whatsapp" title="Conversar com o Esposo">
                                💬 {{ formatarTelefone(c.esposo.celular) }} (Ele)
                              </a>
                            } @else {
                              <span class="texto-suave">— (Ele)</span>
                            }
                          </div>
                          <div class="contatos-linha">
                            @if (c.esposa.celular) {
                              <a [href]="gerarLinkWhatsApp(c.esposa.celular)" target="_blank" class="link-whatsapp" title="Conversar com a Esposa">
                                💬 {{ formatarTelefone(c.esposa.celular) }} (Ela)
                              </a>
                            } @else {
                              <span class="texto-suave">— (Ela)</span>
                            }
                          </div>
                        </td>
                        <td>
                          <span>{{ c.dataMatrimonio | ensDate }}</span>
                          @if (c.paroquiaCasamento) {
                            <div><small class="texto-suave">{{ c.paroquiaCasamento }}</small></div>
                          }
                        </td>
                        <td>
                          <span class="badge" [class.badge-dourado]="c.status === 'ATIVO'" [class.badge-inativo]="c.status === 'INATIVO'">
                            {{ c.status }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>

          <div class="modal-acoes">
            <button type="button" class="btn btn-primario" (click)="fecharModalVisualizacao()">Fechar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .cabecalho h1 {
      color: var(--azul-900);
      font-size: clamp(1.4rem, 3vw, 1.8rem);
    }
    .cabecalho p {
      margin: 0.35rem 0 0;
      color: var(--texto-suave);
      font-style: italic;
    }
    .container-tabela { padding: 0; overflow: hidden; }
    .tabela-responsiva { width: 100%; overflow-x: auto; }
    .tabela-ens {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .tabela-ens th {
      background: var(--fundo-claro);
      color: var(--texto-suave);
      font-size: 0.75rem;
      text-transform: uppercase;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--borda);
    }
    .tabela-ens td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid var(--borda);
      font-size: 0.9rem;
      vertical-align: middle;
    }
    .tabela-ens tr:hover td {
      background: rgba(241, 245, 249, 0.6);
    }
    .bloco-devocao-equipe {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .nome-devocao-principal {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--azul-900);
    }
    .meta-equipe-linha {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .badge-numero-sutil {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .texto-piloto {
      font-size: 0.8rem;
      margin-top: 0.2rem;
    }
    .badge-pilotagem {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      font-size: 0.7rem;
    }
    .badge-sce {
      background: #f3e8ff;
      color: #6b21a8;
      font-size: 0.8rem;
    }
    .badge-cre {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      font-weight: 600;
    }
    .caminho-estrutura { color: var(--texto-suave); }
    .texto-direita { text-align: right; }
    .texto-centro { text-align: center; }
    .texto-suave { color: var(--texto-suave); font-size: 0.85rem; }
    .rotulo-suave { color: var(--texto-suave); font-size: 0.8rem; display: block; }
    .badge-inativo { background: #fee2e2; color: #dc2626; }
    .acoes-linha {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .btn-acao-icone {
      background: var(--fundo-claro);
      border: 1px solid var(--borda);
      color: var(--azul-900);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.35rem 0.65rem;
      border-radius: var(--raio-sm);
      transition: background 0.15s ease;
    }
    .btn-acao-icone:hover {
      background: var(--borda);
    }
    .btn-icone {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }
    .btn-icone:hover { background: var(--fundo); }
    .estado-vazio, .estado-info { padding: 2rem; text-align: center; color: var(--texto-suave); }

    /* Modais */
    .overlay-modal {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1rem;
    }
    .modal-dialog {
      max-width: 580px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-largo {
      max-width: 900px;
    }
    .modal-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--borda);
      padding-bottom: 0.75rem;
    }
    .modal-cabecalho h2 {
      margin: 0;
      color: var(--azul-900);
    }
    .btn-fechar {
      background: transparent;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--texto-suave);
    }
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .linha-dupla {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .campo-checkbox label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .modal-acoes {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

    /* Ficha de Visualização */
    .ficha-equipe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem 1.25rem;
      background: var(--fundo-claro);
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    .ficha-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .secao-casais-equipe {
      margin-top: 1rem;
    }
    .topo-secao-casais {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .topo-secao-casais h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--azul-900);
    }
    .col-casal-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar-casal {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--borda);
      flex-shrink: 0;
    }
    .avatar-casal-padrao {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      font-size: 1.1rem;
    }
    .datas-aniversario {
      margin-top: 0.2rem;
    }
    .contatos-linha {
      font-size: 0.85rem;
    }
    .link-whatsapp {
      color: #059669;
      text-decoration: none;
      font-weight: 500;
    }
    .link-whatsapp:hover {
      text-decoration: underline;
    }

    /* Temas Anuais */
    .secao-temas-anuais {
      background: var(--fundo-claro);
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 0.85rem;
    }
    .linha-adicionar-tema {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .input-ano {
      width: 100px;
      flex-shrink: 0;
    }
    .input-tema {
      flex: 1;
    }
    .lista-temas-cadastrados {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.5rem;
    }
    .item-tema-ano {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #ffffff;
      padding: 0.35rem 0.65rem;
      border-radius: 4px;
      border: 1px solid var(--borda);
      font-size: 0.85rem;
    }
    .badge-ano {
      background: #1e3a8a;
      color: #ffffff;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .badge-ano-sm {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .texto-tema-item {
      flex: 1;
      color: var(--texto);
    }
    .btn-remover-tema {
      background: transparent;
      border: none;
      color: var(--erro);
      cursor: pointer;
      font-weight: bold;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    .btn-remover-tema:hover {
      background: #fee2e2;
    }
    .ficha-item-largo {
      grid-column: 1 / -1;
    }
    .chips-temas-visualizacao {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.35rem;
    }
    .chip-tema {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.85rem;
    }
  `,
})
export class EquipesPage {
  private readonly equipeService = inject(EquipeService);
  private readonly sceService = inject(SceService);
  private readonly casalService = inject(CasalService);
  private readonly route = inject(ActivatedRoute);

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected carregando = signal(false);
  protected equipes = signal<EquipeResumoDto[]>([]);
  protected sacerdotesAtivos = signal<SceDto[]>([]);
  protected modalAberto = signal(false);
  protected modoEdicao = signal(false);
  protected idEdicao: string | null = null;
  protected todosCasais = signal<CasalDto[]>([]);

  // Visualização de Equipe e Casais
  protected modalVisualizacaoAberto = signal(false);
  protected equipeDetalheVisualizacao = signal<EquipeDetalheDto | null>(null);
  protected casaisVisualizacao = signal<CasalDto[]>([]);
  protected carregandoCasaisVisualizacao = signal(false);

  protected readonly ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
  ];

  protected novaEquipe: EquipeRequest = {
    nomeDevocao: '',
    estado: '',
    municipio: '',
    superRegiaoId: '',
    provinciaId: '',
    regiaoId: '',
    setorId: '',
    status: 'ATIVA',
    emPilotagem: false,
    casalPilotoId: '',
    casalResponsavelId: '',
    sceId: '',
  };

  constructor() {
    this.carregarSacerdotes();
    this.carregarTodosCasais();
    effect(() => {
      const params = this.queryParams();
      this.carregarEquipes(
        params.get('superRegiaoId') ?? undefined,
        params.get('provinciaId') ?? undefined,
        params.get('regiaoId') ?? undefined,
        params.get('setorId') ?? undefined,
      );
    });
  }

  carregarTodosCasais(): void {
    this.casalService.listar({ size: 100 }).subscribe({
      next: (res) => this.todosCasais.set(res.content),
      error: () => {},
    });
  }

  carregarSacerdotes(): void {
    this.sceService.listarAtivos().subscribe({
      next: (dados) => this.sacerdotesAtivos.set(dados),
      error: () => {},
    });
  }

  carregarEquipes(superRegiaoId?: string, provinciaId?: string, regiaoId?: string, setorId?: string): void {
    this.carregando.set(true);
    this.equipeService.listar({ superRegiaoId, provinciaId, regiaoId, setorId }).subscribe({
      next: (res) => {
        this.equipes.set(res.content);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  aoMudarPilotagem(): void {
    if (!this.novaEquipe.emPilotagem) {
      this.novaEquipe.dataInicioPilotagem = '';
      this.novaEquipe.dataTerminoPilotagem = '';
      this.novaEquipe.casalPilotoId = '';
    }
  }

  protected temasAnuaisLista = signal<TemaAno[]>([]);
  protected novoTemaAno = new Date().getFullYear();
  protected novoTemaTexto = '';

  adicionarTemaAno(): void {
    const texto = this.novoTemaTexto.trim();
    if (!texto || !this.novoTemaAno) return;

    this.temasAnuaisLista.update((atuais) => {
      const filtrada = atuais.filter((t) => t.ano !== Number(this.novoTemaAno));
      const nova = [...filtrada, { ano: Number(this.novoTemaAno), tema: texto }];
      return nova.sort((a, b) => b.ano - a.ano);
    });

    this.novoTemaTexto = '';
    this.sincronizarTemasParaEnvio();
  }

  removerTemaAno(index: number): void {
    this.temasAnuaisLista.update((atuais) => atuais.filter((_, i) => i !== index));
    this.sincronizarTemasParaEnvio();
  }

  private sincronizarTemasParaEnvio(): void {
    const lista = this.temasAnuaisLista();
    this.novaEquipe.temasAnuais = lista;
    if (lista.length > 0) {
      this.novaEquipe.temaEstudoAno = lista[0].tema;
    } else {
      this.novaEquipe.temaEstudoAno = '';
    }
  }

  abrirModalNova(): void {
    const params = this.queryParams();
    this.modoEdicao.set(false);
    this.idEdicao = null;
    this.temasAnuaisLista.set([]);
    this.novoTemaAno = new Date().getFullYear();
    this.novoTemaTexto = '';
    this.novaEquipe = {
      nomeDevocao: '',
      estado: '',
      municipio: '',
      superRegiaoId: params.get('superRegiaoId') || '6adf705bab4bd66ea0556d39',
      provinciaId: params.get('provinciaId') || 'prov1',
      regiaoId: params.get('regiaoId') || 'reg1',
      setorId: params.get('setorId') || 'set1',
      status: 'ATIVA',
      emPilotagem: false,
      casalPilotoId: '',
      casalResponsavelId: '',
      sceId: '',
      temaEstudoAno: '',
      temasAnuais: [],
    };
    this.modalAberto.set(true);
  }

  abrirModalEdicao(eq: EquipeResumoDto): void {
    this.modoEdicao.set(true);
    this.idEdicao = eq.id;
    this.equipeService.obterPorId(eq.id).subscribe({
      next: (detalhe) => {
        const temas = detalhe.temasAnuais && detalhe.temasAnuais.length > 0
          ? [...detalhe.temasAnuais].sort((a, b) => b.ano - a.ano)
          : (detalhe.temaEstudoAno ? [{ ano: new Date().getFullYear(), tema: detalhe.temaEstudoAno }] : []);
        this.temasAnuaisLista.set(temas);
        this.novoTemaAno = new Date().getFullYear();
        this.novoTemaTexto = '';

        this.novaEquipe = {
          numero: detalhe.numero,
          nomeDevocao: detalhe.nomeDevocao || '',
          estado: detalhe.estado || '',
          municipio: detalhe.municipio || '',
          superRegiaoId: detalhe.superRegiao?.id || '',
          provinciaId: detalhe.provincia?.id || '',
          regiaoId: detalhe.regiao?.id || '',
          setorId: detalhe.setor?.id || '',
          dataFundacao: detalhe.dataFundacao || '',
          emPilotagem: detalhe.emPilotagem || false,
          dataInicioPilotagem: detalhe.dataInicioPilotagem || '',
          dataTerminoPilotagem: detalhe.dataTerminoPilotagem || '',
          casalPilotoId: detalhe.casalPilotoId || '',
          casalResponsavelId: detalhe.creCasalId || '',
          status: detalhe.status,
          sceId: detalhe.sceId || '',
          temaEstudoAno: detalhe.temaEstudoAno || '',
          temasAnuais: temas,
        };
        this.modalAberto.set(true);
      },
      error: (err) => alert(err.error?.message || 'Erro ao carregar dados da equipe'),
    });
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  salvarEquipe(e: Event): void {
    e.preventDefault();
    const req$ = this.modoEdicao() && this.idEdicao
      ? this.equipeService.atualizar(this.idEdicao, this.novaEquipe)
      : this.equipeService.criar(this.novaEquipe);

    req$.subscribe({
      next: () => {
        this.fecharModal();
        const p = this.queryParams();
        this.carregarEquipes(
          p.get('superRegiaoId') ?? undefined,
          p.get('provinciaId') ?? undefined,
          p.get('regiaoId') ?? undefined,
          p.get('setorId') ?? undefined,
        );
      },
      error: (err) => {
        alert(err.error?.message || 'Erro ao salvar equipe');
      },
    });
  }

  abrirModalVisualizacao(eq: EquipeResumoDto): void {
    this.modalVisualizacaoAberto.set(true);
    this.carregandoCasaisVisualizacao.set(true);

    this.equipeService.obterPorId(eq.id).subscribe({
      next: (detalhe) => {
        this.equipeDetalheVisualizacao.set(detalhe);
        this.casalService.listar({ equipeId: eq.id, size: 50 }).subscribe({
          next: (res) => {
            this.casaisVisualizacao.set(res.content);
            this.carregandoCasaisVisualizacao.set(false);
          },
          error: () => this.carregandoCasaisVisualizacao.set(false),
        });
      },
      error: (err) => {
        this.carregandoCasaisVisualizacao.set(false);
        alert(err.error?.message || 'Erro ao carregar detalhes da equipe');
      },
    });
  }

  fecharModalVisualizacao(): void {
    this.modalVisualizacaoAberto.set(false);
    this.equipeDetalheVisualizacao.set(null);
    this.casaisVisualizacao.set([]);
  }

  arquivar(eq: EquipeResumoDto): void {
    if (confirm(`Deseja arquivar a Equipe ${eq.numero}? O histórico será preservado.`)) {
      this.equipeService.arquivar(eq.id).subscribe(() => {
        const p = this.queryParams();
        this.carregarEquipes(
          p.get('superRegiaoId') ?? undefined,
          p.get('provinciaId') ?? undefined,
          p.get('regiaoId') ?? undefined,
          p.get('setorId') ?? undefined,
        );
      });
    }
  }

  formatarData(iso?: string): string {
    if (!iso) return '—';
    const partes = iso.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return iso;
  }

  formatarTelefone(tel?: string): string {
    return mascararTelefone(tel);
  }

  gerarLinkWhatsApp(tel?: string): string {
    if (!tel) return '#';
    const limpo = tel.replace(/\D/g, '');
    const ddi = limpo.length <= 11 ? `55${limpo}` : limpo;
    return `https://wa.me/${ddi}`;
  }
}
