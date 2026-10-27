import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SceDto, SceRequest, SceService, TituloSce } from '../../core/sce.service';
import { mascararTelefone, desmascarar } from '../../core/mascara.util';
import { EnsDatePipe } from '../../core/ens-date.pipe';

@Component({
  selector: 'app-sacerdotes-page',
  imports: [CommonModule, FormsModule, EnsDatePipe],
  template: `
    <div class="sacerdotes-container">
      <!-- Cabeçalho -->
      <header class="page-header">
        <div class="header-titles">
          <h1>Sacerdotes e Conselheiros Espirituais (SCE)</h1>
          <p class="subtitulo">
            Acompanhamento e cadastro dos conselheiros espirituais dedicados ao movimento das Equipes de Nossa Senhora.
          </p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary" (click)="abrirModalNovo()">
            <span>➕</span> Cadastrar Sacerdote
          </button>
        </div>
      </header>

      <!-- Barra de Busca -->
      <section class="filtros-card">
        <div class="busca-wrapper">
          <span class="icone-busca">🔍</span>
          <input
            type="text"
            [(ngModel)]="termoBusca"
            (ngModelChange)="buscar()"
            placeholder="Buscar por nome, diocese ou paróquia..."
          />
        </div>
      </section>

      <!-- Listagem de Sacerdotes -->
      <section class="tabela-card">
        @if (carregando()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Carregando sacerdotes...</p>
          </div>
        } @else if (sacerdotes().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🕊️</span>
            <h3>Nenhum sacerdote localizado</h3>
            <p>Cadastre os sacerdotes para vinculá-los às equipes de base.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="tabela-sce">
              <thead>
                <tr>
                  <th>Título e Nome</th>
                  <th>Diocese / Congregação</th>
                  <th>Paróquia</th>
                  <th>Contatos</th>
                  <th>Datas</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (s of sacerdotes(); track s.id) {
                  <tr>
                    <td>
                      <div class="col-nome">
                        @if (s.fotoUrl) {
                          <img [src]="s.fotoUrl" [alt]="s.nomeCompleto" class="avatar-tabela" />
                        } @else {
                          <div class="avatar-tabela avatar-padrao">✝️</div>
                        }
                        <div>
                          <span class="badge-titulo">{{ s.titulo }}</span>
                          <strong>{{ s.nomeCompleto }}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{{ s.dioceseCongregacao || 'Não informada' }}</td>
                    <td>{{ s.paroquia || 'Não informada' }}</td>
                    <td>
                      <div class="col-contato">
                        @if (s.email) {
                          <span class="email-link">📧 {{ s.email }}</span>
                        }
                        @if (s.telefones && s.telefones.length > 0) {
                          <span class="tel-link">📱 {{ formatarTelefones(s.telefones) }}</span>
                        }
                      </div>
                    </td>
                    <td>
                      @if (s.dataNascimento) {
                        <div><small>🎂 Nasc: {{ s.dataNascimento | ensDate }}</small></div>
                      }
                      @if (s.dataOrdenacaoConsagracao) {
                        <div><small>✝️ Ord: {{ s.dataOrdenacaoConsagracao | ensDate }}</small></div>
                      }
                      @if (!s.dataNascimento && !s.dataOrdenacaoConsagracao) {
                        —
                      }
                    </td>
                    <td>
                      <span class="badge-status" [class.status-ativo]="s.status === 'ATIVO'">
                        {{ s.status === 'ATIVO' ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td>
                      <div class="acoes-linha">
                        <button type="button" class="btn-acao" (click)="editar(s)">
                          Editar
                        </button>
                        @if (s.status === 'ATIVO') {
                          <button type="button" class="btn-acao btn-inativar" (click)="inativar(s)">
                            Inativar
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <!-- Modal Cadastro / Edição -->
      @if (modalAberto()) {
        <div class="modal-backdrop" (click)="fecharModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h2>{{ editandoId ? 'Editar Sacerdote' : 'Cadastrar Sacerdote' }}</h2>
              <button type="button" class="btn-fechar" (click)="fecharModal()">✕</button>
            </header>

            <form class="modal-body" (ngSubmit)="salvar()">
              <!-- Seção de Foto -->
              <div class="bloco-foto-modal">
                @if (fotoCarregando()) {
                  <div class="foto-placeholder foto-carregando">
                    <div class="spinner-sm"></div>
                  </div>
                  <small class="texto-carregando-anexo">Carregando anexo...</small>
                } @else if (form.fotoUrl) {
                  <div class="preview-anexo-container">
                    <img [src]="form.fotoUrl" alt="Foto do Sacerdote" class="foto-preview" />
                    <span class="badge-anexo-sucesso">✓ Anexo carregado</span>
                  </div>
                  <button type="button" class="btn-remover-foto" (click)="removerFoto()">✕ Remover Foto</button>
                } @else {
                  <div class="foto-placeholder">✝️</div>
                  <label for="input-foto-sacerdote" class="btn-upload-foto">
                    📷 Incluir Foto
                  </label>
                  <input
                    id="input-foto-sacerdote"
                    type="file"
                    accept="image/*"
                    (click)="$any($event.target).value = null"
                    (change)="aoSelecionarFoto($event)"
                    style="display: none"
                  />
                }
              </div>

              <div class="form-row">
                <div class="campo-grupo">
                  <label for="sce-titulo">Título Religioso <span class="obrigatorio">*</span></label>
                  <select id="sce-titulo" [(ngModel)]="form.titulo" name="titulo" required>
                    <option value="PADRE">Padre</option>
                    <option value="DIACONO">Diácono</option>
                    <option value="BISPO">Bispo</option>
                    <option value="RELIGIOSO">Religioso (Irmão/Frei)</option>
                    <option value="RELIGIOSA">Religiosa (Irmã/Madre)</option>
                  </select>
                </div>

                <div class="campo-grupo">
                  <label for="sce-nome">Nome Completo <span class="obrigatorio">*</span></label>
                  <input
                    type="text"
                    id="sce-nome"
                    [(ngModel)]="form.nomeCompleto"
                    name="nomeCompleto"
                    placeholder="Ex: Pe. João Batista dos Santos"
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="campo-grupo">
                  <label for="sce-diocese">Diocese / Arquidiocese / Congregação</label>
                  <input
                    type="text"
                    id="sce-diocese"
                    [(ngModel)]="form.dioceseCongregacao"
                    name="dioceseCongregacao"
                    placeholder="Ex: Arquidiocese de Cuiabá"
                  />
                </div>

                <div class="campo-grupo">
                  <label for="sce-paroquia">Paróquia Atual</label>
                  <input
                    type="text"
                    id="sce-paroquia"
                    [(ngModel)]="form.paroquia"
                    name="paroquia"
                    placeholder="Ex: Paróquia São Gonçalo do Porto"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="campo-grupo">
                  <label for="sce-email">E-mail</label>
                  <input
                    type="email"
                    id="sce-email"
                    [(ngModel)]="form.email"
                    name="email"
                    placeholder="Ex: padrejoao@diocesecuiaba.org.br"
                  />
                </div>

                <div class="campo-grupo">
                  <label for="sce-tel">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    id="sce-tel"
                    [(ngModel)]="telefonesTexto"
                    (input)="telefonesTexto = mascararTelefone($any($event.target).value)"
                    maxlength="15"
                    name="telefones"
                    placeholder="Ex: (65) 99988-7766"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="campo-grupo">
                  <label for="sce-nasc">Data de Nascimento</label>
                  <input
                    type="date"
                    id="sce-nasc"
                    [(ngModel)]="form.dataNascimento"
                    name="dataNascimento"
                  />
                </div>

                <div class="campo-grupo">
                  <label for="sce-ordenacao">Data de Ordenação / Consagração</label>
                  <input
                    type="date"
                    id="sce-ordenacao"
                    [(ngModel)]="form.dataOrdenacaoConsagracao"
                    name="dataOrdenacaoConsagracao"
                  />
                </div>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="fecharModal()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="salvando() || !form.nomeCompleto">
                  {{ salvando() ? 'Salvando...' : 'Salvar Sacerdote' }}
                </button>
              </footer>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .sacerdotes-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header-titles h1 {
        font-family: 'Lora', Georgia, serif;
        font-size: 1.75rem;
        color: #1e3a8a;
        margin: 0 0 0.25rem 0;
      }

      .subtitulo {
        font-size: 0.95rem;
        color: #64748b;
        margin: 0;
      }

      .filtros-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        padding: 1rem 1.25rem;
      }

      .busca-wrapper {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0.5rem 0.85rem;
      }

      .busca-wrapper input {
        border: none;
        background: transparent;
        outline: none;
        font-size: 0.95rem;
        color: #1e293b;
        width: 100%;
      }

      .tabela-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }

      .table-responsive {
        overflow-x: auto;
      }

      .tabela-sce {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
        text-align: left;
      }

      .tabela-sce th {
        background: #f8fafc;
        padding: 0.85rem 1rem;
        font-weight: 600;
        color: #475569;
        border-bottom: 1px solid #e2e8f0;
      }

      .tabela-sce td {
        padding: 1rem;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .tabela-sce tbody tr:hover {
        background: #f8fafc;
      }

      .col-nome {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .avatar-tabela {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #e2e8f0;
      }

      .avatar-padrao {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f5f9;
        font-size: 1rem;
      }

      .bloco-foto-modal {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0 1rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .foto-preview {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #d97706;
      }

      .preview-anexo-container {
        position: relative;
        display: inline-block;
      }
      .badge-anexo-sucesso {
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        background: #16a34a;
        color: #ffffff;
        font-size: 0.65rem;
        padding: 1px 6px;
        border-radius: 999px;
        white-space: nowrap;
        font-weight: 600;
        border: 1px solid #ffffff;
      }
      .texto-carregando-anexo {
        color: var(--azul-600, #2563eb);
        font-weight: 600;
        font-size: 0.8rem;
      }

      .foto-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #f8fafc;
        border: 2px dashed #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
      }

      .btn-upload-foto {
        cursor: pointer;
        font-size: 0.8rem;
        color: #1e3a8a;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        font-weight: 500;
        transition: background 0.15s;
      }

      .btn-upload-foto:hover {
        background: #dbeafe;
      }

      .btn-remover-foto {
        background: transparent;
        border: none;
        color: #ef4444;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .badge-titulo {
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        background: #fef3c7;
        color: #b45309;
      }

      .col-contato {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.8rem;
        color: #475569;
      }

      .badge-status {
        padding: 0.25rem 0.5rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        background: #f1f5f9;
        color: #64748b;
      }

      .badge-status.status-ativo {
        background: #ecfdf5;
        color: #065f46;
      }

      .acoes-linha {
        display: flex;
        gap: 0.4rem;
      }

      .btn-acao {
        padding: 0.35rem 0.6rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        cursor: pointer;
      }

      .btn-acao:hover {
        background: #f8fafc;
      }

      .btn-inativar {
        color: #dc2626;
        border-color: #fca5a5;
      }

      .btn-inativar:hover {
        background: #fee2e2;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
      }

      .btn-primary {
        background: #2563eb;
        color: #ffffff;
      }

      .btn-primary:hover {
        background: #1d4ed8;
      }

      .btn-outline {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #334155;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-card {
        background: #ffffff;
        border-radius: 14px;
        width: 100%;
        max-width: 620px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h2 {
        font-size: 1.25rem;
        color: #1e3a8a;
        margin: 0;
      }

      .btn-fechar {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        color: #94a3b8;
        cursor: pointer;
      }

      .modal-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .campo-grupo {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .campo-grupo label {
        font-size: 0.825rem;
        font-weight: 600;
        color: #475569;
      }

      .campo-grupo select,
      .campo-grupo input {
        padding: 0.6rem 0.75rem;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        font-size: 0.9rem;
        color: #1e293b;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .loading-state,
      .empty-state {
        padding: 3rem 1.5rem;
        text-align: center;
        color: #64748b;
      }

      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        margin: 0 auto 1rem auto;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .empty-icon {
        font-size: 2.5rem;
        display: block;
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class SacerdotesPage implements OnInit {
  private readonly sceService = inject(SceService);

  readonly sacerdotes = signal<SceDto[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);
  readonly modalAberto = signal<boolean>(false);
  readonly fotoCarregando = signal<boolean>(false);

  termoBusca = '';
  editandoId: string | null = null;
  telefonesTexto = '';
  readonly mascararTelefone = mascararTelefone;

  formatarTelefones(telefones: string[]): string {
    return (telefones || []).map((t) => mascararTelefone(t)).join(', ');
  }

  form: SceRequest = {
    nomeCompleto: '',
    titulo: 'PADRE',
    dioceseCongregacao: '',
    paroquia: '',
    telefones: [],
    email: '',
    dataOrdenacaoConsagracao: '',
  };

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.sceService.listar(this.termoBusca, 0, 50).subscribe({
      next: (res) => {
        this.sacerdotes.set(res.content);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  buscar(): void {
    this.carregar();
  }

  abrirModalNovo(): void {
    this.editandoId = null;
    this.telefonesTexto = '';
    this.form = {
      nomeCompleto: '',
      titulo: 'PADRE',
      dioceseCongregacao: '',
      paroquia: '',
      telefones: [],
      email: '',
      fotoUrl: '',
      dataNascimento: '',
      dataOrdenacaoConsagracao: '',
    };
    this.modalAberto.set(true);
  }

  editar(s: SceDto): void {
    this.editandoId = s.id;
    this.telefonesTexto = s.telefones && s.telefones.length > 0
      ? s.telefones.map((t) => mascararTelefone(t)).join(', ')
      : '';
    this.form = {
      nomeCompleto: s.nomeCompleto,
      titulo: s.titulo,
      dioceseCongregacao: s.dioceseCongregacao || '',
      paroquia: s.paroquia || '',
      telefones: s.telefones || [],
      email: s.email || '',
      fotoUrl: s.fotoUrl || '',
      dataNascimento: s.dataNascimento || '',
      dataOrdenacaoConsagracao: s.dataOrdenacaoConsagracao || '',
    };
    this.modalAberto.set(true);
  }

  aoSelecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto deve ter no máximo 2MB.');
        return;
      }
      this.fotoCarregando.set(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.form.fotoUrl = e.target?.result as string;
        this.fotoCarregando.set(false);
      };
      reader.onerror = () => {
        this.fotoCarregando.set(false);
        alert('Erro ao carregar a foto do sacerdote.');
      };
      reader.readAsDataURL(file);
    }
  }

  removerFoto(): void {
    this.form.fotoUrl = '';
  }

  salvar(): void {
    if (!this.form.nomeCompleto.trim()) return;

    this.salvando.set(true);
    this.form.telefones = this.telefonesTexto
      ? this.telefonesTexto.split(',').map((t) => desmascarar(t.trim())).filter((t) => t.length > 0)
      : [];

    const req$ = this.editandoId
      ? this.sceService.atualizar(this.editandoId, this.form)
      : this.sceService.criar(this.form);

    req$.subscribe({
      next: () => {
        this.salvando.set(false);
        this.fecharModal();
        this.carregar();
      },
      error: (err) => {
        this.salvando.set(false);
        alert(err.error?.message || 'Erro ao salvar sacerdote');
      },
    });
  }

  inativar(s: SceDto): void {
    if (confirm(`Deseja inativar o registro de ${s.titulo} ${s.nomeCompleto}?`)) {
      this.sceService.inativar(s.id).subscribe({
        next: () => this.carregar(),
      });
    }
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }
}
