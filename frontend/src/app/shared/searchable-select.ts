import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
}

@Component({
  selector: 'app-searchable-select',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="searchable-select-wrapper" [class.aberto]="aberto()" [class.desabilitado]="disabled">
      <!-- Botão Principal que exibe o item selecionado ou placeholder -->
      <button
        type="button"
        class="select-trigger"
        [id]="id"
        [disabled]="disabled"
        (click)="alternarAberto($event)"
        [attr.aria-expanded]="aberto()"
        [attr.title]="labelSelecionado() || placeholder"
      >
        <span class="trigger-texto" [class.placeholder]="!temValorSelecionado()">
          {{ labelSelecionado() || placeholder }}
        </span>
        <span class="seta-icone">{{ aberto() ? '▲' : '▼' }}</span>
      </button>

      <!-- Painel Dropdown Flutuante -->
      @if (aberto()) {
        <div class="dropdown-painel" (click)="$event.stopPropagation()">
          <!-- Campo de Busca (exibido se forçado, como Casal/Conselheiro, ou se > 10 itens) -->
          @if (exibirBusca()) {
            <div class="busca-container">
              <span class="icone-lupa">🔍</span>
              <input
                #inputBusca
                type="text"
                class="input-busca"
                [placeholder]="searchPlaceholder"
                [ngModel]="termoBusca()"
                (ngModelChange)="termoBusca.set($event)"
                (keydown.escape)="fechar()"
              />
              @if (termoBusca()) {
                <button type="button" class="btn-limpar-busca" (click)="termoBusca.set('')" title="Limpar busca">
                  ✕
                </button>
              }
            </div>
          }

          <!-- Lista de Opções Filtradas -->
          <ul class="opcoes-lista" role="listbox">
            @if (allowEmpty) {
              <li
                class="opcao-item opcao-vazia"
                [class.selecionado]="!valueAtual()"
                (click)="selecionarOpcao('')"
                role="option"
              >
                <em>{{ emptyLabel }}</em>
              </li>
            }

            @for (opt of opcoesFiltradas(); track opt.value) {
              <li
                class="opcao-item"
                [class.selecionado]="opt.value === valueAtual()"
                (click)="selecionarOpcao(opt.value)"
                role="option"
              >
                <div class="opcao-conteudo">
                  <span class="opcao-label">{{ opt.label }}</span>
                  @if (opt.sublabel) {
                    <small class="opcao-sublabel">{{ opt.sublabel }}</small>
                  }
                </div>
                @if (opt.value === valueAtual()) {
                  <span class="opcao-check">✓</span>
                }
              </li>
            }

            @if (opcoesFiltradas().length === 0) {
              <li class="opcao-nenhum">
                Nenhum resultado encontrado para "{{ termoBusca() }}"
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      position: relative;
    }

    .searchable-select-wrapper {
      position: relative;
      width: 100%;
    }

    .select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.6rem 0.75rem;
      font: inherit;
      color: var(--texto, #1e293b);
      background: var(--superficie, #ffffff);
      border: 1px solid var(--borda, #cbd5e1);
      border-radius: var(--raio-sm, 8px);
      cursor: pointer;
      text-align: left;
      transition: border-color 0.15s, box-shadow 0.15s;
      min-height: 42px;
      box-sizing: border-box;
      gap: 0.5rem;
    }

    .select-trigger:hover:not(:disabled) {
      border-color: var(--azul-600, #2563eb);
    }

    .searchable-select-wrapper.aberto .select-trigger,
    .select-trigger:focus-visible {
      outline: none;
      border-color: var(--azul-600, #2563eb);
      box-shadow: 0 0 0 3px var(--azul-100, #dbe6fd);
    }

    .select-trigger:disabled {
      background: var(--fundo-claro, #f8fafc);
      color: var(--texto-suave, #64748b);
      cursor: not-allowed;
      opacity: 0.75;
    }

    .trigger-texto {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 0.9rem;
    }

    .trigger-texto.placeholder {
      color: var(--texto-suave, #64748b);
    }

    .seta-icone {
      font-size: 0.7rem;
      color: var(--texto-suave, #64748b);
      flex-shrink: 0;
      transition: transform 0.15s;
    }

    /* Dropdown Flutuante */
    .dropdown-painel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--superficie, #ffffff);
      border: 1px solid var(--borda, #cbd5e1);
      border-radius: var(--raio-sm, 8px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      z-index: 100;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.12s ease-out;
    }

    /* Caixa de Busca */
    .busca-container {
      display: flex;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: var(--fundo-claro, #f8fafc);
      border-bottom: 1px solid var(--borda, #e2e8f0);
      gap: 0.5rem;
    }

    .icone-lupa {
      font-size: 0.85rem;
      opacity: 0.7;
    }

    .input-busca {
      flex: 1;
      border: none;
      background: transparent;
      font: inherit;
      font-size: 0.85rem;
      color: var(--texto, #1e293b);
      outline: none;
      padding: 0.2rem 0;
    }

    .btn-limpar-busca {
      background: none;
      border: none;
      font-size: 0.75rem;
      color: var(--texto-suave, #64748b);
      cursor: pointer;
      padding: 0.2rem;
    }

    /* Lista de Opções */
    .opcoes-lista {
      list-style: none;
      margin: 0;
      padding: 0.25rem 0;
      max-height: 230px;
      overflow-y: auto;
    }

    .opcao-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.55rem 0.85rem;
      font-size: 0.875rem;
      color: var(--texto, #1e293b);
      cursor: pointer;
      transition: background 0.12s;
      gap: 0.5rem;
    }

    .opcao-item:hover {
      background: var(--azul-100, #dbe6fd);
      color: var(--azul-900, #1e3a8a);
    }

    .opcao-item.selecionado {
      background: #eff6ff;
      color: var(--azul-900, #1e3a8a);
      font-weight: 600;
    }

    .opcao-conteudo {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .opcao-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .opcao-sublabel {
      font-size: 0.75rem;
      color: var(--texto-suave, #64748b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .opcao-check {
      color: var(--azul-600, #2563eb);
      font-weight: bold;
    }

    .opcao-nenhum {
      padding: 1rem 0.85rem;
      font-size: 0.85rem;
      color: var(--texto-suave, #64748b);
      text-align: center;
      font-style: italic;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class SearchableSelect {
  private readonly elementRef = inject(ElementRef);

  @Input() id = '';
  @Input() placeholder = 'Selecione...';
  @Input() searchPlaceholder = 'Pesquisar...';
  @Input() disabled = false;
  @Input() forceSearch = false; // Forçado para Casal e Conselheiro, ou por regra > 10 itens
  @Input() allowEmpty = true;
  @Input() emptyLabel = 'Nenhum / Não informado';

  private readonly _options = signal<SearchableOption[]>([]);
  @Input() set options(opts: SearchableOption[] | null | undefined) {
    this._options.set(opts || []);
  }
  get options(): SearchableOption[] {
    return this._options();
  }

  private readonly _value = signal<string | null | undefined>(null);
  @Input() set value(val: string | null | undefined) {
    this._value.set(val);
  }
  get value(): string | null | undefined {
    return this._value();
  }
  @Output() valueChange = new EventEmitter<string>();

  protected readonly valueAtual = computed(() => this._value());
  protected readonly aberto = signal(false);
  protected readonly termoBusca = signal('');

  // Regra: todo combobox com mais de 10 registros ou forceSearch permite consulta
  protected readonly exibirBusca = computed(() => {
    return this.forceSearch || this._options().length > 10;
  });

  protected readonly temValorSelecionado = computed(() => {
    const v = this._value();
    return !!v && this._options().some((o) => o.value === v);
  });

  protected readonly labelSelecionado = computed(() => {
    const v = this._value();
    const encontrada = this._options().find((o) => o.value === v);
    return encontrada ? encontrada.label : '';
  });

  // Filtro sem distinção de acentos ou maiúsculas/minúsculas
  protected readonly opcoesFiltradas = computed(() => {
    const termo = this.removerAcentos(this.termoBusca().trim().toLowerCase());
    const opts = this._options();
    if (!termo) {
      return opts;
    }
    return opts.filter((opt) => {
      const l = this.removerAcentos(opt.label.toLowerCase());
      const sub = opt.sublabel ? this.removerAcentos(opt.sublabel.toLowerCase()) : '';
      return l.includes(termo) || sub.includes(termo);
    });
  });

  alternarAberto(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    if (this.aberto()) {
      this.fechar();
    } else {
      this.abrir();
    }
  }

  abrir(): void {
    this.termoBusca.set('');
    this.aberto.set(true);
  }

  fechar(): void {
    this.aberto.set(false);
    this.termoBusca.set('');
  }

  selecionarOpcao(val: string): void {
    this._value.set(val);
    this.valueChange.emit(val);
    this.fechar();
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.fechar();
    }
  }

  private removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
