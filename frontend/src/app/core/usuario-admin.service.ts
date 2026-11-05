import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilUsuario, StatusUsuario, TipoUsuario, UsuarioLogado } from './auth.model';

export interface PageUsuarios {
  content: UsuarioLogado[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CriarUsuarioPayload {
  nome: string;
  email: string;
  senha?: string;
  tipoUsuario?: TipoUsuario;
  perfis: PerfilUsuario[];
  casalId?: string;
  sceId?: string;
  equipeId?: string;
  setorId?: string;
  regiaoId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioAdminService {
  private readonly http = inject(HttpClient);

  listar(busca?: string, page = 0, size = 20): Observable<PageUsuarios> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (busca && busca.trim()) {
      params = params.set('busca', busca.trim());
    }
    return this.http.get<PageUsuarios>('/api/admin/usuarios', { params });
  }

  obterPorId(id: string): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`/api/admin/usuarios/${id}`);
  }

  criar(dados: CriarUsuarioPayload): Observable<UsuarioLogado> {
    return this.http.post<UsuarioLogado>('/api/admin/usuarios', dados);
  }

  atualizarPerfis(id: string, perfis: PerfilUsuario[]): Observable<UsuarioLogado> {
    return this.http.patch<UsuarioLogado>(`/api/admin/usuarios/${id}/perfis`, { perfis });
  }

  alterarStatus(id: string, status: StatusUsuario): Observable<UsuarioLogado> {
    return this.http.patch<UsuarioLogado>(`/api/admin/usuarios/${id}/status`, { status });
  }

  resetarSenha(id: string): Observable<{ mensagem: string; novaSenhaTemporaria: string }> {
    return this.http.post<{ mensagem: string; novaSenhaTemporaria: string }>(
      `/api/admin/usuarios/${id}/reset-senha`,
      {}
    );
  }
}

