import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type MetodoEnvioEmail = 'SMTP' | 'OAUTH2';

export interface EmailConfigDto {
  metodo: MetodoEnvioEmail;
  remetenteEmail: string;
  remetenteNome: string;
  // Campos SMTP
  smtpHost: string;
  smtpPorta: number;
  smtpUsuario: string;
  senhaAppMascarada: string;
  usaTls: boolean;
  // Campos OAuth2 Google Workspace
  oauthClientId?: string;
  oauthClientSecretMascarado?: string;
  oauthConectado?: boolean;
  // Status de Operação
  ativo: boolean;
  ultimoTesteEm?: string;
  ultimoTesteSucesso?: boolean;
  ultimaMensagemTeste?: string;
}

export interface SalvarEmailConfigRequest extends Partial<EmailConfigDto> {
  senhaAppReal?: string;
  oauthClientSecretReal?: string;
}

export interface TesteEmailRequest {
  destinatario: string;
  assunto?: string;
  mensagem?: string;
}

export interface TesteEmailResponse {
  sucesso: boolean;
  mensagem: string;
  timestamp: string;
  detalhes?: string;
}

export interface LogEnvioEmailDto {
  id: string;
  destinatario: string;
  assunto: string;
  tipo: 'TESTE' | 'AVISO_SEMANAL' | 'AVISO_VESPERA_D1' | 'AVISO_IMEDIATO_H4';
  sucesso: boolean;
  dataHora: string;
  detalhes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailIntegracaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/email';

  obterConfiguracao(): Observable<EmailConfigDto> {
    return this.http.get<EmailConfigDto>(`${this.baseUrl}/config`);
  }

  salvarConfiguracao(dados: SalvarEmailConfigRequest): Observable<EmailConfigDto> {
    return this.http.put<EmailConfigDto>(`${this.baseUrl}/config`, dados);
  }

  testarEnvio(dados: TesteEmailRequest): Observable<TesteEmailResponse> {
    return this.http.post<TesteEmailResponse>(`${this.baseUrl}/testar`, dados);
  }

  obterLogs(): Observable<LogEnvioEmailDto[]> {
    return this.http.get<LogEnvioEmailDto[]>(`${this.baseUrl}/logs`);
  }

  enviarEmail(dados: {
    destinatario: string;
    assunto: string;
    corpo: string;
    tipo: LogEnvioEmailDto['tipo'];
  }): Observable<TesteEmailResponse> {
    return this.http.post<TesteEmailResponse>(`${this.baseUrl}/enviar`, dados);
  }
}
