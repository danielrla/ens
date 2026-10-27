import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EstruturaService,
  NivelEstrutura,
  NoArvore,
  NoEstrutura,
  NoEstruturaRequest
} from '../../core/estrutura.service';

type AbaVisualizacao = 'PROVINCIA' | 'REGIAO' | 'SETOR' | 'SUPER_REGIAO' | 'ARVORE';

@Component({
  selector: 'app-estrutura-page',
  imports: [CommonModule, FormsModule],
  template: `
    <header class="cabecalho">
      <div>
        <h1>Estrutura Organizacional da ENS</h1>
        <p class="serifa">Organização e abrangência territorial das Equipes de Nossa Senhora no Brasil.</p>
      </div>
      <div class="acoes-cabecalho">
        <button type="button" class="btn btn-primario" (click)="abrirModalCriar()">
          + Novo Nó Territorial
        </button>
      </div>
    </header>

    @if (mensagemSucesso()) {
      <div class="alerta alerta-sucesso">
        {{ mensagemSucesso() }}
      </div>
    }

    @if (mensagemErro()) {
      <div class="alerta alerta-erro">
        {{ mensagemErro() }}
      </div>
    }

    <!-- Navegação de Abas -->
    <nav class="abas-navegacao" role="tablist">
      <button
        type="button"
        class="aba-item"
        [class.ativa]="abaAtiva() === 'PROVINCIA'"
        (click)="selecionarAba('PROVINCIA')"
      >
        🏛️ Províncias
      </button>
      <button
        type="button"
        class="aba-item"
        [class.ativa]="abaAtiva() === 'REGIAO'"
        (click)="selecionarAba('REGIAO')"
      >
        📍 Regiões
      </button>
      <button
        type="button"
        class="aba-item"
        [class.ativa]="abaAtiva() === 'SETOR'"
        (click)="selecionarAba('SETOR')"
      >
        🏘️ Setores
      </button>
      <button
        type="button"
        class="aba-item"
        [class.ativa]="abaAtiva() === 'SUPER_REGIAO'"
        (click)="selecionarAba('SUPER_REGIAO')"
      >
        🇧🇷 Super-Região
      </button>
      <button
        type="button"
        class="aba-item"
        [class.ativa]="abaAtiva() === 'ARVORE'"
        (click)="selecionarAba('ARVORE')"
      >
        🌳 Visão em Árvore Completa
      </button>
    </nav>

    @if (abaAtiva() === 'ARVORE') {
      <!-- Visão em Árvore Hierárquica -->
      <section class="cartao container-arvore">
        <div class="cabecalho-secao">
          <div>
            <h2>Árvore Territorial Completa</h2>
            <small>Expanda as instâncias para navegar de Províncias até Setores de base.</small>
          </div>
          <button type="button" class="btn btn-secundario" (click)="carregarArvore()">
            🔄 Atualizar Árvore
          </button>
        </div>

        @if (carregando()) {
          <p class="estado-info">Carregando hierarquia territorial...</p>
        } @else if (arvore().length === 0) {
          <div class="estado-vazio">
            <p>Nenhuma instância territorial cadastrada.</p>
          </div>
        } @else {
          <div class="arvore-container">
            @for (raiz of arvore(); track raiz.id) {
              <div class="no-arvore-raiz">
                <div class="linha-no super-regiao">
                  <span class="icone-nivel">🇧🇷</span>
                  <strong>{{ raiz.nome }}</strong>
                  <span class="badge badge-azul">{{ raiz.totalFilhos }} província(s)</span>
                </div>

                <div class="filhos-container">
                  @for (prov of raiz.filhos; track prov.id) {
                    <details class="item-expansivel" open>
                      <summary class="linha-no provincia">
                        <span class="icone-nivel">🏛️</span>
                        <span class="nome-no">{{ prov.nome }}</span>
                        <span class="badge badge-dourado">{{ prov.totalFilhos }} região(ões)</span>
                      </summary>

                      <div class="filhos-container sub">
                        @for (reg of prov.filhos; track reg.id) {
                          <details class="item-expansivel">
                            <summary class="linha-no regiao">
                              <span class="icone-nivel">📍</span>
                              <span class="nome-no">{{ reg.nome }}</span>
                              <span class="badge badge-verde">{{ reg.totalFilhos }} setor(es)</span>
                            </summary>

                            <div class="filhos-container sub-setores">
                              @for (setor of reg.filhos; track setor.id) {
                                <div class="linha-no setor">
                                  <span class="icone-nivel">🏘️</span>
                                  <span class="nome-no">{{ setor.nome }}</span>
                                  <div class="acoes-linha">
                                    <button type="button" class="btn-link" (click)="abrirModalEditar(setor)">Editar</button>
                                    <button type="button" class="btn-link texto-perigo" (click)="confirmarExclusao(setor)">Excluir</button>
                                  </div>
                                </div>
                              }
                            </div>
                          </details>
                        }
                      </div>
                    </details>
                  }
                </div>
              </div>
            }
          </div>
        }
      </section>
    } @else {
      <!-- Listagem em Tabela com Filtros -->
      <section class="cartao container-tabela">
        <div class="barra-filtros">
          <div class="filtro-busca">
            <input
              type="text"
              class="input-ens"
              placeholder="Buscar por nome..."
              [ngModel]="termoBusca()"
              (ngModelChange)="aoMudarBusca($event)"
            />
          </div>

          @if (abaAtiva() === 'REGIAO') {
            <div class="filtro-pai">
              <label>Filtrar por Província:</label>
              <select
                class="select-ens"
                [ngModel]="filtroPaiId()"
                (ngModelChange)="aoMudarFiltroPai($event)"
              >
                <option value="">Todas as Províncias</option>
                @for (p of provincias(); track p.id) {
                  <option [value]="p.id">{{ p.nome }}</option>
                }
              </select>
            </div>
          }

          @if (abaAtiva() === 'SETOR') {
            <div class="filtro-pai">
              <label>Filtrar por Região:</label>
              <select
                class="select-ens"
                [ngModel]="filtroPaiId()"
                (ngModelChange)="aoMudarFiltroPai($event)"
              >
                <option value="">Todas as Regiões</option>
                @for (r of regioes(); track r.id) {
                  <option [value]="r.id">{{ r.nome }}</option>
                }
              </select>
            </div>
          }
        </div>

        @if (carregando()) {
          <p class="estado-info">Carregando dados da estrutura...</p>
        } @else if (itensFiltrados().length === 0) {
          <div class="estado-vazio">
            <p>Nenhuma instância territorial encontrada.</p>
          </div>
        } @else {
          <div class="tabela-responsiva">
            <table class="tabela-ens">
              <thead>
                <tr>
                  <th>Nome da Instância</th>
                  <th>Nível Hierárquico</th>
                  <th>Instância Superior (Pai)</th>
                  <th class="texto-direita">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of itensPaginados(); track item.id) {
                  <tr>
                    <td>
                      <strong>{{ item.nome }}</strong>
                    </td>
                    <td>
                      <span class="badge" [class.badge-azul]="item.nivel === 'SUPER_REGIAO'" [class.badge-dourado]="item.nivel === 'PROVINCIA'" [class.badge-verde]="item.nivel === 'REGIAO'" [class.badge-cinza]="item.nivel === 'SETOR'">
                        {{ rotuloNivel(item.nivel) }}
                      </span>
                    </td>
                    <td>
                      {{ obterNomePai(item.paiId) }}
                    </td>
                    <td class="texto-direita">
                      <div class="acoes-tabela">
                        <button type="button" class="btn btn-sm btn-secundario" (click)="abrirModalEditar(item)">
                          Editar
                        </button>
                        @if (item.nivel !== 'SUPER_REGIAO') {
                          <button type="button" class="btn btn-sm btn-perigo" (click)="confirmarExclusao(item)">
                            Excluir
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Barra de Paginação -->
          <div class="rodape-paginacao">
            <div class="info-paginacao">
              Mostrando {{ indiceInicial() }} a {{ indiceFinal() }} de {{ totalItens() }} instâncias
            </div>
            <div class="controles-paginacao">
              <label class="seletor-tamanho">
                <span>Por página:</span>
                <select [ngModel]="itensPorPagina()" (ngModelChange)="aoMudarTamanhoPagina($event)" class="select-ens select-sm">
                  <option [value]="10">10</option>
                  <option [value]="25">25</option>
                  <option [value]="50">50</option>
                </select>
              </label>
              <button type="button" class="btn btn-sm btn-secundario" [disabled]="paginaAtual() === 1" (click)="irParaPagina(paginaAtual() - 1)">
                ◀ Anterior
              </button>
              <span class="pagina-indicador">Página {{ paginaAtual() }} de {{ totalPaginas() }}</span>
              <button type="button" class="btn btn-sm btn-secundario" [disabled]="paginaAtual() >= totalPaginas()" (click)="irParaPagina(paginaAtual() + 1)">
                Próxima ▶
              </button>
            </div>
          </div>
        }
      </section>
    }

    <!-- Modal de Criação / Edição de Nó -->
    @if (modalAberto()) {
      <div class="modal-backdrop" (click)="fecharModal()">
        <div class="modal-conteudo" (click)="$event.stopPropagation()">
          <div class="modal-cabecalho">
            <h3>{{ modoEdicao() ? 'Editar Nó de Estrutura' : 'Novo Nó Territorial' }}</h3>
            <button type="button" class="btn-fechar" (click)="fecharModal()">✕</button>
          </div>

          <div class="modal-corpo">
            <div class="campo-grupo">
              <label class="rotulo-campo">Nível Territorial *</label>
              <select
                class="select-ens"
                [(ngModel)]="formulario.nivel"
                [disabled]="modoEdicao()"
                (change)="aoAlterarNivelFormulario()"
              >
                <option value="PROVINCIA">Província</option>
                <option value="REGIAO">Região</option>
                <option value="SETOR">Setor</option>
              </select>
            </div>

            @if (formulario.nivel !== 'SUPER_REGIAO') {
              <div class="campo-grupo">
                <label class="rotulo-campo">Instância Superior (Pai) *</label>
                <select class="select-ens" [(ngModel)]="formulario.paiId">
                  <option value="">Selecione a instância superior...</option>
                  @for (op of opcoesPais(); track op.id) {
                    <option [value]="op.id">{{ op.nome }}</option>
                  }
                </select>
              </div>
            }

            <div class="campo-grupo">
              <label class="rotulo-campo">Nome da Instância *</label>
              <input
                type="text"
                class="input-ens"
                placeholder="Ex.: Província Centro-Oeste, Setor Cuiabá..."
                [(ngModel)]="formulario.nome"
              />
            </div>
          </div>

          <div class="modal-rodape">
            <button type="button" class="btn btn-secundario" (click)="fecharModal()">
              Cancelar
            </button>
            <button type="button" class="btn btn-primario" (click)="salvarNo()" [disabled]="salvando()">
              {{ salvando() ? 'Salvando...' : 'Salvar Instância' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .cabecalho h1 {
      margin: 0 0 0.25rem 0;
      color: var(--azul-900);
      font-size: 1.75rem;
    }

    .serifa {
      font-family: var(--fonte-serifa, serif);
      color: var(--texto-suave);
      font-size: 0.95rem;
      margin: 0;
    }

    .alerta {
      padding: 0.75rem 1rem;
      border-radius: var(--raio-sm);
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
    }
    .alerta-sucesso {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .alerta-erro {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .abas-navegacao {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--borda);
      padding-bottom: 0.5rem;
      overflow-x: auto;
    }

    .aba-item {
      padding: 0.6rem 1.1rem;
      border: none;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--texto-suave);
      border-radius: var(--raio-sm);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .aba-item:hover {
      background: var(--fundo-claro);
      color: var(--azul-900);
    }
    .aba-item.ativa {
      background: var(--azul-100);
      color: var(--azul-900);
      font-weight: 600;
    }

    .container-tabela, .container-arvore {
      background: #ffffff;
      border: 1px solid var(--borda);
      border-radius: var(--raio);
      padding: 1.25rem;
      box-shadow: var(--sombra-sm);
    }

    .barra-filtros {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .filtro-busca {
      flex: 1;
      min-width: 250px;
    }

    .filtro-pai {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--texto-suave);
    }

    .input-ens, .select-ens {
      width: 100%;
      padding: 0.55rem 0.85rem;
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      font: inherit;
      font-size: 0.875rem;
      background: #ffffff;
      color: var(--texto);
      box-sizing: border-box;
    }
    .input-ens:focus, .select-ens:focus {
      outline: none;
      border-color: var(--azul-600);
      box-shadow: 0 0 0 2px var(--azul-100);
    }

    .tabela-responsiva {
      overflow-x: auto;
    }

    .tabela-ens {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    .tabela-ens th {
      padding: 0.75rem 0.85rem;
      background: var(--fundo-claro);
      border-bottom: 1px solid var(--borda);
      color: var(--texto-suave);
      font-weight: 600;
    }

    .tabela-ens td {
      padding: 0.75rem 0.85rem;
      border-bottom: 1px solid var(--borda);
      color: var(--texto);
    }

    .tabela-ens tr:hover {
      background: #f8fafc;
    }

    .texto-direita {
      text-align: right;
    }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-azul {
      background: var(--azul-100);
      color: var(--azul-900);
    }
    .badge-dourado {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-verde {
      background: #dcfce7;
      color: #166534;
    }
    .badge-cinza {
      background: #f1f5f9;
      color: #475569;
    }

    .acoes-tabela {
      display: flex;
      justify-content: flex-end;
      gap: 0.4rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--raio-sm);
      border: 1px solid transparent;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .btn-sm {
      padding: 0.3rem 0.6rem;
      font-size: 0.75rem;
    }
    .btn-primario {
      background: var(--azul-600);
      color: #ffffff;
    }
    .btn-primario:hover {
      background: var(--azul-900);
    }
    .btn-secundario {
      background: #ffffff;
      border-color: var(--borda);
      color: var(--texto);
    }
    .btn-secundario:hover {
      background: var(--fundo-claro);
    }
    .btn-perigo {
      background: #fee2e2;
      color: var(--erro);
      border-color: #fca5a5;
    }
    .btn-perigo:hover {
      background: #fecaca;
    }
    .btn-link {
      background: transparent;
      border: none;
      color: var(--azul-600);
      cursor: pointer;
      font-size: 0.8rem;
      text-decoration: underline;
      padding: 0.2rem;
    }
    .texto-perigo {
      color: var(--erro);
    }

    /* Estilos da Árvore */
    .cabecalho-secao {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--borda);
    }
    .cabecalho-secao h2 {
      margin: 0;
      font-size: 1.15rem;
      color: var(--azul-900);
    }
    .cabecalho-secao small {
      color: var(--texto-suave);
    }

    .arvore-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .linha-no {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.55rem 0.8rem;
      border-radius: var(--raio-sm);
      cursor: pointer;
    }
    .linha-no.super-regiao {
      background: var(--azul-100);
      font-size: 1rem;
    }
    .linha-no.provincia {
      background: #f8fafc;
      border: 1px solid var(--borda);
      font-weight: 600;
    }
    .linha-no.regiao {
      background: #ffffff;
      border: 1px dashed var(--borda);
      font-weight: 500;
    }
    .linha-no.setor {
      background: #ffffff;
      padding-left: 1.5rem;
      font-size: 0.85rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .linha-no.setor:hover {
      background: #f8fafc;
    }
    .nome-no {
      flex: 1;
    }
    .acoes-linha {
      display: flex;
      gap: 0.5rem;
    }

    /* Paginação */
    .rodape-paginacao {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.25rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--borda);
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.85rem;
      color: var(--texto-suave);
    }
    .controles-paginacao {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .seletor-tamanho {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .select-sm {
      padding: 0.25rem 0.5rem;
      width: auto;
      font-size: 0.8rem;
    }
    .pagina-indicador {
      font-weight: 600;
      color: var(--azul-900);
    }

    .filhos-container {
      padding-left: 1.25rem;
      margin-top: 0.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .filhos-container.sub {
      border-left: 2px solid var(--borda);
    }
    .filhos-container.sub-setores {
      border-left: 1px dotted var(--borda);
    }

    .item-expansivel summary {
      outline: none;
      list-style: none;
    }
    .item-expansivel summary::-webkit-details-marker {
      display: none;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-conteudo {
      background: #ffffff;
      border-radius: var(--raio);
      width: 100%;
      max-width: 500px;
      box-shadow: var(--sombra-lg);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal-cabecalho {
      padding: 1.25rem;
      border-bottom: 1px solid var(--borda);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-cabecalho h3 {
      margin: 0;
      font-size: 1.15rem;
      color: var(--azul-900);
    }
    .btn-fechar {
      background: transparent;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--texto-suave);
    }
    .modal-corpo {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .campo-grupo {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .rotulo-campo {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--azul-900);
    }
    .modal-rodape {
      padding: 1rem 1.25rem;
      background: var(--fundo-claro);
      border-top: 1px solid var(--borda);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .estado-info, .estado-vazio {
      text-align: center;
      padding: 2rem;
      color: var(--texto-suave);
    }
  `
})
export class EstruturaPage implements OnInit {
  private readonly estruturaService = inject(EstruturaService);

