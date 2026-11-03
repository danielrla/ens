import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  PresencaCasal,
  RegistroPresencaRequest,
  ReuniaoDto,
  ReuniaoRequest,
  ReuniaoService,
  StatusPresenca,
  TipoReuniao,
} from '../../core/reuniao.service';
import { EquipeDetalheDto, EquipeResumoDto, EquipeService } from '../../core/equipe.service';
import { CasalDto, CasalService, Endereco } from '../../core/casal.service';
import { EnsDatePipe } from '../../core/ens-date.pipe';

interface ItemChamadaPresenca {
  casalId: string;
  nomeCasal: string;
  status: StatusPresenca;
  observacao: string;
}

@Component({
  selector: 'app-agenda-reunioes-page',
  imports: [CommonModule, FormsModule, RouterLink, EnsDatePipe],
  template: `
    <header class="cabecalho">
      <div>
        <h1>Agenda e Reuniões da Equipe</h1>
        <p class="serifa">Planejamento, agendamento de reuniões mensais e registro de presenças pelo CRE.</p>
      </div>
      <div class="botoes-topo">
        <button type="button" class="btn btn-primario" [disabled]="!equipeIdSelecionada" (click)="abrirModalAgendamento()">
          + Agendar Reunião
        </button>
      </div>
    </header>

    @if (carregandoPerfil()) {
      <div class="cartao estado-info">
        <p>Identificando a sua equipe...</p>
      </div>
    } @else if (!equipeIdSelecionada) {
      <div class="cartao aviso-sem-equipe">
        <span class="icone-aviso">⚠️</span>
        <div class="texto-aviso">
          <strong>Seu perfil de casal ainda não possui uma equipe vinculada.</strong>
          <p>Para agendar e visualizar as reuniões da equipe, vincule sua equipe na página de perfil.</p>
          <a routerLink="/perfil" class="btn btn-primario btn-sm">Acessar Meu Perfil</a>
        </div>
      </div>
    } @else {
      <!-- Identificação da Equipe do Casal -->
      <section class="cartao seletor-equipe-container cartao-resumo-minha-equipe">
        <div class="identificacao-equipe-agenda">
          <span class="etiqueta-exclusiva">Agenda da Equipe</span>
          <h2 class="nome-equipe-titulo">
            Equipe {{ detalheEquipe()?.numero | number:'2.0-0' }} — {{ detalheEquipe()?.nomeDevocao || 'Nossa Senhora' }}
          </h2>
          <small class="local-equipe">
            📍 {{ detalheEquipe()?.municipio || '—' }} / {{ detalheEquipe()?.estado || '—' }} • {{ detalheEquipe()?.setor?.nome || 'Setor' }}
          </small>
        </div>

        @if (detalheEquipe()) {
          <div class="resumo-equipe-topo">
            <div class="resumo-item">
              <span class="rotulo">CRE:</span>
              <strong class="destaque-cre">{{ detalheEquipe()?.cre || 'Não informado' }}</strong>
            </div>
            <div class="resumo-item">
              <span class="rotulo">SCE:</span>
              <span class="badge-sce">✝️ {{ detalheEquipe()?.nomeSce || 'Não vinculado' }}</span>
            </div>
            <div class="resumo-item">
              <span class="rotulo">Casais Ativos:</span>
              <span class="badge badge-dourado">{{ casaisAtivos().length }} casais</span>
            </div>
            <div class="resumo-item tema-item-agenda">
              <span class="rotulo">Tema do Ano:</span>
              <div class="bloco-tema-rapido">
                <strong class="texto-dourado">{{ obterTemaDaReuniao() }}</strong>
                <button type="button" class="btn-editar-tema-agenda" (click)="abrirModalTema()" title="Editar Tema do Ano">
                  ✏️
                </button>
              </div>
            </div>
          </div>
        }
      </section>
    }

    <!-- Lista de Reuniões -->
    <section class="cartao container-reunioes">
      @if (carregando()) {
        <p class="estado-info">Carregando reuniões da equipe...</p>
      } @else if (reunioes().length === 0) {
        <div class="estado-vazio">
          <p>Nenhuma reunião agendada para esta equipe.</p>
          <button type="button" class="btn btn-primario btn-sm" (click)="abrirModalAgendamento()">
            Agendar a Primeira Reunião
          </button>
        </div>
      } @else {
        <div class="grade-reunioes">
          @for (r of reunioes(); track r.id) {
            <article class="cartao-reuniao">
              <div class="reuniao-topo">
                <div class="data-hora-bloco">
                  <span class="icone-calendario">📅</span>
                  <div>
                    <h3 class="data-formatada">{{ r.data | ensDate }}</h3>
                    @if (r.horario) {
                      <span class="horario-destaque">⏰ {{ r.horario }}</span>
                    }
                  </div>
                </div>

                <div class="badges-status">
                  @if (r.tipo === 'INFORMAL') {
                    <span class="badge badge-informal">Informal</span>
                  } @else {
                    <span class="badge badge-formal">Formal</span>
                  }
                  @if (r.presencas && r.presencas.length > 0) {
                    <span class="badge badge-realizada">✓ Realizada</span>
                  } @else {
                    <span class="badge badge-agendada">⏳ Agendada</span>
                  }
                  @if (r.scePresente) {
                    <span class="badge badge-sce">✝️ SCE Presente</span>
                  }
                </div>
              </div>

              @if (r.tema) {
                <div class="tema-bloco">
                  <span class="rotulo-suave">Tema de Estudo:</span>
                  <strong class="tema-texto">{{ r.tema }}</strong>
                </div>
              }

              @if (r.nomeCasalAnimador) {
                <div class="animador-bloco">
                  <span class="rotulo-suave">Casal Animador:</span>
                  <strong>🎙️ {{ r.nomeCasalAnimador }}</strong>
                </div>
              }

              <!-- Detalhes do Anfitrião e Endereço -->
              <div class="anfitriao-bloco">
                <div class="anfitriao-linha">
                  <span class="icone-casa">🏡</span>
                  <div>
                    <span class="rotulo-suave">Casal Anfitrião:</span>
                    <strong>{{ r.nomeCasalAnfitriao || 'A definir' }}</strong>
                  </div>
                </div>

                @if (r.enderecoAnfitriao) {
                  <div class="endereco-card">
                    <p class="endereco-texto">
                      📍 {{ formatarEndereco(r.enderecoAnfitriao) }}
                    </p>
                  </div>
                }

                @if (r.localObservacao) {
                  <div class="observacao-local-card">
                    <span class="icone-info">ℹ️</span>
                    <span><strong>Local / Obs:</strong> {{ r.localObservacao }}</span>
                  </div>
                }
              </div>

              <!-- Resumo da Ata e Presenças se Realizada -->
              @if (r.presencas && r.presencas.length > 0) {
                <div class="resumo-presencas-bloco">
                  <div class="estatisticas-presenca">
                    <span class="tag-presenca tag-ok">{{ r.totalPresentes }} Presentes</span>
                    @if (r.totalFaltas > 0) {
                      <span class="tag-presenca tag-falta">{{ r.totalFaltas }} Faltas</span>
                    }
                    @if (r.totalJustificadas > 0) {
                      <span class="tag-presenca tag-justificada">{{ r.totalJustificadas }} Justificadas</span>
                    }
                  </div>

                  <div class="chamada-chips">
                    @for (p of r.presencas; track p.casalId) {
                      <span
                        class="chip-presenca"
                        [class.chip-ok]="p.status === 'PRESENTE'"
                        [class.chip-falta]="p.status === 'FALTOU'"
                        [class.chip-justificada]="p.status === 'JUSTIFICOU'"
                      >
                        {{ p.nomeCasal }} ({{ p.status }})
                        @if (p.observacao) {
                          <small>— {{ p.observacao }}</small>
                        }
                      </span>
                    }
                  </div>

                  @if (r.anotacoesCre) {
                    <div class="anotacoes-cre-bloco">
                      <strong>Anotações do CRE:</strong>
                      <p>{{ r.anotacoesCre }}</p>
                    </div>
                  }

                  @if (r.fotos && r.fotos.length > 0) {
                    <div class="galeria-fotos">
                      @for (foto of r.fotos; track $index) {
                        <img [src]="foto" alt="Foto da Reunião" class="foto-miniatura" (click)="visualizarFoto(foto)" />
                      }
                    </div>
                  }
                </div>
              }

              <!-- Ações da Reunião -->
              <div class="reuniao-rodape">
                <div class="acoes-principais">
                  <button type="button" class="btn btn-primario btn-sm" (click)="abrirModalPresenca(r)">
                    📝 Registrar Presenças
                  </button>
                  @if (r.tipo !== 'INFORMAL') {
                    <button type="button" class="btn btn-secundario btn-sm btn-imprimir" (click)="abrirModalRoteiro(r)">
                      📄 Imprimir Roteiro
                    </button>
                  }
                </div>
                <div class="acoes-secundarias">
                  <button type="button" class="btn-icone" title="Editar Agendamento" (click)="editarAgendamento(r)">✏️</button>
                  <button type="button" class="btn-icone" title="Excluir Reunião" (click)="excluirReuniao(r)">🗑️</button>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </section>

    <!-- Modal de Agendamento da Reunião -->
    @if (modalAgendamentoAberto()) {
      <div class="overlay-modal" (click)="fecharModalAgendamento()">
        <div class="modal-dialog cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <div>
              <h2>{{ modoEdicaoAgendamento() ? 'Editar Reunião' : 'Agendar Nova Reunião' }}</h2>
              <p class="texto-suave">Informe data, horário, tema e selecione o casal anfitrião ativo.</p>
            </div>
            <button type="button" class="btn-fechar" (click)="fecharModalAgendamento()">✕</button>
          </div>

          <form (submit)="salvarAgendamento($event)" class="form-grid">
            <div class="campo">
              <label>Tipo de Reunião <span class="obrigatorio">*</span></label>
              <div class="tipo-reuniao-selector">
                <label class="radio-card" [class.selecionado]="formReuniao.tipo !== 'INFORMAL'">
                  <input type="radio" [(ngModel)]="formReuniao.tipo" name="tipoReuniao" value="FORMAL" />
                  <div class="radio-info">
                    <strong>📖 Reunião Formal</strong>
                    <small>Encontro litúrgico mensal com estudo, oração, PCEs e emissão de roteiro oficial</small>
                  </div>
                </label>
                <label class="radio-card" [class.selecionado]="formReuniao.tipo === 'INFORMAL'">
                  <input type="radio" [(ngModel)]="formReuniao.tipo" name="tipoReuniao" value="INFORMAL" />
                  <div class="radio-info">
                    <strong>🎉 Reunião Informal</strong>
                    <small>Confraternização, piquenique, celebração informal ou encontro de famílias</small>
                  </div>
                </label>
              </div>
            </div>

            <div class="linha-dupla">
              <div class="campo">
                <label>Data da Reunião <span class="obrigatorio">*</span></label>
                <input type="date" required [(ngModel)]="formReuniao.data" name="dataReuniao" />
              </div>
              <div class="campo">
                <label>Horário</label>
                <input type="time" [(ngModel)]="formReuniao.horario" name="horarioReuniao" placeholder="19:30" />
              </div>
            </div>

            <div class="campo">
              <label>Tema de Reflexão / Assunto da Reunião</label>
              <input [(ngModel)]="formReuniao.tema" name="temaReuniao" placeholder="Ex: Tema do Mês, Livro de Estudo Cap. 7" />
            </div>

            @if (formReuniao.tipo !== 'INFORMAL') {
              <div class="campo">
                <label>Casal Animador do Mês</label>
                <select [(ngModel)]="formReuniao.casalAnimadorId" name="animadorId">
                  <option value="">Selecione o casal animador (opcional)...</option>
                  @for (c of casaisAtivos(); track c.id) {
                    <option [value]="c.id">{{ c.esposo.nomeCompleto }} & {{ c.esposa.nomeCompleto }}</option>
                  }
                </select>
              </div>
            }

            <div class="campo">
              <label>Casal Anfitrião (Apenas Casais Ativos)</label>
              <select [(ngModel)]="formReuniao.casalAnfitriaoId" name="anfitriaoId" (change)="aoSelecionarAnfitriao()">
                <option value="">Selecione o casal anfitrião...</option>
                @for (c of casaisAtivos(); track c.id) {
                  <option [value]="c.id">{{ c.esposo.nomeCompleto }} & {{ c.esposa.nomeCompleto }}</option>
                }
              </select>
            </div>

            <!-- Preview Automático do Endereço do Casal Anfitrião -->
            @if (enderecoPreview()) {
              <div class="endereco-preview-card">
                <strong>📍 Endereço do Anfitrião:</strong>
                <p>{{ formatarEndereco(enderecoPreview()!) }}</p>
              </div>
            } @else if (formReuniao.casalAnfitriaoId) {
              <div class="endereco-preview-aviso">
                <small>⚠️ Este casal ainda não possui endereço residencial cadastrado.</small>
              </div>
            }

            <div class="campo">
              <label>Local / Observação do Espaço</label>
              <input
                [(ngModel)]="formReuniao.localObservacao"
                name="localObservacao"
                placeholder="Ex: Salão de festas do condomínio, churrasqueira, etc."
              />
            </div>

            <div class="modal-acoes">
              <button type="button" class="btn btn-fantasma" (click)="fecharModalAgendamento()">Cancelar</button>
              <button type="submit" class="btn btn-primario" [disabled]="salvando()">
                {{ salvando() ? 'Gravando...' : (modoEdicaoAgendamento() ? 'Salvar Alterações' : 'Confirmar Agendamento') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Registrar Presenças, Ata e Fotos -->
    @if (modalPresencaAberto() && reuniaoSelecionada()) {
      <div class="overlay-modal" (click)="fecharModalPresenca()">
        <div class="modal-dialog modal-largo cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <div>
              <h2>Registro de Presenças e Ata da Reunião</h2>
              <p class="texto-suave">
                {{ formatarData(reuniaoSelecionada()?.data) }}
                {{ reuniaoSelecionada()?.horario ? 'às ' + reuniaoSelecionada()?.horario : '' }}
                — Anfitrião: {{ reuniaoSelecionada()?.nomeCasalAnfitriao || 'Não definido' }}
              </p>
            </div>
            <button type="button" class="btn-fechar" (click)="fecharModalPresenca()">✕</button>
          </div>

          <form (submit)="salvarPresencas($event)" class="form-grid">
            <div class="campo-checkbox sce-checkbox-container">
              <label>
                <input type="checkbox" [(ngModel)]="formPresenca.scePresente" name="scePresente" />
                ✝️ Sacerdote Conselheiro Espiritual (SCE) esteve presente na reunião
              </label>
            </div>

            <!-- Chamada dos Casais Ativos -->
            <div class="quadro-chamada">
              <h3>Chamada de Casais Ativos</h3>
              @if (itensChamada().length === 0) {
                <p class="texto-suave">Nenhum casal ativo nesta equipe para registrar presença.</p>
              } @else {
                <div class="tabela-responsiva">
                  <table class="tabela-chamada">
                    <thead>
                      <tr>
                        <th>Casal</th>
                        <th>Presença</th>
                        <th>Observação / Justificativa</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of itensChamada(); track item.casalId) {
                        <tr>
                          <td><strong>{{ item.nomeCasal }}</strong></td>
                          <td>
                            <div class="botoes-presenca">
                              <label class="btn-status status-presente" [class.selecionado]="item.status === 'PRESENTE'">
                                <input type="radio" [(ngModel)]="item.status" [name]="'status_' + item.casalId" value="PRESENTE" hidden />
                                ✓ Presente
                              </label>
                              <label class="btn-status status-faltou" [class.selecionado]="item.status === 'FALTOU'">
                                <input type="radio" [(ngModel)]="item.status" [name]="'status_' + item.casalId" value="FALTOU" hidden />
                                ✕ Faltou
                              </label>
                              <label class="btn-status status-justificou" [class.selecionado]="item.status === 'JUSTIFICOU'">
                                <input type="radio" [(ngModel)]="item.status" [name]="'status_' + item.casalId" value="JUSTIFICOU" hidden />
                                💬 Justificou
                              </label>
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              class="input-obs"
                              [(ngModel)]="item.observacao"
                              [name]="'obs_' + item.casalId"
                              placeholder="Motivo da ausência ou observação"
                            />
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- Anotações do CRE -->
            <div class="campo">
              <label>Anotações do CRE / Vivência da Equipe</label>
              <textarea
                rows="3"
                [(ngModel)]="formPresenca.anotacoesCre"
                name="anotacoesCre"
                placeholder="Registros da oração litúrgica, partilha de vida, estudo do tema e reflexões vividas..."
              ></textarea>
            </div>

            <!-- Seção de Fotos da Reunião com Feedback de Upload -->
            <div class="secao-fotos">
              <div class="fotos-cabecalho">
                <label>Fotos da Reunião</label>
                <label
                  for="input-fotos-reuniao"
                  class="btn-upload-foto"
                  [class.btn-upload-carregando]="carregandoFotosReuniao()"
                >
                  @if (carregandoFotosReuniao()) {
                    <span class="spinner-sm"></span>
                    Carregando anexo...
                  } @else {
                    📷 Adicionar Foto
                  }
                </label>
                <input
                  id="input-fotos-reuniao"
                  type="file"
                  accept="image/*"
                  multiple
                  [disabled]="carregandoFotosReuniao()"
                  (click)="$any($event.target).value = null"
                  (change)="aoSelecionarFoto($event)"
                  style="display: none"
                />
              </div>

              @if (carregandoFotosReuniao()) {
                <div class="alerta-upload-fotos">
                  <span class="spinner-sm"></span>
                  <span>Processando o arquivo de imagem...</span>
                </div>
              }

              @if (fotosPresenca().length === 0) {
                <p class="texto-suave">Nenhuma foto adicionada ainda.</p>
              } @else {
                <div class="status-fotos-adicionadas">
                  <span class="badge badge-sucesso">✓ {{ fotosPresenca().length }} anexo(s) carregado(s)</span>
                </div>
                <div class="galeria-edicao">
                  @for (foto of fotosPresenca(); track $index) {
                    <div class="foto-wrapper">
                      <img [src]="foto" alt="Foto Reunião" class="foto-miniatura-edicao" />
                      <button type="button" class="btn-remover-foto" (click)="removerFoto($index)" title="Remover este anexo">✕</button>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="modal-acoes">
              <button type="button" class="btn btn-fantasma" (click)="fecharModalPresenca()">Cancelar</button>
              <button type="submit" class="btn btn-primario" [disabled]="salvando()">
                {{ salvando() ? 'Salvando...' : 'Salvar Presenças e Ata' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Zoom Foto -->
    @if (fotoZoom()) {
      <div class="overlay-modal" (click)="fotoZoom.set(null)">
        <div class="modal-zoom" (click)="$event.stopPropagation()">
          <img [src]="fotoZoom()" alt="Foto Ampliada" class="imagem-zoom" />
          <button type="button" class="btn-fechar-zoom" (click)="fotoZoom.set(null)">✕</button>
        </div>
      </div>
    }

    <!-- Modal Roteiro Litúrgico para Impressão -->
    @if (modalRoteiroAberto() && reuniaoRoteiro()) {
      <div class="overlay-modal overlay-roteiro" (click)="fecharModalRoteiro()">
        <div class="modal-dialog modal-roteiro-dialog cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho botoes-roteiro">
            <div>
              <h3>Roteiro da Reunião Mensal (Formal)</h3>
              <p class="texto-suave">Visualização e impressão do modelo litúrgico oficial das Equipes de Nossa Senhora.</p>
            </div>
            <div class="acoes-roteiro-topo">
              <button type="button" class="btn btn-primario" (click)="imprimirRoteiro()">
                🖨️ Imprimir Roteiro
              </button>
              <button type="button" class="btn-fechar" (click)="fecharModalRoteiro()">✕</button>
            </div>
          </div>

          <!-- Documento Formatado para Impressão conforme modelo em docx -->
          <article class="documento-roteiro" id="roteiro-para-impressao">
            <header class="doc-cabecalho">
              <h2 class="doc-titulo-movimento">MOVIMENTO DE ESPIRITUALIDADE CONJUGAL</h2>
              <div class="doc-subtitulos">
                <span>{{ detalheEquipe()?.provincia?.nome || 'PROVÍNCIA' }} • {{ detalheEquipe()?.setor?.nome || 'SETOR' }} • Equipe {{ detalheEquipe()?.numero }} {{ detalheEquipe()?.nomeDevocao || '' }}</span>
                <span class="doc-carisma">Carisma: Espiritualidade Conjugal</span>
              </div>
            </header>

            <div class="doc-faixa-destaque">
              <h3>REUNIÃO MENSAL — {{ obterMesAno(reuniaoRoteiro()?.data) | uppercase }}</h3>
              <div class="doc-tema-ano">
                <strong>TEMA DO ANO:</strong> {{ obterTemaDaReuniao(reuniaoRoteiro()?.data) }}
              </div>
              <div class="doc-assunto">
                <strong>ASSUNTO DA REUNIÃO:</strong> {{ reuniaoRoteiro()?.tema || 'Tema do Mês' }}
              </div>
            </div>

            <div class="doc-quadro-informacoes">
              <div class="doc-info-col">
                <p><strong>DATA/HORA:</strong> {{ reuniaoRoteiro()?.data | ensDate }} às {{ reuniaoRoteiro()?.horario || '19:30' }}</p>
                <p><strong>Conselheiro Espiritual:</strong> {{ detalheEquipe()?.nomeSce || 'A definir' }}</p>
                <p><strong>LOCAL:</strong> {{ reuniaoRoteiro()?.nomeCasalAnfitriao || 'Casal anfitrião' }} — {{ formatarEndereco(reuniaoRoteiro()?.enderecoAnfitriao) }}</p>
              </div>
              <div class="doc-info-col">
                <p><strong>Casal Ligação:</strong> {{ detalheEquipe()?.setor?.nome || 'Setor' }}</p>
                <p><strong>CRE:</strong> {{ detalheEquipe()?.cre || 'Casal Responsável' }}</p>
                <p><strong>Casal Animador:</strong> {{ reuniaoRoteiro()?.nomeCasalAnimador || 'A definir' }}</p>
              </div>
            </div>

            <div class="doc-passos-liturgia">
              <section class="doc-passo">
                <h4>1 – RECEPÇÃO/ACOLHIDA: (CASAL ANFITRIÃO)</h4>
                <p class="doc-liturgia-texto">
                  <strong>INVOCAÇÃO À SANTÍSSIMA TRINDADE: (SCE)</strong> Em nome do Pai e do Filho e do Espírito Santo. Amém.
                </p>
                <div class="doc-oracao-bloco">
                  <strong>ORAÇÃO INICIAL: ORAÇÃO DAS EQUIPES AO ESPÍRITO SANTO (TODOS)</strong>
                  <p>
                    Espírito Santo, Vós sois o alento do Pai na plenitude da eternidade. Vós nos fostes enviado por Jesus para fazer compreender tudo o que ele nos disse e nos conduzir à verdade completa. Vós sois para nós sopro de vida, sopro criador, sopro santificador. Vós sois quem renova todas as coisas. Vos pedimos, humildemente, que nos deis vida e que habiteis em cada um de nós, em cada um de nossos lares, em cada uma de nossas equipes, para que possamos viver o sacramento do matrimônio como um lugar de amor, um projeto de felicidade e um caminho para santidade. AMÉM!
                  </p>
                </div>
              </section>

              <section class="doc-passo">
                <h4>2 – ESCUTA DA PALAVRA: 1 JOÃO 3, 18-24</h4>
                <div class="doc-texto-biblico">
                  <p>
                    “Filhinhos, não amemos com palavras nem com a boca, mas com ações e em verdade! Nisso conheceremos que somos da verdade e diante dele tranquilizaremos o nosso coração. Se o nosso coração nos acusa, Deus é maior que o nosso coração e tudo conhece. Amados, se o nosso coração não nos acusa, podemos dirigir-nos com confiança a Deus. E qualquer coisa que pedirmos, dele a receberemos, porque guardamos os seus mandamentos e fazemos o que é do seu agrado. Este é o seu mandamento: que creiamos no nome do seu Filho, Jesus Cristo, e nos amemos uns aos outros, de acordo com o mandamento que ele nos deu. Quem guarda os seus mandamentos permanece em Deus, e Deus permanece nele. E nisto sabemos que ele permanece em nós: pelo Espírito que nos deu”.
                  </p>
                  <p class="doc-resposta-biblica">
                    — Palavra do Senhor.<br />
                    <strong>— Graças a Deus.</strong>
                  </p>
                </div>
              </section>

              <section class="doc-passo">
                <h4>3 – REFLEXÃO DA ESCUTA DA PALAVRA: TODOS OS CASAIS</h4>
                <p class="doc-liturgia-texto">Partilha espontânea da Palavra por cada casal e fechamento pelo Conselheiro Espiritual.</p>
              </section>

              <section class="doc-passo">
                <h4>4 – MOMENTO DE ESTUDO: (CASAL ANIMADOR — TEMA DO MÊS)</h4>
                <div class="doc-estudo-detalhes">
                  <p><strong>Assunto:</strong> {{ reuniaoRoteiro()?.tema || 'Tema de estudo mensal' }}</p>
                  <p><strong>Objetivo do tema:</strong> Reconhecer e viver o dom total de si mesmo no matrimônio, cultivando a reciprocidade e a acolhida ativa como expressão concreta do amor de Cristo.</p>
                  <p><strong>Propósito para o mês:</strong> A partir do tema de estudo e das reflexões da reunião, definir uma forma concreta para que a nossa espiritualidade conjugal possa crescer e se aprofundar.</p>
                </div>
              </section>

              <section class="doc-passo">
                <h4>5 – PARTILHA DOS PCEs: (CASAL RESPONSÁVEL)</h4>
                <p class="doc-liturgia-texto">
                  Como os Pontos Concretos de Esforço nos ajudaram a viver o mês equipista? (Dever de Sentar-se, Oração Pessoal, Oração Conjugal, Escuta da Palavra, Regra de Vida e Retiro Anual).
                </p>
              </section>

              <section class="doc-passo">
                <h4>6 – CO-PARTICIPAÇÃO: (CASAL ANIMADOR)</h4>
                <p class="doc-liturgia-texto">
                  Neste momento podemos compartilhar fatos e momentos importantes ocorridos durante o mês em nossas famílias.
                </p>
              </section>

              <section class="doc-passo">
                <h4>7 – INTENÇÕES / PRECES: (CASAL ANIMADOR)</h4>
                <p class="doc-liturgia-texto">Nossa súplica será: <em>“Senhor, escutai a nossa prece.”</em></p>

                <div class="doc-aniversariantes-bloco">
                  <strong>Pelos aniversariantes ao longo do Mês:</strong>
                  @if (aniversariantesDoMes(reuniaoRoteiro()?.data).length > 0) {
                    <ul>
                      @for (aniv of aniversariantesDoMes(reuniaoRoteiro()?.data); track aniv) {
                        <li>🎉 {{ aniv }}</li>
                      }
                    </ul>
                  } @else {
                    <p class="texto-suave">Nenhum aniversário registrado para este mês.</p>
                  }
                </div>

                <p class="doc-pedidos-oracao">Demais pedidos de orações e intenções do coração de cada casal...</p>

                <div class="doc-oracao-bloco">
                  <strong>Oração à Sagrada Família (Papa Francisco — Exortação Apostólica Amoris Laetitia, n. 325)</strong>
                  <p>
                    Jesus, Maria e José, em vós contemplamos o esplendor do verdadeiro amor, a vós, confiantes, nos dirigimos. Sagrada Família de Nazaré, tornai também as nossas famílias lugares de comunhão e cenáculos de oração, autênticas escolas do Evangelho e pequenas igrejas domésticas. Sagrada Família de Nazaré, que nunca mais haja nas famílias episódios de violência, de fechamento e divisão; e quem tiver sido ferido ou escandalizado seja rapidamente consolado e curado. Sagrada Família de Nazaré, fazei que todos nos tornemos conscientes do carácter sagrado e inviolável da família, da sua beleza no projeto de Deus. Jesus, Maria e José, ouvi-nos e acolhei a nossa súplica. Amém.
                  </p>
                </div>
              </section>

              <section class="doc-passo">
                <h4>8 – RECADOS, DATAS, EVENTOS: (CASAL ANIMADOR)</h4>
                <p class="doc-recados-texto">{{ reuniaoRoteiro()?.anotacoesCre || 'Sem recados pendentes.' }}</p>
                <p><strong>CASAL ANIMADOR DO PRÓXIMO MÊS:</strong> {{ reuniaoRoteiro()?.nomeCasalAnfitriao || 'Casal anfitrião desta reunião' }}</p>
              </section>

              <section class="doc-passo">
                <h4>9 – ORAÇÃO FINAL — MAGNIFICAT (TODOS OS CASAIS)</h4>
                <p class="doc-oracao-texto">
                  A minha alma engrandece o Senhor e o meu espírito se alegra em Deus, meu Salvador, porque olhou para a humildade de sua serva. Doravante todas as gerações me chamarão bem-aventurada, porque o Todo-poderoso fez em mim grandes coisas; o seu nome é santo. A sua misericórdia se estende de geração em geração sobre os que o temem. Manifestou o poder do seu braço: dispersou os soberbos de coração. Derrubou dos tronos os poderosos e elevou os humildes. Encheu de bens os famintos e despediu os ricos de mãos vazias. Acolheu Israel, seu servo, lembrado da sua misericórdia, como havia prometido a nossos pais, em favor de Abraão e de sua descendência para sempre. Glória ao Pai e ao Filho e ao Espírito Santo, como era no princípio, agora e sempre. Amém.
                </p>
              </section>

              <section class="doc-passo">
                <h4>10 – BÊNÇÃO FINAL: CONSELHEIRO ESPIRITUAL (OU CASAL RESPONSÁVEL)</h4>
              </section>
            </div>
          </article>
        </div>
      </div>
    }

    <!-- Modal Edição Rápida do Tema do Ano -->
    @if (modalTemaAberto()) {
      <div class="overlay-modal" (click)="fecharModalTema()">
        <div class="modal-dialog cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <h3>Tema de Estudo do Ano da Equipe</h3>
            <button type="button" class="btn-fechar" (click)="fecharModalTema()">✕</button>
          </div>
          <form (submit)="salvarTema($event)">
            <p class="texto-suave">
              Defina o tema de estudo anual que constará na agenda e no cabeçalho do roteiro oficial das reuniões mensais.
            </p>
            <div class="linha-dupla">
              <div class="campo" style="max-width: 140px;">
                <label for="input-ano-agenda">Ano</label>
                <input
                  id="input-ano-agenda"
                  type="number"
                  required
                  [(ngModel)]="temaAnoInput"
                  name="temaAnoInput"
                />
              </div>
              <div class="campo" style="flex: 1;">
                <label for="input-tema-ano-agenda">Tema de Estudo</label>
                <input
                  id="input-tema-ano-agenda"
                  type="text"
                  required
                  [(ngModel)]="temaInput"
                  name="temaInput"
                  placeholder="Ex: O Matrimônio como Vocação à Santidade"
                />
              </div>
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
      margin: 0;
    }
    .cabecalho p {
      margin: 0.35rem 0 0;
      color: var(--texto-suave);
    }
    .seletor-equipe-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
    }
    .cartao-resumo-minha-equipe {
      border-left: 5px solid var(--ouro-500, #d97706);
    }
    .identificacao-equipe-agenda {
      margin-bottom: 0.5rem;
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
      font-size: 1.35rem;
      color: var(--azul-900);
      font-weight: 700;
    }
    .local-equipe {
      color: var(--texto-suave);
      font-size: 0.85rem;
      margin-top: 0.2rem;
      display: block;
    }
    .destaque-cre {
      color: var(--azul-900);
      font-size: 0.95rem;
    }
    .aviso-sem-equipe {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.5rem;
      border-left: 5px solid #ca8a04;
    }
    .icone-aviso {
      font-size: 2rem;
    }
    .texto-aviso strong {
      color: #92400e;
      display: block;
      margin-bottom: 0.35rem;
      font-size: 1.05rem;
    }
    .texto-aviso p {
      margin: 0 0 1rem 0;
      color: var(--texto-suave);
      font-size: 0.95rem;
    }
    .campo-equipe {
      min-width: 280px;
      flex: 1;
    }
    .resumo-equipe-topo {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      align-items: center;
    }
    .resumo-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.875rem;
    }
    .rotulo {
      color: var(--texto-suave);
    }
    .badge-sce {
      background: #f3e8ff;
      color: #6b21a8;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .container-reunioes {
      padding: 1.25rem;
    }
    .grade-reunioes {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .cartao-reuniao {
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 1.25rem;
      background: #fff;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      transition: box-shadow 0.15s ease;
    }
    .cartao-reuniao:hover {
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
    }
    .reuniao-topo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      border-bottom: 1px solid var(--borda);
      padding-bottom: 0.75rem;
    }
    .data-hora-bloco {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .icone-calendario {
      font-size: 1.75rem;
    }
    .data-formatada {
      margin: 0;
      color: var(--azul-900);
      font-size: 1.15rem;
    }
    .horario-destaque {
      font-size: 0.85rem;
      font-weight: 600;
      color: #b45309;
    }
    .badges-status {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .badge-agendada {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .badge-realizada {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .tema-bloco {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }
    .rotulo-suave {
      color: var(--texto-suave);
      font-size: 0.85rem;
    }
    .tema-texto {
      color: var(--azul-900);
    }
    .anfitriao-bloco {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      background: var(--fundo-claro);
      padding: 0.75rem 1rem;
      border-radius: var(--raio-sm);
    }
    .anfitriao-linha {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }
    .icone-casa {
      font-size: 1.1rem;
    }
    .endereco-card {
      font-size: 0.85rem;
      color: #334155;
      padding-left: 1.6rem;
    }
    .endereco-texto {
      margin: 0;
    }
    .observacao-local-card {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: #1e40af;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 0.35rem 0.65rem;
      border-radius: 4px;
      margin-top: 0.25rem;
    }
    .resumo-presencas-bloco {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      border-top: 1px dashed var(--borda);
      padding-top: 0.75rem;
    }
    .estatisticas-presenca {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .tag-presenca {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .tag-ok { background: #dcfce7; color: #15803d; }
    .tag-falta { background: #fee2e2; color: #dc2626; }
    .tag-justificada { background: #e0f2fe; color: #0369a1; }
    .chamada-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .chip-presenca {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--borda);
    }
    .chip-ok { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .chip-falta { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
    .chip-justificada { background: #f0f9ff; border-color: #bae6fd; color: #075985; }
    .anotacoes-cre-bloco {
      font-size: 0.85rem;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 0.6rem 0.85rem;
      border-radius: 4px;
      color: #92400e;
    }
    .anotacoes-cre-bloco p {
      margin: 0.25rem 0 0;
      font-style: italic;
    }
    .galeria-fotos {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.25rem 0;
    }
    .foto-miniatura {
      width: 70px;
      height: 70px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--borda);
      cursor: pointer;
      transition: transform 0.15s;
    }
    .foto-miniatura:hover {
      transform: scale(1.05);
    }
    .reuniao-rodape {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.25rem;
      border-top: 1px solid var(--borda);
      padding-top: 0.75rem;
    }
    .acoes-secundarias {
      display: flex;
      gap: 0.35rem;
    }
    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }
    .btn-icone {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.25rem 0.45rem;
      border-radius: 4px;
    }
    .btn-icone:hover {
      background: var(--fundo-claro);
    }
    .estado-vazio, .estado-info {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--texto-suave);
    }
    .estado-vazio p {
      margin-bottom: 1rem;
    }

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
      max-width: 860px;
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
      font-size: 1.25rem;
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
    .endereco-preview-card {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--raio-sm);
      padding: 0.65rem 0.85rem;
      font-size: 0.85rem;
      color: #1e3a8a;
    }
    .endereco-preview-card p {
      margin: 0.25rem 0 0;
    }
    .endereco-preview-aviso {
      color: #b45309;
      font-size: 0.8rem;
    }
    .sce-checkbox-container {
      background: #fdf4ff;
      border: 1px solid #f0abfc;
      border-radius: var(--raio-sm);
      padding: 0.75rem 1rem;
    }
    .quadro-chamada {
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 0.85rem;
      background: #fff;
    }
    .quadro-chamada h3 {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      color: var(--azul-900);
    }
    .tabela-chamada {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .tabela-chamada th {
      text-align: left;
      padding: 0.5rem;
      border-bottom: 1px solid var(--borda);
      color: var(--texto-suave);
    }
    .tabela-chamada td {
      padding: 0.6rem 0.5rem;
      border-bottom: 1px solid var(--borda);
      vertical-align: middle;
    }
    .botoes-presenca {
      display: flex;
      gap: 0.35rem;
    }
    .btn-status {
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      border: 1px solid var(--borda);
      background: var(--fundo-claro);
      color: var(--texto);
      transition: all 0.15s ease;
    }
    .btn-status.selecionado.status-presente {
      background: #15803d;
      color: #fff;
      border-color: #15803d;
    }
    .btn-status.selecionado.status-faltou {
      background: #dc2626;
      color: #fff;
      border-color: #dc2626;
    }
    .btn-status.selecionado.status-justificou {
      background: #0369a1;
      color: #fff;
      border-color: #0369a1;
    }
    .input-obs {
      width: 100%;
      padding: 0.35rem 0.5rem;
      font-size: 0.8rem;
      border: 1px solid var(--borda);
      border-radius: 4px;
    }
    .secao-fotos {
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 0.85rem;
    }
    .fotos-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .fotos-cabecalho label {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--azul-900);
    }
    .btn-upload-foto {
      cursor: pointer;
      font-size: 0.8rem;
      color: #1e3a8a;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.3rem 0.65rem;
      border-radius: 4px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-upload-carregando {
      background: #f1f5f9;
      color: #64748b;
      cursor: wait;
      pointer-events: none;
    }
    .alerta-upload-fotos {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #1e40af;
      margin: 0.5rem 0;
    }
    .status-fotos-adicionadas {
      margin-bottom: 0.5rem;
    }
    .galeria-edicao {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .foto-wrapper {
      position: relative;
      width: 64px;
      height: 64px;
    }
    .foto-miniatura-edicao {
      width: 64px;
      height: 64px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--borda);
    }
    .btn-remover-foto {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--erro);
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.65rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-acoes {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .modal-zoom {
      position: relative;
      max-width: 80vw;
      max-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .imagem-zoom {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .btn-fechar-zoom {
      position: absolute;
      top: -12px;
      right: -12px;
      background: #fff;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    /* Tipo de Reunião e Roteiro */
    .tipo-reuniao-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .radio-card {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 0.75rem;
      cursor: pointer;
      background: var(--fundo-claro);
      transition: all 0.15s ease;
    }
    .radio-card input {
      margin-top: 0.2rem;
    }
    .radio-card.selecionado {
      border-color: var(--azul-primario, #1e3a8a);
      background: #eff6ff;
    }
    .radio-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .radio-info strong {
      font-size: 0.85rem;
      color: var(--azul-900);
    }
    .radio-info small {
      font-size: 0.75rem;
      color: var(--texto-suave);
      line-height: 1.25;
    }
    .badge-formal {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .badge-informal {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .animador-bloco {
      font-size: 0.85rem;
      color: #475569;
    }
    .animador-linha {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .acoes-principais {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .btn-imprimir {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }
    .btn-imprimir:hover {
      background: #e2e8f0;
    }
    .bloco-tema-rapido {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-editar-tema-agenda {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    .btn-editar-tema-agenda:hover {
      background: rgba(0,0,0,0.06);
    }

    /* Modal do Roteiro Litúrgico */
    .overlay-roteiro {
      background: rgba(15, 23, 42, 0.75);
    }
    .modal-roteiro-dialog {
      max-width: 900px;
      max-height: 94vh;
      overflow-y: auto;
      padding: 2rem;
      background: #f8fafc;
    }
    .botoes-roteiro {
      position: sticky;
      top: -2rem;
      background: #f8fafc;
      z-index: 10;
      padding-top: 0.5rem;
    }
    .acoes-roteiro-topo {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .documento-roteiro {
      background: #ffffff;
      padding: 2.5rem;
      border-radius: 6px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      font-family: 'Times New Roman', Times, serif;
      color: #1a1a1a;
      line-height: 1.5;
    }
    .doc-cabecalho {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 1rem;
      margin-bottom: 1.25rem;
    }
    .doc-titulo-movimento {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.5px;
      margin: 0 0 0.4rem;
    }
    .doc-subtitulos {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      font-size: 0.95rem;
      color: #334155;
    }
    .doc-carisma {
      font-style: italic;
      color: #64748b;
    }
    .doc-faixa-destaque {
      text-align: center;
      background: #f1f5f9;
      border-left: 4px solid #1e3a8a;
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
    }
    .doc-faixa-destaque h3 {
      margin: 0 0 0.35rem;
      font-size: 1.15rem;
      color: #1e3a8a;
      letter-spacing: 0.5px;
    }
    .doc-tema-ano, .doc-assunto {
      font-size: 0.95rem;
      margin-top: 0.2rem;
    }
    .doc-quadro-informacoes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .doc-info-col p {
      margin: 0.25rem 0;
    }
    .doc-passos-liturgia {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .doc-passo {
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 1rem;
    }
    .doc-passo:last-child {
      border-bottom: none;
    }
    .doc-passo h4 {
      font-size: 1rem;
      font-weight: bold;
      color: #0f172a;
      margin: 0 0 0.5rem;
      text-transform: uppercase;
    }
    .doc-liturgia-texto {
      margin: 0.25rem 0;
      font-size: 0.95rem;
    }
    .doc-oracao-bloco {
      background: #fdfbf7;
      border-left: 3px solid #d97706;
      padding: 0.75rem 1rem;
      margin: 0.6rem 0;
      font-style: italic;
      font-size: 0.92rem;
    }
    .doc-oracao-bloco strong {
      display: block;
      margin-bottom: 0.35rem;
      font-style: normal;
      color: #78350f;
    }
    .doc-oracao-bloco p {
      margin: 0;
    }
    .doc-texto-biblico {
      background: #f0fdf4;
      border-left: 3px solid #16a34a;
      padding: 0.85rem 1.25rem;
      margin: 0.6rem 0;
      font-size: 0.95rem;
    }
    .doc-texto-biblico p {
      margin: 0 0 0.5rem;
      text-align: justify;
    }
    .doc-resposta-biblica {
      margin: 0.5rem 0 0 !important;
      font-style: italic;
    }
    .doc-estudo-detalhes p {
      margin: 0.3rem 0;
      font-size: 0.95rem;
    }
    .doc-aniversariantes-bloco {
      background: #fefce8;
      border: 1px solid #fef08a;
      padding: 0.65rem 0.85rem;
      border-radius: 4px;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }
    .doc-aniversariantes-bloco ul {
      margin: 0.35rem 0 0;
      padding-left: 1.25rem;
    }
    .doc-aniversariantes-bloco li {
      margin: 0.2rem 0;
    }
    .doc-pedidos-oracao {
      font-style: italic;
      font-size: 0.9rem;
      color: #475569;
      margin: 0.4rem 0;
    }
    .doc-recados-texto, .doc-oracao-texto {
      margin: 0.3rem 0;
      font-size: 0.92rem;
    }

    /* Estilos de Impressão (@media print) */
    @media print {
      body * {
        visibility: hidden !important;
      }
      .modal-roteiro-dialog,
      .documento-roteiro,
      .documento-roteiro * {
        visibility: visible !important;
      }
      .overlay-roteiro {
        position: static !important;
        background: transparent !important;
        padding: 0 !important;
        inset: auto !important;
      }
      .modal-roteiro-dialog {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        background: #ffffff !important;
        border: none !important;
        overflow: visible !important;
      }
      .botoes-roteiro {
        display: none !important;
      }
      .documento-roteiro {
        box-shadow: none !important;
        padding: 1cm !important;
        margin: 0 !important;
        width: 100% !important;
      }
      @page {
        size: A4;
        margin: 1cm;
      }
    }
  `,
})
export class AgendaReunioesPage {
  private readonly reuniaoService = inject(ReuniaoService);
  private readonly equipeService = inject(EquipeService);
  private readonly casalService = inject(CasalService);

