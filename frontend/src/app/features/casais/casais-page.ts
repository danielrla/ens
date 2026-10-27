import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CasalDto,
  CasalRequest,
  CasalService,
  Filho,
  MandatoDto,
  MovimentacaoDto,
  MovimentacaoRequest,
  StatusCasal,
  TipoMovimentacao,
} from '../../core/casal.service';
import { EquipeResumoDto, EquipeService } from '../../core/equipe.service';
import { mascararCpf, mascararTelefone, desmascarar } from '../../core/mascara.util';
import { EnsDatePipe } from '../../core/ens-date.pipe';

@Component({
  selector: 'app-casais-page',
  imports: [CommonModule, FormsModule, EnsDatePipe],
  template: `
    <header class="cabecalho">
      <div>
        <h1>Gestão de Casais e Membros</h1>
        <p class="serifa">Registro cadastral conforme o Quadrante oficial das Equipes de Nossa Senhora.</p>
      </div>
      <button type="button" class="btn btn-primario" (click)="abrirModalNovo()">
        + Novo Casal
      </button>
    </header>

    <!-- Barra de busca e filtros -->
    <section class="cartao barra-busca">
      <div class="campo flex-1">
        <label for="busca-nome">Buscar por Nome ou WhatsApp</label>
        <input
          id="busca-nome"
          type="search"
          placeholder="Ex: João, Maria ou (65) 99999..."
          [(ngModel)]="termoBusca"
          (keyup.enter)="buscar()"
        />
      </div>
      <div class="campo flex-1">
        <label for="filtro-equipe">Equipe</label>
        <select id="filtro-equipe" [(ngModel)]="equipeFiltro" (change)="buscar()">
          <option value="">Todas as Equipes</option>
          @for (eq of equipesDisponiveis(); track eq.id) {
            <option [value]="eq.id">Equipe {{ eq.numero | number:'2.0-0' }} — {{ eq.nomeDevocao || 'Nossa Senhora' }}</option>
          }
        </select>
      </div>
      <div class="campo">
        <label for="filtro-status-casal">Status</label>
        <select id="filtro-status-casal" [(ngModel)]="statusFiltro" (change)="buscar()">
          <option value="">Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="EM_PILOTAGEM">Em Pilotagem</option>
          <option value="LICENCIADO">Licenciado</option>
          <option value="EMERITO">Emérito</option>
          <option value="VIUVO">Viúvo(a)</option>
          <option value="INATIVO">Inativo</option>
        </select>
      </div>
      <button type="button" class="btn btn-primario" (click)="buscar()">Buscar</button>
    </section>

    <!-- Listagem em Tabela Moderna com 4 Colunas Principais -->
    <section class="cartao container-tabela">
      @if (carregando()) {
        <p class="estado-info">Carregando casais...</p>
      } @else if (casais().length === 0) {
        <div class="estado-vazio">
          <p>Nenhum casal encontrado com os filtros selecionados.</p>
        </div>
      } @else {
        <div class="tabela-responsiva">
          <table class="tabela-ens">
            <thead>
              <tr>
                <th>Casal (Esposo & Esposa)</th>
                <th>Contatos / WhatsApp</th>
                <th>Status</th>
                <th>Equipe</th>
                <th class="texto-direita">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (c of casais(); track c.id) {
                <tr>
                  <td>
                    <div class="col-casal-container">
                      @if (c.fotoUrl) {
                        <img [src]="c.fotoUrl" [alt]="c.esposo.nomeCompleto" class="avatar-casal" />
                      } @else {
                        <div class="avatar-casal avatar-casal-padrao">👥</div>
                      }
                      <div class="col-casal-info">
                        <div class="info-casal">
                          <strong>{{ c.esposo.nomeCompleto }}</strong>
                          <span class="separador-e">&</span>
                          <strong>{{ c.esposa.nomeCompleto }}</strong>
                        </div>
                        <div class="datas-aniversario">
                          @if (c.esposo.dataNascimento) {
                            <small class="texto-suave">Nasc. Ele: {{ c.esposo.dataNascimento | ensDate }}</small>
                          }
                          @if (c.esposa.dataNascimento) {
                            <small class="texto-suave"> | Nasc. Ela: {{ c.esposa.dataNascimento | ensDate }}</small>
                          }
                        </div>
                        @if (c.esposo.dataFalecimento || c.esposa.dataFalecimento) {
                          <div class="aviso-falecimento">
                            @if (c.esposo.dataFalecimento) {
                              <span class="tag-luto">🕊️ Falec. Ele: {{ c.esposo.dataFalecimento | ensDate }}</span>
                            }
                            @if (c.esposa.dataFalecimento) {
                              <span class="tag-luto">🕊️ Falec. Ela: {{ c.esposa.dataFalecimento | ensDate }}</span>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="contato-item">
                      @if (c.esposo.celular) {
                        <a [href]="gerarLinkWhatsApp(c.esposo.celular)" target="_blank" class="link-whatsapp" title="Conversar no WhatsApp com o Esposo">
                          💬 {{ formatarTelefone(c.esposo.celular) }} (Ele)
                        </a>
                      } @else {
                        <span class="texto-suave">— (Ele)</span>
                      }
                    </div>
                    <div class="contato-item">
                      @if (c.esposa.celular) {
                        <a [href]="gerarLinkWhatsApp(c.esposa.celular)" target="_blank" class="link-whatsapp" title="Conversar no WhatsApp com a Esposa">
                          💬 {{ formatarTelefone(c.esposa.celular) }} (Ela)
                        </a>
                      } @else {
                        <span class="texto-suave">— (Ela)</span>
                      }
                    </div>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class.badge-dourado]="c.status === 'ATIVO'"
                      [class.badge-viuvo]="c.status === 'VIUVO'"
                      [class.badge-inativo]="c.status === 'INATIVO'"
                    >
                      {{ c.status }}
                    </span>
                  </td>
                  <td>
                    @if (c.nomeEquipe) {
                      <strong class="nome-equipe-link">{{ c.nomeEquipe }}</strong>
                    } @else {
                      <span class="texto-suave">— Sem equipe</span>
                    }
                  </td>
                  <td class="texto-direita acoes-linha">
                    <button type="button" class="btn-acao-icone" title="Histórico de Mandatos e Movimentações" (click)="abrirModalHistorico(c)">
                      📜 Histórico
                    </button>
                    <button type="button" class="btn-acao-icone" title="Registrar Remanejamento ou Saída" (click)="abrirModalMovimentacao(c)">
                      🔄 Movimentar
                    </button>
                    <button type="button" class="btn-icone" title="Editar" (click)="editar(c)">✏️</button>
                    @if (c.status !== 'INATIVO') {
                      <button type="button" class="btn-icone" title="Inativar" (click)="inativar(c)">🚫</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    <!-- Modal de Cadastro / Edição com Ficha do Quadrante -->
    @if (modalAberto()) {
      <div class="overlay-modal" (click)="fecharModal()">
        <div class="modal-dialog cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <h2>{{ modoEdicao() ? 'Editar Ficha do Casal' : 'Cadastrar Novo Casal' }}</h2>
            <small class="texto-suave">Campos oficiais do Quadrante ENS</small>
          </div>
          <form (submit)="salvar($event)" class="form-grid">
            <!-- Seção de Foto do Casal -->
            <div class="bloco-foto-modal">
              @if (fotoCasalCarregando()) {
                <div class="foto-placeholder-casal foto-carregando">
                  <div class="spinner-sm"></div>
                </div>
                <small class="texto-carregando-anexo">Carregando anexo...</small>
              } @else if (formCasal.fotoUrl) {
                <div class="preview-anexo-container">
                  <img [src]="formCasal.fotoUrl" alt="Foto do Casal" class="foto-preview-casal" />
                  <span class="badge-anexo-sucesso">✓ Anexo carregado</span>
                </div>
                <button type="button" class="btn-remover-foto" (click)="removerFotoCasal()">✕ Remover Foto</button>
              } @else {
                <div class="foto-placeholder-casal">👥</div>
                <label for="input-foto-casal-admin" class="btn-upload-foto">
                  📷 Incluir Foto do Casal
                </label>
                <input
                  id="input-foto-casal-admin"
                  type="file"
                  accept="image/*"
                  (click)="$any($event.target).value = null"
                  (change)="aoSelecionarFotoCasal($event)"
                  style="display: none"
                />
              }
            </div>

            <!-- Dados do Esposo -->
            <fieldset class="grupo-form">
              <legend>Dados do Esposo (Ele)</legend>
              <div class="campo">
                <label>Nome Completo <span class="obrigatorio">*</span></label>
                <input required [(ngModel)]="formCasal.esposo.nomeCompleto" name="esposoNome" />
              </div>
              <div class="campo">
                <label>CPF <span class="obrigatorio">*</span></label>
                <input
                  required
                  [ngModel]="formCasal.esposo.cpf"
                  (input)="aoDigitarCpf($event, 'esposo')"
                  name="esposoCpf"
                  placeholder="000.000.000-00"
                  maxlength="14"
                />
              </div>
              <div class="campo">
                <label>Data de Nascimento</label>
                <input type="date" [(ngModel)]="formCasal.esposo.dataNascimento" name="esposoNasc" />
              </div>
              <div class="campo">
                <label>Data de Falecimento (se falecido)</label>
                <input type="date" [(ngModel)]="formCasal.esposo.dataFalecimento" name="esposoFalec" />
              </div>
              <div class="campo">
                <label>Profissão</label>
                <input [(ngModel)]="formCasal.esposo.profissao" name="esposoProfissao" placeholder="Ex: Empresário, Engenheiro" />
              </div>
              <div class="campo">
                <label>Celular / WhatsApp</label>
                <input
                  [ngModel]="formCasal.esposo.celular"
                  (input)="aoDigitarTelefone($event, 'esposo')"
                  name="esposoCelular"
                  placeholder="(65) 99999-9999"
                  maxlength="15"
                />
              </div>
              <div class="campo">
                <label>E-mail</label>
                <input type="email" [(ngModel)]="formCasal.esposo.email" name="esposoEmail" />
              </div>
            </fieldset>

            <!-- Dados da Esposa -->
            <fieldset class="grupo-form">
              <legend>Dados da Esposa (Ela)</legend>
              <div class="campo">
                <label>Nome Completo <span class="obrigatorio">*</span></label>
                <input required [(ngModel)]="formCasal.esposa.nomeCompleto" name="esposaNome" />
              </div>
              <div class="campo">
                <label>CPF <span class="obrigatorio">*</span></label>
                <input
                  required
                  [ngModel]="formCasal.esposa.cpf"
                  (input)="aoDigitarCpf($event, 'esposa')"
                  name="esposaCpf"
                  placeholder="000.000.000-00"
                  maxlength="14"
                />
              </div>
              <div class="campo">
                <label>Data de Nascimento</label>
                <input type="date" [(ngModel)]="formCasal.esposa.dataNascimento" name="esposaNasc" />
              </div>
              <div class="campo">
                <label>Data de Falecimento (se falecida)</label>
                <input type="date" [(ngModel)]="formCasal.esposa.dataFalecimento" name="esposaFalec" />
              </div>
              <div class="campo">
                <label>Profissão</label>
                <input [(ngModel)]="formCasal.esposa.profissao" name="esposaProfissao" placeholder="Ex: Professora, Advogada" />
              </div>
              <div class="campo">
                <label>Celular / WhatsApp</label>
                <input
                  [ngModel]="formCasal.esposa.celular"
                  (input)="aoDigitarTelefone($event, 'esposa')"
                  name="esposaCelular"
                  placeholder="(65) 99999-9999"
                  maxlength="15"
                />
              </div>
              <div class="campo">
                <label>E-mail</label>
                <input type="email" [(ngModel)]="formCasal.esposa.email" name="esposaEmail" />
              </div>
            </fieldset>

            <!-- Matrimônio e Vida Eclesial -->
            <fieldset class="grupo-form">
              <legend>Matrimônio e Vida Eclesial</legend>
              <div class="campo">
                <label>Data do Matrimônio</label>
                <input type="date" [(ngModel)]="formCasal.dataMatrimonio" name="dataMatrimonio" />
              </div>
              <div class="campo">
                <label>Paróquia / Igreja onde casou</label>
                <input [(ngModel)]="formCasal.paroquiaCasamento" name="paroquiaCasamento" placeholder="Ex: Paróquia N. Sra. do Carmo - Cuiabá" />
              </div>
              <div class="campo">
                <label>Recebem a Carta Mensal?</label>
                <select [(ngModel)]="formCasal.recebeCartaMensal" name="recebeCartaMensal">
                  <option value="SIM">Sim (Impresso)</option>
                  <option value="No grupo por PDF">No grupo por PDF</option>
                  <option value="NÃO">Não</option>
                </select>
              </div>
              <div class="campo">
                <label>Status Cadastral</label>
                <select [(ngModel)]="formCasal.status" name="status">
                  <option value="ATIVO">Ativo</option>
                  <option value="EM_PILOTAGEM">Em Pilotagem</option>
                  <option value="LICENCIADO">Licenciado</option>
                  <option value="EMERITO">Emérito</option>
                  <option value="VIUVO">Viúvo(a)</option>
                </select>
              </div>
            </fieldset>

            <!-- Filhos do Casal -->
            <fieldset class="grupo-form-filhos">
              <div class="filhos-topo">
                <legend>Filhos do Casal</legend>
                <button type="button" class="btn btn-fantasma btn-sm" (click)="adicionarFilho()">
                  + Adicionar Filho
                </button>
              </div>
              @if (!formCasal.filhos || formCasal.filhos.length === 0) {
                <p class="texto-suave texto-centro">Nenhum filho registrado.</p>
              } @else {
                <div class="grade-filhos">
                  @for (filho of formCasal.filhos; track $index) {
                    <div class="linha-filho">
                      <div class="foto-filho-wrapper">
                        @if (filhoCarregandoFoto()[$index]) {
                          <div class="avatar-filho-carregando" title="Carregando foto do filho...">
                            <div class="spinner-sm"></div>
                          </div>
                        } @else if (filho.fotoUrl) {
                          <img [src]="filho.fotoUrl" [alt]="filho.nome" class="avatar-filho-form" />
                          <span class="badge-anexo-filho-ok" title="Anexo carregado">✓</span>
                          <button type="button" class="btn-remover-foto-filho" title="Remover anexo do filho" (click)="removerFotoFilho($index)">✕</button>
                        } @else {
                          <label [for]="'input-foto-filho-adm-' + $index" class="btn-anexar-foto-filho" title="Adicionar foto (anexo)">
                            📷
                          </label>
                          <input
                            [id]="'input-foto-filho-adm-' + $index"
                            type="file"
                            accept="image/*"
                            (click)="$any($event.target).value = null"
                            (change)="aoSelecionarFotoFilho($event, $index)"
                            style="display: none"
                          />
                        }
                      </div>
                      <div class="campo flex-2">
                        <label>Nome do Filho <span class="obrigatorio">*</span></label>
                        <input [(ngModel)]="filho.nome" [name]="'filhoNome_' + $index" placeholder="Ex: Lucas" required />
                      </div>
                      <div class="campo flex-1">
                        <label>Nascimento</label>
                        <input type="date" [(ngModel)]="filho.dataNascimento" [name]="'filhoNasc_' + $index" />
                      </div>
                      <button type="button" class="btn-excluir-filho" title="Remover filho" (click)="removerFilho($index)">
                        ✕
                      </button>
                    </div>
                  }
                </div>
              }
            </fieldset>

            <div class="modal-acoes">
              <button type="button" class="btn btn-fantasma" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn btn-primario">Salvar no Quadrante</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Histórico do Casal (Mandatos e Movimentações) -->
    @if (modalHistoricoAberto() && casalSelecionado()) {
      <div class="overlay-modal" (click)="fecharModalHistorico()">
        <div class="modal-dialog modal-largo cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <div>
              <h2>Histórico do Casal</h2>
              <p class="texto-suave">{{ casalSelecionado()?.esposo?.nomeCompleto }} & {{ casalSelecionado()?.esposa?.nomeCompleto }}</p>
            </div>
            <button type="button" class="btn-fechar" (click)="fecharModalHistorico()">✕</button>
          </div>

          <!-- Seção de Mandatos Exercidos -->
          <section class="secao-historico">
            <h3>Mandatos e Funções Exercidas na Estrutura ENS</h3>
            <p class="texto-suave-descricao">O casal mantém sua equipe base enquanto serve acumulando responsabilidades nas instâncias.</p>
            @if (carregandoHistorico()) {
              <p class="estado-info">Carregando mandatos...</p>
            } @else if (mandatosHistorico().length === 0) {
              <p class="texto-suave">Nenhum mandato registrado formalmente para este casal.</p>
            } @else {
              <div class="tabela-responsiva">
                <table class="tabela-ens">
                  <thead>
                    <tr>
                      <th>Função / Responsabilidade</th>
                      <th>Nível da Instância</th>
                      <th>Instância Vinculada</th>
                      <th>Início</th>
                      <th>Término</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of mandatosHistorico(); track m.id) {
                      <tr>
                        <td><strong>{{ m.funcao }}</strong></td>
                        <td><span class="badge">{{ m.nivelInstancia }}</span></td>
                        <td>{{ m.nomeInstancia || '—' }}</td>
                        <td>{{ m.dataInicio | ensDate }}</td>
                        <td>
                          @if (m.dataEncerramentoEfetivo) {
                            {{ m.dataEncerramentoEfetivo | ensDate }}
                          } @else if (m.dataPrevistaTermino) {
                            {{ m.dataPrevistaTermino | ensDate }}
                          } @else {
                            Vigente
                          }
                        </td>
                        <td>
                          <span class="badge" [class.badge-dourado]="m.status === 'VIGENTE'" [class.badge-inativo]="m.status === 'INTERROMPIDO_ANTECIPADAMENTE'">
                            {{ m.status }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>

          <!-- Seção de Movimentações de Equipe -->
          <section class="secao-historico">
            <h3>Histórico de Movimentações e Remanejamentos de Equipe</h3>
            @if (carregandoHistorico()) {
              <p class="estado-info">Carregando movimentações...</p>
            } @else if (movimentacoesHistorico().length === 0) {
              <p class="texto-suave">Nenhuma movimentação ou saída registrada para este casal.</p>
            } @else {
              <div class="tabela-responsiva">
                <table class="tabela-ens">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Origem → Destino</th>
                      <th>Motivo Registrado</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (mov of movimentacoesHistorico(); track mov.id) {
                      <tr>
                        <td>{{ mov.data | ensDate }}</td>
                        <td><span class="badge badge-tipo-mov">{{ formatarTipoMov(mov.tipo) }}</span></td>
                        <td>
                          <span>{{ mov.nomeEquipeOrigem || 'Equipe anterior' }}</span>
                          @if (mov.nomeEquipeDestino) {
                            <span> → <strong>{{ mov.nomeEquipeDestino }}</strong></span>
                          }
                        </td>
                        <td><em>{{ mov.motivo }}</em></td>
                        <td><small class="texto-suave">{{ mov.observacoes || '—' }}</small></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>
        </div>
      </div>
    }

    <!-- Modal Registrar Movimentação / Remanejamento / Saída -->
    @if (modalMovimentacaoAberto() && casalSelecionado()) {
      <div class="overlay-modal" (click)="fecharModalMovimentacao()">
        <div class="modal-dialog cartao" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <div>
              <h2>Registrar Movimentação de Equipe</h2>
              <p class="texto-suave">{{ casalSelecionado()?.esposo?.nomeCompleto }} & {{ casalSelecionado()?.esposa?.nomeCompleto }}</p>
            </div>
            <button type="button" class="btn-fechar" (click)="fecharModalMovimentacao()">✕</button>
          </div>

          <form (submit)="salvarMovimentacao($event)" class="form-grid">
            <div class="linha-dupla">
              <div class="campo">
                <label>Tipo de Movimentação <span class="obrigatorio">*</span></label>
                <select [(ngModel)]="formMovimentacao.tipo" name="tipoMov" required>
                  <option value="TRANSFERENCIA">Transferência para Outra Equipe</option>
                  <option value="SAIDA">Saída da Equipe (Inativação)</option>
                  <option value="LICENCA">Licença Temporária</option>
                  <option value="RETORNO">Retorno de Licença</option>
                  <option value="FALECIMENTO">Falecimento de Cônjuge</option>
                </select>
              </div>
              <div class="campo">
                <label>Data da Movimentação <span class="obrigatorio">*</span></label>
                <input type="date" required [(ngModel)]="formMovimentacao.data" name="dataMov" />
              </div>
            </div>

            @if (formMovimentacao.tipo === 'TRANSFERENCIA') {
              <div class="campo">
                <label>Equipe de Destino <span class="obrigatorio">*</span></label>
                <select [(ngModel)]="formMovimentacao.equipeDestinoId" name="equipeDestino" required>
                  <option value="">Selecione a nova equipe...</option>
                  @for (eq of equipesDisponiveis(); track eq.id) {
                    <option [value]="eq.id">Equipe {{ eq.numero | number:'2.0-0' }} — {{ eq.nomeDevocao || 'Nossa Senhora' }}</option>
                  }
                </select>
              </div>
            }

            <div class="campo">
              <label>Motivo da Movimentação <span class="obrigatorio">*</span></label>
              <textarea
                required
                rows="3"
                [(ngModel)]="formMovimentacao.motivo"
                name="motivoMov"
                placeholder="Descreva obrigatoriamente a razão da saída, transferência ou licença..."
              ></textarea>
            </div>

            <div class="campo">
              <label>Observações Adicionais</label>
              <input [(ngModel)]="formMovimentacao.observacoes" name="obsMov" placeholder="Detalhes complementares" />
            </div>

            <div class="modal-acoes">
              <button type="button" class="btn btn-fantasma" (click)="fecharModalMovimentacao()">Cancelar</button>
              <button type="submit" class="btn btn-primario" [disabled]="salvandoMovimentacao()">
                {{ salvandoMovimentacao() ? 'Registrando...' : 'Confirmar e Registrar' }}
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
    .cabecalho h1 {
      color: var(--azul-900);
      font-size: clamp(1.4rem, 3vw, 1.8rem);
    }
    .barra-busca {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .flex-1 { flex: 1; min-width: 200px; }
    .flex-2 { flex: 2; min-width: 200px; }
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
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--borda);
      font-size: 0.875rem;
      vertical-align: top;
    }
    .tabela-ens tr:hover td {
      background: rgba(241, 245, 249, 0.6);
    }
    .col-casal-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .col-casal-info {
      display: flex;
      flex-direction: column;
    }
    .avatar-casal {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e2e8f0;
      flex-shrink: 0;
    }
    .avatar-casal-padrao {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      font-size: 1.1rem;
    }
    .bloco-foto-modal {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0 1rem;
      border-bottom: 1px solid var(--borda);
    }
    .foto-preview-casal {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #d97706;
    }
    .foto-placeholder-casal {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: var(--fundo-claro);
      border: 2px dashed #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
    }
    .btn-upload-foto {
      cursor: pointer;
      font-size: 0.8rem;
      color: #1e3a8a;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-weight: 500;
      transition: background 0.15s;
    }
    .preview-anexo-container {
      position: relative;
      display: inline-block;
    }
    .badge-anexo-sucesso {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      background: #16a34a;
      color: #ffffff;
      font-size: 0.65rem;
      padding: 1px 6px;
      border-radius: 999px;
      white-space: nowrap;
      font-weight: 600;
      border: 1px solid #ffffff;
    }
    .badge-anexo-filho-ok {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #16a34a;
      color: #ffffff;
      font-size: 0.65rem;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      border: 1px solid #ffffff;
    }
    .avatar-filho-carregando {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed var(--azul-600);
      color: var(--azul-600);
    }
    .texto-carregando-anexo {
      color: var(--azul-600);
      font-weight: 600;
      font-size: 0.8rem;
    }
    .btn-upload-foto:hover {
      background: #dbeafe;
    }
    .btn-remover-foto {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .info-casal {
      display: flex;
      gap: 0.35rem;
      align-items: center;
      color: var(--azul-900);
    }
    .separador-e { color: var(--ambar-600); font-weight: bold; }
    .datas-aniversario { margin-top: 0.2rem; }
    .aviso-falecimento {
      margin-top: 0.35rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .tag-luto {
      font-size: 0.75rem;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }
    .texto-direita { text-align: right; }
    .texto-centro { text-align: center; }
    .texto-suave { color: var(--texto-suave); font-size: 0.85rem; }
    .texto-suave-descricao {
      color: var(--texto-suave);
      font-size: 0.85rem;
      margin: 0 0 0.75rem;
    }
    .badge-inativo { background: #fee2e2; color: #dc2626; }
    .badge-viuvo { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .badge-tipo-mov { background: #e0f2fe; color: #0369a1; }
    .badge-carta {
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .lista-filhos-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }
    .tag-filho {
      background: var(--fundo-claro);
      border: 1px solid var(--borda);
      border-radius: 999px;
      padding: 0.1rem 0.5rem;
      font-size: 0.75rem;
      color: var(--texto);
    }
    .contato-item {
      font-size: 0.85rem;
      margin-bottom: 0.2rem;
    }
    .link-whatsapp {
      color: #059669;
      text-decoration: none;
      font-weight: 500;
    }
    .link-whatsapp:hover {
      text-decoration: underline;
    }
    .nome-equipe-link {
      color: var(--azul-900);
      font-size: 0.85rem;
    }
    .acoes-linha {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.4rem;
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

    /* Modal */
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
      max-width: 760px;
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
      color: var(--azul-900);
      margin: 0;
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
      gap: 1.25rem;
    }
    .linha-dupla {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .grupo-form {
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 0.85rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }
    .grupo-form legend,
    .grupo-form-filhos legend {
      padding: 0 0.4rem;
      font-weight: 600;
      color: var(--azul-900);
      font-size: 0.85rem;
    }
    .grupo-form-filhos {
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 0.85rem;
    }
    .filhos-topo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .btn-sm {
      padding: 0.3rem 0.6rem;
      font-size: 0.75rem;
    }
    .grade-filhos {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .linha-filho {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      background: var(--fundo-claro);
      padding: 0.5rem;
      border-radius: var(--raio-sm);
    }
    .btn-excluir-filho {
      background: transparent;
      border: none;
      color: var(--erro);
      cursor: pointer;
      font-weight: bold;
      padding: 0.5rem;
      border-radius: 4px;
    }
    .btn-excluir-filho:hover {
      background: #fee2e2;
    }
    .foto-filho-wrapper {
      position: relative;
      width: 42px;
      height: 42px;
      flex-shrink: 0;
    }
    .avatar-filho-form {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--azul-600);
    }
    .btn-remover-foto-filho {
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
    .btn-anexar-foto-filho {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--superficie);
      border: 1px dashed var(--borda);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.15rem;
      transition: border-color 0.15s, background 0.15s;
    }
    .btn-anexar-foto-filho:hover {
      border-color: var(--azul-600);
      background: var(--azul-100);
    }
    .avatar-filho-tabela {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 0.3rem;
      border: 1px solid var(--borda);
    }
    .modal-acoes {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .secao-historico {
      margin-bottom: 1.5rem;
    }
    .secao-historico h3 {
      font-size: 1rem;
      color: var(--azul-900);
      margin: 0 0 0.35rem;
    }
  `,
})
export class CasaisPage {
  private readonly casalService = inject(CasalService);
  private readonly equipeService = inject(EquipeService);