  protected readonly abaAtiva = signal<AbaVisualizacao>('PROVINCIA');
  protected readonly carregando = signal<boolean>(false);
  protected readonly salvando = signal<boolean>(false);
  protected readonly termoBusca = signal<string>('');
  protected readonly filtroPaiId = signal<string>('');

  protected readonly mensagemSucesso = signal<string | null>(null);
  protected readonly mensagemErro = signal<string | null>(null);

  protected readonly superRegioes = signal<NoEstrutura[]>([]);
  protected readonly provincias = signal<NoEstrutura[]>([]);
  protected readonly regioes = signal<NoEstrutura[]>([]);
  protected readonly setores = signal<NoEstrutura[]>([]);
  protected readonly arvore = signal<NoArvore[]>([]);

  // Paginação
  protected readonly paginaAtual = signal<number>(1);
  protected readonly itensPorPagina = signal<number>(10);

  // Modal
  protected readonly modalAberto = signal<boolean>(false);
  protected readonly modoEdicao = signal<boolean>(false);
  protected idEditando: string | null = null;
  protected formulario: NoEstruturaRequest = {
    nome: '',
    nivel: 'PROVINCIA',
    paiId: ''
  };

  ngOnInit(): void {
    this.carregarTodosDados();
  }

  carregarTodosDados(): void {
    this.carregando.set(true);
    this.limparMensagens();

    this.estruturaService.listar('SUPER_REGIAO').subscribe({
      next: (dadosSuper) => {
        this.superRegioes.set(dadosSuper);
        const superId = dadosSuper[0]?.id;

        if (superId) {
          this.estruturaService.listar('PROVINCIA', superId).subscribe({
            next: (dadosProv) => {
              this.provincias.set(dadosProv);
              this.carregarRegioesESetores();
            },
            error: () => this.carregando.set(false)
          });
        } else {
          this.carregando.set(false);
        }
      },
      error: () => this.carregando.set(false)
    });
  }