  protected equipes = signal<EquipeResumoDto[]>([]);
  protected equipeIdSelecionada = '';
  protected detalheEquipe = signal<EquipeDetalheDto | null>(null);
  protected casaisAtivos = signal<CasalDto[]>([]);
  protected reunioes = signal<ReuniaoDto[]>([]);
  protected carregando = signal(false);
  protected salvando = signal(false);

  // Modal Agendamento
  protected modalAgendamentoAberto = signal(false);
  protected modoEdicaoAgendamento = signal(false);
  protected idEdicaoReuniao: string | null = null;
  protected formReuniao: ReuniaoRequest = {
    tipo: 'FORMAL',
    data: new Date().toISOString().substring(0, 10),
    horario: '19:30',
    tema: '',
    casalAnimadorId: '',
    casalAnfitriaoId: '',
    localObservacao: '',
  };
  protected enderecoPreview = signal<Endereco | null>(null);

  // Modal Presença e Ata
  protected modalPresencaAberto = signal(false);
  protected reuniaoSelecionada = signal<ReuniaoDto | null>(null);
  protected formPresenca: RegistroPresencaRequest = {
    scePresente: true,
    presencas: [],
    anotacoesCre: '',
    fotos: [],
  };
  protected itensChamada = signal<ItemChamadaPresenca[]>([]);
  protected fotosPresenca = signal<string[]>([]);
  protected carregandoFotosReuniao = signal(false);
  protected fotoZoom = signal<string | null>(null);

