import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TituloSce = 'PADRE' | 'DIACONO' | 'BISPO' | 'RELIGIOSO' | 'RELIGIOSA';

export interface SceRequest {
  nomeCompleto: string;
  titulo: TituloSce;
  dioceseCongregacao?: string;
  paroquia?: string;
  telefones?: string[];
  email?: string;
  fotoUrl?: string;
  dataNascimento?: string;
  dataOrdenacaoConsagracao?: string;
}

export interface SceDto extends SceRequest {
  id: string;
  status: 'ATIVO' | 'INATIVO';
}

export interface PageResponse<T> {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: T[];
}

@Injectable({
  providedIn: 'root',
})
export class SceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/sce';

  listar(busca?: string, page = 0, size = 20): Observable<PageResponse<SceDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (busca && busca.trim()) {
      params = params.set('busca', busca.trim());
    }

    return this.http.get<PageResponse<SceDto>>(this.baseUrl, { params });
  }

  listarAtivos(): Observable<SceDto[]> {
    return this.http.get<SceDto[]>(`${this.baseUrl}/ativos`);
  }

  buscarPorId(id: string): Observable<SceDto> {
    return this.http.get<SceDto>(`${this.baseUrl}/${id}`);
  }

  criar(req: SceRequest): Observable<SceDto> {
    return this.http.post<SceDto>(this.baseUrl, req);
  }

  atualizar(id: string, req: SceRequest): Observable<SceDto> {
    return this.http.put<SceDto>(`${this.baseUrl}/${id}`, req);
  }

  inativar(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/inativar`, {});
  }
}
