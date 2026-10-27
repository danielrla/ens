import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type FuncaoMandato = 'CRE' | 'CL' | 'CRS' | 'CRR' | 'CRP' | 'CRSR' | 'ERI';

export type StatusMandato = 'VIGENTE' | 'CONCLUIDO' | 'INTERROMPIDO_ANTECIPADAMENTE';

export type NivelInstancia = 'EQUIPE' | 'SETOR' | 'REGIAO' | 'PROVINCIA' | 'SUPER_REGIAO' | 'INTERNACIONAL';

export type AlertaMandato = 'NENHUM' | 'DOURADO' | 'LARANJA' | 'VERMELHO';

export interface MandatoRequest {
  casalId?: string;
  sceId?: string;
  funcao: FuncaoMandato;
  nivelInstancia: NivelInstancia;
  instanciaId: string;
  dataInicio: string;
  dataPrevistaTermino?: string;
  observacoes?: string;
}

export interface MandatoDto extends MandatoRequest {
  id: string;
  nomeResponsavel: string;
  nomeInstancia: string;
  dataEncerramentoEfetivo?: string;
  status: StatusMandato;
  alerta: AlertaMandato;
  diasParaTermino?: number;
}

export interface PageResponse<T> {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: T[];
}

export interface PrazoSugeridoDto {
  dataPrevistaTermino: string;
}

export interface InterrupcaoRequest {
  motivo: string;
}

export interface FiltroMandato {
  funcao?: FuncaoMandato;
  status?: StatusMandato;
  nivelInstancia?: NivelInstancia;
  instanciaId?: string;
  alerta?: AlertaMandato;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MandatoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/mandatos';

  listar(filtro: FiltroMandato = {}): Observable<PageResponse<MandatoDto>> {
    let params = new HttpParams();

    if (filtro.funcao) params = params.set('funcao', filtro.funcao);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.nivelInstancia) params = params.set('nivelInstancia', filtro.nivelInstancia);
    if (filtro.instanciaId) params = params.set('instanciaId', filtro.instanciaId);
    if (filtro.alerta) params = params.set('alerta', filtro.alerta);
    params = params.set('page', (filtro.page ?? 0).toString());
    params = params.set('size', (filtro.size ?? 20).toString());

    return this.http.get<PageResponse<MandatoDto>>(this.baseUrl, { params });
  }

  criar(req: MandatoRequest): Observable<MandatoDto> {
    return this.http.post<MandatoDto>(this.baseUrl, req);
  }

  buscarPorId(id: string): Observable<MandatoDto> {
    return this.http.get<MandatoDto>(`${this.baseUrl}/${id}`);
  }

  obterPrazoSugerido(funcao: FuncaoMandato, dataInicio: string): Observable<PrazoSugeridoDto> {
    const params = new HttpParams()
      .set('funcao', funcao)
      .set('dataInicio', dataInicio);
    return this.http.get<PrazoSugeridoDto>(`${this.baseUrl}/prazo-sugerido`, { params });
  }

  interromper(id: string, motivo: string): Observable<MandatoDto> {
    return this.http.post<MandatoDto>(`${this.baseUrl}/${id}/interromper`, { motivo });
  }
}