  protected termoBusca = '';
  protected statusFiltro = '';
  protected equipeFiltro = '';
  protected carregando = signal(false);
  protected casais = signal<CasalDto[]>([]);
  protected modalAberto = signal(false);
  protected modoEdicao = signal(false);
  protected idEdicao: string | null = null;
  protected fotoCasalCarregando = signal(false);
  protected filhoCarregandoFoto = signal<Record<number, boolean>>({});

  // Modais de Histórico e Movimentação
  protected casalSelecionado = signal<CasalDto | null>(null);
  protected modalHistoricoAberto = signal(false);
  protected mandatosHistorico = signal<MandatoDto[]>([]);
  protected movimentacoesHistorico = signal<MovimentacaoDto[]>([]);
  protected carregandoHistorico = signal(false);

  protected modalMovimentacaoAberto = signal(false);
  protected salvandoMovimentacao = signal(false);
  protected equipesDisponiveis = signal<EquipeResumoDto[]>([]);
  protected formMovimentacao: MovimentacaoRequest = {
    tipo: 'TRANSFERENCIA',
    motivo: '',
    data: new Date().toISOString().substring(0, 10),
    equipeDestinoId: '',
    observacoes: '',
  };

  protected formCasal: CasalRequest = this.criarFormVazio();

  constructor() {
    this.carregarEquipes();
    this.buscar();
  }

