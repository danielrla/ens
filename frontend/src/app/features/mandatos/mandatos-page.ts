import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertaMandato,
  FuncaoMandato,
  MandatoDto,
  MandatoRequest,
  MandatoService,
  NivelInstancia,
  StatusMandato,
} from '../../core/mandato.service';
import { CasalDto, CasalService } from '../../core/casal.service';
import { EquipeResumoDto, EquipeService } from '../../core/equipe.service';
import { EstruturaService, NoEstrutura } from '../../core/estrutura.service';
import { EnsDatePipe } from '../../core/ens-date.pipe';

@Component({
  selector: 'app-mandatos-page',
  imports: [CommonModule, FormsModule, EnsDatePipe],
  template: `
    <div class="mandatos-container">
      <!-- Cabeçalho da Página -->
      <header class="page-header">
        <div class="header-titles">
          <h1>Mandatos e Alertas de Sucessão</h1>
          <p class="subtitulo">
            Acompanhamento dos ciclos estatutários dos serviços e casais responsáveis nas Equipes de Nossa Senhora.
          </p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary" (click)="abrirModalNovo()">
            <span>➕</span> Registrar Novo Mandato
          </button>
        </div>
      </header>

      <!-- Cards de Resumo e Alertas Rápidos (KPIs clicáveis) -->
      <section class="kpi-grid">
        <div
          class="kpi-card card-vigente"
          [class.ativo]="statusFiltro() === 'VIGENTE' && alertaFiltro() === ''"
          (click)="filtrarPorKpi('VIGENTE', '')"
        >
          <div class="kpi-icone">⏳</div>
          <div class="kpi-conteudo">
            <span class="kpi-valor">{{ totalVigentes() }}</span>
            <span class="kpi-label">Mandatos Vigentes</span>
          </div>
        </div>

        <div
          class="kpi-card card-vermelho"
          [class.ativo]="alertaFiltro() === 'VERMELHO'"
          (click)="filtrarPorKpi('VIGENTE', 'VERMELHO')"
        >
          <div class="kpi-icone">🚨</div>
          <div class="kpi-conteudo">
            <span class="kpi-valor">{{ totalVermelhos() }}</span>
            <span class="kpi-label">Vencidos sem Sucessor</span>
          </div>
        </div>

        <div
          class="kpi-card card-laranja"
          [class.ativo]="alertaFiltro() === 'LARANJA'"
          (click)="filtrarPorKpi('VIGENTE', 'LARANJA')"
        >
          <div class="kpi-icone">⚠️</div>
          <div class="kpi-conteudo">
            <span class="kpi-valor">{{ totalLaranjas() }}</span>
            <span class="kpi-label">Urgência (&lt; 30 dias)</span>
          </div>
        </div>

        <div
          class="kpi-card card-dourado"
          [class.ativo]="alertaFiltro() === 'DOURADO'"
          (click)="filtrarPorKpi('VIGENTE', 'DOURADO')"
        >
          <div class="kpi-icone">⚜️</div>
          <div class="kpi-conteudo">
            <span class="kpi-valor">{{ totalDourados() }}</span>
            <span class="kpi-label">Fase Sucessão (60-90 dias)</span>
          </div>
        </div>
      </section>

      <!-- Barra de Filtros e Busca -->
      <section class="filtros-card">
        <div class="filtros-cabecalho">
          <div class="filtros-titulo-area">
            <span class="filtros-icone">🔎</span>
            <span class="filtros-titulo">Filtros de Pesquisa</span>
            @if (totalFiltrosAtivos() > 0) {
              <span class="badge-filtros-ativos">{{ totalFiltrosAtivos() }} ativo{{ totalFiltrosAtivos() > 1 ? 's' : '' }}</span>
            }
          </div>
          @if (totalFiltrosAtivos() > 0 || termoBusca()) {
            <button type="button" class="btn-limpar-filtros" (click)="limparFiltros()">
              ✕ Limpar Filtros
            </button>
          }
        </div>

        <div class="filtros-grid-quatro">
          <div class="campo-grupo">
            <label for="filtro-funcao">Função do Mandato</label>
            <select id="filtro-funcao" [ngModel]="funcaoFiltro()" (ngModelChange)="aoMudarFuncao($event)">
              <option value="">Todas as Funções</option>
              <option value="CRE">CRE - Equipe (1 ano)</option>
              <option value="CL">CL - Ligação (3 anos)</option>
              <option value="CRS">CRS - Setor (3 anos)</option>
              <option value="CRR">CRR - Região (4 anos)</option>
              <option value="CRP">CRP - Província (5 anos)</option>
              <option value="CRSR">CRSR - Super-Região (5 anos)</option>
              <option value="ERI">ERI - Internacional (6 anos)</option>
            </select>
          </div>

          <div class="campo-grupo">
            <label for="filtro-nivel">Âmbito da Instância</label>
            <select id="filtro-nivel" [ngModel]="nivelInstanciaFiltro()" (ngModelChange)="aoMudarNivelInstancia($event)">
              <option value="">Todos os Âmbitos</option>
              <option value="EQUIPE">Equipe</option>
              <option value="SETOR">Setor</option>
              <option value="REGIAO">Região</option>
              <option value="PROVINCIA">Província</option>
              <option value="SUPER_REGIAO">Super-Região</option>
              <option value="INTERNACIONAL">Internacional (ERI)</option>
            </select>
          </div>

          <div class="campo-grupo">
            <label for="filtro-status">Status</label>
            <select id="filtro-status" [ngModel]="statusFiltro()" (ngModelChange)="aoMudarStatus($event)">
              <option value="">Todos os Status</option>
              <option value="VIGENTE">Vigente</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="INTERROMPIDO_ANTECIPADAMENTE">Interrompido</option>
            </select>
          </div>

          <div class="campo-grupo">
            <label for="filtro-alerta">Alerta de Sucessão</label>
            <select id="filtro-alerta" [ngModel]="alertaFiltro()" (ngModelChange)="aoMudarAlerta($event)">
              <option value="">Todos os Alertas</option>
              <option value="VERMELHO">🔴 Vencido (Vermelho)</option>
              <option value="LARANJA">🟠 &lt; 30 dias (Laranja)</option>
              <option value="DOURADO">🟡 60-90 dias (Dourado)</option>
              <option value="NENHUM">🟢 Regular</option>
            </select>
          </div>
        </div>

        <div class="filtros-busca-linha">
          <div class="campo-busca-container">
            <span class="icone-busca-input">🔍</span>
            <input
              type="text"
              class="input-busca-mandato"
              placeholder="Buscar por casal responsável, equipe, setor, região ou observações..."
              [ngModel]="termoBusca()"
              (ngModelChange)="termoBusca.set($event)"
            />
            @if (termoBusca()) {
              <button type="button" class="btn-limpar-termo" (click)="termoBusca.set('')">✕</button>
            }
          </div>
        </div>
      </section>

      <!-- Lista / Tabela de Mandatos -->
      <section class="tabela-card">
        @if (carregando()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Carregando dados dos mandatos...</p>
          </div>
        } @else if (mandatosExibidos().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📂</span>
            <h3>Nenhum mandato localizado</h3>
            <p>Tente ajustar os filtros ou registre um novo mandato para a estrutura.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="tabela-mandatos">
              <thead>
                <tr>
                  <th>Função</th>
                  <th>Responsável</th>
                  <th>Instância / Âmbito</th>
                  <th>Período do Mandato</th>
                  <th>Situação Estatutária</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (m of mandatosExibidos(); track m.id) {
                  <tr>
                    <td>
                      <span class="badge-funcao badge-{{ m.funcao.toLowerCase() }}">
                        {{ m.funcao }}
                      </span>
                    </td>
                    <td>
                      <div class="col-responsavel">
                        <strong>{{ m.nomeResponsavel }}</strong>
                        @if (m.observacoes) {
                          <small class="obs-texto" [title]="m.observacoes">{{ m.observacoes }}</small>
                        }
                      </div>
                    </td>
                    <td>
                      <div class="col-instancia">
                        <span class="instancia-nome">{{ m.nomeInstancia }}</span>
                        <span class="instancia-nivel">{{ m.nivelInstancia }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="col-datas">
                        <span><strong>Início:</strong> {{ m.dataInicio | ensDate }}</span>
                        <span>
                          <strong>Prev. Fim:</strong>
                          {{ m.dataPrevistaTermino ? (m.dataPrevistaTermino | ensDate) : 'Não informada' }}
                        </span>
                        @if (m.dataEncerramentoEfetivo) {
                          <span class="data-efetiva">
                            <strong>Encerramento:</strong> {{ m.dataEncerramentoEfetivo | ensDate }}
                          </span>
                        }
                      </div>
                    </td>
                    <td>
                      <div class="col-situacao">
                        @if (m.status === 'VIGENTE') {
                          @switch (m.alerta) {
                            @case ('VERMELHO') {
                              <span class="badge-alerta alerta-vermelho" title="Prazo estatutário expirado sem sucessor registrado">
                                🚨 Vencido ({{ m.diasParaTermino ? (m.diasParaTermino * -1) + 'd atrás' : 'expirado' }})
                              </span>
                            }
                            @case ('LARANJA') {
                              <span class="badge-alerta alerta-laranja" title="Alerta crítico: menos de 30 dias para o término">
                                ⚠️ Vence em {{ m.diasParaTermino }} dias
                              </span>
                            }
                            @case ('DOURADO') {
                              <span class="badge-alerta alerta-dourado" title="Fase de discernimento e sucessão (60 a 90 dias)">
                                ⚜️ Sucessão ({{ m.diasParaTermino }} dias)
                              </span>
                            }
                            @default {
                              <span class="badge-alerta alerta-regular">
                                🟢 Vigente ({{ m.diasParaTermino }}d restantes)
                              </span>
                            }
                          }
                        } @else if (m.status === 'CONCLUIDO') {
                          <span class="badge-alerta status-concluido">✓ Concluído</span>
                        } @else {
                          <span class="badge-alerta status-interrompido">✕ Interrompido</span>
                        }
                      </div>
                    </td>
                    <td>
                      <div class="acoes-linha">
                        @if (m.status === 'VIGENTE') {
                          <button
                            type="button"
                            class="btn-acao btn-acao-sucessor"
                            title="Indicar sucessor (novo mandato)"
                            (click)="prepararSucessor(m)"
                          >
                            Nova Eleição
                          </button>
                          <button
                            type="button"
                            class="btn-acao btn-acao-interromper"
                            title="Interromper mandato antecipadamente"
                            (click)="abrirModalInterromper(m)"
                          >
                            Interromper
                          </button>
                        } @else {
                          <span class="acao-historico">Histórico</span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <!-- Modal de Registro de Novo Mandato -->
      @if (modalAberto()) {
        <div class="modal-backdrop" (click)="fecharModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h2>Registrar Mandato / Sucessão</h2>
              <button type="button" class="btn-fechar" (click)="fecharModal()">✕</button>
            </header>

            <form class="modal-body" (ngSubmit)="salvarMandato()">
              <div class="alerta-transicao-aviso">
                <strong>💡 Regra de Sucessão ENS:</strong>
                Ao cadastrar este novo mandato, o mandato vigente anterior para a mesma instância e função será
                automaticamente concluído com a data de término igual à data de início deste novo.
              </div>

              <div class="form-row">
                <div class="campo-grupo">
                  <label for="cad-funcao">Função Estatutária <span class="obrigatorio">*</span></label>
                  <select
                    id="cad-funcao"
                    [(ngModel)]="novoMandato.funcao"
                    name="funcao"
                    (ngModelChange)="aoAlterarFuncaoOuInicio()"
                    required
                  >
                    <option value="CRE">CRE - Casal Resp. de Equipe (1 ano)</option>
                    <option value="CL">CL - Casal Ligação (3 anos)</option>
                    <option value="CRS">CRS - Casal Resp. de Setor (3 anos)</option>
                    <option value="CRR">CRR - Casal Resp. de Região (4 anos)</option>
                    <option value="CRP">CRP - Casal Resp. de Província (5 anos)</option>
                    <option value="CRSR">CRSR - Casal Resp. de Super-Região (5 anos)</option>
                    <option value="ERI">ERI - Equipe Resp. Internacional (6 anos)</option>
                  </select>
                </div>

                <div class="campo-grupo">
                  <label for="cad-nivel">Âmbito da Instância <span class="obrigatorio">*</span></label>
                  <select
                    id="cad-nivel"
                    [(ngModel)]="novoMandato.nivelInstancia"
                    name="nivelInstancia"
                    (ngModelChange)="aoAlterarNivelInstancia()"
                    required
                  >
                    <option value="EQUIPE">Equipe</option>
                    <option value="SETOR">Setor</option>
                    <option value="REGIAO">Região</option>
                    <option value="PROVINCIA">Província</option>
                    <option value="SUPER_REGIAO">Super-Região</option>
                    <option value="INTERNACIONAL">Internacional (ERI)</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="campo-grupo">
                  <label for="cad-instancia">Instância Selecionada <span class="obrigatorio">*</span></label>
                  @if (novoMandato.nivelInstancia === 'EQUIPE') {
                    <select id="cad-instancia" [(ngModel)]="novoMandato.instanciaId" name="instanciaId" required>
                      <option value="">Selecione a Equipe...</option>
                      @for (eq of equipes(); track eq.id) {
                        <option [value]="eq.id">
                          Equipe {{ eq.numero }} - {{ eq.nomeDevocao }}
                        </option>
                      }
                    </select>
                  } @else if (novoMandato.nivelInstancia === 'INTERNACIONAL') {
                    <input
                      type="text"
                      id="cad-instancia"
                      value="ERI - Internacional"
                      readonly
                    />
                  } @else {
                    <select id="cad-instancia" [(ngModel)]="novoMandato.instanciaId" name="instanciaId" required>
                      <option value="">Selecione o nó da estrutura...</option>
                      @for (est of estruturasFiltradas(); track est.id) {
                        <option [value]="est.id">{{ est.nome }}</option>
                      }
                    </select>
                  }
                </div>

                <div class="campo-grupo">
                  <label for="cad-casal">Casal Responsável <span class="obrigatorio">*</span></label>
                  <select id="cad-casal" [(ngModel)]="novoMandato.casalId" name="casalId" required>
                    <option value="">Selecione o casal...</option>
                    @for (c of casais(); track c.id) {
                      <option [value]="c.id">
                        {{ c.esposo.nomeCompleto }} e {{ c.esposa.nomeCompleto }}
                      </option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="campo-grupo">
                  <label for="cad-inicio">Data de Início <span class="obrigatorio">*</span></label>
                  <input
                    type="date"
                    id="cad-inicio"
                    [(ngModel)]="novoMandato.dataInicio"
                    name="dataInicio"
                    (ngModelChange)="aoAlterarFuncaoOuInicio()"
                    required
                  />
                </div>

                <div class="campo-grupo">
                  <label for="cad-termino">Término Previsto (Sugerido)</label>
                  <input
                    type="date"
                    id="cad-termino"
                    [(ngModel)]="novoMandato.dataPrevistaTermino"
                    name="dataPrevistaTermino"
                  />
                </div>
              </div>

              <div class="campo-grupo">
                <label for="cad-obs">Observações / Histórico de Eleição</label>
                <textarea
                  id="cad-obs"
                  [(ngModel)]="novoMandato.observacoes"
                  name="observacoes"
                  rows="2"
                  placeholder="Ex: Eleito na reunião de balanço anual em 15/12..."
                ></textarea>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="fecharModal()">
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="salvando() || !novoMandato.instanciaId || !novoMandato.casalId || !novoMandato.dataInicio"
                >
                  {{ salvando() ? 'Salvando...' : 'Confirmar e Registrar Mandato' }}
                </button>
              </footer>
            </form>
          </div>
        </div>
      }

      <!-- Modal de Interrupção Antecipada -->
      @if (modalInterromperAberto()) {
        <div class="modal-backdrop" (click)="fecharModalInterromper()">
          <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h2>Interromper Mandato Antecipadamente</h2>
              <button type="button" class="btn-fechar" (click)="fecharModalInterromper()">✕</button>
            </header>

            <form class="modal-body" (ngSubmit)="confirmarInterrupcao()">
              <p class="aviso-interrupcao">
                Você está interrompendo o mandato de <strong>{{ mandatoSelecionado()?.nomeResponsavel }}</strong>
                como <strong>{{ mandatoSelecionado()?.funcao }}</strong> em
                <strong>{{ mandatoSelecionado()?.nomeInstancia }}</strong>.
              </p>

              <div class="campo-grupo">
                <label for="motivo-interrupcao">Motivo formal da interrupção <span class="obrigatorio">*</span></label>
                <textarea
                  id="motivo-interrupcao"
                  [(ngModel)]="motivoInterrupcao"
                  name="motivo"
                  rows="3"
                  placeholder="Ex: Mudança de cidade, licença médica ou necessidade pastoral..."
                  required
                ></textarea>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="fecharModalInterromper()">
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-danger"
                  [disabled]="salvando() || !motivoInterrupcao.trim()"
                >
                  {{ salvando() ? 'Interrompendo...' : 'Confirmar Interrupção' }}
                </button>
              </footer>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .mandatos-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header-titles h1 {
        font-family: 'Lora', Georgia, serif;
        font-size: 1.75rem;
        color: #1e3a8a;
        margin: 0 0 0.25rem 0;
      }

      .subtitulo {
        font-size: 0.95rem;
        color: #64748b;
        margin: 0;
      }

      /* KPI Cards */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .kpi-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      }

      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
      }

      .kpi-card.ativo {
        border-width: 2px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      }

      .card-vigente.ativo { border-color: #2563eb; }
      .card-vermelho.ativo { border-color: #dc2626; }
      .card-laranja.ativo { border-color: #ea580c; }
      .card-dourado.ativo { border-color: #d97706; }

      .kpi-icone {
        font-size: 2rem;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: #f1f5f9;
      }

      .card-vermelho .kpi-icone { background: #fee2e2; }
      .card-laranja .kpi-icone { background: #ffedd5; }
      .card-dourado .kpi-icone { background: #fef3c7; }

      .kpi-conteudo {
        display: flex;
        flex-direction: column;
      }

      .kpi-valor {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1e293b;
        line-height: 1.1;
      }

      .kpi-label {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 500;
      }

      /* Filtros */
      .filtros-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .filtros-cabecalho {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .filtros-titulo-area {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .filtros-icone {
        font-size: 1rem;
      }

      .filtros-titulo {
        font-size: 0.875rem;
        font-weight: 700;
        color: #1e293b;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .badge-filtros-ativos {
        font-size: 0.72rem;
        font-weight: 600;
        background: #dbeafe;
        color: #1d4ed8;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
      }

      .btn-limpar-filtros {
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .btn-limpar-filtros:hover {
        background: #fee2e2;
        color: #dc2626;
      }

      .filtros-grid-quatro {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
      }

      @media (max-width: 1024px) {
        .filtros-grid-quatro {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 640px) {
        .filtros-grid-quatro {
          grid-template-columns: 1fr;
        }
      }

      .filtros-busca-linha {
        display: flex;
        width: 100%;
      }

      .campo-busca-container {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      }

      .icone-busca-input {
        position: absolute;
        left: 0.85rem;
        font-size: 0.9rem;
        color: #94a3b8;
        pointer-events: none;
      }

      .input-busca-mandato {
        width: 100%;
        padding: 0.65rem 2.2rem 0.65rem 2.4rem;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        font-size: 0.875rem;
        color: #1e293b;
        background: #f8fafc;
        outline: none;
        transition: all 0.2s ease;
      }

      .input-busca-mandato:focus {
        background: #ffffff;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .btn-limpar-termo {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0.2rem;
      }

      .btn-limpar-termo:hover {
        color: #475569;
      }

      .campo-grupo {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .campo-grupo label {
        font-size: 0.825rem;
        font-weight: 600;
        color: #475569;
      }

      .campo-grupo select,
      .campo-grupo input,
      .campo-grupo textarea {
        padding: 0.6rem 0.75rem;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        font-size: 0.9rem;
        color: #1e293b;
        background: #ffffff;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .campo-grupo select:focus,
      .campo-grupo input:focus,
      .campo-grupo textarea:focus {
        border-color: #2563eb;
      }

      /* Tabela */
      .tabela-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }

      .table-responsive {
        overflow-x: auto;
      }

      .tabela-mandatos {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
        text-align: left;
      }

      .tabela-mandatos th {
        background: #f8fafc;
        padding: 0.85rem 1rem;
        font-weight: 600;
        color: #475569;
        border-bottom: 1px solid #e2e8f0;
      }

      .tabela-mandatos td {
        padding: 1rem;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .tabela-mandatos tbody tr:hover {
        background: #f8fafc;
      }

      /* Badges */
      .badge-funcao {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.75rem;
        background: #e2e8f0;
        color: #1e293b;
      }

      .badge-cre { background: #dbeafe; color: #1e40af; }
      .badge-cl { background: #e0e7ff; color: #3730a3; }
      .badge-crs { background: #fef3c7; color: #92400e; }
      .badge-crr { background: #fed7aa; color: #9a3412; }
      .badge-crp { background: #fbcfe8; color: #9d174d; }
      .badge-crsr { background: #ddd6fe; color: #5b21b6; }
      .badge-eri { background: #ccfbf1; color: #115e59; }

      .col-responsavel {
        display: flex;
        flex-direction: column;
      }

      .obs-texto {
        font-size: 0.75rem;
        color: #64748b;
        max-width: 280px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .col-instancia {
        display: flex;
        flex-direction: column;
      }

      .instancia-nome {
        font-weight: 600;
        color: #1e293b;
      }

      .instancia-nivel {
        font-size: 0.75rem;
        color: #64748b;
      }

      .col-datas {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        font-size: 0.8rem;
        color: #475569;
      }

      .data-efetiva {
        color: #dc2626;
      }

      .badge-alerta {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.35rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .alerta-vermelho {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
      }

      .alerta-laranja {
        background: #ffedd5;
        color: #9a3412;
        border: 1px solid #fdba74;
      }

      .alerta-dourado {
        background: #fef3c7;
        color: #b45309;
        border: 1px solid #fcd34d;
      }

      .alerta-regular {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }

      .status-concluido {
        background: #f1f5f9;
        color: #64748b;
      }

      .status-interrompido {
        background: #fef2f2;
        color: #b91c1c;
      }

      /* Ações */
      .acoes-linha {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .btn-acao {
        padding: 0.35rem 0.6rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        border: 1px solid transparent;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-acao-sucessor {
        background: #eff6ff;
        color: #1d4ed8;
        border-color: #bfdbfe;
      }

      .btn-acao-sucessor:hover {
        background: #dbeafe;
      }

      .btn-acao-interromper {
        background: #fef2f2;
        color: #b91c1c;
        border-color: #fecaca;
      }

      .btn-acao-interromper:hover {
        background: #fee2e2;
      }

      .acao-historico {
        font-size: 0.8rem;
        color: #94a3b8;
        font-style: italic;
      }

      /* Botões */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #2563eb;
        color: #ffffff;
      }

      .btn-primary:hover {
        background: #1d4ed8;
      }

      .btn-outline {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #334155;
      }

      .btn-outline:hover {
        background: #f8fafc;
      }

      .btn-danger {
        background: #dc2626;
        color: #ffffff;
      }

      .btn-danger:hover {
        background: #b91c1c;
      }

      /* Modais */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-card {
        background: #ffffff;
        border-radius: 14px;
        width: 100%;
        max-width: 680px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .modal-sm {
        max-width: 480px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h2 {
        font-size: 1.25rem;
        color: #1e3a8a;
        margin: 0;
      }

      .btn-fechar {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        color: #94a3b8;
        cursor: pointer;
      }

      .modal-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .alerta-transicao-aviso {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        padding: 0.85rem;
        font-size: 0.85rem;
        color: #1e40af;
        line-height: 1.4;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      @media (max-width: 640px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .loading-state,
      .empty-state {
        padding: 3rem 1.5rem;
        text-align: center;
        color: #64748b;
      }

      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        margin: 0 auto 1rem auto;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .empty-icon {
        font-size: 2.5rem;
        display: block;
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class MandatosPage implements OnInit {
  private readonly mandatoService = inject(MandatoService);
  private readonly casalService = inject(CasalService);
  private readonly equipeService = inject(EquipeService);
  private readonly estruturaService = inject(EstruturaService);

  readonly mandatos = signal<MandatoDto[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);

  readonly funcaoFiltro = signal<FuncaoMandato | ''>('');
  readonly nivelInstanciaFiltro = signal<NivelInstancia | ''>('');
  readonly statusFiltro = signal<StatusMandato | ''>('VIGENTE');
  readonly alertaFiltro = signal<AlertaMandato | ''>('');
  readonly termoBusca = signal<string>('');

  readonly casais = signal<CasalDto[]>([]);
  readonly equipes = signal<EquipeResumoDto[]>([]);
  readonly estruturas = signal<NoEstrutura[]>([]);

  readonly modalAberto = signal<boolean>(false);
  readonly modalInterromperAberto = signal<boolean>(false);
  readonly mandatoSelecionado = signal<MandatoDto | null>(null);
  motivoInterrupcao = '';

  novoMandato: MandatoRequest = {
    funcao: 'CRE',
    nivelInstancia: 'EQUIPE',
    instanciaId: '',
    casalId: '',
    dataInicio: new Date().toISOString().substring(0, 10),
    dataPrevistaTermino: '',
    observacoes: '',
  };

  readonly totalFiltrosAtivos = computed(() => {
    let count = 0;
    if (this.funcaoFiltro()) count++;
    if (this.nivelInstanciaFiltro()) count++;
    if (this.statusFiltro() && this.statusFiltro() !== 'VIGENTE') count++;
    if (this.alertaFiltro()) count++;
    return count;
  });

  readonly mandatosExibidos = computed(() => {
    const lista = this.mandatos();
    const termo = this.termoBusca().trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(
      (m) =>
        (m.nomeResponsavel && m.nomeResponsavel.toLowerCase().includes(termo)) ||
        (m.nomeInstancia && m.nomeInstancia.toLowerCase().includes(termo)) ||
        (m.observacoes && m.observacoes.toLowerCase().includes(termo))
    );
  });

  readonly totalVigentes = computed(
    () => this.mandatos().filter((m) => m.status === 'VIGENTE').length
  );
  readonly totalVermelhos = computed(
    () => this.mandatos().filter((m) => m.status === 'VIGENTE' && m.alerta === 'VERMELHO').length
  );
  readonly totalLaranjas = computed(
    () => this.mandatos().filter((m) => m.status === 'VIGENTE' && m.alerta === 'LARANJA').length
  );
  readonly totalDourados = computed(
    () => this.mandatos().filter((m) => m.status === 'VIGENTE' && m.alerta === 'DOURADO').length
  );

  readonly estruturasFiltradas = computed(() => {
    const nivel = this.novoMandato.nivelInstancia;
    return this.estruturas().filter((e) => e.nivel === nivel);
  });

  ngOnInit(): void {
    this.carregarDadosIniciais();
    this.carregarMandatos();
  }

  carregarDadosIniciais(): void {
    this.casalService.listar({ status: 'ATIVO', size: 100 }).subscribe({
      next: (res) => this.casais.set(res.content),
    });

    this.equipeService.listar({ size: 100 }).subscribe({
      next: (res) => this.equipes.set(res.content),
    });

    // Carrega nós da estrutura para seleção de Setores, Regiões, etc.
    this.estruturaService.listar('SETOR').subscribe({
      next: (setores) => {
        this.estruturaService.listar('REGIAO').subscribe({
          next: (regioes) => {
            this.estruturaService.listar('PROVINCIA').subscribe({
              next: (provincias) => {
                this.estruturaService.listar('SUPER_REGIAO').subscribe({
                  next: (superRegioes) => {
                    this.estruturas.set([
                      ...superRegioes,
                      ...provincias,
                      ...regioes,
                      ...setores,
                    ]);
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  carregarMandatos(): void {
    this.carregando.set(true);
    this.mandatoService
      .listar({
        funcao: this.funcaoFiltro() || undefined,
        status: this.statusFiltro() || undefined,
        nivelInstancia: this.nivelInstanciaFiltro() || undefined,
        alerta: this.alertaFiltro() || undefined,
        size: 100,
      })
      .subscribe({
        next: (res) => {
          this.mandatos.set(res.content);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
  }

  aoMudarFuncao(funcao: FuncaoMandato | ''): void {
    this.funcaoFiltro.set(funcao);
    this.carregarMandatos();
  }

  aoMudarNivelInstancia(nivel: NivelInstancia | ''): void {
    this.nivelInstanciaFiltro.set(nivel);
    this.carregarMandatos();
  }

  aoMudarStatus(status: StatusMandato | ''): void {
    this.statusFiltro.set(status);
    this.carregarMandatos();
  }

  aoMudarAlerta(alerta: AlertaMandato | ''): void {
    this.alertaFiltro.set(alerta);
    this.carregarMandatos();
  }

  filtrarPorKpi(status: StatusMandato, alerta: AlertaMandato | ''): void {
    this.statusFiltro.set(status);
    this.alertaFiltro.set(alerta);
    this.carregarMandatos();
  }

  limparFiltros(): void {
    this.funcaoFiltro.set('');
    this.nivelInstanciaFiltro.set('');
    this.statusFiltro.set('VIGENTE');
    this.alertaFiltro.set('');
    this.termoBusca.set('');
    this.carregarMandatos();
  }

  abrirModalNovo(): void {
    const hoje = new Date().toISOString().substring(0, 10);
    this.novoMandato = {
      funcao: 'CRE',
      nivelInstancia: 'EQUIPE',
      instanciaId: this.equipes().length > 0 ? this.equipes()[0].id : '',
      casalId: this.casais().length > 0 ? this.casais()[0].id : '',
      dataInicio: hoje,
      dataPrevistaTermino: '',
      observacoes: '',
    };
    this.aoAlterarFuncaoOuInicio();
    this.modalAberto.set(true);
  }

  prepararSucessor(m: MandatoDto): void {
    const hoje = new Date().toISOString().substring(0, 10);
    this.novoMandato = {
      funcao: m.funcao,
      nivelInstancia: m.nivelInstancia,
      instanciaId: m.instanciaId,
      casalId: '',
      dataInicio: hoje,
      dataPrevistaTermino: '',
      observacoes: `Sucessão do mandato anterior de ${m.nomeResponsavel}`,
    };
    this.aoAlterarFuncaoOuInicio();
    this.modalAberto.set(true);
  }

  aoAlterarNivelInstancia(): void {
    if (this.novoMandato.nivelInstancia === 'EQUIPE') {
      this.novoMandato.instanciaId = this.equipes().length > 0 ? this.equipes()[0].id : '';
    } else if (this.novoMandato.nivelInstancia === 'INTERNACIONAL') {
      this.novoMandato.instanciaId = 'ERI';
    } else {
      const primeiro = this.estruturasFiltradas()[0];
      this.novoMandato.instanciaId = primeiro ? primeiro.id : '';
    }
  }

  aoAlterarFuncaoOuInicio(): void {
    if (!this.novoMandato.funcao || !this.novoMandato.dataInicio) return;
    this.mandatoService
      .obterPrazoSugerido(this.novoMandato.funcao, this.novoMandato.dataInicio)
      .subscribe({
        next: (res) => {
          this.novoMandato.dataPrevistaTermino = res.dataPrevistaTermino;
        },
      });
  }

  salvarMandato(): void {
    this.salvando.set(true);
    this.mandatoService.criar(this.novoMandato).subscribe({
      next: () => {
        this.salvando.set(false);
        this.modalAberto.set(false);
        this.carregarMandatos();
      },
      error: (err) => {
        this.salvando.set(false);
        alert(err.error?.message || 'Erro ao registrar mandato');
      },
    });
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  abrirModalInterromper(m: MandatoDto): void {
    this.mandatoSelecionado.set(m);
    this.motivoInterrupcao = '';
    this.modalInterromperAberto.set(true);
  }

  fecharModalInterromper(): void {
    this.modalInterromperAberto.set(false);
    this.mandatoSelecionado.set(null);
  }

  confirmarInterrupcao(): void {
    const sel = this.mandatoSelecionado();
    if (!sel || !this.motivoInterrupcao.trim()) return;

    this.salvando.set(true);
    this.mandatoService.interromper(sel.id, this.motivoInterrupcao).subscribe({
      next: () => {
        this.salvando.set(false);
        this.fecharModalInterromper();
        this.carregarMandatos();
      },
      error: (err) => {
        this.salvando.set(false);
        alert(err.error?.message || 'Erro ao interromper mandato');
      },
    });
  }
}
