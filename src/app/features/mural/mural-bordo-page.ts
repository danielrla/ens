import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MomentoMuralDto, MomentoMuralRequest, MuralService } from '../../core/mural.service';
import { CasalService } from '../../core/casal.service';
import { EnsDatePipe } from '../../core/ens-date.pipe';

@Component({
  selector: 'app-mural-bordo-page',
  imports: [CommonModule, FormsModule, RouterLink, EnsDatePipe],
  template: `
    <div class="mural-container">
      <header class="cabecalho-mural">
        <div>
          <nav class="breadcrumb-mural">
            <a routerLink="/equipes">Início</a>
            <span class="separador">/</span>
            <span class="separador-contexto">Vida da Equipe</span>
            <span class="separador">/</span>
            <span class="atual">Mural de Bordo</span>
          </nav>
          <h1>📸 Mural de Bordo da Equipe</h1>
          <p class="subtitulo serifa">
            Memórias, registros de retiros, reuniões e momentos fraternos vividos exclusivamente pela nossa equipe.
          </p>
        </div>
        <div class="acoes-topo">
          <button
            type="button"
            class="btn btn-primario"
            (click)="abrirModalNovo()"
            [disabled]="!temEquipeVinculada()"
          >
            + Registrar Novo Momento
          </button>
        </div>
      </header>

      <!-- Identificação Exclusiva da Equipe do Casal -->
      <section class="cartao equipe-mural-cartao">
        @if (equipeCarregando()) {
          <div class="linha-carregando-equipe">
            <div class="spinner-sm"></div>
            <span>Identificando os dados da sua equipe...</span>
          </div>
        } @else if (equipeNome()) {
          <div class="info-equipe-mural">
            <div class="icone-equipe">⚜️</div>
            <div class="detalhes-equipe">
              <span class="etiqueta-contexto">Mural Exclusivo da Nossa Equipe</span>
              <h2 class="nome-equipe-titulo">{{ equipeNome() }}</h2>
            </div>
            <div class="chips-info-equipe">
              <span class="badge badge-dourado">Equipe Oficial</span>
              <span class="badge badge-sucesso">
                {{ momentos().length }} momento(s) registrado(s)
              </span>
            </div>
          </div>
        } @else {
          <div class="aviso-sem-equipe">
            <span class="icone-aviso">⚠️</span>
            <div class="texto-aviso">
              <strong>Seu perfil de casal ainda não possui uma equipe vinculada.</strong>
              <p>Cada equipe possui seu próprio mural reservado. Para acessar e registrar momentos, vincule sua equipe na página de perfil.</p>
              <a routerLink="/perfil" class="btn btn-fantasma btn-sm">Ir para Meu Perfil</a>
            </div>
          </div>
        }
      </section>

      <!-- Feed / Linha do Tempo dos Momentos -->
      @if (carregando()) {
        <div class="cartao estado-vazio">
          <div class="spinner"></div>
          <p>Carregando momentos do mural de bordo...</p>
        </div>
      } @else if (momentos().length === 0) {
        <div class="cartao estado-vazio-bonito">
          <div class="icone-vazio">🖼️</div>
          <h3>Nenhum momento registrado ainda</h3>
          <p class="texto-suave">
            Nossa equipe ainda não possui fotografias ou relatos registrados no Mural de Bordo.
          </p>
          @if (temEquipeVinculada()) {
            <button
              type="button"
              class="btn btn-primario"
              (click)="abrirModalNovo()"
            >
              + Adicionar o Primeiro Momento
            </button>
          }
        </div>
      } @else {
        <div class="linha-do-tempo-mural">
          @for (momento of momentos(); track momento.id) {
            <article class="cartao cartao-momento">
              <header class="topo-momento">
                <div class="bloco-titulo-momento">
                  <div class="meta-momento">
                    <span class="data-tag">📅 {{ momento.data | ensDate }}</span>
                    <span class="badge badge-categoria">{{ obterRotuloCategoria(momento.categoria) }}</span>
                    @if (momento.fotos && momento.fotos.length > 0) {
                      <span class="badge badge-fotos-contagem">📷 {{ momento.fotos.length }} foto(s)</span>
                    }
                  </div>
                  <h2>{{ momento.titulo }}</h2>
                </div>
                <div class="acoes-momento">
                  <button
                    type="button"
                    class="btn-icone"
                    title="Editar Momento"
                    (click)="abrirModalEdicao(momento)"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    class="btn-icone btn-excluir"
                    title="Excluir Momento"
                    (click)="excluirMomento(momento)"
                  >
                    🗑️
                  </button>
                </div>
              </header>

              <div class="corpo-momento">
                @if (momento.descricao && momento.descricao.trim()) {
                  <p class="descricao-texto">{{ momento.descricao }}</p>
                }

                <!-- Grade de Fotos do Momento com Acesso ao Carrossel -->
                @if (momento.fotos && momento.fotos.length > 0) {
                  <div class="galeria-fotos">
                    @for (foto of momento.fotos; track $index) {
                      <div class="foto-item" (click)="abrirCarrossel(momento, $index)">
                        <img [src]="foto" [alt]="momento.titulo + ' foto ' + ($index + 1)" loading="lazy" />
                        <div class="overlay-zoom">
                          <span>🔍 Ver no Carrossel</span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              @if (momento.autorNome) {
                <footer class="rodape-momento">
                  <small class="texto-suave">Registrado por: {{ momento.autorNome }}</small>
                </footer>
              }
            </article>
          }
        </div>
      }

      <!-- Modal de Cadastro / Edição de Momento -->
      @if (modalAberto()) {
        <div class="overlay-modal" (click)="fecharModal()">
          <div class="modal-dialog cartao" (click)="$event.stopPropagation()">
            <div class="modal-cabecalho">
              <div>
                <h2>{{ editandoId() ? 'Editar Momento do Mural' : 'Novo Momento da Equipe' }}</h2>
                <p class="texto-suave">Adicione fotos, data e memórias dos momentos vividos pela nossa equipe.</p>
              </div>
              <button type="button" class="btn-fechar" (click)="fecharModal()">✕</button>
            </div>

            <form (ngSubmit)="salvarMomento()" class="form-momento">
              <div class="linha-dupla">
                <div class="campo" style="max-width: 170px;">
                  <label for="momento-data">Data do Momento <span class="obrigatorio">*</span></label>
                  <input
                    id="momento-data"
                    type="date"
                    required
                    [(ngModel)]="form.data"
                    name="momentoData"
                  />
                </div>
                <div class="campo flex-1">
                  <label for="momento-categoria">Categoria / Ocasião</label>
                  <select
                    id="momento-categoria"
                    [(ngModel)]="form.categoria"
                    name="momentoCategoria"
                  >
                    <option value="REUNIAO_MENSAL">Reunião Mensal</option>
                    <option value="RETIRO_ANUAL">Retiro Anual</option>
                    <option value="MISSA_SETOR">Missa de Setor</option>
                    <option value="CONFRATERNIZACAO">Confraternização / Almoço</option>
                    <option value="ORACAO">Encontro de Oração / Terço</option>
                    <option value="BODAS">Bodas / Celebração de Casal</option>
                    <option value="OUTRO">Outro Momento Especial</option>
                  </select>
                </div>
              </div>

              <div class="campo">
                <label for="momento-titulo">Título do Momento <span class="obrigatorio">*</span></label>
                <input
                  id="momento-titulo"
                  type="text"
                  required
                  [(ngModel)]="form.titulo"
                  name="momentoTitulo"
                  placeholder="Ex: Retiro Espiritual em Chapada dos Guimarães"
                />
              </div>

              <div class="campo">
                <label for="momento-descricao">
                  Descrição do Momento
                  <span class="opcional-tag">(Opcional)</span>
                </label>
                <textarea
                  id="momento-descricao"
                  rows="4"
                  [(ngModel)]="form.descricao"
                  name="momentoDescricao"
                  placeholder="Conte como foi o momento, partilhas e reflexões vividas pela equipe (campo não obrigatório)..."
                ></textarea>
              </div>

              <!-- Upload de Fotos com Sinalização e Exibição de Anexos -->
              <div class="secao-upload-fotos">
                <div class="topo-upload">
                  <div>
                    <label>Fotos do Momento</label>
                    <small class="texto-suave">Adicione fotos do evento (JPG ou PNG até 2MB cada)</small>
                  </div>
                  <div>
                    <label
                      for="input-fotos-mural"
                      class="btn btn-sm btn-anexar-fotos"
                      [class.btn-carregando]="carregandoFotos()"
                      [class.btn-fantasma]="!carregandoFotos()"
                    >
                      @if (carregandoFotos()) {
                        <span class="spinner-sm"></span>
                        Carregando anexo(s)...
                      } @else {
                        📷 + Adicionar Fotos
                      }
                    </label>
                    <input
                      id="input-fotos-mural"
                      type="file"
                      accept="image/*"
                      multiple
                      [disabled]="carregandoFotos()"
                      (click)="$any($event.target).value = null"
                      (change)="aoSelecionarFotos($event)"
                      style="display: none"
                    />
                  </div>
                </div>

                @if (carregandoFotos()) {
                  <div class="alerta-upload-andamento">
                    <span class="spinner-sm"></span>
                    <span>Processando e anexando fotografias selecionadas...</span>
                  </div>
                }

                @if (!form.fotos || form.fotos.length === 0) {
                  <div class="nenhuma-foto-box">
                    <p class="texto-suave">Nenhuma foto anexada a este momento ainda.</p>
                  </div>
                } @else {
                  <div class="status-anexos-carregados">
                    <span class="badge badge-sucesso">✓ {{ form.fotos.length }} foto(s) carregada(s) com sucesso</span>
                  </div>
                  <div class="previews-fotos-grid">
                    @for (foto of form.fotos; track $index) {
                      <div class="preview-card">
                        <img [src]="foto" alt="Anexo carregado" />
                        <span class="badge-indice-anexo">#{{ $index + 1 }}</span>
                        <button
                          type="button"
                          class="btn-remover-foto-preview"
                          title="Remover anexo"
                          (click)="removerFotoForm($index)"
                        >
                          ✕
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="modal-acoes">
                <button type="button" class="btn btn-fantasma" (click)="fecharModal()">Cancelar</button>
                <button
                  type="submit"
                  class="btn btn-primario"
                  [disabled]="salvando() || carregandoFotos()"
                >
                  {{ salvando() ? 'Salvando...' : 'Salvar no Mural' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Carrossel de Fotos Interativo -->
      @if (carrosselAberto() && fotosCarrossel().length > 0) {
        <div class="overlay-carrossel" (click)="fecharCarrossel()">
          <div class="carrossel-container" (click)="$event.stopPropagation()">
            <!-- Cabeçalho do Carrossel -->
            <div class="carrossel-topo">
              <div class="carrossel-info">
                <h3>{{ momentoCarrossel()?.titulo }}</h3>
                <span class="data-tag">📅 {{ momentoCarrossel()?.data | ensDate }}</span>
              </div>
              <div class="carrossel-controles-topo">
                <span class="contador-fotos">
                  Foto {{ fotoIndexAtivo() + 1 }} de {{ fotosCarrossel().length }}
                </span>
                <button
                  type="button"
                  class="btn-fechar-carrossel"
                  (click)="fecharCarrossel()"
                  title="Fechar carrossel (ESC)"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Área Central com Navegação e Imagem -->
            <div class="carrossel-palco">
              <button
                type="button"
                class="btn-nav-carrossel btn-anterior"
                (click)="anteriorFoto()"
                [disabled]="fotosCarrossel().length <= 1"
                title="Foto anterior (Seta para a esquerda)"
              >
                ❮
              </button>

              <div class="palco-imagem">
                <img
                  [src]="fotosCarrossel()[fotoIndexAtivo()]"
                  [alt]="'Foto ' + (fotoIndexAtivo() + 1) + ' do momento'"
                  class="img-carrossel-ativa"
                />
              </div>

              <button
                type="button"
                class="btn-nav-carrossel btn-proximo"
                (click)="proximaFoto()"
                [disabled]="fotosCarrossel().length <= 1"
                title="Próxima foto (Seta para a direita)"
              >
                ❯
              </button>
            </div>

            <!-- Miniaturas Inferiores para Navegação Rápida -->
            @if (fotosCarrossel().length > 1) {
              <div class="carrossel-miniaturas">
                @for (foto of fotosCarrossel(); track $index) {
                  <button
                    type="button"
                    class="miniatura-btn"
                    [class.miniatura-ativa]="$index === fotoIndexAtivo()"
                    (click)="selecionarFotoIndex($index)"
                    [title]="'Ir para a foto ' + ($index + 1)"
                  >
                    <img [src]="foto" [alt]="'Miniatura ' + ($index + 1)" />
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .mural-container {
      max-width: 1140px;
      margin: 0 auto;
      padding-bottom: 3rem;
    }

    .breadcrumb-mural {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }
    .breadcrumb-mural a {
      color: var(--texto-suave);
      text-decoration: none;
    }
    .breadcrumb-mural a:hover {
      color: var(--azul-600);
    }
    .breadcrumb-mural .separador {
      color: var(--borda);
    }
    .breadcrumb-mural .separador-contexto {
      color: var(--texto-suave);
    }
    .breadcrumb-mural .atual {
      color: var(--azul-900);
      font-weight: 600;
    }

    .cabecalho-mural {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .cabecalho-mural h1 {
      color: var(--azul-900);
      font-size: clamp(1.6rem, 3.5vw, 2.2rem);
      margin: 0 0 0.4rem 0;
    }
    .subtitulo {
      margin: 0;
      color: var(--texto-suave);
      font-size: 1rem;
    }

    /* Cartão de Equipe Exclusivo */
    .equipe-mural-cartao {
      padding: 1.25rem 1.75rem;
      margin-bottom: 2rem;
      background: #ffffff;
      border-left: 5px solid var(--ouro-500, #d97706);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .linha-carregando-equipe {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--texto-suave);
      font-size: 0.95rem;
    }
    .info-equipe-mural {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .info-equipe-mural .icone-equipe {
      font-size: 2.2rem;
      line-height: 1;
    }
    .detalhes-equipe {
      flex: 1;
    }
    .etiqueta-contexto {
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
    .chips-info-equipe {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }

    .aviso-sem-equipe {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.5rem 0;
    }
    .icone-aviso {
      font-size: 1.8rem;
    }
    .texto-aviso strong {
      color: #b45309;
      display: block;
      margin-bottom: 0.25rem;
    }
    .texto-aviso p {
      margin: 0 0 0.75rem 0;
      color: var(--texto-suave);
      font-size: 0.9rem;
    }

    /* Estados Vazio e Carregamento */
    .estado-vazio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--borda);
      border-top-color: var(--azul-600);
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }
    .spinner-sm {
      width: 18px;
      height: 18px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes girar {
      to { transform: rotate(360deg); }
    }

    .estado-vazio-bonito {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      gap: 0.75rem;
      background: #ffffff;
    }
    .icone-vazio {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .estado-vazio-bonito h3 {
      color: var(--azul-900);
      margin: 0;
      font-size: 1.3rem;
    }

    .linha-do-tempo-mural {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .cartao-momento {
      padding: 1.75rem;
      background: #ffffff;
      border: 1px solid var(--borda);
      border-radius: var(--raio);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .cartao-momento:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .topo-momento {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--borda);
      padding-bottom: 1rem;
    }
    .bloco-titulo-momento h2 {
      margin: 0.4rem 0 0 0;
      color: var(--azul-900);
      font-size: 1.35rem;
    }
    .meta-momento {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .data-tag {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--azul-900);
      background: var(--fundo-claro);
      padding: 0.25rem 0.6rem;
      border-radius: var(--raio-sm);
    }
    .badge-categoria {
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 600;
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
    }
    .badge-fotos-contagem {
      background: #fef3c7;
      color: #92400e;
      font-weight: 600;
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
    }

    .acoes-momento {
      display: flex;
      gap: 0.4rem;
    }
    .btn-icone {
      background: transparent;
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      padding: 0.4rem 0.6rem;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.15s;
    }
    .btn-icone:hover {
      background: var(--fundo-claro);
    }
    .btn-excluir:hover {
      background: #fee2e2;
      border-color: #fca5a5;
    }

    .corpo-momento {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .descricao-texto {
      margin: 0;
      color: var(--texto);
      font-size: 1rem;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .galeria-fotos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .foto-item {
      position: relative;
      height: 150px;
      border-radius: var(--raio-sm);
      overflow: hidden;
      cursor: pointer;
      border: 1px solid var(--borda);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .foto-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.25s ease;
    }
    .foto-item:hover img {
      transform: scale(1.05);
    }
    .overlay-zoom {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .foto-item:hover .overlay-zoom {
      opacity: 1;
    }

    .rodape-momento {
      margin-top: 1.25rem;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--borda);
    }

    /* Modal */
    .overlay-modal {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-dialog {
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      background: #ffffff;
      padding: 1.75rem;
    }
    .modal-cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--borda);
      padding-bottom: 0.75rem;
    }
    .modal-cabecalho h2 {
      margin: 0 0 0.3rem 0;
      color: var(--azul-900);
      font-size: 1.4rem;
    }
    .btn-fechar {
      background: transparent;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--texto-suave);
    }
    .form-momento {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .linha-dupla {
      display: flex;
      gap: 1rem;
    }
    .campo {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .campo label {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--texto);
    }
    .opcional-tag {
      font-size: 0.75rem;
      font-weight: normal;
      color: var(--texto-suave);
      margin-left: 0.3rem;
    }
    .campo input,
    .campo select,
    .campo textarea {
      padding: 0.6rem 0.8rem;
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      font: inherit;
      font-size: 0.9rem;
      background: #ffffff;
    }
    .campo input:focus,
    .campo select:focus,
    .campo textarea:focus {
      outline: none;
      border-color: var(--azul-600);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .obrigatorio {
      color: var(--erro);
    }

    /* Upload de Fotos com Feedback */
    .secao-upload-fotos {
      border: 1px dashed var(--borda);
      border-radius: var(--raio-sm);
      padding: 1.25rem;
      background: var(--fundo-claro);
    }
    .topo-upload {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .topo-upload label {
      font-weight: 600;
      color: var(--azul-900);
      display: block;
    }
    .btn-anexar-fotos {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }
    .btn-carregando {
      background: #e2e8f0 !important;
      color: var(--azul-900) !important;
      cursor: wait !important;
      pointer-events: none;
    }
    .alerta-upload-andamento {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 0.9rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--raio-sm);
      color: #1e40af;
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }
    .status-anexos-carregados {
      margin-bottom: 0.75rem;
    }
    .nenhuma-foto-box {
      text-align: center;
      padding: 1.5rem;
    }
    .previews-fotos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 0.75rem;
    }
    .preview-card {
      position: relative;
      height: 80px;
      border-radius: var(--raio-sm);
      overflow: hidden;
      border: 1px solid var(--borda);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .preview-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .badge-indice-anexo {
      position: absolute;
      bottom: 3px;
      left: 3px;
      background: rgba(15, 23, 42, 0.75);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .btn-remover-foto-preview {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(220, 38, 38, 0.9);
      color: #ffffff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.7rem;
      transition: background 0.15s ease;
    }
    .btn-remover-foto-preview:hover {
      background: #b91c1c;
    }

    .modal-acoes {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      border-top: 1px solid var(--borda);
      padding-top: 1rem;
    }

    /* Carrossel de Fotos Interativo */
    .overlay-carrossel {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(8px);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .carrossel-container {
      position: relative;
      width: 100%;
      max-width: 960px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }
    .carrossel-topo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #ffffff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 0.75rem;
    }
    .carrossel-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.25rem;
      color: #ffffff;
    }
    .carrossel-controles-topo {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .contador-fotos {
      font-size: 0.9rem;
      font-weight: 600;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
    }
    .btn-fechar-carrossel {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 1.2rem;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }
    .btn-fechar-carrossel:hover {
      background: rgba(220, 38, 38, 0.8);
    }

    .carrossel-palco {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      height: 60vh;
      min-height: 320px;
    }
    .palco-imagem {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .img-carrossel-ativa {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: var(--raio-sm);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      transition: opacity 0.2s ease;
    }
    .btn-nav-carrossel {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      font-size: 1.5rem;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .btn-nav-carrossel:hover:not(:disabled) {
      background: var(--ouro-500, #d97706);
      transform: scale(1.1);
      border-color: transparent;
    }
    .btn-nav-carrossel:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .carrossel-miniaturas {
      display: flex;
      justify-content: center;
      gap: 0.6rem;
      overflow-x: auto;
      padding: 0.5rem 0;
    }
    .miniatura-btn {
      width: 60px;
      height: 45px;
      border-radius: var(--raio-sm);
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      background: transparent;
      cursor: pointer;
      opacity: 0.5;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .miniatura-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .miniatura-btn:hover {
      opacity: 0.85;
    }
    .miniatura-ativa {
      border-color: var(--ouro-500, #d97706);
      opacity: 1;
      transform: scale(1.08);
      box-shadow: 0 0 10px rgba(217, 119, 6, 0.6);
    }

    @media (max-width: 640px) {
      .linha-dupla {
        flex-direction: column;
        gap: 0.75rem;
      }
      .carrossel-palco {
        height: 50vh;
      }
      .btn-nav-carrossel {
        width: 38px;
        height: 38px;
        font-size: 1.2rem;
      }
    }
  `,
})
export class MuralBordoPage implements OnInit {
  private readonly muralService = inject(MuralService);
  private readonly casalService = inject(CasalService);

