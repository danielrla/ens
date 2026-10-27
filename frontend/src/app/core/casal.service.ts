import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MandatoDto } from './mandato.service';
export type { MandatoDto };

export type StatusCasal = 'ATIVO' | 'EM_PILOTAGEM' | 'LICENCIADO' | 'EMERITO' | 'VIUVO' | 'INATIVO';

export type TipoMovimentacao =
  | 'TRANSFERENCIA'
  | 'SAIDA'
  | 'SAIDA_VOLUNTARIA'
  | 'REMANEJAMENTO'
  | 'LICENCA'
  | 'RETORNO'
  | 'FALECIMENTO';

export interface Pessoa {
  nomeCompleto: string;
  cpf: string;
  email?: string;
  celular?: string;
  dataNascimento?: string;
  profissao?: string;
  dataFalecimento?: string;
}

export interface Filho {
  nome: string;
  dataNascimento?: string;
  idade?: number;
  fotoUrl?: string;
}

export interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
}

export interface CasalRequest {
  esposo: Pessoa;
  esposa: Pessoa;
  dataMatrimonio?: string;
  paroquiaCasamento?: string;
  recebeCartaMensal?: string;
  endereco?: Endereco;
  status?: StatusCasal;
  equipeId?: string;
  fotoUrl?: string;
  filhos?: Filho[];
}

export interface CasalDto extends CasalRequest {
  id: string;
  nomeEquipe?: string;
  fotoUrl?: string;
  motivoInativacao?: string;
}

export interface PageResponse<T> {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: T[];
}

export interface FiltroCasal {
  busca?: string;
  status?: StatusCasal;
  equipeId?: string;
  page?: number;
  size?: number;
}

export interface MovimentacaoDto {
  id: string;
  casalId: string;
  tipo: TipoMovimentacao;
  equipeOrigemId?: string;
  nomeEquipeOrigem?: string;
  equipeDestinoId?: string;
  nomeEquipeDestino?: string;
  data: string;
  motivo: string;
  observacoes?: string;
}

export interface MovimentacaoRequest {
  tipo: TipoMovimentacao;
  equipeDestinoId?: string;
  motivo: string;
  data?: string;
  observacoes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CasalService {
  private readonly http = inject(HttpClient);

  readonly casalLogado = signal<CasalDto | null>(null);

  obterPerfil(): Observable<CasalDto> {
    return this.http.get<CasalDto>('/api/casais/perfil').pipe(
      tap((casal) => this.casalLogado.set(casal))
    );
  }

  atualizarPerfil(request: CasalRequest): Observable<CasalDto> {
    return this.http.put<CasalDto>('/api/casais/perfil', request).pipe(
      tap((casal) => this.casalLogado.set(casal))
    );
  }

  listar(filtro: FiltroCasal = {}): Observable<PageResponse<CasalDto>> {
    let params = new HttpParams();
    if (filtro.busca) params = params.set('busca', filtro.busca);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.equipeId) params = params.set('equipeId', filtro.equipeId);
    if (filtro.page !== undefined) params = params.set('page', filtro.page);
    if (filtro.size !== undefined) params = params.set('size', filtro.size);

    return this.http.get<PageResponse<CasalDto>>('/api/casais', { params });
  }

  obterPorId(id: string): Observable<CasalDto> {
    return this.http.get<CasalDto>(`/api/casais/${id}`);
  }

  criar(request: CasalRequest): Observable<CasalDto> {
    return this.http.post<CasalDto>('/api/casais', request);
  }

  atualizar(id: string, request: CasalRequest): Observable<CasalDto> {
    return this.http.put<CasalDto>(`/api/casais/${id}`, request);
  }

  inativar(id: string, motivo: string): Observable<void> {
    return this.http.post<void>(`/api/casais/${id}/inativar`, { motivo });
  }

  transferir(id: string, equipeDestinoId: string, motivo?: string, papel?: string): Observable<void> {
    return this.http.post<void>(`/api/casais/${id}/transferir`, { equipeDestinoId, papel, motivo });
  }

  registrarMovimentacao(id: string, req: MovimentacaoRequest): Observable<MovimentacaoDto> {
    return this.http.post<MovimentacaoDto>(`/api/casais/${id}/movimentacoes`, req);
  }

  listarMovimentacoes(casalId: string): Observable<MovimentacaoDto[]> {
    return this.http.get<MovimentacaoDto[]>(`/api/casais/${casalId}/movimentacoes`);
  }

  listarMandatos(casalId: string): Observable<MandatoDto[]> {
    return this.http.get<MandatoDto[]>(`/api/casais/${casalId}/mandatos`);
  }
}
