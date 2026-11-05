import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse, PerfilUsuario, UsuarioLogado } from './auth.model';

const TOKEN_KEY = 'ens_auth_token';
const USUARIO_KEY = 'ens_auth_usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private static readonly LOGGED_OUT_KEY = 'ens_logged_out';

  private static readonly DEFAULT_ADMIN: UsuarioLogado = {
    id: 'usr-admin-principal',
    email: 'admin@ens.org.br',
    nome: 'Super Administrador ENS',
    tipoUsuario: 'INDIVIDUAL',
    perfis: ['ADMINISTRADOR', 'RESPONSAVEL_REGIAO', 'RESPONSAVEL_SETOR', 'CRE', 'MEMBRO_EQUIPE'],
    status: 'ATIVO',
  };

  readonly usuarioAtual = signal<UsuarioLogado | null>(this.obterUsuarioArmazenado());
  readonly token = signal<string | null>(this.obterTokenArmazenado());

  readonly isLogado = computed(() => !!this.token() && !!this.usuarioAtual());

  private obterTokenArmazenado(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) return token;
    const loggedOut = localStorage.getItem(AuthService.LOGGED_OUT_KEY);
    if (loggedOut === 'true') return null;
    // Auto-login default admin
    const defaultToken = 'mock-jwt-admin-token';
    localStorage.setItem(TOKEN_KEY, defaultToken);
    return defaultToken;
  }

  private obterUsuarioArmazenado(): UsuarioLogado | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(USUARIO_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const loggedOut = localStorage.getItem(AuthService.LOGGED_OUT_KEY);
    if (loggedOut === 'true') return null;
    // Auto-login default admin
    localStorage.setItem(USUARIO_KEY, JSON.stringify(AuthService.DEFAULT_ADMIN));
    return AuthService.DEFAULT_ADMIN;
  }

  login(credenciais: { email: string; senha: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', credenciais).pipe(
      tap((res) => {
        const usuario: UsuarioLogado = {
          id: res.usuarioId,
          email: res.email,
          nome: res.nome,
          tipoUsuario: res.tipoUsuario,
          perfis: res.perfis,
          casalId: res.casalId,
          sceId: res.sceId,
          equipeId: res.equipeId,
          setorId: res.setorId,
          regiaoId: res.regiaoId,
        };

        localStorage.removeItem(AuthService.LOGGED_OUT_KEY);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));

        this.token.set(res.token);
        this.usuarioAtual.set(usuario);
      })
    );
  }

  logout(): void {
    localStorage.setItem(AuthService.LOGGED_OUT_KEY, 'true');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.token.set(null);
    this.usuarioAtual.set(null);
    this.router.navigate(['/login']);
  }

  solicitarResetSenha(email: string): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>('/api/auth/esqueci-senha', { email });
  }

  redefinirSenha(dados: { token: string; novaSenha: string }): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>('/api/auth/reset-senha', dados);
  }

  trocarSenha(dados: { senhaAtual: string; novaSenha: string }): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>('/api/auth/trocar-senha', dados);
  }

  loginComBiometria(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/biometria/autenticar', { email }).pipe(
      tap((res) => {
        const usuario: UsuarioLogado = {
          id: res.usuarioId,
          email: res.email,
          nome: res.nome,
          tipoUsuario: res.tipoUsuario,
          perfis: res.perfis,
          casalId: res.casalId,
          sceId: res.sceId,
          equipeId: res.equipeId,
          setorId: res.setorId,
          regiaoId: res.regiaoId,
        };

        localStorage.removeItem(AuthService.LOGGED_OUT_KEY);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));

        this.token.set(res.token);
        this.usuarioAtual.set(usuario);
      })
    );
  }

  temPerfil(...perfisDesejados: PerfilUsuario[]): boolean {
    const usuario = this.usuarioAtual();
    if (!usuario || !usuario.perfis) return false;
    if (usuario.perfis.includes('ADMINISTRADOR')) return true;
    return perfisDesejados.some((p) => usuario.perfis.includes(p));
  }

  podeAcessarRota(rota: string): boolean {
    const usuario = this.usuarioAtual();
    if (!usuario || !usuario.perfis || usuario.perfis.length === 0) return false;

    // Administrador tem acesso total
    if (usuario.perfis.includes('ADMINISTRADOR')) return true;

    // Rotas de administração exclusivas de ADMIN
    if (rota.startsWith('/admin')) {
      return false;
    }

    const perfis = usuario.perfis;
    const isRegiao = perfis.includes('RESPONSAVEL_REGIAO');
    const isSetor = perfis.includes('RESPONSAVEL_SETOR');
    const isCre = perfis.includes('CRE');
    const isSacerdote = perfis.includes('SACERDOTE');
    const isMembro = perfis.includes('MEMBRO_EQUIPE');

    // Dashboard Geral: Responsáveis de Região e Setor
    if (rota === '/dashboard') {
      return isRegiao || isSetor;
    }

    // Estrutura e Membros: Responsáveis de Região e Setor
    if (rota.startsWith('/estrutura') || rota.startsWith('/casais') || rota.startsWith('/sacerdotes') || rota.startsWith('/mandatos')) {
      return isRegiao || isSetor;
    }

    // Equipes de Base: Responsáveis de Região/Setor ou CRE/Sacerdote (Quadro de Avisos)
    if (rota === '/equipes') {
      return isRegiao || isSetor || isCre || isSacerdote;
    }

    // Dashboard Equipe: CRE e Sacerdote (ou superiores)
    if (rota === '/reunioes/dashboard' || rota === '/vida-equipe/dashboard') {
      return isRegiao || isSetor || isCre || isSacerdote;
    }

    // Agenda e Reuniões, Mural de Bordo e Perfil: Membro de Equipe (e todos que acumulam)
    if (rota.startsWith('/reunioes') || rota.startsWith('/mural') || rota.startsWith('/perfil')) {
      return isMembro || isCre || isSacerdote || isSetor || isRegiao;
    }

    return true;
  }
}