  protected readonly carregando = signal(true);
  protected readonly equipeCarregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly carregandoFotos = signal(false);

  protected readonly momentos = signal<MomentoMuralDto[]>([]);

  // Dados exclusivos da equipe do casal
  protected readonly equipeNome = computed(() => {
    return this.casalService.casalLogado()?.nomeEquipe || null;
  });

  protected readonly temEquipeVinculada = computed(() => {
    const casal = this.casalService.casalLogado();
    return !!(casal && casal.equipeId);
  });

  // Modal
  protected readonly modalAberto = signal(false);
  protected readonly editandoId = signal<string | null>(null);

  protected form: MomentoMuralRequest = {
    titulo: '',
    data: new Date().toISOString().split('T')[0],
    categoria: 'REUNIAO_MENSAL',
    descricao: '',
    fotos: [],
  };

  // Carrossel
  protected readonly carrosselAberto = signal(false);
  protected readonly momentoCarrossel = signal<MomentoMuralDto | null>(null);
  protected readonly fotosCarrossel = signal<string[]>([]);
  protected readonly fotoIndexAtivo = signal(0);

  ngOnInit(): void {
    this.carregarPerfilEMural();
  }

  @HostListener('window:keydown', ['$event'])
  aoPressionarTeclado(event: KeyboardEvent): void {
    if (!this.carrosselAberto()) return;
    if (event.key === 'ArrowLeft') {
      this.anteriorFoto();
    } else if (event.key === 'ArrowRight') {
      this.proximaFoto();
    } else if (event.key === 'Escape') {
      this.fecharCarrossel();
    }
  }

