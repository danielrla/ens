import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReuniaoDto, ReuniaoService } from '../../core/reuniao.service';
import { EquipeDetalheDto, EquipeService } from '../../core/equipe.service';
import { CasalDto, CasalService } from '../../core/casal.service';
import { EnsDatePipe } from '../../core/ens-date.pipe';

interface EstatisticaCasal {
  casalId: string;
  nomeCasal: string;
  totalConvocacoes: number;
  presencas: number;
  faltas: number;
  justificadas: number;
  percentualPresenca: number;
}

@Component({
  selector: 'app-dashboard-equipe-page',
  imports: [CommonModule, FormsModule, RouterLink, EnsDatePipe],
  template: `
    <header class="cabecalho">
      <div>
        <nav class="breadcrumb-ens">
          <a routerLink="/dashboard">Início</a>
          <span class="separador">/</span>
          <span class="separador-contexto">Vida da Equipe</span>
          <span class="separador">/</span>
          <span class="atual">Dashboard Equipe</span>
        </nav>
        <h1>🕊️ Dashboard da Nossa Equipe</h1>
        <p class="serifa">Indicadores exclusivos de assiduidade, presenças e histórico de reuniões mensais da nossa equipe.</p>
      </div>
      <div class="acoes-cabecalho">
        <a routerLink="/reunioes" class="btn btn-primario">
          📅 Ir para Agenda e Reuniões
        </a>
      </div>
    </header>

    @if (carregandoPerfil()) {
      <div class="cartao estado-carregando">
        <div class="spinner-sm"></div>
        <p>Identificando a sua equipe...</p>
      </div>
    } @else if (!temEquipeVinculada()) {
      <div class="cartao aviso-sem-equipe">
        <span class="icone-aviso">⚠️</span>
        <div class="texto-aviso">
          <strong>Seu perfil de casal ainda não possui uma equipe vinculada.</strong>
          <p>O Dashboard da Equipe apresenta dados privativos da equipe a qual o casal pertence. Por favor, acesse o seu perfil e vincule sua equipe.</p>
          <a routerLink="/perfil" class="btn btn-primario btn-sm">Acessar Meu Perfil</a>
        </div>
      </div>
    } @else {
      <!-- Cartão com Identificação e Resumo da Equipe Exclusiva -->
      <section class="cartao cartao-resumo-minha-equipe">
        <div class="topo-minha-equipe">
          <div class="identificacao-equipe">
            <span class="etiqueta-exclusiva">Equipe de Base</span>
            <h2 class="nome-equipe-titulo">
              Equipe {{ detalheEquipe()?.numero | number:'2.0-0' }} — {{ detalheEquipe()?.nomeDevocao || 'Nossa Senhora' }}
            </h2>
            <small class="local-equipe">
              📍 {{ detalheEquipe()?.municipio || '—' }} / {{ detalheEquipe()?.estado || '—' }} • {{ detalheEquipe()?.setor?.nome || 'Setor' }}
            </small>
          </div>
          <div class="badges-status-equipe">
            @if (detalheEquipe()?.emPilotagem) {
              <span class="badge badge-agendada">Em Pilotagem</span>
            } @else {
              <span class="badge badge-sucesso">Equipe Ativa</span>
            }
          </div>
        </div>

        <div class="resumo-equipe-grid">
          <div class="resumo-item">
            <span class="rotulo">Casal Responsável (CRE):</span>
            <strong class="destaque-cre">{{ detalheEquipe()?.cre || 'Não informado' }}</strong>
          </div>
          <div class="resumo-item">
            <span class="rotulo">Conselheiro Espiritual (SCE):</span>
            <span class="badge-sce">✝️ {{ detalheEquipe()?.nomeSce || 'Não vinculado' }}</span>
          </div>
          <div class="resumo-item">
            <span class="rotulo">Casais Ativos:</span>
            <span class="badge badge-dourado">{{ casaisAtivos().length }} casais membros</span>
          </div>
          <div class="resumo-item tema-item">
            <span class="rotulo">Tema de Estudo do Ano:</span>
            <div class="bloco-tema">
              <strong class="texto-tema">{{ temaAnoAtual() }}</strong>
              <button type="button" class="btn-editar-tema" (click)="abrirModalTema()" title="Editar Tema do Ano">
                ✏️ Editar Tema
              </button>
            </div>
          </div>
        </div>
      </section>

      @if (carregandoDados()) {
        <div class="cartao estado-carregando">
          <p>Carregando indicadores e reuniões da equipe...</p>
        </div>
      } @else {
        <!-- KPIs Globais de Reuniões da Equipe -->
        <section class="grade-kpis">
          <article class="cartao cartao-kpi">
            <div class="kpi-icone">📅</div>
            <div class="kpi-conteudo">
              <span class="kpi-rotulo">Total de Reuniões</span>
              <strong class="kpi-valor">{{ totalReunioes() }}</strong>
              <small class="kpi-detalhe">
                {{ reunioesRealizadas().length }} realizadas • {{ reunioesAgendadas().length }} agendadas
              </small>
            </div>
          </article>

          <article class="cartao cartao-kpi">
            <div class="kpi-icone">📊</div>
            <div class="kpi-conteudo">
              <span class="kpi-rotulo">Assiduidade Geral</span>
              <strong class="kpi-valor" [class.texto-sucesso]="percentualGeralPresenca() >= 80" [class.texto-atencao]="percentualGeralPresenca() < 80 && percentualGeralPresenca() >= 60" [class.texto-perigo]="percentualGeralPresenca() < 60">
                {{ percentualGeralPresenca() | number:'1.1-1' }}%
              </strong>
              <small class="kpi-detalhe">Presença média nas reuniões realizadas</small>
            </div>
          </article>

          <article class="cartao cartao-kpi">
            <div class="kpi-icone">⚠️</div>
            <div class="kpi-conteudo">
              <span class="kpi-rotulo">Total de Faltas</span>
              <strong class="kpi-valor">{{ totalFaltasGeral() }}</strong>
              <small class="kpi-detalhe">
                {{ totalFaltasNaoJustificadas() }} não justificadas • {{ totalFaltasJustificadas() }} justificadas
              </small>
            </div>
          </article>

          <article class="cartao cartao-kpi">
            <div class="kpi-icone">✝️</div>
            <div class="kpi-conteudo">
              <span class="kpi-rotulo">Presença do SCE</span>
              <strong class="kpi-valor">{{ percentualPresencaSce() | number:'1.0-0' }}%</strong>
              <small class="kpi-detalhe">{{ totalReunioesComSce() }} de {{ reunioesRealizadas().length }} reuniões realizadas</small>
            </div>
          </article>

          <article class="cartao cartao-kpi" [class.kpi-destaque-alerta]="casalComMaisFaltas() !== null">
            <div class="kpi-icone">👥</div>
            <div class="kpi-conteudo">
              <span class="kpi-rotulo">Apoio Fraterno</span>
              @if (casalComMaisFaltas()) {
                <strong class="kpi-valor-casal texto-perigo">{{ casalComMaisFaltas()?.nomeCasal }}</strong>
                <small class="kpi-detalhe">
                  {{ casalComMaisFaltas()?.faltas }} faltas acumuladas (necessita acolhida e contato do CRE)
                </small>
              } @else {
                <strong class="kpi-valor-casal texto-sucesso">100% Assídua</strong>
                <small class="kpi-detalhe">Todos os casais ativos presentes nas reuniões</small>
              }
            </div>
          </article>
        </section>

        <!-- Seção: Faltas e Assiduidade por Casal da Equipe -->
        <section class="cartao secao-dashboard">
          <div class="secao-cabecalho">
            <div>
              <div class="cabecalho-com-icone">
                <span class="icone-secao">👥</span>
                <h2>Assiduidade e Faltas por Casal</h2>
              </div>
              <p class="texto-suave">Acompanhamento fraterno das presenças individuais dos casais da nossa equipe.</p>
            </div>
            <div class="secao-acoes-topo">
              <span class="badge badge-dourado">{{ estatisticasCasais().length }} casais membros</span>
              <div class="seletor-visao-segmentado">
                <button
                  type="button"
                  class="btn-segmento"
                  [class.ativo]="modoVisaoCasais() === 'cards'"
                  (click)="alternarVisaoCasais('cards')"
                  title="Visualização em Cards"
                >
                  📇 Cards
                </button>
                <button
                  type="button"
                  class="btn-segmento"
                  [class.ativo]="modoVisaoCasais() === 'tabela'"
                  (click)="alternarVisaoCasais('tabela')"
                  title="Visualização em Tabela"
                >
                  📑 Tabela
                </button>
              </div>
            </div>
          </div>

          @if (estatisticasCasais().length === 0) {
            <p class="texto-suave texto-centro py-8">Nenhuma reunião com chamada de presença realizada até o momento.</p>
          } @else if (modoVisaoCasais() === 'cards') {
            <!-- Grade Moderna de Cards de Casais -->
            <div class="grade-cards-casais">
              @for (c of estatisticasCasais(); track c.casalId) {
                <div class="card-casal-assiduidade" [class.borda-alerta]="c.percentualPresenca < 60">
                  <div class="card-casal-topo">
                    <div class="avatar-casal-luxo">👥</div>
                    <div class="info-casal-identidade">
                      <strong class="nome-conjugal">{{ c.nomeCasal }}</strong>
                      <span class="subtitulo-casal">Casal Membro</span>
                    </div>
                    <div class="situacao-badge-area">
                      @if (c.percentualPresenca >= 80) {
                        <span class="tag-status-luxo tag-assiduo-luxo">✓ Assíduo</span>
                      } @else if (c.percentualPresenca >= 60) {
                        <span class="tag-status-luxo tag-atencao-luxo">⚠️ Atenção</span>
                      } @else {
                        <span class="tag-status-luxo tag-alerta-luxo">🚨 Apoio Fraterno</span>
                      }
                    </div>
                  </div>

                  <!-- Barra e Taxa de Frequência -->
                  <div class="bloco-medidor-frequencia">
                    <div class="medidor-rotulo-linha">
                      <span class="rotulo-taxa">Taxa de Assiduidade</span>
                      <strong class="valor-taxa" [class.texto-sucesso]="c.percentualPresenca >= 80" [class.texto-atencao]="c.percentualPresenca < 80 && c.percentualPresenca >= 60" [class.texto-perigo]="c.percentualPresenca < 60">
                        {{ c.percentualPresenca | number:'1.0-0' }}%
                      </strong>
                    </div>
                    <div class="trilha-progresso-luxo">
                      <div
                        class="barra-progresso-luxo"
                        [style.width.%]="c.percentualPresenca"
                        [class.progresso-verde]="c.percentualPresenca >= 80"
                        [class.progresso-amarelo]="c.percentualPresenca >= 60 && c.percentualPresenca < 80"
                        [class.progresso-vermelho]="c.percentualPresenca < 60"
                      ></div>
                    </div>
                  </div>

                  <!-- Mini-Painel de Métricas -->
                  <div class="mini-grid-metricas">
                    <div class="mini-metrica-item">
                      <span class="mini-label">Reuniões</span>
                      <strong class="mini-valor">{{ c.totalConvocacoes }}</strong>
                    </div>
                    <div class="mini-metrica-item destaque-sucesso">
                      <span class="mini-label">Presenças</span>
                      <strong class="mini-valor">{{ c.presencas }}</strong>
                    </div>
                    <div class="mini-metrica-item" [class.destaque-falta]="c.faltas > 0">
                      <span class="mini-label">Faltas</span>
                      <strong class="mini-valor">{{ c.faltas }}</strong>
                    </div>
                    <div class="mini-metrica-item" [class.destaque-justificada]="c.justificadas > 0">
                      <span class="mini-label">Justificadas</span>
                      <strong class="mini-valor">{{ c.justificadas }}</strong>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="tabela-responsiva">
              <table class="tabela-ens">
                <thead>
                  <tr>
                    <th>Casal</th>
                    <th>Reuniões Realizadas</th>
                    <th>Presenças</th>
                    <th>Faltas</th>
                    <th>Justificadas</th>
                    <th>% Assiduidade</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of estatisticasCasais(); track c.casalId) {
                    <tr>
                      <td>
                        <div class="casal-tabela-item">
                          <span class="avatar-min">👥</span>
                          <strong>{{ c.nomeCasal }}</strong>
                        </div>
                      </td>
                      <td>{{ c.totalConvocacoes }}</td>
                      <td><span class="badge badge-sucesso">{{ c.presencas }}</span></td>
                      <td>
                        @if (c.faltas > 0) {
                          <span class="badge badge-falta">{{ c.faltas }} falta(s)</span>
                        } @else {
                          <span class="texto-suave">0</span>
                        }
                      </td>
                      <td>
                        @if (c.justificadas > 0) {
                          <span class="badge badge-justificada">{{ c.justificadas }} just.</span>
                        } @else {
                          <span class="texto-suave">0</span>
                        }
                      </td>
                      <td>
                        <div class="col-percentual">
                          <strong>{{ c.percentualPresenca | number:'1.0-0' }}%</strong>
                          <div class="barra-fundo">
                            <div
                              class="barra-progresso"
                              [style.width.%]="c.percentualPresenca"
                              [class.barra-verde]="c.percentualPresenca >= 80"
                              [class.barra-amarela]="c.percentualPresenca >= 60 && c.percentualPresenca < 80"
                              [class.barra-vermelha]="c.percentualPresenca < 60"
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        @if (c.percentualPresenca >= 80) {
                          <span class="tag-status tag-assiduo">✓ Assíduo</span>
                        } @else if (c.percentualPresenca >= 60) {
                          <span class="tag-status tag-atencao">⚠️ Atenção</span>
                        } @else {
                          <span class="tag-status tag-alerta">🚨 Apoio do CRE</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        <!-- Seção: Percentual de Presença em Cada Reunião -->
        <section class="cartao secao-dashboard">
          <div class="secao-cabecalho">
            <div>
              <div class="cabecalho-com-icone">
                <span class="icone-secao">📅</span>
                <h2>Percentual de Presença por Reunião</h2>
              </div>
              <p class="texto-suave">Presença, vivência litúrgica e quórum de cada reunião mensal da equipe.</p>
            </div>
            <div class="secao-acoes-topo">
              <span class="badge">{{ reunioes().length }} reunião(ões) na agenda</span>
              <div class="seletor-visao-segmentado">
                <button
                  type="button"
                  class="btn-segmento"
                  [class.ativo]="modoVisaoReunioes() === 'cards'"
                  (click)="alternarVisaoReunioes('cards')"
                  title="Visualização em Linha do Tempo"
                >
                  🗓️ Linha do Tempo
                </button>
                <button
                  type="button"
                  class="btn-segmento"
                  [class.ativo]="modoVisaoReunioes() === 'tabela'"
                  (click)="alternarVisaoReunioes('tabela')"
                  title="Visualização em Tabela"
                >
                  📑 Tabela
                </button>
              </div>
            </div>
          </div>

          @if (reunioes().length === 0) {
            <p class="texto-suave texto-centro py-8">Nenhuma reunião cadastrada para a equipe.</p>
          } @else if (modoVisaoReunioes() === 'cards') {
            <!-- Timeline de Cards de Reunião com Quórum e Presença -->
            <div class="timeline-reunioes-cards">
              @for (r of reunioes(); track r.id) {
                <div class="card-reuniao-timeline" [class.card-realizada]="r.presencas && r.presencas.length > 0">
                  <!-- Bloco Data -->
                  <div class="reuniao-data-box">
                    <span class="dia-destaque">{{ r.data ? (r.data | date:'dd') : '—' }}</span>
                    <span class="mes-ano">{{ r.data ? (r.data | date:'MMM yyyy') : '—' }}</span>
                    <span class="hora-badge">⏰ {{ r.horario || '19:30' }}</span>
                  </div>

                  <!-- Bloco Conteúdo Litúrgico e Vivência -->
                  <div class="reuniao-conteudo-box">
                    <div class="reuniao-tags-linha">
                      @if (r.tipo === 'INFORMAL') {
                        <span class="badge badge-informal">🎉 Reunião Informal</span>
                      } @else {
                        <span class="badge badge-formal">📖 Reunião Formal</span>
                      }

                      @if (r.presencas && r.presencas.length > 0) {
                        <span class="badge badge-sucesso">✓ Realizada</span>
                      } @else {
                        <span class="badge badge-agendada">⏳ Agendada</span>
                      }

                      @if (r.scePresente) {
                        <span class="badge-sce-presente">✝️ SCE Presente</span>
                      } @else {
                        <span class="badge-sce-ausente">SCE Ausente</span>
                      }
                    </div>

                    <h3 class="tema-reuniao-titulo">{{ r.tema || 'Tema Litúrgico / Estudo Mensal da Equipe' }}</h3>

                    <div class="detalhes-meta-reuniao">
                      <span class="item-anfitriao">
                        🏡 <strong>Anfitriões:</strong> {{ r.nomeCasalAnfitriao || 'Não definido / A combinar' }}
                      </span>
                    </div>
                  </div>

                  <!-- Bloco Medidor de Quórum / Percentual -->
                  <div class="reuniao-quorum-box">
                    @if (r.presencas && r.presencas.length > 0) {
                      <div class="quorum-indicador">
                        <span class="rotulo-taxa-sm">Taxa de Presença</span>
                        <div class="quorum-numero-grande" [class.texto-sucesso]="calcularPercentualReuniao(r) >= 80" [class.texto-atencao]="calcularPercentualReuniao(r) < 80 && calcularPercentualReuniao(r) >= 60" [class.texto-perigo]="calcularPercentualReuniao(r) < 60">
                          {{ calcularPercentualReuniao(r) | number:'1.0-0' }}%
                        </div>
                        <div class="trilha-quorum">
                          <div
                            class="barra-quorum"
                            [style.width.%]="calcularPercentualReuniao(r)"
                            [class.progresso-verde]="calcularPercentualReuniao(r) >= 80"
                            [class.progresso-amarelo]="calcularPercentualReuniao(r) >= 60 && calcularPercentualReuniao(r) < 80"
                            [class.progresso-vermelho]="calcularPercentualReuniao(r) < 60"
                          ></div>
                        </div>
                        <span class="detalhe-quorum-presencas">
                          👥 <strong>{{ r.totalPresentes }}</strong> presentes • <strong>{{ r.totalFaltas }}</strong> falta(s)
                        </span>
                      </div>
                    } @else {
                      <div class="quorum-aguardando">
                        <span class="icone-relogio">⏳</span>
                        <span class="texto-aguardando">Aguardando realização e ata</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="tabela-responsiva">
              <table class="tabela-ens">
                <thead>
                  <tr>
                    <th>Data e Horário</th>
                    <th>Tipo</th>
                    <th>Tema da Reunião</th>
                    <th>Casal Anfitrião</th>
                    <th>SCE</th>
                    <th>Presentes</th>
                    <th>Faltas</th>
                    <th>Taxa de Presença</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of reunioes(); track r.id) {
                    <tr>
                      <td>
                        <div class="data-col">
                          <strong>{{ r.data | ensDate }}</strong>
                          <small class="texto-suave">⏰ {{ r.horario || '19:30' }}</small>
                        </div>
                      </td>
                      <td>
                        @if (r.tipo === 'INFORMAL') {
                          <span class="badge badge-informal">Informal</span>
                        } @else {
                          <span class="badge badge-formal">Formal</span>
                        }
                      </td>
                      <td>
                        <strong class="texto-tema-reuniao">{{ r.tema || 'Tema não informado' }}</strong>
                      </td>
                      <td>
                        <span>{{ r.nomeCasalAnfitriao || 'Não definido' }}</span>
                      </td>
                      <td>
                        @if (r.scePresente) {
                          <span class="tag-sce-sim">✝️ Presente</span>
                        } @else {
                          <span class="tag-sce-nao">Ausente</span>
                        }
                      </td>
                      <td>
                        <strong>{{ r.totalPresentes }}</strong>
                      </td>
                      <td>
                        @if (r.totalFaltas > 0) {
                          <span class="badge badge-falta">{{ r.totalFaltas }}</span>
                        } @else {
                          <span class="texto-suave">0</span>
                        }
                      </td>
                      <td>
                        @if (r.presencas && r.presencas.length > 0) {
                          <div class="col-percentual">
                            <strong>{{ calcularPercentualReuniao(r) | number:'1.0-0' }}%</strong>
                            <div class="barra-fundo">
                              <div
                                class="barra-progresso"
                                [style.width.%]="calcularPercentualReuniao(r)"
                                [class.barra-verde]="calcularPercentualReuniao(r) >= 80"
                                [class.barra-amarela]="calcularPercentualReuniao(r) >= 60 && calcularPercentualReuniao(r) < 80"
                                [class.barra-vermelha]="calcularPercentualReuniao(r) < 60"
                              ></div>
                            </div>
                          </div>
                        } @else {
                          <span class="texto-suave">Aguardando ata</span>
                        }
                      </td>
                      <td>
                        @if (r.presencas && r.presencas.length > 0) {
                          <span class="badge badge-sucesso">Realizada</span>
                        } @else {
                          <span class="badge badge-agendada">Agendada</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }
    }

    <!-- Modal para Edição Rápida do Tema de Estudo do Ano -->
    @if (modalTemaAberto()) {
      <div class="overlay-modal" (click)="fecharModalTema()">
        <div class="modal-dialog cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <h3>Tema de Estudo do Ano da Nossa Equipe</h3>
            <button type="button" class="btn-fechar" (click)="fecharModalTema()">✕</button>
          </div>
          <form (submit)="salvarTema($event)">
            <p class="texto-suave">
              Defina o tema de estudo anual que constará na agenda e no cabeçalho do roteiro oficial das reuniões mensais.
            </p>
            <div class="campo">
              <label for="input-tema-ano">Tema de Estudo do Ano</label>
              <input
                id="input-tema-ano"
                type="text"
                required
                [(ngModel)]="temaInput"
                name="temaInput"
                placeholder="Ex: O Matrimônio como Vocação à Santidade"
              />
            </div>
            <div class="modal-acoes">
              <button type="button" class="btn btn-fantasma" (click)="fecharModalTema()">Cancelar</button>
              <button type="submit" class="btn btn-primario" [disabled]="salvandoTema()">
                {{ salvandoTema() ? 'Salvando...' : 'Salvar Tema' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: `
    .cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .breadcrumb-ens {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 0.35rem;
    }
    .breadcrumb-ens a {
      color: var(--texto-suave);
      text-decoration: none;
    }
    .breadcrumb-ens .separador {
      color: var(--borda);
    }
    .breadcrumb-ens .separador-contexto {
      color: var(--texto-suave);
    }
    .breadcrumb-ens .atual {
      color: var(--azul-900);
      font-weight: 600;
    }

    .cartao-resumo-minha-equipe {
      margin-bottom: 1.5rem;
      padding: 1.5rem 1.75rem;
      border-left: 5px solid var(--ouro-500, #d97706);
    }
    .topo-minha-equipe {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .etiqueta-exclusiva {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ouro-600, #b45309);
      display: block;
      margin-bottom: 0.2rem;
    }
    .nome-equipe-titulo {
      margin: 0;
      font-size: 1.4rem;
      color: var(--azul-900);
      font-weight: 700;
    }
    .local-equipe {
      color: var(--texto-suave);
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: block;
    }

    .aviso-sem-equipe {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.75rem;
      border-left: 5px solid #ca8a04;
    }
    .icone-aviso {
      font-size: 2.2rem;
    }
    .texto-aviso strong {
      color: #92400e;
      display: block;
      margin-bottom: 0.35rem;
      font-size: 1.1rem;
    }
    .texto-aviso p {
      margin: 0 0 1rem 0;
      color: var(--texto-suave);
      font-size: 0.95rem;
    }

    .kpi-valor-casal {
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.25;
      margin-top: 0.2rem;
    }
    .kpi-destaque-alerta {
      border-left: 4px solid #dc2626;
    }
    .resumo-equipe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--borda);
    }
    .resumo-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.85rem;
    }
    .resumo-item .rotulo {
      color: var(--texto-suave);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .destaque-cre {
      color: var(--azul-900);
      font-size: 1.05rem;
    }
    .tema-item {
      grid-column: span 2;
    }
    @media (max-width: 768px) {
      .tema-item { grid-column: span 1; }
    }
    .bloco-tema {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .texto-tema {
      color: var(--dourado-700);
      font-size: 0.95rem;
    }
    .btn-editar-tema {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      border-radius: 4px;
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-editar-tema:hover {
      background: #fde68a;
    }
    .grade-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .cartao-kpi {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      box-shadow: var(--sombra-sm);
    }
    .kpi-icone {
      font-size: 2.2rem;
      background: var(--azul-50);
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    .kpi-conteudo {
      display: flex;
      flex-direction: column;
    }
    .kpi-rotulo {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--texto-suave);
      font-weight: 600;
    }
    .kpi-valor {
      font-size: 1.75rem;
      color: var(--azul-950);
      font-weight: 700;
      line-height: 1.2;
    }
    .kpi-detalhe {
      font-size: 0.75rem;
      color: var(--texto-suave);
      margin-top: 0.2rem;
    }
    .secao-dashboard {
      margin-bottom: 1.5rem;
      padding: 1.5rem;
    }
    .secao-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      gap: 1rem;
    }
    .secao-cabecalho h2 {
      margin: 0;
      font-size: 1.2rem;
      color: var(--azul-900);
    }
    .casal-tabela-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .avatar-min {
      font-size: 1.1rem;
    }
    .col-percentual {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 110px;
    }
    .barra-fundo {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    .barra-progresso {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .barra-verde { background: #16a34a; }
    .barra-amarela { background: #ca8a04; }
    .barra-vermelha { background: #dc2626; }
    .texto-sucesso { color: #16a34a !important; }
    .texto-atencao { color: #ca8a04 !important; }
    .texto-perigo { color: #dc2626 !important; }

    .tag-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
    }
    .tag-assiduo { background: #dcfce7; color: #166534; }
    .tag-atencao { background: #fef3c7; color: #92400e; }
    .tag-alerta { background: #fee2e2; color: #991b1b; }

    .tag-sce-sim {
      font-size: 0.75rem;
      font-weight: 600;
      color: #166534;
      background: #dcfce7;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .tag-sce-nao {
      font-size: 0.75rem;
      font-weight: 500;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .badge-formal {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-informal {
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }
    .badge-sucesso {
      background: #dcfce7;
      color: #166534;
      font-size: 0.75rem;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-falta {
      background: #fee2e2;
      color: #991b1b;
      font-size: 0.75rem;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-justificada {
      background: #f1f5f9;
      color: #475569;
      font-size: 0.75rem;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
    }
    .badge-agendada {
      background: #fef3c7;
      color: #92400e;
      font-size: 0.75rem;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
    }
    .badge-sce {
      font-size: 0.75rem;
      color: #1e3a8a;
      background: #dbeafe;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }
    .texto-tema-reuniao {
      color: var(--azul-950);
      font-size: 0.85rem;
    }
    .data-col {
      display: flex;
      flex-direction: column;
    }
    .overlay-modal {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-dialog {
      background: #fff;
      max-width: 520px;
      width: 100%;
      border-radius: var(--raio-md);
      padding: 1.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }
    .modal-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .modal-cabecalho h3 {
      margin: 0;
      color: var(--azul-900);
    }
    .btn-fechar {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--texto-suave);
    }
    .campo {
      margin: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .campo input {
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      font-size: 0.95rem;
    }
    /* Cabeçalho de seções com ícone e alternador de visão */
    .cabecalho-com-icone {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .icone-secao {
      font-size: 1.25rem;
    }
    .secao-acoes-topo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .seletor-visao-segmentado {
      display: flex;
      background: #f1f5f9;
      padding: 0.25rem;
      border-radius: 8px;
      gap: 0.25rem;
      border: 1px solid #e2e8f0;
    }
    .btn-segmento {
      border: none;
      background: transparent;
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-segmento.ativo {
      background: #ffffff;
      color: var(--azul-900);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Cards de Assiduidade por Casal */
    .grade-cards-casais {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 1.25rem;
      margin-top: 1rem;
    }
    .card-casal-assiduidade {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .card-casal-assiduidade:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
      border-color: #cbd5e1;
    }
    .card-casal-assiduidade.borda-alerta {
      border-left: 4px solid #ef4444;
    }
    .card-casal-topo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar-casal-luxo {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
      border: 1px solid #bfdbfe;
    }
    .info-casal-identidade {
      flex: 1;
      min-width: 0;
    }
    .nome-conjugal {
      display: block;
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .subtitulo-casal {
      font-size: 0.75rem;
      color: #64748b;
    }
    .tag-status-luxo {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      white-space: nowrap;
    }
    .tag-assiduo-luxo {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .tag-atencao-luxo {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .tag-alerta-luxo {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    .bloco-medidor-frequencia {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .medidor-rotulo-linha {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .rotulo-taxa {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .valor-taxa {
      font-size: 1.15rem;
      font-weight: 800;
    }
    .trilha-progresso-luxo {
      height: 8px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
    }
    .barra-progresso-luxo {
      height: 100%;
      border-radius: 999px;
      transition: width 0.4s ease;
    }
    .progresso-verde {
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    }
    .progresso-amarelo {
      background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
    }
    .progresso-vermelho {
      background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
    }
    .mini-grid-metricas {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      background: #f8fafc;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
    }
    .mini-metrica-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .mini-label {
      font-size: 0.68rem;
      color: #64748b;
      font-weight: 500;
    }
    .mini-valor {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
      margin-top: 0.1rem;
    }
    .mini-metrica-item.destaque-sucesso .mini-valor { color: #059669; }
    .mini-metrica-item.destaque-falta .mini-valor { color: #dc2626; }
    .mini-metrica-item.destaque-justificada .mini-valor { color: #d97706; }

    /* Timeline de Cards de Reunião */
    .timeline-reunioes-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
    .card-reuniao-timeline {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      display: grid;
      grid-template-columns: 100px 1fr 220px;
      gap: 1.25rem;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card-reuniao-timeline:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
      border-color: #cbd5e1;
    }
    .card-reuniao-timeline.card-realizada {
      border-left: 5px solid #059669;
    }
    @media (max-width: 860px) {
      .card-reuniao-timeline {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
    .reuniao-data-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.65rem 0.5rem;
      text-align: center;
    }
    .dia-destaque {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--azul-900);
      line-height: 1;
    }
    .mes-ano {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      margin-top: 0.2rem;
    }
    .hora-badge {
      font-size: 0.7rem;
      color: #475569;
      background: #ffffff;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      margin-top: 0.35rem;
    }
    .reuniao-conteudo-box {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .reuniao-tags-linha {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .badge-sce-presente {
      font-size: 0.72rem;
      font-weight: 600;
      color: #6b21a8;
      background: #f3e8ff;
      border: 1px solid #e9d5ff;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }
    .badge-sce-ausente {
      font-size: 0.72rem;
      font-weight: 500;
      color: #64748b;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }
    .tema-reuniao-titulo {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.35;
    }
    .detalhes-meta-reuniao {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.85rem;
      color: #475569;
    }
    .item-anfitriao strong {
      color: #1e293b;
    }
    .reuniao-quorum-box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #f8fafc;
      border-radius: 10px;
      padding: 0.85rem 1rem;
      border: 1px solid #f1f5f9;
    }
    .quorum-indicador {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .rotulo-taxa-sm {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .quorum-numero-grande {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }
    .trilha-quorum {
      height: 6px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
      margin: 0.2rem 0;
    }
    .barra-quorum {
      height: 100%;
      border-radius: 999px;
    }
    .detalhe-quorum-presencas {
      font-size: 0.78rem;
      color: #475569;
    }
    .quorum-aguardando {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.8rem;
      font-style: italic;
    }
    .icone-relogio {
      font-size: 1.25rem;
    }
    .py-8 {
      padding: 2rem 0;
    }
  `,
})
export class DashboardEquipePage implements OnInit {
  private readonly reuniaoService = inject(ReuniaoService);
  private readonly equipeService = inject(EquipeService);
  private readonly casalService = inject(CasalService);

  protected readonly carregandoPerfil = signal(true);
  protected readonly carregandoDados = signal(false);

  protected equipeId = signal<string | null>(null);
  protected detalheEquipe = signal<EquipeDetalheDto | null>(null);
  protected casaisAtivos = signal<CasalDto[]>([]);
  protected reunioes = signal<ReuniaoDto[]>([]);

  protected modoVisaoCasais = signal<'cards' | 'tabela'>('cards');
  protected modoVisaoReunioes = signal<'cards' | 'tabela'>('cards');

  alternarVisaoCasais(modo: 'cards' | 'tabela'): void {
    this.modoVisaoCasais.set(modo);
  }

  alternarVisaoReunioes(modo: 'cards' | 'tabela'): void {
    this.modoVisaoReunioes.set(modo);
  }

  protected temEquipeVinculada = computed(() => !!this.equipeId());

  // Modal Tema do Ano
  protected modalTemaAberto = signal(false);
  protected temaInput = '';
  protected salvandoTema = signal(false);

  protected temaAnoAtual = computed(() => {
    const detalhe = this.detalheEquipe();
    if (!detalhe) return 'Não cadastrado';
    const anoAtual = new Date().getFullYear();
    if (detalhe.temasAnuais && detalhe.temasAnuais.length > 0) {
      const temaDoAno = detalhe.temasAnuais.find((t) => t.ano === anoAtual);
      if (temaDoAno) return `${anoAtual}: ${temaDoAno.tema}`;
      return `${detalhe.temasAnuais[0].ano}: ${detalhe.temasAnuais[0].tema}`;
    }
    return detalhe.temaEstudoAno || 'Não cadastrado';
  });

  // Reuniões Realizadas vs Agendadas
  protected reunioesRealizadas = computed(() =>
    this.reunioes().filter((r) => r.presencas && r.presencas.length > 0)
  );

  protected reunioesAgendadas = computed(() =>
    this.reunioes().filter((r) => !r.presencas || r.presencas.length === 0)
  );

  protected totalReunioes = computed(() => this.reunioes().length);

  protected totalFaltasNaoJustificadas = computed(() =>
    this.reunioesRealizadas().reduce((acc, r) => acc + (r.totalFaltas || 0), 0)
  );

  protected totalFaltasJustificadas = computed(() =>
    this.reunioesRealizadas().reduce((acc, r) => acc + (r.totalJustificadas || 0), 0)
  );

  protected totalFaltasGeral = computed(() =>
    this.totalFaltasNaoJustificadas() + this.totalFaltasJustificadas()
  );

  protected totalReunioesComSce = computed(() =>
    this.reunioesRealizadas().filter((r) => r.scePresente).length
  );

  protected percentualPresencaSce = computed(() => {
    const total = this.reunioesRealizadas().length;
    if (total === 0) return 100;
    return (this.totalReunioesComSce() / total) * 100;
  });

  protected percentualGeralPresenca = computed(() => {
    const realizadas = this.reunioesRealizadas();
    if (realizadas.length === 0) return 100;
    let somaPercentuais = 0;
    for (const r of realizadas) {
      somaPercentuais += this.calcularPercentualReuniao(r);
    }
    return somaPercentuais / realizadas.length;
  });

  protected casalComMaisFaltas = computed(() => {
    const lista = this.estatisticasCasais();
    if (lista.length === 0) return null;
    const ordenados = [...lista].sort((a, b) => b.faltas - a.faltas || b.justificadas - a.justificadas);
    const pior = ordenados[0];
    return pior && (pior.faltas > 0 || pior.justificadas > 0) ? pior : null;
  });

  // Estatísticas e Faltas Agrupadas por Casal da Equipe
  protected estatisticasCasais = computed<EstatisticaCasal[]>(() => {
    const casais = this.casaisAtivos();
    const realizadas = this.reunioesRealizadas();
    if (casais.length === 0 || realizadas.length === 0) return [];

    const statsMap = new Map<string, EstatisticaCasal>();
    for (const c of casais) {
      statsMap.set(c.id, {
        casalId: c.id,
        nomeCasal: `${c.esposo.nomeCompleto} & ${c.esposa.nomeCompleto}`,
        totalConvocacoes: 0,
        presencas: 0,
        faltas: 0,
        justificadas: 0,
        percentualPresenca: 100,
      });
    }

    for (const r of realizadas) {
      for (const p of r.presencas) {
        const item = statsMap.get(p.casalId);
        if (item) {
          item.totalConvocacoes++;
          if (p.status === 'PRESENTE') {
            item.presencas++;
          } else if (p.status === 'FALTOU') {
            item.faltas++;
          } else if (p.status === 'JUSTIFICOU') {
            item.justificadas++;
          }
        }
      }
    }

    const resultado: EstatisticaCasal[] = [];
    statsMap.forEach((val) => {
      if (val.totalConvocacoes > 0) {
        val.percentualPresenca = (val.presencas / val.totalConvocacoes) * 100;
      } else {
        val.percentualPresenca = 100;
      }
      resultado.push(val);
    });

    return resultado.sort((a, b) => b.faltas - a.faltas || a.percentualPresenca - b.percentualPresenca);
  });

  ngOnInit(): void {
    this.carregarPerfilEEuipe();
  }

  carregarPerfilEEuipe(): void {
    this.carregandoPerfil.set(true);
    this.casalService.obterPerfil().subscribe({
      next: (perfil) => {
        this.carregandoPerfil.set(false);
        if (perfil.equipeId) {
          this.equipeId.set(perfil.equipeId);
          this.carregarDadosEquipe(perfil.equipeId);
        }
      },
      error: () => {
        this.carregandoPerfil.set(false);
      },
    });
  }

  carregarDadosEquipe(id: string): void {
    this.carregandoDados.set(true);

    this.equipeService.obterPorId(id).subscribe({
      next: (detalhe) => this.detalheEquipe.set(detalhe),
    });

    this.casalService.listar({ equipeId: id, status: 'ATIVO', size: 100 }).subscribe({
      next: (res) => this.casaisAtivos.set(res.content),
    });

    this.reuniaoService.listarMinhaEquipe().subscribe({
      next: (lista) => {
        this.reunioes.set(lista);
        this.carregandoDados.set(false);
      },
      error: () => {
        // Fallback para listarPorEquipe
        this.reuniaoService.listarPorEquipe(id).subscribe({
          next: (lista) => {
            this.reunioes.set(lista);
            this.carregandoDados.set(false);
          },
          error: () => this.carregandoDados.set(false),
        });
      },
    });
  }

  calcularPercentualReuniao(r: ReuniaoDto): number {
    const total = (r.totalPresentes || 0) + (r.totalFaltas || 0) + (r.totalJustificadas || 0);
    if (total === 0) return 100;
    return ((r.totalPresentes || 0) / total) * 100;
  }

  abrirModalTema(): void {
    const detalhe = this.detalheEquipe();
    this.temaInput = detalhe?.temaEstudoAno || '';
    this.modalTemaAberto.set(true);
  }

  fecharModalTema(): void {
    this.modalTemaAberto.set(false);
  }

  salvarTema(e: Event): void {
    e.preventDefault();
    const detalhe = this.detalheEquipe();
    if (!detalhe) return;

    this.salvandoTema.set(true);
    this.equipeService.atualizar(detalhe.id, {
      superRegiaoId: detalhe.superRegiao?.id || '',
      provinciaId: detalhe.provincia?.id || '',
      regiaoId: detalhe.regiao?.id || '',
      setorId: detalhe.setor?.id || '',
      numero: detalhe.numero,
      nomeDevocao: detalhe.nomeDevocao,
      status: detalhe.status,
      temaEstudoAno: this.temaInput,
    }).subscribe({
      next: (atualizada) => {
        this.detalheEquipe.set(atualizada);
        this.salvandoTema.set(false);
        this.fecharModalTema();
      },
      error: (err) => {
        this.salvandoTema.set(false);
        alert(err.error?.message || 'Erro ao salvar tema do ano da equipe');
      },
    });
  }
}