  carregarEquipes(): void {
    this.equipeService.listar({ size: 100 }).subscribe({
      next: (res) => this.equipesDisponiveis.set(res.content),
    });
  }

  buscar(): void {
    this.carregando.set(true);
    const status = this.statusFiltro ? (this.statusFiltro as StatusCasal) : undefined;
    const equipeId = this.equipeFiltro ? this.equipeFiltro : undefined;
    this.casalService.listar({ busca: this.termoBusca, status, equipeId }).subscribe({
      next: (res) => {
        this.casais.set(res.content);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  gerarLinkWhatsApp(tel?: string): string {
    if (!tel) return '#';
    const limpo = tel.replace(/\D/g, '');
    const ddi = limpo.length <= 11 ? `55${limpo}` : limpo;
    return `https://wa.me/${ddi}`;
  }

  abrirModalNovo(): void {
    this.modoEdicao.set(false);
    this.idEdicao = null;
    this.formCasal = this.criarFormVazio();
    this.modalAberto.set(true);
  }

  editar(c: CasalDto): void {
    this.modoEdicao.set(true);
    this.idEdicao = c.id;
    this.formCasal = {
      esposo: {
        ...c.esposo,
        cpf: mascararCpf(c.esposo.cpf),
        celular: mascararTelefone(c.esposo.celular),
      },
      esposa: {
        ...c.esposa,
        cpf: mascararCpf(c.esposa.cpf),
        celular: mascararTelefone(c.esposa.celular),
      },
      fotoUrl: c.fotoUrl || '',
      dataMatrimonio: c.dataMatrimonio,
      paroquiaCasamento: c.paroquiaCasamento,
      recebeCartaMensal: c.recebeCartaMensal || 'SIM',
      status: c.status,
      equipeId: c.equipeId,
      filhos: c.filhos ? c.filhos.map((f) => ({ ...f, fotoUrl: f.fotoUrl || '' })) : [],
    };
    this.modalAberto.set(true);
  }

  aoSelecionarFotoCasal(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto deve ter no máximo 2MB.');
        return;
      }
      this.fotoCasalCarregando.set(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formCasal.fotoUrl = e.target?.result as string;
        this.fotoCasalCarregando.set(false);
      };
      reader.onerror = () => {
        this.fotoCasalCarregando.set(false);
        alert('Erro ao carregar a foto do casal.');
      };
      reader.readAsDataURL(file);
    }
  }

  removerFotoCasal(): void {
    this.formCasal.fotoUrl = '';
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  adicionarFilho(): void {
    if (!this.formCasal.filhos) {
      this.formCasal.filhos = [];
    }
    this.formCasal.filhos.push({ nome: '', dataNascimento: '', fotoUrl: '' });
  }

  removerFilho(index: number): void {
    if (this.formCasal.filhos) {
      this.formCasal.filhos.splice(index, 1);
    }
  }

  aoDigitarCpf(event: Event, pessoa: 'esposo' | 'esposa'): void {
    const input = event.target as HTMLInputElement;
    const formatado = mascararCpf(input.value);
    input.value = formatado;
    this.formCasal[pessoa].cpf = formatado;
  }

  aoDigitarTelefone(event: Event, pessoa: 'esposo' | 'esposa'): void {
    const input = event.target as HTMLInputElement;
    const formatado = mascararTelefone(input.value);
    input.value = formatado;
    this.formCasal[pessoa].celular = formatado;
  }

  aoSelecionarFotoFilho(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto do filho deve ter no máximo 2MB.');
        return;
      }
      this.filhoCarregandoFoto.update((m) => ({ ...m, [index]: true }));
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.formCasal.filhos && this.formCasal.filhos[index]) {
          this.formCasal.filhos[index].fotoUrl = e.target?.result as string;
        }
        this.filhoCarregandoFoto.update((m) => ({ ...m, [index]: false }));
      };
      reader.onerror = () => {
        this.filhoCarregandoFoto.update((m) => ({ ...m, [index]: false }));
        alert('Erro ao carregar a foto do filho.');
      };
      reader.readAsDataURL(file);
    }
  }

  removerFotoFilho(index: number): void {
    if (this.formCasal.filhos && this.formCasal.filhos[index]) {
      this.formCasal.filhos[index].fotoUrl = '';
    }
  }

  formatarTelefone(tel?: string): string {
    return mascararTelefone(tel);
  }

  formatarCpf(cpf?: string): string {
    return mascararCpf(cpf);
  }

  salvar(e: Event): void {
    e.preventDefault();

    // Sanitiza os campos removendo máscaras antes de enviar ao backend
    const payload: CasalRequest = {
      ...this.formCasal,
      esposo: {
        ...this.formCasal.esposo,
        cpf: desmascarar(this.formCasal.esposo.cpf),
        celular: desmascarar(this.formCasal.esposo.celular),
      },
      esposa: {
        ...this.formCasal.esposa,
        cpf: desmascarar(this.formCasal.esposa.cpf),
        celular: desmascarar(this.formCasal.esposa.celular),
      },
      filhos: (this.formCasal.filhos || []).map((f) => ({
        nome: f.nome,
        dataNascimento: f.dataNascimento || undefined,
        fotoUrl: f.fotoUrl || undefined,
      })),
    };

    if (this.modoEdicao() && this.idEdicao) {
      this.casalService.atualizar(this.idEdicao, payload).subscribe(() => {
        this.fecharModal();
        this.buscar();
      });
    } else {
      this.casalService.criar(payload).subscribe(() => {
        this.fecharModal();
        this.buscar();
      });
    }
  }

  inativar(c: CasalDto): void {
    const motivo = prompt(`Informe o motivo para inativar o casal ${c.esposo.nomeCompleto} & ${c.esposa.nomeCompleto}:`);
    if (motivo) {
      this.casalService.inativar(c.id, motivo).subscribe(() => this.buscar());
    }
  }

  abrirModalHistorico(c: CasalDto): void {
    this.casalSelecionado.set(c);
    this.modalHistoricoAberto.set(true);
    this.carregandoHistorico.set(true);

    this.casalService.listarMandatos(c.id).subscribe({
      next: (mandatos) => {
        this.mandatosHistorico.set(mandatos);
        this.casalService.listarMovimentacoes(c.id).subscribe({
          next: (movs) => {
            this.movimentacoesHistorico.set(movs);
            this.carregandoHistorico.set(false);
          },
          error: () => this.carregandoHistorico.set(false),
        });
      },
      error: () => this.carregandoHistorico.set(false),
    });
  }

  fecharModalHistorico(): void {
    this.modalHistoricoAberto.set(false);
    this.casalSelecionado.set(null);
  }

  abrirModalMovimentacao(c: CasalDto): void {
    this.casalSelecionado.set(c);
    this.formMovimentacao = {
      tipo: 'TRANSFERENCIA',
      motivo: '',
      data: new Date().toISOString().substring(0, 10),
      equipeDestinoId: '',
      observacoes: '',
    };
    this.modalMovimentacaoAberto.set(true);

    this.equipeService.listar({ size: 100 }).subscribe({
      next: (res) => this.equipesDisponiveis.set(res.content),
    });
  }

  fecharModalMovimentacao(): void {
    this.modalMovimentacaoAberto.set(false);
    this.casalSelecionado.set(null);
  }

  salvarMovimentacao(e: Event): void {
    e.preventDefault();
    const c = this.casalSelecionado();
    if (!c) return;

    if (!this.formMovimentacao.motivo.trim()) {
      alert('O motivo da movimentação é obrigatório.');
      return;
    }

    this.salvandoMovimentacao.set(true);
    this.casalService.registrarMovimentacao(c.id, this.formMovimentacao).subscribe({
      next: () => {
        this.salvandoMovimentacao.set(false);
        this.fecharModalMovimentacao();
        this.buscar();
      },
      error: (err) => {
        this.salvandoMovimentacao.set(false);
        alert(err.error?.message || 'Erro ao registrar movimentação');
      },
    });
  }

  formatarTipoMov(tipo?: TipoMovimentacao): string {
    switch (tipo) {
      case 'TRANSFERENCIA': return 'Transferência';
      case 'REMANEJAMENTO': return 'Remanejamento';
      case 'SAIDA':
      case 'SAIDA_VOLUNTARIA': return 'Saída da Equipe';
      case 'LICENCA': return 'Licença';
      case 'RETORNO': return 'Retorno';
      case 'FALECIMENTO': return 'Falecimento';
      default: return tipo || 'Movimentação';
    }
  }

  private criarFormVazio(): CasalRequest {
    return {
      esposo: { nomeCompleto: '', cpf: '', celular: '', email: '', dataNascimento: '', dataFalecimento: '', profissao: '' },
      esposa: { nomeCompleto: '', cpf: '', celular: '', email: '', dataNascimento: '', dataFalecimento: '', profissao: '' },
      fotoUrl: '',
      recebeCartaMensal: 'SIM',
      status: 'ATIVO',
      filhos: [],
    };
  }
}