  // Modal Roteiro Litúrgico para Impressão
  protected modalRoteiroAberto = signal(false);
  protected reuniaoRoteiro = signal<ReuniaoDto | null>(null);

  // Modal Tema do Ano
  protected modalTemaAberto = signal(false);
  protected temaAnoInput = new Date().getFullYear();
  protected temaInput = '';
  protected salvandoTema = signal(false);

  protected readonly carregandoPerfil = signal(true);

  ngOnInit(): void {
    this.carregarPerfilEEuipe();
  }

  carregarPerfilEEuipe(): void {
    this.carregandoPerfil.set(true);
    this.casalService.obterPerfil().subscribe({
      next: (perfil) => {
        this.carregandoPerfil.set(false);
        if (perfil.equipeId) {
          this.equipeIdSelecionada = perfil.equipeId;
          this.carregarDadosEquipe(perfil.equipeId);
        }
      },
      error: () => {
        this.carregandoPerfil.set(false);
      },
    });
  }

  carregarDadosEquipe(id: string): void {
    this.carregando.set(true);
    this.equipeService.obterPorId(id).subscribe({
      next: (detalhe) => this.detalheEquipe.set(detalhe),
    });

    this.casalService.listar({ equipeId: id, status: 'ATIVO', size: 100 }).subscribe({
      next: (res) => this.casaisAtivos.set(res.content),
    });

    this.carregarReunioes();
  }

