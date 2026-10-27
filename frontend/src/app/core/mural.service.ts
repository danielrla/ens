import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface MomentoMuralDto {
  id: string;
  equipeId: string;
  titulo: string;
  data: string;
  categoria?: string;
  descricao?: string;
  fotos?: string[];
  autorCasalId?: string;
  autorNome?: string;
  criadoEm?: string;
}

export interface MomentoMuralRequest {
  titulo: string;
  data: string;
  categoria?: string;
  descricao?: string;
  fotos?: string[];
  autorCasalId?: string;
  autorNome?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MuralService {
  private readonly http = inject(HttpClient);

  listarMeuMural(): Observable<MomentoMuralDto[]> {
    return this.http.get<MomentoMuralDto[]>('/api/mural/meu-mural');
  }

  criarMeuMural(request: MomentoMuralRequest): Observable<MomentoMuralDto> {
    return this.http.post<MomentoMuralDto>('/api/mural/meu-mural', request);
  }

  listarPorEquipe(equipeId: string): Observable<MomentoMuralDto[]> {
    return this.http.get<MomentoMuralDto[]>(`/api/equipes/${equipeId}/mural`);
  }

  criar(equipeId: string, request: MomentoMuralRequest): Observable<MomentoMuralDto> {
    return this.http.post<MomentoMuralDto>(`/api/equipes/${equipeId}/mural`, request);
  }

  atualizar(id: string, request: MomentoMuralRequest): Observable<MomentoMuralDto> {
    return this.http.put<MomentoMuralDto>(`/api/mural/${id}`, request);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`/api/mural/${id}`);
  }
}
