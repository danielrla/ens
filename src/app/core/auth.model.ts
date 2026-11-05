export type PerfilUsuario =
  | 'ADMINISTRADOR'
  | 'MEMBRO_EQUIPE'
  | 'CRE'
  | 'SACERDOTE'
  | 'RESPONSAVEL_SETOR'
  | 'RESPONSAVEL_REGIAO';

export type TipoUsuario = 'INDIVIDUAL' | 'CASAL';
export type StatusUsuario = 'ATIVO' | 'BLOQUEADO';

export interface UsuarioLogado {
  id: string;
  email: string;
  nome: string;
  tipoUsuario: TipoUsuario;
  perfis: PerfilUsuario[];
  casalId?: string;
  sceId?: string;
  equipeId?: string;
  setorId?: string;
  regiaoId?: string;
  status?: StatusUsuario;
  criadoEm?: string;
  ultimoAcessoEm?: string;
}

export interface LoginResponse {
  token: string;
  usuarioId: string;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  perfis: PerfilUsuario[];
  casalId?: string;
  sceId?: string;
  equipeId?: string;
  setorId?: string;
  regiaoId?: string;
}