  carregarReunioes(): void {
    if (!this.equipeIdSelecionada) {
      this.carregando.set(false);
      return;
    }
    this.carregando.set(true);
    this.reuniaoService.listarMinhaEquipe().subscribe({
      next: (lista) => {
        this.reunioes.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.reuniaoService.listarPorEquipe(this.equipeIdSelecionada).subscribe({
          next: (lista) => {
            this.reunioes.set(lista);
            this.carregando.set(false);
          },
          error: () => this.carregando.set(false),
        });
      },
    });
  }

  abrirModalAgendamento(): void {
    this.modoEdicaoAgendamento.set(false);
    this.idEdicaoReuniao = null;
    this.formReuniao = {
      tipo: 'FORMAL',
      data: new Date().toISOString().substring(0, 10),
      horario: '19:30',
      tema: '',
      casalAnimadorId: '',
      casalAnfitriaoId: '',
      localObservacao: '',
    };
    this.enderecoPreview.set(null);
    this.modalAgendamentoAberto.set(true);
  }

  editarAgendamento(r: ReuniaoDto): void {
    this.modoEdicaoAgendamento.set(true);
    this.idEdicaoReuniao = r.id;
    this.formReuniao = {
      tipo: r.tipo || 'FORMAL',
      data: r.data,
      horario: r.horario || '19:30',
      tema: r.tema || '',
      casalAnimadorId: r.casalAnimadorId || '',
      casalAnfitriaoId: r.casalAnfitriaoId || '',
      localObservacao: r.localObservacao || '',
    };
    this.enderecoPreview.set(r.enderecoAnfitriao || null);
    this.modalAgendamentoAberto.set(true);
  }

