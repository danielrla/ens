import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CasalDto, CasalRequest, CasalService, Filho } from '../../core/casal.service';
import { mascararCpf, mascararTelefone, desmascarar } from '../../core/mascara.util';

@Component({
  selector: 'app-perfil-casal-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="perfil-container">
      <header class="cabecalho-perfil">
        <div>
          <nav class="breadcrumb-perfil">
            <a routerLink="/equipes">Início</a>
            <span class="separador">/</span>
            <span class="atual">Meu Perfil e Dados do Casal</span>
          </nav>
          <h1>Meu Perfil e Dados do Casal</h1>
          <p class="subtitulo serifa">
            Mantenha as informações pessoais, contatos, endereço e família sempre atualizados no Quadrante.
          </p>
        </div>
        <div class="acoes-topo">
          <a routerLink="/equipes" class="btn btn-fantasma">← Voltar</a>
          <button
            type="button"
            class="btn btn-primario"
            (click)="salvar()"
            [disabled]="salvando() || carregando()"
          >
            {{ salvando() ? 'Salvando...' : '💾 Salvar Alterações' }}
          </button>
        </div>
      </header>

      @if (mensagemSucesso()) {
        <div class="alerta alerta-sucesso">
          <span>✓</span>
          <p>{{ mensagemSucesso() }}</p>
          <button type="button" class="btn-fechar-alerta" (click)="mensagemSucesso.set('')">✕</button>
        </div>
      }

      @if (mensagemErro()) {
        <div class="alerta alerta-erro">
          <span>⚠</span>
          <p>{{ mensagemErro() }}</p>
          <button type="button" class="btn-fechar-alerta" (click)="mensagemErro.set('')">✕</button>
        </div>
      }

      @if (carregando()) {
        <div class="estado-carregando cartao">
          <div class="spinner"></div>
          <p>Carregando dados do casal...</p>
        </div>
      } @else {
        <form (ngSubmit)="salvar()" class="form-perfil">
          <!-- Cartão de Destaque: Foto do Casal e Identificação -->
          <section class="cartao secao-foto-destaque">
            <div class="foto-casal-bloco">
              @if (fotoCarregando()) {
                <div class="avatar-perfil-padrao">
                  <div class="spinner-sm"></div>
                </div>
              } @else if (fotoUrlPreview()) {
                <img [src]="fotoUrlPreview()" alt="Foto do Casal" class="foto-perfil-preview" />
              } @else {
                <div class="avatar-perfil-padrao">
                  {{ obterIniciais() }}
                </div>
              }
              <div class="botoes-foto">
                <label for="input-foto-casal-perfil" class="btn btn-primario btn-sm btn-upload">
                  📷 {{ fotoUrlPreview() ? 'Alterar Foto' : 'Adicionar Foto' }}
                </label>
                <input
                  id="input-foto-casal-perfil"
                  type="file"
                  accept="image/*"
                  (click)="$any($event.target).value = null"
                  (change)="aoSelecionarFotoCasal($event)"
                  style="display: none;"
                />
                @if (fotoUrlPreview()) {
                  <button type="button" class="btn btn-fantasma btn-sm btn-perigo" (click)="removerFotoCasal()">
                    ✕ Remover Foto
                  </button>
                }
                @if (nomeArquivoFoto()) {
                  <span class="badge badge-sucesso tag-status-foto">✓ {{ nomeArquivoFoto() }}</span>
                }
                <small class="texto-suave">Formatos aceitos: JPG ou PNG de até 2MB</small>
              </div>
            </div>

            <div class="info-resumo-casal">
              <h2>{{ form.esposo.nomeCompleto || 'Esposo' }} & {{ form.esposa.nomeCompleto || 'Esposa' }}</h2>
              <div class="meta-itens">
                <span class="badge badge-dourado">Equipe: {{ nomeEquipe() || 'Equipe Aparecida' }}</span>
                <span class="badge badge-sucesso">Status: {{ form.status || 'ATIVO' }}</span>
              </div>
              <p class="texto-suave">
                A foto adicionada aqui será exibida no topo de navegação do sistema e nos relatórios de equipe.
              </p>
            </div>
          </section>

          <!-- Dados do Esposo e Esposa Lado a Lado -->
          <div class="grade-dupla">
            <!-- Esposo -->
            <fieldset class="cartao grupo-campos">
              <legend class="titulo-secao">👨‍💼 Dados do Esposo</legend>
              <div class="campo">
                <label for="esposo-nome">Nome Completo <span class="obrigatorio">*</span></label>
                <input
                  id="esposo-nome"
                  type="text"
                  required
                  [(ngModel)]="form.esposo.nomeCompleto"
                  name="esposoNome"
                />
              </div>

              <div class="linha-dupla">
                <div class="campo">
                  <label for="esposo-cpf">CPF</label>
                  <input
                    id="esposo-cpf"
                    type="text"
                    [(ngModel)]="form.esposo.cpf"
                    (input)="aoDigitarCpf($event, 'esposo')"
                    name="esposoCpf"
                    maxlength="14"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div class="campo">
                  <label for="esposo-nascimento">Data de Nascimento</label>
                  <input
                    id="esposo-nascimento"
                    type="date"
                    [(ngModel)]="form.esposo.dataNascimento"
                    name="esposoNasc"
                  />
                </div>
              </div>

              <div class="linha-dupla">
                <div class="campo">
                  <label for="esposo-email">E-mail</label>
                  <input
                    id="esposo-email"
                    type="email"
                    [(ngModel)]="form.esposo.email"
                    name="esposoEmail"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div class="campo">
                  <label for="esposo-celular">Celular / WhatsApp</label>
                  <input
                    id="esposo-celular"
                    type="tel"
                    [(ngModel)]="form.esposo.celular"
                    (input)="aoDigitarTelefone($event, 'esposo')"
                    name="esposoCelular"
                    maxlength="15"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div class="campo">
                <label for="esposo-profissao">Profissão / Ocupação</label>
                <input
                  id="esposo-profissao"
                  type="text"
                  [(ngModel)]="form.esposo.profissao"
                  name="esposoProfissao"
                  placeholder="Ex: Engenheiro, Professor, Administrador"
                />
              </div>
            </fieldset>

            <!-- Esposa -->
            <fieldset class="cartao grupo-campos">
              <legend class="titulo-secao">👩‍💼 Dados da Esposa</legend>
              <div class="campo">
                <label for="esposa-nome">Nome Completo <span class="obrigatorio">*</span></label>
                <input
                  id="esposa-nome"
                  type="text"
                  required
                  [(ngModel)]="form.esposa.nomeCompleto"
                  name="esposaNome"
                />
              </div>

              <div class="linha-dupla">
                <div class="campo">
                  <label for="esposa-cpf">CPF</label>
                  <input
                    id="esposa-cpf"
                    type="text"
                    [(ngModel)]="form.esposa.cpf"
                    (input)="aoDigitarCpf($event, 'esposa')"
                    name="esposaCpf"
                    maxlength="14"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div class="campo">
                  <label for="esposa-nascimento">Data de Nascimento</label>
                  <input
                    id="esposa-nascimento"
                    type="date"
                    [(ngModel)]="form.esposa.dataNascimento"
                    name="esposaNasc"
                  />
                </div>
              </div>

              <div class="linha-dupla">
                <div class="campo">
                  <label for="esposa-email">E-mail</label>
                  <input
                    id="esposa-email"
                    type="email"
                    [(ngModel)]="form.esposa.email"
                    name="esposaEmail"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div class="campo">
                  <label for="esposa-celular">Celular / WhatsApp</label>
                  <input
                    id="esposa-celular"
                    type="tel"
                    [(ngModel)]="form.esposa.celular"
                    (input)="aoDigitarTelefone($event, 'esposa')"
                    name="esposaCelular"
                    maxlength="15"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div class="campo">
                <label for="esposa-profissao">Profissão / Ocupação</label>
                <input
                  id="esposa-profissao"
                  type="text"
                  [(ngModel)]="form.esposa.profissao"
                  name="esposaProfissao"
                  placeholder="Ex: Médica, Advogada, Arquiteta"
                />
              </div>
            </fieldset>
          </div>

          <!-- Matrimônio e Vida Eclesial -->
          <fieldset class="cartao grupo-campos">
            <legend class="titulo-secao">💍 Matrimônio e Vida Eclesial</legend>
            <div class="grade-tripla">
              <div class="campo">
                <label for="casal-matrimonio">Data do Matrimônio Religioso</label>
                <input
                  id="casal-matrimonio"
                  type="date"
                  [(ngModel)]="form.dataMatrimonio"
                  name="dataMatrimonio"
                />
              </div>
              <div class="campo flex-2">
                <label for="casal-paroquia">Paróquia / Igreja do Casamento</label>
                <input
                  id="casal-paroquia"
                  type="text"
                  [(ngModel)]="form.paroquiaCasamento"
                  name="paroquiaCasamento"
                  placeholder="Ex: Paróquia Nossa Senhora de Guadalupe"
                />
              </div>
              <div class="campo">
                <label for="casal-carta">Recebe a Carta Mensal?</label>
                <select id="casal-carta" [(ngModel)]="form.recebeCartaMensal" name="recebeCartaMensal">
                  <option value="SIM">Sim (Impresso)</option>
                  <option value="No grupo por PDF">No grupo por PDF</option>
                  <option value="NÃO">Não</option>
                </select>
              </div>
            </div>
          </fieldset>

          <!-- Endereço Residencial -->
          <fieldset class="cartao grupo-campos">
            <legend class="titulo-secao">🏠 Endereço Residencial</legend>
            <div class="grade-endereco">
              <div class="campo" style="max-width: 160px;">
                <label for="end-cep">CEP</label>
                <input
                  id="end-cep"
                  type="text"
                  [(ngModel)]="form.endereco!.cep"
                  name="endCep"
                  placeholder="78000-000"
                />
              </div>
              <div class="campo flex-2">
                <label for="end-logradouro">Logradouro / Rua / Avenida</label>
                <input
                  id="end-logradouro"
                  type="text"
                  [(ngModel)]="form.endereco!.logradouro"
                  name="endLogradouro"
                  placeholder="Ex: Av. das Palmeiras"
                />
              </div>
              <div class="campo" style="max-width: 120px;">
                <label for="end-numero">Número</label>
                <input
                  id="end-numero"
                  type="text"
                  [(ngModel)]="form.endereco!.numero"
                  name="endNumero"
                  placeholder="Ex: 295"
                />
              </div>
            </div>

            <div class="grade-tripla">
              <div class="campo">
                <label for="end-complemento">Complemento / Condomínio / Bloco</label>
                <input
                  id="end-complemento"
                  type="text"
                  [(ngModel)]="form.endereco!.complemento"
                  name="endComplemento"
                  placeholder="Ex: Cond. Rio Jangada, Casa 12"
                />
              </div>
              <div class="campo">
                <label for="end-bairro">Bairro</label>
                <input
                  id="end-bairro"
                  type="text"
                  [(ngModel)]="form.endereco!.bairro"
                  name="endBairro"
                  placeholder="Ex: Jardim Imperial"
                />
              </div>
              <div class="linha-dupla">
                <div class="campo flex-2">
                  <label for="end-cidade">Cidade</label>
                  <input
                    id="end-cidade"
                    type="text"
                    [(ngModel)]="form.endereco!.cidade"
                    name="endCidade"
                    placeholder="Ex: Cuiabá"
                  />
                </div>
                <div class="campo" style="max-width: 80px;">
                  <label for="end-uf">UF</label>
                  <input
                    id="end-uf"
                    type="text"
                    maxlength="2"
                    [(ngModel)]="form.endereco!.uf"
                    name="endUf"
                    placeholder="MT"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Filhos do Casal -->
          <fieldset class="cartao grupo-campos">
            <div class="topo-filhos">
              <div>
                <legend class="titulo-secao">👶 Filhos do Casal</legend>
                <p class="texto-suave">Cadastre os filhos para compor o Quadrante e eventos da equipe.</p>
              </div>
              <button type="button" class="btn btn-fantasma btn-sm" (click)="adicionarFilho()">
                + Adicionar Filho
              </button>
            </div>

            @if (!form.filhos || form.filhos.length === 0) {
              <div class="filhos-vazio">
                <p class="texto-suave">Nenhum filho registrado no momento.</p>
              </div>
            } @else {
              <div class="grade-filhos">
                @for (filho of form.filhos; track $index) {
                  <div class="cartao cartao-filho">
                    <div class="filho-avatar-bloco">
                      @if (filhoCarregandoFoto()[$index]) {
                        <div class="avatar-filho-carregando" title="Carregando foto do filho...">
                          <div class="spinner-sm"></div>
                        </div>
                      } @else if (filho.fotoUrl) {
                        <img [src]="filho.fotoUrl" [alt]="filho.nome" class="avatar-filho-img" />
                        <span class="badge-anexo-filho-ok" title="Anexo carregado com sucesso">✓</span>
                        <button
                          type="button"
                          class="btn-remover-foto-filho"
                          (click)="removerFotoFilho($index)"
                          title="Remover anexo do filho"
                        >
                          ✕
                        </button>
                      } @else {
                        <label [for]="'input-foto-filho-' + $index" class="btn-anexar-foto-filho" title="Adicionar foto (anexo)">
                          📷
                        </label>
                        <input
                          [id]="'input-foto-filho-' + $index"
                          type="file"
                          accept="image/*"
                          (click)="$any($event.target).value = null"
                          (change)="aoSelecionarFotoFilho($event, $index)"
                          style="display: none"
                        />
                      }
                    </div>

                    <div class="campo flex-2">
                      <label [for]="'filho-nome-' + $index">Nome do Filho <span class="obrigatorio">*</span></label>
                      <input
                        [id]="'filho-nome-' + $index"
                        type="text"
                        required
                        [(ngModel)]="filho.nome"
                        [name]="'filhoNome_' + $index"
                        placeholder="Ex: Matheus"
                      />
                    </div>

                    <div class="campo flex-1">
                      <label [for]="'filho-nasc-' + $index">Data de Nascimento</label>
                      <input
                        [id]="'filho-nasc-' + $index"
                        type="date"
                        [(ngModel)]="filho.dataNascimento"
                        [name]="'filhoNasc_' + $index"
                      />
                    </div>

                    <button
                      type="button"
                      class="btn-excluir-filho"
                      title="Excluir este filho"
                      (click)="removerFilho($index)"
                    >
                      🗑️
                    </button>
                  </div>
                }
              </div>
            }
          </fieldset>

          <!-- Barra Fixa de Ações no Rodapé -->
          <div class="rodape-acoes-perfil cartao">
            <div class="texto-aviso-salvar">
              <strong>Pronto para atualizar?</strong>
              <span>Ao salvar, suas informações serão sincronizadas em todo o sistema.</span>
            </div>
            <div class="botoes-salvar">
              <a routerLink="/equipes" class="btn btn-fantasma">Cancelar</a>
              <button
                type="submit"
                class="btn btn-primario btn-lg"
                [disabled]="salvando()"
              >
                {{ salvando() ? 'Salvando...' : '💾 Salvar Alterações do Casal' }}
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    .perfil-container {
      max-width: 1080px;
      margin: 0 auto;
      padding-bottom: 3rem;
    }

    .breadcrumb-perfil {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }
    .breadcrumb-perfil a {
      color: var(--texto-suave);
      text-decoration: none;
    }
    .breadcrumb-perfil a:hover {
      color: var(--azul-600);
    }
    .breadcrumb-perfil .separador {
      color: var(--borda);
    }
    .breadcrumb-perfil .atual {
      color: var(--azul-900);
      font-weight: 600;
    }

    .cabecalho-perfil {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .cabecalho-perfil h1 {
      color: var(--azul-900);
      font-size: clamp(1.6rem, 3.5vw, 2.2rem);
      margin: 0 0 0.4rem 0;
    }
    .subtitulo {
      margin: 0;
      color: var(--texto-suave);
      font-size: 1rem;
    }
    .acoes-topo {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .alerta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      border-radius: var(--raio-sm);
      margin-bottom: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }
    .alerta p {
      margin: 0;
      flex: 1;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .alerta-sucesso {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .alerta-erro {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .btn-fechar-alerta {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.2rem;
    }

    .estado-carregando {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--borda);
      border-top-color: var(--azul-600);
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }
    @keyframes girar {
      to { transform: rotate(360deg); }
    }

    .form-perfil {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .secao-foto-destaque {
      display: flex;
      align-items: center;
      gap: 2rem;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-left: 4px solid var(--ouro-500, #d97706);
    }
    .foto-casal-bloco {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .foto-perfil-preview {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      border: 3px solid #ffffff;
      outline: 2px solid var(--ouro-500, #d97706);
    }
    .avatar-perfil-padrao {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--azul-900), var(--azul-600));
      color: #ffffff;
      font-size: 2.2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      border: 3px solid #ffffff;
      outline: 2px solid var(--ouro-500, #d97706);
    }
    .botoes-foto {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }
    .btn-upload {
      cursor: pointer;
    }
    .btn-perigo {
      color: var(--erro) !important;
    }
    .btn-perigo:hover {
      background: #fee2e2 !important;
    }
    .spinner-sm {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }
    .tag-status-foto {
      font-size: 0.725rem;
      max-width: 190px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .info-resumo-casal {
      flex: 1;
    }
    .info-resumo-casal h2 {
      margin: 0 0 0.5rem 0;
      color: var(--azul-900);
      font-size: 1.4rem;
    }
    .meta-itens {
      display: flex;
      gap: 0.6rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .grupo-campos {
      margin: 0;
      padding: 1.5rem;
      border: 1px solid var(--borda);
    }
    .titulo-secao {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--azul-900);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .grade-dupla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .linha-dupla {
      display: flex;
      gap: 1rem;
    }
    .grade-tripla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .grade-endereco {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .campo {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }
    .campo label {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--texto);
    }
    .campo input,
    .campo select {
      padding: 0.6rem 0.8rem;
      border: 1px solid var(--borda);
      border-radius: var(--raio-sm);
      font: inherit;
      font-size: 0.9rem;
      color: var(--texto);
      background: #ffffff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .campo input:focus,
    .campo select:focus {
      outline: none;
      border-color: var(--azul-600);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .obrigatorio {
      color: var(--erro);
    }

    .topo-filhos {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .topo-filhos legend {
      margin: 0;
    }
    .filhos-vazio {
      padding: 1.5rem;
      text-align: center;
      background: var(--fundo-claro);
      border-radius: var(--raio-sm);
    }
    .grade-filhos {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .cartao-filho {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      background: var(--fundo-claro);
      border: 1px solid var(--borda);
    }
    .filho-avatar-bloco {
      position: relative;
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }
    .avatar-filho-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--borda);
    }
    .avatar-filho-carregando {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed var(--azul-600);
      color: var(--azul-600);
    }
    .badge-anexo-filho-ok {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #16a34a;
      color: #ffffff;
      font-size: 0.65rem;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      border: 1px solid #ffffff;
    }
    .btn-anexar-foto-filho {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px dashed var(--borda);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.1rem;
    }
    .btn-anexar-foto-filho:hover {
      background: var(--azul-50, #eff6ff);
      border-color: var(--azul-600);
    }
    .btn-remover-foto-filho {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--erro);
      color: #ffffff;
      border: none;
      font-size: 0.65rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .btn-excluir-filho {
      background: transparent;
      border: none;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--raio-sm);
      transition: background 0.15s;
    }
    .btn-excluir-filho:hover {
      background: #fee2e2;
    }

    .rodape-acoes-perfil {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: #ffffff;
      position: sticky;
      bottom: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      z-index: 20;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .texto-aviso-salvar {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .texto-aviso-salvar strong {
      color: var(--azul-900);
      font-size: 0.95rem;
    }
    .texto-aviso-salvar span {
      font-size: 0.8rem;
      color: var(--texto-suave);
    }
    .botoes-salvar {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .btn-lg {
      padding: 0.75rem 1.75rem;
      font-size: 1rem;
      font-weight: 600;
    }

    @media (max-width: 640px) {
      .secao-foto-destaque {
        flex-direction: column;
        text-align: center;
      }
      .meta-itens {
        justify-content: center;
      }
      .linha-dupla {
        flex-direction: column;
        gap: 0;
      }
      .cartao-filho {
        flex-direction: column;
        align-items: stretch;
      }
      .rodape-acoes-perfil {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
      .botoes-salvar {
        flex-direction: column;
      }
    }
  `,
})
export class PerfilCasalPage implements OnInit {
  private readonly casalService = inject(CasalService);

  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly mensagemSucesso = signal('');
  protected readonly mensagemErro = signal('');
  protected readonly nomeEquipe = signal('');

  protected readonly fotoUrlPreview = signal<string>('');
  protected readonly fotoCarregando = signal<boolean>(false);
  protected readonly nomeArquivoFoto = signal<string>('');
  protected readonly filhoCarregandoFoto = signal<Record<number, boolean>>({});

  protected form: CasalRequest = {
    esposo: {
      nomeCompleto: '',
      cpf: '',
      email: '',
      celular: '',
      dataNascimento: '',
      profissao: '',
    },
    esposa: {
      nomeCompleto: '',
      cpf: '',
      email: '',
      celular: '',
      dataNascimento: '',
      profissao: '',
    },
    dataMatrimonio: '',
    paroquiaCasamento: '',
    recebeCartaMensal: 'SIM',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
    },
    status: 'ATIVO',
    equipeId: '',
    fotoUrl: '',
    filhos: [],
  };

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');
    this.casalService.obterPerfil().subscribe({
      next: (casal) => {
        this.popularFormulario(casal);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.mensagemErro.set(err.error?.message || 'Erro ao carregar dados do perfil do casal.');
      },
    });
  }

  private popularFormulario(c: CasalDto): void {
    this.nomeEquipe.set(c.nomeEquipe || '');
    this.form = {
      esposo: {
        nomeCompleto: c.esposo?.nomeCompleto || '',
        cpf: c.esposo?.cpf ? mascararCpf(c.esposo.cpf) : '',
        email: c.esposo?.email || '',
        celular: c.esposo?.celular ? mascararTelefone(c.esposo.celular) : '',
        dataNascimento: c.esposo?.dataNascimento || '',
        profissao: c.esposo?.profissao || '',
      },
      esposa: {
        nomeCompleto: c.esposa?.nomeCompleto || '',
        cpf: c.esposa?.cpf ? mascararCpf(c.esposa.cpf) : '',
        email: c.esposa?.email || '',
        celular: c.esposa?.celular ? mascararTelefone(c.esposa.celular) : '',
        dataNascimento: c.esposa?.dataNascimento || '',
        profissao: c.esposa?.profissao || '',
      },
      dataMatrimonio: c.dataMatrimonio || '',
      paroquiaCasamento: c.paroquiaCasamento || '',
      recebeCartaMensal: c.recebeCartaMensal || 'SIM',
      endereco: {
        logradouro: c.endereco?.logradouro || '',
        numero: c.endereco?.numero || '',
        complemento: c.endereco?.complemento || '',
        bairro: c.endereco?.bairro || '',
        cidade: c.endereco?.cidade || '',
        uf: c.endereco?.uf || '',
        cep: c.endereco?.cep || '',
      },
      status: c.status || 'ATIVO',
      equipeId: c.equipeId || '',
      fotoUrl: c.fotoUrl || '',
      filhos: c.filhos ? c.filhos.map((f) => ({ ...f })) : [],
    };
    this.fotoUrlPreview.set(c.fotoUrl || '');
    this.nomeArquivoFoto.set('');
  }

  obterIniciais(): string {
    const esp = this.form.esposo?.nomeCompleto?.trim().charAt(0) || '';
    const espa = this.form.esposa?.nomeCompleto?.trim().charAt(0) || '';
    return (espa + esp).toUpperCase() || 'AD';
  }

  aoSelecionarFotoCasal(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        this.mensagemErro.set('A foto selecionada excede o limite de 2MB. Escolha uma imagem menor.');
        return;
      }
      this.fotoCarregando.set(true);
      this.mensagemErro.set('');
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultado = e.target?.result as string;
        this.fotoUrlPreview.set(resultado);
        this.form.fotoUrl = resultado;
        this.nomeArquivoFoto.set(file.name);
        this.fotoCarregando.set(false);
        this.mensagemSucesso.set(`Foto "${file.name}" carregada no formulário. Clique em "Salvar Alterações" no rodapé para sincronizar com o topo do sistema.`);
      };
      reader.onerror = () => {
        this.fotoCarregando.set(false);
        this.mensagemErro.set('Erro ao ler o arquivo de imagem selecionado.');
      };
      reader.readAsDataURL(file);
    }
  }

  removerFotoCasal(): void {
    this.form.fotoUrl = '';
    this.fotoUrlPreview.set('');
    this.nomeArquivoFoto.set('');
    this.mensagemSucesso.set('Foto removida do formulário. Clique em "Salvar Alterações" no rodapé para confirmar.');
  }

  adicionarFilho(): void {
    if (!this.form.filhos) {
      this.form.filhos = [];
    }
    this.form.filhos.push({ nome: '', dataNascimento: '', fotoUrl: '' });
  }

  removerFilho(index: number): void {
    if (this.form.filhos) {
      this.form.filhos.splice(index, 1);
    }
  }

  aoSelecionarFotoFilho(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.form.filhos && this.form.filhos[index]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto do filho deve ter no máximo 2MB.');
        return;
      }
      this.filhoCarregandoFoto.update((m) => ({ ...m, [index]: true }));
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.form.filhos && this.form.filhos[index]) {
          this.form.filhos[index].fotoUrl = e.target?.result as string;
        }
        this.filhoCarregandoFoto.update((m) => ({ ...m, [index]: false }));
      };
      reader.onerror = () => {
        this.filhoCarregandoFoto.update((m) => ({ ...m, [index]: false }));
        alert('Erro ao carregar anexo de imagem do filho.');
      };
      reader.readAsDataURL(file);
    }
  }

  removerFotoFilho(index: number): void {
    if (this.form.filhos && this.form.filhos[index]) {
      this.form.filhos[index].fotoUrl = '';
    }
  }

  aoDigitarCpf(event: Event, tipo: 'esposo' | 'esposa'): void {
    const input = event.target as HTMLInputElement;
    this.form[tipo].cpf = mascararCpf(input.value);
  }

  aoDigitarTelefone(event: Event, tipo: 'esposo' | 'esposa'): void {
    const input = event.target as HTMLInputElement;
    this.form[tipo].celular = mascararTelefone(input.value);
  }

  salvar(): void {
    if (!this.form.esposo.nomeCompleto?.trim() || !this.form.esposa.nomeCompleto?.trim()) {
      this.mensagemErro.set('O nome do esposo e da esposa são de preenchimento obrigatório.');
      return;
    }

    this.salvando.set(true);
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

    const payload: CasalRequest = {
      ...this.form,
      esposo: {
        ...this.form.esposo,
        cpf: desmascarar(this.form.esposo.cpf || ''),
        celular: desmascarar(this.form.esposo.celular || ''),
      },
      esposa: {
        ...this.form.esposa,
        cpf: desmascarar(this.form.esposa.cpf || ''),
        celular: desmascarar(this.form.esposa.celular || ''),
      },
      endereco: {
        ...this.form.endereco,
        cep: desmascarar(this.form.endereco?.cep || ''),
      },
    };

    this.casalService.atualizarPerfil(payload).subscribe({
      next: (atualizado) => {
        this.salvando.set(false);
        this.popularFormulario(atualizado);
        this.mensagemSucesso.set('Dados do casal e foto atualizados com sucesso no sistema!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.salvando.set(false);
        this.mensagemErro.set(err.error?.message || 'Erro ao salvar alterações no perfil do casal.');
      },
    });
  }
}
