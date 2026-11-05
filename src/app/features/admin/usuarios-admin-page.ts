import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioAdminService, CriarUsuarioPayload } from '../../core/usuario-admin.service';
import { PerfilUsuario, StatusUsuario, TipoUsuario, UsuarioLogado } from '../../core/auth.model';

@Component({
  selector: 'app-usuarios-admin-page',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div>
          <h1>Gestão de Usuários e Acessos</h1>
          <p class="subtitulo">Controle de perfis estatutários, bloqueios e redefinições de senha</p>
        </div>
        <button type="button" class="btn btn-primario" (click)="abrirModalNovo()">
          ➕ Novo Usuário
        </button>
      </header>

      <!-- Mensagem de Feedback / Notificação -->
      @if (alertaFeedback()) {
        <div class="alerta" [class.alerta-sucesso]="alertaFeedback()!.tipo === 'sucesso'" [class.alerta-erro]="alertaFeedback()!.tipo === 'erro'">
          <span>{{ alertaFeedback()!.tipo === 'sucesso' ? '✅' : '⚠️' }}</span>
          <div class="alerta-conteudo">
            <strong>{{ alertaFeedback()!.mensagem }}</strong>
            @if (alertaFeedback()!.extra) {
              <div class="alerta-extra">{{ alertaFeedback()!.extra }}</div>
            }
          </div>
          <button type="button" class="btn-fechar-alerta" (click)="alertaFeedback.set(null)">✕</button>
        </div>
      }

      <!-- Barra de Filtros e Busca -->
      <div class="barra-filtros cartao">
        <div class="campo-busca">
          <span class="icone-busca">🔍</span>
          <input
            type="text"
            [(ngModel)]="termoBusca"
            (keyup.enter)="carregarUsuarios()"
            placeholder="Buscar por nome ou e-mail..."
          />
        </div>
        <button type="button" class="btn btn-secundario" (click)="carregarUsuarios()">
          Buscar
        </button>
      </div>

      <!-- Tabela de Usuários -->
      <div class="tabela-container cartao">
        @if (carregando()) {
          <div class="estado-vazio">
            <div class="spinner"></div>
            <p>Carregando usuários cadastrados...</p>
          </div>
        } @else if (usuarios().length === 0) {
          <div class="estado-vazio">
            <p>Nenhum usuário encontrado com os critérios informados.</p>
          </div>
        } @else {
          <table class="tabela-dados">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Tipo</th>
                <th>Perfis Atribuídos</th>
                <th>Status</th>
                <th class="col-acoes">Ações de Governança</th>
              </tr>
            </thead>
            <tbody>
              @for (u of usuarios(); track u.id) {
                <tr>
                  <td>
                    <div class="usuario-info">
                      <strong>{{ u.nome }}</strong>
                      <small class="email-sub">{{ u.email }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [class.badge-azul]="u.tipoUsuario === 'INDIVIDUAL'" [class.badge-cinza]="u.tipoUsuario === 'CASAL'">
                      {{ u.tipoUsuario }}
                    </span>
                  </td>
                  <td>
                    <div class="tags-perfis">
                      @for (p of u.perfis; track p) {
                        <span class="tag-perfil" [class.tag-admin]="p === 'ADMINISTRADOR'" [class.tag-cre]="p === 'CRE'" [class.tag-sce]="p === 'SACERDOTE'">
                          {{ p }}
                        </span>
                      }
                    </div>
                  </td>
                  <td>
                    @if (u.status === 'ATIVO') {
                      <span class="status-badge status-ativo">Ativo</span>
                    } @else {
                      <span class="status-badge status-bloqueado">Bloqueado</span>
                    }
                  </td>
                  <td class="col-acoes">
                    <div class="botoes-acoes">
                      <button
                        type="button"
                        class="btn-acao-tabela"
                        (click)="abrirModalPerfis(u)"
                        title="Atribuir ou alterar perfis"
                      >
                        🏷️
                      </button>

                      <button
                        type="button"
                        class="btn-acao-tabela"
                        (click)="resetarSenha(u)"
                        title="Resetar senha e gerar nova senha temporária"
                      >
                        🔑
                      </button>

                      @if (u.status === 'ATIVO') {
                        <button
                          type="button"
                          class="btn-acao-tabela btn-perigo"
                          (click)="alternarStatus(u, 'BLOQUEADO')"
                          title="Bloquear acesso do usuário"
                        >
                          🔒
                        </button>
                      } @else {
                        <button
                          type="button"
                          class="btn-acao-tabela btn-sucesso"
                          (click)="alternarStatus(u, 'ATIVO')"
                          title="Desbloquear acesso do usuário"
                        >
                          🔓
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Modal: Atribuir / Editar Perfis -->
      @if (modalPerfisAberto()) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <header class="modal-header">
              <h2>Atribuir Perfis: {{ usuarioSelecionado()?.nome }}</h2>
              <button type="button" class="btn-fechar" (click)="fecharModalPerfis()">✕</button>
            </header>

            <div class="modal-corpo">
              <p class="instrucao-perfis">
                Selecione os perfis para este usuário. Nota estatutária: perfis de <strong>ADMINISTRADOR</strong> e <strong>SACERDOTE</strong> são individuais; os demais são vinculados ao casal.
              </p>

              <div class="grid-perfis">
                @for (opcao of listaOpcoesPerfis; track opcao.valor) {
                  <label class="item-checkbox-perfil">
                    <input
                      type="checkbox"
                      [checked]="perfisEdicao().includes(opcao.valor)"
                      (change)="togglePerfilEdicao(opcao.valor)"
                    />
                    <div>
                      <strong>{{ opcao.rotulo }}</strong>
                      <small>{{ opcao.descricao }}</small>
                    </div>
                  </label>
                }
              </div>
            </div>

            <footer class="modal-footer">
              <button type="button" class="btn btn-secundario" (click)="fecharModalPerfis()">Cancelar</button>
              <button
                type="button"
                class="btn btn-primario"
                [disabled]="perfisEdicao().length === 0"
                (click)="salvarPerfis()"
              >
                Salvar Perfis
              </button>
            </footer>
          </div>
        </div>
      }

      <!-- Modal: Novo Usuário -->
      @if (modalNovoAberto()) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <header class="modal-header">
              <h2>Cadastrar Novo Usuário</h2>
              <button type="button" class="btn-fechar" (click)="fecharModalNovo()">✕</button>
            </header>

            <form (ngSubmit)="salvarNovoUsuario()" class="modal-corpo form-novo-usuario">
              <div class="campo-form">
                <label for="novoNome">Nome Completo</label>
                <input
                  type="text"
                  id="novoNome"
                  [(ngModel)]="novoUsuario.nome"
                  name="nome"
                  required
                  placeholder="Ex: João e Maria Silva ou Pe. Pedro"
                />
              </div>

              <div class="campo-form">
                <label for="novoEmail">E-mail</label>
                <input
                  type="email"
                  id="novoEmail"
                  [(ngModel)]="novoUsuario.email"
                  name="email"
                  required
                  placeholder="usuario@ens.org.br"
                />
              </div>

              <div class="campo-form">
                <label for="novaSenha">Senha Inicial (opcional - gera automática se vazio)</label>
                <input
                  type="text"
                  id="novaSenha"
                  [(ngModel)]="novoUsuario.senha"
                  name="senha"
                  placeholder="Deixe vazio para gerar automática"
                />
              </div>

              <div class="campo-form">
                <label>Perfis Iniciais</label>
                <div class="grid-perfis">
                  @for (opcao of listaOpcoesPerfis; track opcao.valor) {
                    <label class="item-checkbox-perfil">
                      <input
                        type="checkbox"
                        [checked]="novoUsuario.perfis.includes(opcao.valor)"
                        (change)="togglePerfilNovo(opcao.valor)"
                      />
                      <div>
                        <strong>{{ opcao.rotulo }}</strong>
                        <small>{{ opcao.descricao }}</small>
                      </div>
                    </label>
                  }
                </div>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn btn-secundario" (click)="fecharModalNovo()">Cancelar</button>
                <button
                  type="submit"
                  class="btn btn-primario"
                  [disabled]="!novoUsuario.nome.trim() || !novoUsuario.email.trim() || novoUsuario.perfis.length === 0"
                >
                  Criar Usuário
                </button>
              </footer>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .admin-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      margin: 0 0 0.25rem 0;
      color: #0f172a;
      font-size: 1.6rem;
    }

    .subtitulo {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }

    .alerta {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      position: relative;
    }

    .alerta-sucesso {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .alerta-erro {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .alerta-conteudo {
      flex: 1;
    }

    .alerta-extra {
      margin-top: 0.35rem;
      font-size: 0.9rem;
      background: rgba(0, 0, 0, 0.05);
      padding: 0.4rem 0.6rem;
      border-radius: 0.25rem;
      font-family: monospace;
    }

    .btn-fechar-alerta {
      background: transparent;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      color: inherit;
    }

    .cartao {
      background: #ffffff;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .barra-filtros {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
    }

    .campo-busca {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      padding: 0 0.75rem;
      gap: 0.5rem;
    }

    .campo-busca input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 0.6rem 0;
      font-size: 0.95rem;
      outline: none;
    }

    .tabela-container {
      overflow-x: auto;
    }

    .tabela-dados {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .tabela-dados th {
      background: #f8fafc;
      padding: 0.85rem 1rem;
      color: #475569;
      font-weight: 600;
      border-bottom: 1px solid #e2e8f0;
    }

    .tabela-dados td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .usuario-info {
      display: flex;
      flex-direction: column;
    }

    .email-sub {
      color: #64748b;
      font-size: 0.8rem;
    }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-azul {
      background: #e0f2fe;
      color: #0369a1;
    }

    .badge-cinza {
      background: #f1f5f9;
      color: #475569;
    }

    .tags-perfis {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }

    .tag-perfil {
      background: #f3f4f6;
      color: #374151;
      padding: 0.15rem 0.45rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tag-admin {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .tag-cre {
      background: #ede9fe;
      color: #5b21b6;
    }

    .tag-sce {
      background: #e0e7ff;
      color: #3730a3;
    }

    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-ativo {
      background: #dcfce7;
      color: #166534;
    }

    .status-bloqueado {
      background: #fee2e2;
      color: #991b1b;
    }

    .col-acoes {
      text-align: right;
    }

    .botoes-acoes {
      display: inline-flex;
      gap: 0.4rem;
    }

    .btn-acao-tabela {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 0.35rem 0.65rem;
      border-radius: 0.375rem;
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 500;
      color: #1e293b;
      transition: background 0.15s;
    }

    .btn-acao-tabela:hover {
      background: #e2e8f0;
    }

    .btn-perigo {
      color: #b91c1c;
      border-color: #fca5a5;
    }

    .btn-perigo:hover {
      background: #fee2e2;
    }

    .btn-sucesso {
      color: #15803d;
      border-color: #86efac;
    }

    .btn-sucesso:hover {
      background: #dcfce7;
    }

    .btn {
      padding: 0.6rem 1.1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border: none;
      transition: background 0.15s;
    }

    .btn-primario {
      background: #1e3a8a;
      color: #ffffff;
    }

    .btn-primario:hover:not(:disabled) {
      background: #1e40af;
    }

    .btn-primario:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secundario {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }

    .btn-secundario:hover {
      background: #e2e8f0;
    }

    .estado-vazio {
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }

    /* Modais */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(2px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 0.75rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #0f172a;
    }

    .btn-fechar {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;
    }

    .modal-corpo {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .instrucao-perfis {
      color: #475569;
      font-size: 0.875rem;
      margin-top: 0;
      margin-bottom: 1.25rem;
      line-height: 1.4;
    }

    .grid-perfis {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .item-checkbox-perfil {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }

    .item-checkbox-perfil:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .item-checkbox-perfil input {
      margin-top: 0.25rem;
      cursor: pointer;
    }

    .item-checkbox-perfil div {
      display: flex;
      flex-direction: column;
    }

    .item-checkbox-perfil small {
      color: #64748b;
      font-size: 0.8rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .form-novo-usuario {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .campo-form {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .campo-form label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .campo-form input {
      padding: 0.65rem 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .topo-admin {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      .topo-admin .btn-primario {
        width: 100%;
        min-height: 48px;
        justify-content: center;
      }
      .barra-filtros {
        flex-direction: column;
      }
      .tabela-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .tabela-admin th,
      .tabela-admin td {
        padding: 0.75rem 0.6rem;
      }
      .btn-acao-tabela {
        min-width: 44px;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
      }
      .modal-card {
        max-width: 100%;
        margin: 0.5rem;
      }
    }
  `,
})
export class UsuariosAdminPage implements OnInit {
  private readonly usuarioAdminService = inject(UsuarioAdminService);

  protected usuarios = signal<UsuarioLogado[]>([]);
  protected carregando = signal<boolean>(false);
  protected termoBusca = '';

  protected alertaFeedback = signal<{ tipo: 'sucesso' | 'erro'; mensagem: string; extra?: string } | null>(null);

  protected modalPerfisAberto = signal<boolean>(false);
  protected usuarioSelecionado = signal<UsuarioLogado | null>(null);
  protected perfisEdicao = signal<PerfilUsuario[]>([]);

  protected modalNovoAberto = signal<boolean>(false);
  protected novoUsuario: CriarUsuarioPayload = {
    nome: '',
    email: '',
    senha: '',
    perfis: ['MEMBRO_EQUIPE'],
  };

  readonly listaOpcoesPerfis: { valor: PerfilUsuario; rotulo: string; descricao: string }[] = [
    {
      valor: 'MEMBRO_EQUIPE',
      rotulo: 'Membro de Equipe (Casal)',
      descricao: 'Acesso estrito à agenda de reuniões e ao mural de bordo da sua própria equipe.',
    },
    {
      valor: 'CRE',
      rotulo: 'Casal Responsável de Equipe - CRE (Casal)',
      descricao: 'Tudo de Membro + Dashboard da sua equipe e quadro de avisos.',
    },
    {
      valor: 'SACERDOTE',
      rotulo: 'Sacerdote / Conselheiro Espiritual (Individual)',
      descricao: 'Tudo de Membro + Dashboard da sua equipe e quadro de avisos.',
    },
    {
      valor: 'RESPONSAVEL_SETOR',
      rotulo: 'Responsável de Setor (Casal)',
      descricao: 'Acumula funções de equipe + Dashboard Geral e visão de todas as equipes do seu setor.',
    },
    {
      valor: 'RESPONSAVEL_REGIAO',
      rotulo: 'Responsável de Região (Casal)',
      descricao: 'Acumula funções de equipe + Dashboard Geral e visão de todas as equipes da sua região.',
    },
    {
      valor: 'ADMINISTRADOR',
      rotulo: 'Administrador do Sistema (Individual)',
      descricao: 'Acesso total e irrestrito ao sistema, integrações e governança de usuários.',
    },
  ];

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregando.set(true);
    this.usuarioAdminService.listar(this.termoBusca).subscribe({
      next: (res) => {
        this.usuarios.set(res.content || []);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.alertaFeedback.set({
          tipo: 'erro',
          mensagem: 'Falha ao carregar a listagem de usuários.',
        });
      },
    });
  }

  abrirModalPerfis(u: UsuarioLogado): void {
    this.usuarioSelecionado.set(u);
    this.perfisEdicao.set([...u.perfis]);
    this.modalPerfisAberto.set(true);
  }

  fecharModalPerfis(): void {
    this.modalPerfisAberto.set(false);
    this.usuarioSelecionado.set(null);
    this.perfisEdicao.set([]);
  }

  togglePerfilEdicao(perfil: PerfilUsuario): void {
    const atuais = this.perfisEdicao();
    if (atuais.includes(perfil)) {
      this.perfisEdicao.set(atuais.filter((p) => p !== perfil));
    } else {
      this.perfisEdicao.set([...atuais, perfil]);
    }
  }

  salvarPerfis(): void {
    const u = this.usuarioSelecionado();
    if (!u) return;

    this.usuarioAdminService.atualizarPerfis(u.id, this.perfisEdicao()).subscribe({
      next: () => {
        this.fecharModalPerfis();
        this.alertaFeedback.set({
          tipo: 'sucesso',
          mensagem: `Perfis do usuário ${u.nome} atualizados com sucesso.`,
        });
        this.carregarUsuarios();
      },
      error: (err) => {
        this.alertaFeedback.set({
          tipo: 'erro',
          mensagem: err.error?.message || 'Falha ao atualizar perfis.',
        });
      },
    });
  }

  alternarStatus(u: UsuarioLogado, novoStatus: StatusUsuario): void {
    this.usuarioAdminService.alterarStatus(u.id, novoStatus).subscribe({
      next: () => {
        this.alertaFeedback.set({
          tipo: 'sucesso',
          mensagem: `Usuário ${u.nome} foi ${novoStatus === 'ATIVO' ? 'desbloqueado' : 'bloqueado'} com sucesso.`,
        });
        this.carregarUsuarios();
      },
      error: () => {
        this.alertaFeedback.set({
          tipo: 'erro',
          mensagem: 'Falha ao alterar o status do usuário.',
        });
      },
    });
  }

  resetarSenha(u: UsuarioLogado): void {
    if (!confirm(`Deseja resetar a senha do usuário ${u.nome}? Uma nova senha temporária será gerada e enviada por e-mail.`)) {
      return;
    }

    this.usuarioAdminService.resetarSenha(u.id).subscribe({
      next: (res) => {
        this.alertaFeedback.set({
          tipo: 'sucesso',
          mensagem: `Senha de ${u.nome} redefinida com sucesso!`,
          extra: `Nova Senha Temporária: ${res.novaSenhaTemporaria}`,
        });
      },
      error: () => {
        this.alertaFeedback.set({
          tipo: 'erro',
          mensagem: 'Falha ao resetar a senha do usuário.',
        });
      },
    });
  }

  abrirModalNovo(): void {
    this.novoUsuario = {
      nome: '',
      email: '',
      senha: '',
      perfis: ['MEMBRO_EQUIPE'],
    };
    this.modalNovoAberto.set(true);
  }

  fecharModalNovo(): void {
    this.modalNovoAberto.set(false);
  }

  togglePerfilNovo(perfil: PerfilUsuario): void {
    if (this.novoUsuario.perfis.includes(perfil)) {
      this.novoUsuario.perfis = this.novoUsuario.perfis.filter((p) => p !== perfil);
    } else {
      this.novoUsuario.perfis = [...this.novoUsuario.perfis, perfil];
    }
  }

  salvarNovoUsuario(): void {
    if (!this.novoUsuario.nome.trim() || !this.novoUsuario.email.trim() || this.novoUsuario.perfis.length === 0) {
      return;
    }

    this.usuarioAdminService.criar(this.novoUsuario).subscribe({
      next: (criado) => {
        this.fecharModalNovo();
        this.alertaFeedback.set({
          tipo: 'sucesso',
          mensagem: `Usuário ${criado.nome} criado com sucesso!`,
        });
        this.carregarUsuarios();
      },
      error: (err) => {
        this.alertaFeedback.set({
          tipo: 'erro',
          mensagem: err.error?.message || 'Falha ao cadastrar o novo usuário.',
        });
      },
    });
  }
}