  fecharModalAgendamento(): void {
    this.modalAgendamentoAberto.set(false);
    this.idEdicaoReuniao = null;
  }

  aoSelecionarAnfitriao(): void {
    const id = this.formReuniao.casalAnfitriaoId;
    if (!id) {
      this.enderecoPreview.set(null);
      return;
    }
    const casal = this.casaisAtivos().find((c) => c.id === id);
    if (casal && casal.endereco && (casal.endereco.logradouro || casal.endereco.bairro || casal.endereco.cidade)) {
      this.enderecoPreview.set(casal.endereco);
    } else {
      this.enderecoPreview.set(null);
    }
  }

  salvarAgendamento(e: Event): void {
    e.preventDefault();
    if (!this.equipeIdSelecionada) return;

    this.salvando.set(true);
    const req$ = this.modoEdicaoAgendamento() && this.idEdicaoReuniao
      ? this.reuniaoService.atualizar(this.idEdicaoReuniao, this.formReuniao)
      : this.reuniaoService.agendar(this.equipeIdSelecionada, this.formReuniao);

    req$.subscribe({
      next: () => {
        this.salvando.set(false);
        this.fecharModalAgendamento();
        this.carregarReunioes();
      },
      error: (err) => {
        this.salvando.set(false);
        alert(err.error?.message || 'Erro ao salvar agendamento de reunião');
      },
    });
  }