  carregarPerfilEMural(): void {
    this.equipeCarregando.set(true);
    this.casalService.obterPerfil().subscribe({
      next: (casal) => {
        this.equipeCarregando.set(false);
        if (casal && casal.equipeId) {
          this.carregarMomentos();
        } else {
          this.carregando.set(false);
        }
      },
      error: () => {
        this.equipeCarregando.set(false);
        this.carregando.set(false);
      },
    });
  }

  carregarMomentos(): void {
    this.carregando.set(true);
    this.muralService.listarMeuMural().subscribe({
      next: (dados) => {
        this.momentos.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }

  obterRotuloCategoria(cat?: string): string {
    const mapa: Record<string, string> = {
      REUNIAO_MENSAL: 'Reunião Mensal',
      RETIRO_ANUAL: 'Retiro Anual',
      MISSA_SETOR: 'Missa de Setor',
      CONFRATERNIZACAO: 'Confraternização',
      ORACAO: 'Encontro de Oração',
      BODAS: 'Bodas & Família',
      OUTRO: 'Momento Especial',
    };
    return (cat && mapa[cat]) || 'Momento Especial';
  }

  abrirModalNovo(): void {
    this.editandoId.set(null);
    this.form = {
      titulo: '',
      data: new Date().toISOString().split('T')[0],
      categoria: 'REUNIAO_MENSAL',
      descricao: '',
      fotos: [],
    };
    this.modalAberto.set(true);
  }

  abrirModalEdicao(m: MomentoMuralDto): void {
    this.editandoId.set(m.id);
    this.form = {
      titulo: m.titulo,
      data: m.data,
      categoria: m.categoria || 'REUNIAO_MENSAL',
      descricao: m.descricao || '',
      fotos: m.fotos ? [...m.fotos] : [],
    };
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  aoSelecionarFotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const arquivos = Array.from(input.files);
      if (!this.form.fotos) {
        this.form.fotos = [];
      }

      this.carregandoFotos.set(true);

      const promessasLeitura = arquivos.map((file) => {
        return new Promise<void>((resolve) => {
          if (file.size > 2 * 1024 * 1024) {
            alert(`O arquivo ${file.name} excede o limite de 2MB e não será incluído.`);
            resolve();
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            const resultado = e.target?.result as string;
            if (resultado) {
              this.form.fotos!.push(resultado);
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promessasLeitura).then(() => {
        this.carregandoFotos.set(false);
      });
    }
  }

  removerFotoForm(index: number): void {
    if (this.form.fotos) {
      this.form.fotos.splice(index, 1);
    }
  }

  salvarMomento(): void {
    if (!this.form.titulo.trim()) {
      alert('O título do momento é obrigatório.');
      return;
    }
    if (!this.form.data) {
      alert('A data do momento é obrigatória.');
      return;
    }

    this.salvando.set(true);
    const id = this.editandoId();

    if (id) {
      this.muralService.atualizar(id, this.form).subscribe({
        next: (atualizado) => {
          this.salvando.set(false);
          this.momentos.update((lista) =>
            lista.map((item) => (item.id === atualizado.id ? atualizado : item))
          );
          this.fecharModal();
        },
        error: (err) => {
          this.salvando.set(false);
          alert(err.error?.message || 'Erro ao atualizar momento no mural.');
        },
      });
    } else {
      this.muralService.criarMeuMural(this.form).subscribe({
        next: (criado) => {
          this.salvando.set(false);
          this.momentos.update((lista) => [criado, ...lista]);
          this.fecharModal();
        },
        error: (err) => {
          this.salvando.set(false);
          alert(err.error?.message || 'Erro ao registrar momento no mural.');
        },
      });
    }
  }

  excluirMomento(m: MomentoMuralDto): void {
    if (confirm(`Deseja realmente excluir o momento "${m.titulo}" do mural de bordo?`)) {
      this.muralService.excluir(m.id).subscribe({
        next: () => {
          this.momentos.update((lista) => lista.filter((item) => item.id !== m.id));
        },
        error: (err) => {
          alert(err.error?.message || 'Erro ao excluir momento do mural.');
        },
      });
    }
  }

  // Métodos do Carrossel
  abrirCarrossel(m: MomentoMuralDto, fotoIndex: number): void {
    if (m.fotos && m.fotos.length > 0) {
      this.momentoCarrossel.set(m);
      this.fotosCarrossel.set(m.fotos);
      this.fotoIndexAtivo.set(Math.max(0, Math.min(fotoIndex, m.fotos.length - 1)));
      this.carrosselAberto.set(true);
    }
  }

  fecharCarrossel(): void {
    this.carrosselAberto.set(false);
    this.momentoCarrossel.set(null);
    this.fotosCarrossel.set([]);
    this.fotoIndexAtivo.set(0);
  }

  proximaFoto(): void {
    const total = this.fotosCarrossel().length;
    if (total <= 1) return;
    this.fotoIndexAtivo.update((idx) => (idx + 1) % total);
  }

  anteriorFoto(): void {
    const total = this.fotosCarrossel().length;
    if (total <= 1) return;
    this.fotoIndexAtivo.update((idx) => (idx - 1 + total) % total);
  }

  selecionarFotoIndex(idx: number): void {
    if (idx >= 0 && idx < this.fotosCarrossel().length) {
      this.fotoIndexAtivo.set(idx);
    }
  }
}
