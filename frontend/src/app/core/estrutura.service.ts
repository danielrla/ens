import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type NivelEstrutura = 'SUPER_REGIAO' | 'PROVINCIA' | 'REGIAO' | 'SETOR' | 'EQUIPE';

export interface NoEstrutura {
  id: string;
  nome: string;
  nivel: NivelEstrutura;
  paiId: string | null;
}

export interface NoEstruturaRequest {
  nome: string;
  nivel: NivelEstrutura;
  paiId?: string | null;
}

export interface NoArvore extends NoEstrutura {
  totalFilhos: number;
  filhos: NoArvore[];
}

@Injectable({ providedIn: 'root' })
export class EstruturaService {
  private readonly http = inject(HttpClient);

  /** Lista os nós de um nível, filtrados pelo pai (cascata). Contrato: docs/openapi.yaml. */
  listar(nivel: Exclude<NivelEstrutura, 'EQUIPE'>, paiId?: string): Observable<NoEstrutura[]> {
    let params = new HttpParams();
    if (paiId) {
      params = params.set('paiId', paiId);
    }
    return this.http.get<NoEstrutura[]>(`/api/estrutura/${nivel}`, { params });
  }

  /** Obtém detalhes de um nó por ID */
  obterPorId(id: string): Observable<NoEstrutura> {
    return this.http.get<NoEstrutura>(`/api/estrutura/detalhe/${id}`);
  }

  /** Obtém a árvore hierárquica territorial */
  obterArvore(raizId?: string, nivel?: NivelEstrutura): Observable<NoArvore[]> {
    let params = new HttpParams();
    if (raizId) {
      params = params.set('raizId', raizId);
    }
    if (nivel) {
      params = params.set('nivel', nivel);
    }
    return this.http.get<NoArvore[]>('/api/estrutura/arvore', { params });
  }

  /** Cria um novo nó na estrutura */
  criar(request: NoEstruturaRequest): Observable<NoEstrutura> {
    return this.http.post<NoEstrutura>('/api/estrutura', request);
  }

  /** Atualiza um nó existente */
  atualizar(id: string, request: NoEstruturaRequest): Observable<NoEstrutura> {
    return this.http.put<NoEstrutura>(`/api/estrutura/${id}`, request);
  }

  /** Exclui um nó (bloqueado se houver filhos ou equipes) */
  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`/api/estrutura/${id}`);
  }
}
