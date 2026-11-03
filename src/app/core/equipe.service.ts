import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from './casal.service';
import { NoEstrutura } from './estrutura.service';

export type StatusEquipe = 'ATIVA' | 'EM_PILOTAGEM' | 'EM_REESTRUTURACAO' | 'INATIVA';
export type SituacaoMandato = 'VIGENTE_REGULAR' | 'EM_FASE_SUCESSAO' | 'EXPIRADO';
export type AlertaMandato = 'NENHUM' | 'DOURADO' | 'LARANJA' | 'VERMELHO';
export type PapelVinculo = 'MEMBRO' | 'CRE';

export interface VinculoDto {
  casalId: string;
  nomeCasal: string;
  papel: PapelVinculo;
  desde: string;
}

export interface VinculoRequest {
  casalId: string;
  papel: PapelVinculo;
}

export interface EquipeResumoDto {
  id: string;
  numero: number;
  nomeDevocao?: string;
  status: StatusEquipe;
  emPilotagem?: boolean;
  superRegiao?: NoEstrutura;
  provincia?: NoEstrutura;
  regiao?: NoEstrutura;
  setor?: NoEstrutura;
  nomeSce?: string;
  cre?: string;
  casalPilotoId?: string;
  nomeCasalPiloto?: string;
  situacaoMandatoCre?: SituacaoMandato;
  alertaMandato?: AlertaMandato;
  totalCasais: number;
  estado?: string;
  municipio?: string;
}

export interface TemaAno {
  ano: number;
  tema: string;
}

export interface EquipeDetalheDto extends EquipeResumoDto {
  dataFundacao?: string;
  dataInicioPilotagem?: string;
  dataTerminoPilotagem?: string;
  sceId?: string;
  creCasalId?: string;
  temaEstudoAno?: string;
  temasAnuais?: TemaAno[];
  vinculos: VinculoDto[];
}

export interface EquipeRequest {
  numero?: number;
  nomeDevocao?: string;
  superRegiaoId: string;
  provinciaId: string;
  regiaoId: string;
  setorId: string;
  dataFundacao?: string;
  emPilotagem?: boolean;
  dataInicioPilotagem?: string;
  dataTerminoPilotagem?: string;
  casalPilotoId?: string;
  casalResponsavelId?: string;
  status?: StatusEquipe;
  sceId?: string;
  estado?: string;
  municipio?: string;
  temaEstudoAno?: string;
  temasAnuais?: TemaAno[];
}

export interface FiltroEquipe {
  superRegiaoId?: string;
  provinciaId?: string;
  regiaoId?: string;
  setorId?: string;
  equipeId?: string;
  status?: StatusEquipe;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class EquipeService {
  private readonly http = inject(HttpClient);

  listar(filtro: FiltroEquipe = {}): Observable<PageResponse<EquipeResumoDto>> {
    let params = new HttpParams();
    if (filtro.superRegiaoId) params = params.set('superRegiaoId', filtro.superRegiaoId);
    if (filtro.provinciaId) params = params.set('provinciaId', filtro.provinciaId);
    if (filtro.regiaoId) params = params.set('regiaoId', filtro.regiaoId);
    if (filtro.setorId) params = params.set('setorId', filtro.setorId);
    if (filtro.equipeId) params = params.set('equipeId', filtro.equipeId);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.page !== undefined) params = params.set('page', filtro.page);
    if (filtro.size !== undefined) params = params.set('size', filtro.size);

    return this.http.get<PageResponse<EquipeResumoDto>>('/api/equipes', { params });
  }

  obterPorId(id: string): Observable<EquipeDetalheDto> {
    return this.http.get<EquipeDetalheDto>(`/api/equipes/${id}`);
  }

  criar(request: EquipeRequest): Observable<EquipeDetalheDto> {
    return this.http.post<EquipeDetalheDto>('/api/equipes', request);
  }

  atualizar(id: string, request: EquipeRequest): Observable<EquipeDetalheDto> {
    return this.http.put<EquipeDetalheDto>(`/api/equipes/${id}`, request);
  }

  arquivar(id: string): Observable<void> {
    return this.http.post<void>(`/api/equipes/${id}/arquivar`, {});
  }

  atualizarVinculos(id: string, vinculos: VinculoRequest[]): Observable<EquipeDetalheDto> {
    return this.http.put<EquipeDetalheDto>(`/api/equipes/${id}/vinculos`, vinculos);
  }
}