  abrirModalPresenca(r: ReuniaoDto): void {
    this.reuniaoSelecionada.set(r);
    this.formPresenca = {
      scePresente: r.scePresente ?? true,
      anotacoesCre: r.anotacoesCre || '',
      presencas: [],
      fotos: r.fotos ? [...r.fotos] : [],
    };
    this.fotosPresenca.set(r.fotos ? [...r.fotos] : []);

    // Mapear apenas casais ativos para a lista de presença
    const presencasMap = new Map(r.presencas.map((p) => [p.casalId, p]));
    const itens: ItemChamadaPresenca[] = this.casaisAtivos().map((c) => {
      const pExistente = presencasMap.get(c.id);
      return {
        casalId: c.id,
        nomeCasal: `${c.esposo.nomeCompleto} & ${c.esposa.nomeCompleto}`,
        status: pExistente ? pExistente.status : 'PRESENTE',
        observacao: pExistente?.observacao || '',
      };
    });

    this.itensChamada.set(itens);
    this.modalPresencaAberto.set(true);
  }

  fecharModalPresenca(): void {
    this.modalPresencaAberto.set(false);
    this.reuniaoSelecionada.set(null);
  }

  aoSelecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const arquivos = Array.from(input.files);
      this.carregandoFotosReuniao.set(true);