  private carregarRegioesESetores(): void {
    const provs = this.provincias();
    if (provs.length === 0) {
      this.carregando.set(false);
      return;
    }

    const promisesRegioes = provs.map((p) => this.estruturaService.listar('REGIAO', p.id).toPromise());
    Promise.all(promisesRegioes).then((resultadosReg) => {
      const todasRegioes: NoEstrutura[] = resultadosReg.flatMap((r) => r || []);
      this.regioes.set(todasRegioes);

      const promisesSetores = todasRegioes.map((r) => this.estruturaService.listar('SETOR', r.id).toPromise());
      Promise.all(promisesSetores).then((resultadosSet) => {
        const todosSetores: NoEstrutura[] = resultadosSet.flatMap((s) => s || []);
        this.setores.set(todosSetores);
        this.carregando.set(false);
      }).catch(() => this.carregando.set(false));
    }).catch(() => this.carregando.set(false));
  }

  selecionarAba(aba: AbaVisualizacao): void {
    this.abaAtiva.set(aba);
    this.termoBusca.set('');
    this.filtroPaiId.set('');
    this.paginaAtual.set(1);
    this.limparMensagens();

    if (aba === 'ARVORE') {
      this.carregarArvore();
    }
  }

  carregarArvore(): void {
    this.carregando.set(true);
    this.estruturaService.obterArvore().subscribe({
      next: (dados) => {
        this.arvore.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.mensagemErro.set('Erro ao carregar visão em árvore: ' + (err.error?.message || err.message));
        this.carregando.set(false);
      }
    });
  }

  aoMudarBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.paginaAtual.set(1);
  }

  aoMudarFiltroPai(paiId: string): void {
    this.filtroPaiId.set(paiId);
    this.paginaAtual.set(1);
  }

  itensFiltrados(): NoEstrutura[] {
    const aba = this.abaAtiva();
    let lista: NoEstrutura[] = [];

    switch (aba) {
      case 'SUPER_REGIAO':
        lista = this.superRegioes();
        break;
      case 'PROVINCIA':
        lista = this.provincias();
        break;
      case 'REGIAO':
        lista = this.regioes();
        break;
      case 'SETOR':
        lista = this.setores();
        break;
      default:
        return [];
    }

    const paiFiltro = this.filtroPaiId();
    if (paiFiltro) {
      lista = lista.filter((i) => i.paiId === paiFiltro);
    }

    const busca = this.termoBusca().trim().toLowerCase();
    if (busca) {
      lista = lista.filter((i) => i.nome.toLowerCase().includes(busca));
    }

    return lista;
  }

  totalItens(): number {
    return this.itensFiltrados().length;
  }

  totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalItens() / this.itensPorPagina()));
  }

  itensPaginados(): NoEstrutura[] {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
    return this.itensFiltrados().slice(inicio, inicio + this.itensPorPagina());
  }

  indiceInicial(): number {
    if (this.totalItens() === 0) return 0;
    return (this.paginaAtual() - 1) * this.itensPorPagina() + 1;
  }

  indiceFinal(): number {
    return Math.min(this.paginaAtual() * this.itensPorPagina(), this.totalItens());
  }

  irParaPagina(p: number): void {
    const total = this.totalPaginas();
    const destino = Math.max(1, Math.min(p, total));
    this.paginaAtual.set(destino);
  }

  aoMudarTamanhoPagina(tamanhoStr: any): void {
    this.itensPorPagina.set(Number(tamanhoStr));
    this.paginaAtual.set(1);
  }

  rotuloNivel(nivel: NivelEstrutura): string {
    switch (nivel) {
      case 'SUPER_REGIAO': return 'Super-Região';
      case 'PROVINCIA': return 'Província';
      case 'REGIAO': return 'Região';
      case 'SETOR': return 'Setor';
      case 'EQUIPE': return 'Equipe';
    }
  }

  obterNomePai(paiId: string | null): string {
    if (!paiId) return 'Nenhum (Raiz)';
    const superEncontrada = this.superRegioes().find((s) => s.id === paiId);
    if (superEncontrada) return superEncontrada.nome;
    const provEncontrada = this.provincias().find((p) => p.id === paiId);
    if (provEncontrada) return provEncontrada.nome;
    const regEncontrada = this.regioes().find((r) => r.id === paiId);
    if (regEncontrada) return regEncontrada.nome;
    return 'ID ' + paiId;
  }

  opcoesPais(): NoEstrutura[] {
    const nivel = this.formulario.nivel;
    switch (nivel) {
      case 'PROVINCIA':
        return this.superRegioes();
      case 'REGIAO':
        return this.provincias();
      case 'SETOR':
        return this.regioes();
      default:
        return [];
    }
  }

  aoAlterarNivelFormulario(): void {
    const opcoes = this.opcoesPais();
    this.formulario.paiId = opcoes[0]?.id || '';
  }

  abrirModalCriar(): void {
    this.modoEdicao.set(false);
    this.idEditando = null;
    const aba = this.abaAtiva();

    let nivelPadrao: NivelEstrutura = 'SETOR';
    if (aba === 'PROVINCIA') nivelPadrao = 'PROVINCIA';
    else if (aba === 'REGIAO') nivelPadrao = 'REGIAO';

    this.formulario = {
      nome: '',
      nivel: nivelPadrao,
      paiId: ''
    };
    this.aoAlterarNivelFormulario();
    this.modalAberto.set(true);
  }

  abrirModalEditar(no: NoEstrutura): void {
    this.modoEdicao.set(true);
    this.idEditando = no.id;
    this.formulario = {
      nome: no.nome,
      nivel: no.nivel,
      paiId: no.paiId || ''
    };
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.idEditando = null;
  }

  salvarNo(): void {
    if (!this.formulario.nome.trim()) {
      this.mensagemErro.set('O nome da instância territorial é obrigatório.');
      return;
    }
    if (this.formulario.nivel !== 'SUPER_REGIAO' && !this.formulario.paiId) {
      this.mensagemErro.set('Selecione a instância superior (pai).');
      return;
    }

    this.salvando.set(true);
    this.limparMensagens();

    if (this.modoEdicao() && this.idEditando) {
      this.estruturaService.atualizar(this.idEditando, this.formulario).subscribe({
        next: (atualizado) => {
          this.salvando.set(false);
          this.fecharModal();
          this.mensagemSucesso.set(`Instância "${atualizado.nome}" atualizada com sucesso.`);
          this.carregarTodosDados();
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set('Erro ao atualizar instância: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.estruturaService.criar(this.formulario).subscribe({
        next: (criado) => {
          this.salvando.set(false);
          this.fecharModal();
          this.mensagemSucesso.set(`Instância "${criado.nome}" criada com sucesso.`);
          this.carregarTodosDados();
        },
        error: (err) => {
          this.salvando.set(false);
          this.mensagemErro.set('Erro ao criar instância: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  confirmarExclusao(no: NoEstrutura): void {
    const confirmou = confirm(`Deseja realmente excluir a instância "${no.nome}"? Esta ação será bloqueada caso existam instâncias subordinadas ou equipes vinculadas.`);
    if (!confirmou) return;

    this.limparMensagens();
    this.estruturaService.excluir(no.id).subscribe({
      next: () => {
        this.mensagemSucesso.set(`Instância "${no.nome}" excluída com sucesso.`);
        this.carregarTodosDados();
        if (this.abaAtiva() === 'ARVORE') {
          this.carregarArvore();
        }
      },
      error: (err) => {
        this.mensagemErro.set('Falha na exclusão: ' + (err.error?.message || err.message));
      }
    });
  }

  private limparMensagens(): void {
    this.mensagemSucesso.set(null);
    this.mensagemErro.set(null);
  }
}
