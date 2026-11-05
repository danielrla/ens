import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleStatusDto {
  conectado: boolean;
  configurado: boolean;
  emailGoogle?: string;
  nomeGoogle?: string;
  calendarioEnsId?: string;
  grupoContatosResourceName?: string;
  drivePastaRaizId?: string;
  ultimaSincronizacaoAgenda?: string;
  ultimaSincronizacaoContatos?: string;
  ultimaSincronizacaoDrive?: string;
  redirectUri?: string;
}

export interface GoogleAuthUrlResponse {
  url: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state?: string;
}

export interface SincronizacaoResultadoDto {
  sucesso: boolean;
  mensagem: string;
  itensSincronizados: number;
  detalhes: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GoogleIntegracaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/integracoes/google';

  obterStatus(): Observable<GoogleStatusDto> {
    return this.http.get<GoogleStatusDto>(`${this.baseUrl}/status`);
  }

  obterAuthUrl(state?: string): Observable<GoogleAuthUrlResponse> {
    const params = state ? { state } : undefined;
    return this.http.get<GoogleAuthUrlResponse>(`${this.baseUrl}/auth-url`, { params });
  }

  processarCallback(code: string, state?: string): Observable<GoogleStatusDto> {
    return this.http.post<GoogleStatusDto>(`${this.baseUrl}/callback`, { code, state });
  }

  desconectar(): Observable<GoogleStatusDto> {
    return this.http.delete<GoogleStatusDto>(`${this.baseUrl}/desconectar`);
  }

  sincronizarAgenda(): Observable<SincronizacaoResultadoDto> {
    return this.http.post<SincronizacaoResultadoDto>(`${this.baseUrl}/agenda/sincronizar`, {});
  }

  sincronizarContatos(): Observable<SincronizacaoResultadoDto> {
    return this.http.post<SincronizacaoResultadoDto>(`${this.baseUrl}/contatos/sincronizar`, {});
  }

  sincronizarDrive(): Observable<SincronizacaoResultadoDto> {
    return this.http.post<SincronizacaoResultadoDto>(`${this.baseUrl}/drive/sincronizar`, {});
  }

  sincronizarTudo(): Observable<SincronizacaoResultadoDto> {
    return this.http.post<SincronizacaoResultadoDto>(`${this.baseUrl}/sincronizar-tudo`, {});
  }
}
