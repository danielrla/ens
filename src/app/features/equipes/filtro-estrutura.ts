import { Component, computed, effect, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, distinctUntilChanged, of, switchMap } from 'rxjs';
import { EstruturaService, NoEstrutura } from '../../core/estrutura.service';

type NivelFiltro = 'SUPER_REGIAO' | 'PROVINCIA' | 'REGIAO' | 'SETOR';

interface DefinicaoNivel {
  nivel: NivelFiltro;
  chave: string;
  rotulo: string;
  pai: string | null;
}

/** Ordem hierárquica oficial; o estado de cada nível vive nos queryParams da URL. */
export const NIVEIS: readonly DefinicaoNivel[] = [
  { nivel: 'SUPER_REGIAO', chave: 'superRegiaoId', rotulo: 'Super-Região', pai: null },
  { nivel: 'PROVINCIA', chave: 'provinciaId', rotulo: 'Província', pai: 'superRegiaoId' },
  { nivel: 'REGIAO', chave: 'regiaoId', rotulo: 'Região', pai: 'provinciaId' },
  { nivel: 'SETOR', chave: 'setorId', rotulo: 'Setor', pai: 'regiaoId' },
];

@Component({
  selector: 'app-filtro-estrutura',
  template: `
    <section class="cartao filtro" aria-label="Filtro por estrutura">
      <div class="grade">
        @for (coluna of colunas; track coluna.def.chave) {
          <div class="campo">
            <label [for]="'filtro-' + coluna.def.chave">{{ coluna.def.rotulo }}</label>
            <select
              [id]="'filtro-' + coluna.def.chave"
              [disabled]="!coluna.habilitado()"
              [value]="coluna.valor()"
              (change)="selecionar(coluna.def, $any($event.target).value)"
            >
              <option value="">Todas</option>
              @for (no of coluna.opcoes(); track no.id) {
                <option [value]="no.id" [selected]="no.id === coluna.valor()">{{ no.nome }}</option>
              }
            </select>
          </div>
        }
      </div>
      @if (temFiltro()) {
        <div class="acoes">
          <button type="button" class="btn btn-fantasma" id="limpar-filtros" (click)="limpar()">
            Limpar filtros
          </button>
        </div>
      }
    </section>
  `,
  styles: `
    .grade {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 1rem;
    }
    .acoes {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  `,
})
export class FiltroEstrutura {
  private readonly api = inject(EstruturaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly colunas = NIVEIS.map((def) => {
    const paiId = computed(() => (def.pai ? this.params().get(def.pai) : null));
    const opcoes = toSignal(
      toObservable(paiId).pipe(
        distinctUntilChanged(),
        switchMap((pai) =>
          def.pai && !pai
            ? of<NoEstrutura[]>([])
            : this.api.listar(def.nivel, pai ?? undefined).pipe(catchError(() => of([]))),
        ),
      ),
      { initialValue: [] as NoEstrutura[] },
    );
    return {
      def,
      opcoes,
      valor: computed(() => this.params().get(def.chave) ?? ''),
      habilitado: computed(() => !def.pai || !!paiId()),
    };
  });

  protected readonly temFiltro = computed(() =>
    NIVEIS.some((n) => !!this.params().get(n.chave)),
  );

  constructor() {
    // Padrão: se só existe uma Super-Região (caso do Brasil) e nada foi escolhido, seleciona-a.
    effect(() => {
      const raiz = this.colunas[0];
      const unicas = raiz.opcoes();
      if (unicas.length === 1 && !raiz.valor()) {
        this.navegar({ [raiz.def.chave]: unicas[0].id }, true);
      }
    });
  }

  protected selecionar(def: DefinicaoNivel, valor: string): void {
    const queryParams: Record<string, string | null> = { [def.chave]: valor || null };
    // Trocar um nível invalida todos os descendentes.
    const indice = NIVEIS.indexOf(def);
    for (const descendente of NIVEIS.slice(indice + 1)) {
      queryParams[descendente.chave] = null;
    }
    this.navegar(queryParams);
  }

  protected limpar(): void {
    this.navegar(Object.fromEntries(NIVEIS.map((n) => [n.chave, null])));
  }

  private navegar(queryParams: Record<string, string | null>, replaceUrl = false): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