      const promessas = arquivos.map((file) => {
        return new Promise<void>((resolve) => {
          if (file.size > 3 * 1024 * 1024) {
            alert(`A foto ${file.name} excede o limite de 3MB.`);
            resolve();
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            const fotoUrl = e.target?.result as string;
            if (fotoUrl) {
              this.fotosPresenca.update((lista) => [...lista, fotoUrl]);
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promessas).then(() => {
        this.carregandoFotosReuniao.set(false);
      });
    }
  }

  removerFoto(index: number): void {
    this.fotosPresenca.update((lista) => lista.filter((_, i) => i !== index));
  }

  visualizarFoto(url: string): void {
    this.fotoZoom.set(url);
  }

  salvarPresencas(e: Event): void {
    e.preventDefault();
    const r = this.reuniaoSelecionada();
    if (!r) return;

    const payload: RegistroPresencaRequest = {
      scePresente: this.formPresenca.scePresente,
      anotacoesCre: this.formPresenca.anotacoesCre,
      fotos: this.fotosPresenca(),
      presencas: this.itensChamada().map((item) => ({
        casalId: item.casalId,
        status: item.status,
        observacao: item.observacao || undefined,
      })),
    };

    this.salvando.set(true);
    this.reuniaoService.registrarPresencas(r.id, payload).subscribe({
      next: () => {
        this.salvando.set(false);
        this.fecharModalPresenca();
        this.carregarReunioes();
      },
      error: (err) => {
        this.salvando.set(false);
        alert(err.error?.message || 'Erro ao registrar presenças e ata');
      },
    });
  }

  excluirReuniao(r: ReuniaoDto): void {
    if (confirm(`Deseja excluir o agendamento da reunião de ${this.formatarData(r.data)}?`)) {
      this.reuniaoService.excluir(r.id).subscribe({
        next: () => this.carregarReunioes(),
        error: (err) => alert(err.error?.message || 'Erro ao excluir reunião'),
      });
    }
  }

  // Ações do Roteiro Litúrgico
  abrirModalRoteiro(r: ReuniaoDto): void {
    this.reuniaoRoteiro.set(r);
    this.modalRoteiroAberto.set(true);
  }

  fecharModalRoteiro(): void {
    this.modalRoteiroAberto.set(false);
    this.reuniaoRoteiro.set(null);
  }

  imprimirRoteiro(): void {
    window.print();
  }

  // Ações do Tema do Ano
  obterTemaDaReuniao(data?: string): string {
    const eq = this.detalheEquipe();
    if (!eq) return 'Não cadastrado';
    if (data) {
      const ano = parseInt(data.split('-')[0], 10);
      if (ano && eq.temasAnuais && eq.temasAnuais.length > 0) {
        const encontrado = eq.temasAnuais.find((t) => t.ano === ano);
        if (encontrado?.tema) return encontrado.tema;
      }
    }
    if (eq.temasAnuais && eq.temasAnuais.length > 0) {
      return eq.temasAnuais[0].tema;
    }
    return eq.temaEstudoAno || 'Não cadastrado';
  }

  abrirModalTema(): void {
    const anoAtual = new Date().getFullYear();
    this.temaAnoInput = anoAtual;
    const eq = this.detalheEquipe();
    const temaExistente = eq?.temasAnuais?.find((t) => t.ano === anoAtual);
    this.temaInput = temaExistente?.tema || eq?.temaEstudoAno || '';
    this.modalTemaAberto.set(true);
  }

  fecharModalTema(): void {
    this.modalTemaAberto.set(false);
  }

  salvarTema(e: Event): void {
    e.preventDefault();
    const equipe = this.detalheEquipe();
    if (!equipe) return;

    this.salvandoTema.set(true);

    const temasExistentes = [...(equipe.temasAnuais || [])];
    const anoAlvo = Number(this.temaAnoInput);
    const idx = temasExistentes.findIndex((t) => t.ano === anoAlvo);
    if (idx >= 0) {
      temasExistentes[idx] = { ano: anoAlvo, tema: this.temaInput.trim() };
    } else {
      temasExistentes.push({ ano: anoAlvo, tema: this.temaInput.trim() });
    }
    temasExistentes.sort((a, b) => b.ano - a.ano);

    this.equipeService
      .atualizar(equipe.id, {
        numero: equipe.numero,
        nomeDevocao: equipe.nomeDevocao,
        superRegiaoId: equipe.superRegiao?.id || '',
        provinciaId: equipe.provincia?.id || '',
        regiaoId: equipe.regiao?.id || '',
        setorId: equipe.setor?.id || '',
        dataFundacao: equipe.dataFundacao,
        emPilotagem: equipe.emPilotagem,
        dataInicioPilotagem: equipe.dataInicioPilotagem,
        dataTerminoPilotagem: equipe.dataTerminoPilotagem,
        status: equipe.status,
        sceId: equipe.sceId,
        estado: equipe.estado,
        municipio: equipe.municipio,
        temaEstudoAno: this.temaInput.trim(),
        temasAnuais: temasExistentes,
      })
      .subscribe({
        next: (atualizada) => {
          this.salvandoTema.set(false);
          this.detalheEquipe.set(atualizada);
          this.fecharModalTema();
        },
        error: (err) => {
          this.salvandoTema.set(false);
          alert(err.error?.message || 'Erro ao salvar tema do ano');
        },
      });
  }

  aniversariantesDoMes(dataReuniao?: string): string[] {
    if (!dataReuniao) return [];
    const partes = dataReuniao.split('-');
    if (partes.length < 2) return [];
    const mesReuniao = partes[1];

    const lista: string[] = [];
    const casais = this.casaisAtivos();

    for (const c of casais) {
      if (c.dataMatrimonio) {
        const pCasam = c.dataMatrimonio.split('-');
        if (pCasam[1] === mesReuniao) {
          lista.push(`${pCasam[2]}/${pCasam[1]} — Casamento de ${c.esposo.nomeCompleto} & ${c.esposa.nomeCompleto}`);
        }
      }
      if (c.esposo.dataNascimento) {
        const pEsposo = c.esposo.dataNascimento.split('-');
        if (pEsposo[1] === mesReuniao) {
          lista.push(`${pEsposo[2]}/${pEsposo[1]} — Nascimento de ${c.esposo.nomeCompleto}`);
        }
      }
      if (c.esposa.dataNascimento) {
        const pEsposa = c.esposa.dataNascimento.split('-');
        if (pEsposa[1] === mesReuniao) {
          lista.push(`${pEsposa[2]}/${pEsposa[1]} — Nascimento de ${c.esposa.nomeCompleto}`);
        }
      }
    }

    return lista;
  }

  obterMesAno(data?: string): string {
    if (!data) return 'Mês Atual';
    const partes = data.split('-');
    if (partes.length < 2) return data;
    const mesIdx = parseInt(partes[1], 10);
    const meses = [
      '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const nomeMes = meses[mesIdx] || partes[1];
    return `${nomeMes} de ${partes[0]}`;
  }

  formatarData(iso?: string): string {
    if (!iso) return '—';
    const partes = iso.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return iso;
  }

  formatarEndereco(end?: Endereco): string {
    if (!end) return 'Endereço sem detalhes';
    const partes = [
      end.logradouro ? `${end.logradouro}${end.numero ? ', ' + end.numero : ''}` : '',
      end.complemento,
      end.bairro,
      end.cidade && end.uf ? `${end.cidade} - ${end.uf}` : end.cidade,
      end.cep ? `CEP: ${end.cep}` : '',
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(' — ') : 'Endereço sem detalhes';
  }
}
