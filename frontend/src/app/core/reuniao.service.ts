import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endereco } from './casal.service';

export type StatusPresenca = 'PRESENTE' | 'FALTOU' | 'JUSTIFICOU';

export interface PresencaCasal {
  casalId: string;
  status: StatusPresenca;
  observacao?: string;
}

export interface PresencaDetalheDto {
  casalId: string;
  nomeCasal: string;
  status: StatusPresenca;
  observacao?: string;
}

export type TipoReuniao = 'FORMAL' | 'INFORMAL';

export interface ReuniaoRequest {
  data: string;
  horario?: string;
  tipo?: TipoReuniao;
  casalAnimadorId?: string;
  tema?: string;
  casalAnfitriaoId?: string;
  localObservacao?: string;
  scePresente?: boolean;
  presencas?: PresencaCasal[];
  anotacoesCre?: string;
  fotos?: string[];
}

export interface RegistroPresencaRequest {
  scePresente?: boolean;
  presencas: PresencaCasal[];
  anotacoesCre?: string;
  fotos?: string[];
}

export interface ReuniaoDto {
  id: string;
  equipeId: string;
  data: string;
  horario?: string;
  tipo?: TipoReuniao;
  casalAnimadorId?: string;
  nomeCasalAnimador?: string;
  tema?: string;
  casalAnfitriaoId?: string;
  nomeCasalAnfitriao?: string;
  enderecoAnfitriao?: Endereco;
  localObservacao?: string;
  scePresente: boolean;
  presencas: PresencaDetalheDto[];
  anotacoesCre?: string;
  fotos?: string[];
  totalPresentes: number;
  totalFaltas: number;
  totalJustificadas: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReuniaoService {
  private readonly http = inject(HttpClient);

  listarTodas(equipeId?: string): Observable<ReuniaoDto[]> {
    let params = new HttpParams();
    if (equipeId) {
      params = params.set('equipeId', equipeId);
    }
    return this.http.get<ReuniaoDto[]>('/api/reunioes', { params });
  }

  listarMinhaEquipe(): Observable<ReuniaoDto[]> {
    return this.http.get<ReuniaoDto[]>('/api/reunioes/minha-equipe');
  }

  listarPorEquipe(equipeId: string): Observable<ReuniaoDto[]> {
    return this.http.get<ReuniaoDto[]>(`/api/equipes/${equipeId}/reunioes`);
  }

  obterPorId(id: string): Observable<ReuniaoDto> {
    return this.http.get<ReuniaoDto>(`/api/reunioes/${id}`);
  }

  agendar(equipeId: string, req: ReuniaoRequest): Observable<ReuniaoDto> {
    return this.http.post<ReuniaoDto>(`/api/equipes/${equipeId}/reunioes`, req);
  }

  atualizar(id: string, req: ReuniaoRequest): Observable<ReuniaoDto> {
    return this.http.put<ReuniaoDto>(`/api/reunioes/${id}`, req);
  }

  registrarPresencas(id: string, req: RegistroPresencaRequest): Observable<ReuniaoDto> {
    return this.http.put<ReuniaoDto>(`/api/reunioes/${id}/presencas`, req);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`/api/reunioes/${id}`);
  }
}
