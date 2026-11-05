# Arquitetura do Sistema ENS

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Spring Boot (webmvc, data-mongodb, validation, actuator, mail) | 4.1.1 |
| Linguagem Backend | Java | 25 |
| Segurança & JWT | Spring Security Crypto, JJWT (api, impl, jackson) | 0.12.6 |
| Integração Google | Google API Client, OAuth Client, Calendar v3, People v1, Drive v3 | 2.7.0 / v3 / v1 |
| Banco de Dados | MongoDB em replica set `rs0` | 8.3.13 |
| Frontend | Angular (standalone components, signals, rotas lazy, interceptors, guards) | 21 |
| PWA & Mobile | Web App Manifest, Service Worker para cache offline e ícones em múltiplas resoluções | PWA Standard |
| Infraestrutura | Docker Compose, rede `containers`, timezone `America/Cuiaba` | |

O replica set do MongoDB é obrigatório mesmo em desenvolvimento, pois transições de mandatos e sincronizações atômicas utilizam transações multi-documento.

## Decisões Técnicas

| Tema | Decisão | Razão |
|---|---|---|
| Hierarquia Territorial | Coleção `estrutura` única para Super-Região, Província, Região e Setor, com `nivel` e `paiId` e índice composto | Navegação em cascata simplificada através de consultas indexadas |
| Equipes de Base | Coleção `equipes` própria, com os 4 IDs ancestrais desnormalizados | Filtragem por qualquer instância territorial sem junções pesadas |
| Mandatos | Coleção `mandatos` imutável, encerrando mandatos anteriores na transição | Garantia de auditoria histórica estatutária |
| Casais e Membros | Coleção `casais` com `esposo` e `esposa` embutidos | Cônjuges são sempre consultados e representados em conjunto |
| Vínculos de Equipe | Coleção `vinculos_equipe` com histórico de papéis | Rastreabilidade de transferências entre equipes |
| Reuniões e Encontros | Coleção `reunioes` com tipos `FORMAL`, `INFORMAL` e `OUTROS` | Flexibilidade para acolher reuniões de equipe, retiros e encontros livres de setor |
| Sincronização Google | Sincronização bidirecional em tempo real ao salvar reunião | Notificação automática no Google Calendar com todos os casais ativos e o SCE |
| Criptografia de Tokens | Credenciais OAuth do Google cifradas com AES-GCM 256 bits | Proteção de tokens de atualização (refresh tokens) em repouso no banco |
| Envio de E-mails Gmail | Suporte a SMTP com Senha de App mascarada e OAuth2 com escopo `gmail.send` | Envio oficial e seguro com parametrização restrita ao administrador |
| Notificações de Reunião | Regras temporais (Segunda semanal, D-1 véspera e H-4 no dia) com filtro rígido de equipe | Comunicação assertiva no app e por e-mail estritamente para a equipe do usuário |
| Governança de Documentação | Política obrigatória em `docs/REGRAS_DOCUMENTACAO.md` atualizada a cada mudança | Garantia de rastreabilidade integral entre código e regras funcionais |
| Autenticação JWT | Tokens com assinatura HMAC-SHA256 e extração via `AutenticacaoFilter` | Autenticação stateless com dados mínimos de sessão no `UsuarioContext` |
| Matriz RBAC | Segregação entre perfis individuais (`ADMINISTRADOR`, `SACERDOTE`) e de casal | Fidelidade ao carisma do movimento, no qual o casal atua em unidade |
| Notificações D-1 | Agendador Spring rodando às 08:00 no fuso de Cuiabá | Envio automático de lembretes na véspera dos encontros por e-mail |
| Arquitetura PWA | Manifesto Web e Service Worker com logo oficial em 192px e 512px | Instalação no smartphone sem necessidade de loja de aplicativos |
| Mural de Bordo | Endpoint `/api/mural/meu-mural` vinculado estritamente à equipe do casal | Resguardo da privacidade das partilhas e fotos familiares |

## Modelo de Dados das Principais Entidades

* `estrutura`: `id`, `nome`, `nivel` (`SUPER_REGIAO`, `PROVINCIA`, `REGIAO`, `SETOR`), `paiId`. Índice composto `hierarquia_idx`.
* `equipes`: `id`, `numero`, `nomeDevocao`, `superRegiaoId`, `provinciaId`, `regiaoId`, `setorId`, `status` (`ATIVA`, `EM_PILOTAGEM`, `EM_REESTRUTURACAO`, `INATIVA`), `emPilotagem`, `dataFundacao`, `dataInicioPilotagem`, `dataTerminoPilotagem`, `sceId`, `temaEstudoAno`, `vinculos`.
* `casais`: `id`, `esposo` e `esposa` (`nomeCompleto`, `cpf`, `email`, `celular`, `dataNascimento`, `dataFalecimento`, `profissao`, `falecido`), `dataMatrimonio`, `paroquiaCasamento`, `recebeCartaMensal`, `endereco`, `status` (`ATIVO`, `EM_PILOTAGEM`, `LICENCIADO`, `EMERITO`, `VIUVO`, `INATIVO`), `equipeId`, `fotoUrl`, `motivoInativacao`, `filhos`. Transição automática para `VIUVO` mediante registro de óbito de cônjuge.
* `sacerdotes`: `id`, `nomeCompleto`, `titulo` (`PADRE`, `DIACONO`, `BISPO`, `RELIGIOSO`, `RELIGIOSA`), `dioceseCongregacao`, `paroquia`, `telefones`, `email`, `dataNascimento`, `dataOrdenacaoConsagracao`, `status` (`ATIVO`, `INATIVO`).
* `reunioes`: `id`, `equipeId`, `data`, `horario`, `tipo` (`FORMAL`, `INFORMAL`, `OUTROS`), `casalAnimadorId`, `tema`, `casalAnfitriaoId`, `localObservacao`, `scePresente`, `presencas` (lista com `casalId`, `status`: `PRESENTE`, `FALTOU`, `JUSTIFICOU`, `observacao`), `anotacoesCre`, `fotos`, `googleEventId`, `googleDriveRoteiroFileId`.
* `usuarios`: `id`, `email`, `senhaHash`, `nome`, `tipoUsuario` (`INDIVIDUAL`, `CASAL`), `casalId`, `sceId`, `equipeId`, `setorId`, `regiaoId`, `perfis` (conjunto de `PerfilUsuario`), `status` (`ATIVO`, `BLOQUEADO`), `tokenResetSenha`, `expiracaoTokenReset`, `criadoEm`, `ultimoAcessoEm`.
* `conexoes_google`: `id`, `casalId`, `email`, `accessToken`, `refreshToken`, `expiracaoToken`, `calendarioEnsId`, `ultimaSincronizacaoAgenda`, `ultimaSincronizacaoContatos`, `ultimaSincronizacaoDrive`, `atualizadoEm`.
* `mandatos`: `id`, `casalId`, `sceId`, `funcao` (`CRE`, `CL`, `CRS`, `CRR`, `CRP`, `CRSR`, `ERI`), `nivelInstancia` (`EQUIPE`, `SETOR`, `REGIAO`, `PROVINCIA`, `SUPER_REGIAO`, `INTERNACIONAL`), `instanciaId`, `dataInicio`, `dataPrevistaTermino`, `dataEncerramentoEfetivo`, `status` (`VIGENTE`, `CONCLUIDO`, `INTERROMPIDO_ANTECIPADAMENTE`), `observacoes`.

## Matriz de Perfis Estatutários (RBAC)

A governança de permissões reflete a estrutura de liderança do movimento ENS:

| Perfil | Natureza | Escopo de Visibilidade e Ações |
|---|---|---|
| `ADMINISTRADOR` | Individual | Acesso irrestrito a todas as áreas, parametrizações, integrações Google e governança de usuários |
| `SACERDOTE` | Individual | Visão da própria equipe: agenda de reuniões, mural de bordo, dashboard de reuniões e quadro de avisos |
| `MEMBRO_EQUIPE` | Casal | Acesso restrito à agenda de reuniões e ao mural de bordo da sua própria equipe |
| `CRE` | Casal | Gestão da própria equipe: agenda, presenças, ata/roteiro, dashboard da equipe e quadro de avisos |
| `RESPONSAVEL_SETOR` | Casal | Acumula direitos de equipe e CRE mais acesso ao Dashboard Geral e visão de todas as equipes do seu Setor |
| `RESPONSAVEL_REGIAO` | Casal | Acumula direitos de equipe e CRE mais acesso ao Dashboard Geral e visão de todas as equipes da sua Região |

Apenas `ADMINISTRADOR` e `SACERDOTE` constituem usuários de natureza individual; os demais perfis são vinculados ao casal (`casalId`).

No frontend, o serviço de autenticação (`AuthService`) e o componente de menu (`Sidebar`) filtram os itens de navegação com base nos perfis do usuário logado, enquanto o `authGuard` bloqueia URLs não autorizadas redirecionando para a rota padrão correspondente.

## Integração com Google Workspace

A integração é realizada por meio do protocolo OAuth 2.0 com escopos específicos:
* `https://www.googleapis.com/auth/calendar`: Criação de calendário próprio ("ENS - Equipe ..."), sincronização de eventos com participantes e aniversários de matrimônio;
* `https://www.googleapis.com/auth/contacts`: Criação de grupo de contatos da equipe na agenda Google;
* `https://www.googleapis.com/auth/drive.file`: Exportação de roteiros litúrgicos e relatórios formatados em pasta dedicada no Google Drive.

As reuniões criadas ou alteradas na interface de agenda disparam a sincronização em tempo real no Google Calendar, incluindo automaticamente no evento os endereços de e-mail de todos os cônjuges ativos da equipe e do sacerdote assistente (`sendUpdates="all"`).

## Notificações e Agendamento D-1

O serviço `ReuniaoAlertaScheduler` executa diariamente às 08:00 (fuso horário `America/Cuiaba`):
* Localiza no MongoDB reuniões com `data` correspondente a `LocalDate.now().plusDays(1)`;
* Identifica os cônjuges da equipe e o conselheiro espiritual;
* Constrói e envia mensagens personalizadas de lembrete com detalhes de horário, tema, anfitrião e local;
* Disponibiliza endpoint de disparo manual administrativo via `POST /api/reunioes/disparar-alertas-d1`.

## Fuso Horário Padronizado (Cuiabá - UTC-4)

Todo o ecossistema ENS adota o fuso horário oficial `America/Cuiaba` (UTC-4), prevenindo divergências de dias e horários entre o servidor e os dispositivos dos casais:
* **Módulo Utilitário (`src/app/core/cuiaba-date.util.ts`):** Funções centralizadas `agoraCuiaba()`, `hojeCuiabaStr()`, `formatarDataCuiaba()` e `calcularDiasRestantesCuiaba()`.
* **Pipe Institucional (`src/app/core/ens-date.pipe.ts`):** Formata todas as datas na interface com exibição consistente `dd/MM/yyyy` ou `dd/MM/yyyy HH:mm` no fuso de Cuiabá.
* **Agendador e Notificações:** Todos os cálculos de aviso semanal (segunda-feira), véspera (D-1) e mesmo dia (4 horas antes) operam orientados ao relógio de Cuiabá.

## Gestão de Casais e Movimentações

O módulo `/casais` oferece suporte ao ciclo de vida eclesiástico dos casais das Equipes:
* **Transferência de Equipe:** Transfere o casal para uma nova equipe de destino, atualizando automaticamente os vínculos e exibindo o casal no quadrante da nova equipe.
* **Licença Temporária:** Altera o status para `LICENCIADO`, preservando o histórico e excluindo o casal dos combos de anfitriões e animadores ativos durante o afastamento.
* **Saída / Inativação:** Registra o desligamento formal e atualiza o status para `INATIVO` com registro do motivo.
* **Retorno e Falecimento:** Suporte a retorno de licença (`ATIVO`) e falecimento de cônjuge (`VIUVO`).
* **Histórico Completo:** Registro cronológico de todas as movimentações com equipe de origem, destino, data e observações.

## Governança de Mandatos Estatutários e Sucessão

O módulo `/mandatos` acompanha os mandatos de serviços das ENS (CRE, CL, CRS, CRR, CRP, CRSR, ERI):
* **Cálculo Dinâmico de Prazos:** Prazos estatutários calculados segundo o fuso de Cuiabá.
* **Alertas Visuais de Sucessão:**
  * 🟢 **Vigente Regular:** Prazos acima de 90 dias restantes.
  * 🟡 **Fase de Sucessão / Discernimento:** 60 a 90 dias restantes.
  * 🟠 **Crítico / Iminente:** Menos de 30 dias restantes.
  * 🚨 **Vencido:** Data prevista de término ultrapassada sem sucessor eleito.
  * ✓ **Concluído:** Mandatos finalizados (como o casal Robson e Fernanda).
* **Indicação de Sucessor:** Fluxo rápido com carregamento prévio da instância e função para nova eleição.

## Progressive Web App (PWA) e Ícones Oficiais

O frontend dispõe de suporte completo a PWA e identidade visual oficial das ENS:
* **Ícone Oficial (`logo-ens.png`):** Integrado como favicon na aba do navegador (`<link rel="icon">`), ícone para tela inicial de dispositivos iOS (`<link rel="apple-touch-icon">`) e ícone de instalação do sistema.
* **Manifesto Web (`public/manifest.webmanifest`):** Nome institucional "Equipes de Nossa Senhora", nome curto "ENS Brasil", tema `#1e3a8a`, display `standalone` e suporte a ícones normais e maskable (192x192 e 512x512).
* **Metatags Mobile Web App:** `apple-mobile-web-app-capable="yes"`, `apple-mobile-web-app-status-bar-style="default"`.

## Ergonomia Mobile e Central de Alertas em Bottom Sheet

* **Central de Alertas Adaptativa (`src/app/layout/header/header.ts`):**
  * Em desktop ($\ge 1024\text{px}$), opera como dropdown ancorado abaixo do sino de notificações.
  * Em smartphone/mobile ($< 1024\text{px}$), transforma-se em um **Bottom Sheet deslizante** ancorado na parte inferior da tela (`fixed bottom-0 inset-x-0 rounded-t-3xl`), com alça de arrasto central, overlay escurecido (`backdrop-blur-sm`), botão de fechar proeminente e rolagem interna confortável, eliminando qualquer risco de transbordo lateral fora da tela.
* **Navegação Móvel Híbrida:**
  * Barra inferior fixa (`app-bottom-nav`) para acesso instantâneo com o polegar (Início, Equipes, Reuniões, Perfil, Mais).
  * Gaveta lateral retrátil (`app-sidebar`) acionada pelo botão "Mais" ou hambúrguer para rotas administrativas e institucionais.
  * Contenção estrita de transbordo horizontal (`overflow-x-hidden`) em todo o layout.
  * Espaçamento inferior seguro (`padding-bottom: 5.5rem`) para assegurar que nenhum conteúdo ou botão de ação fique encoberto pela barra inferior.

## Motor de Envio de E-mails via Google Workspace OAuth2

* **Governança de Comunicação (`/admin/integracoes`):**
  * Suporte nativo ao envio de mensagens autenticadas pela API do Gmail utilizando o protocolo Google Workspace OAuth2 (escopo `https://www.googleapis.com/auth/gmail.send`).
  * Parametrização segura do remetente oficial com armazenamento protegido no banco.
  * Painel de teste imediato com disparo para o e-mail do usuário logado (`danielrla@gmail.com`) e rastreabilidade com logs detalhados de data, hora e status de entrega.

## Padrão de Interface e Governança de Componentes UI (M3 e Angular Material)

A interface do sistema adota uma política clara de precedência e padronização visual para componentes e controles interativos:

### 1. Prioridade Primária: Material Design 3 Oficial (https://m3.material.io/)
Todos os elementos de tela devem ser implementados prioritariamente utilizando as especificações, tokens e componentes do Material Design 3 oficial (Material Web / `@material/web` e tokens CSS M3):
* **Botões e Ações:** `md-filled-button`, `md-outlined-button`, `md-text-button`, `md-elevated-button`, `md-tonal-button`, `md-icon-button`;
* **Entradas e Controles:** `md-outlined-text-field`, `md-filled-text-field`, `md-outlined-select`, `md-checkbox`, `md-radio`, `md-switch`, `md-slider`;
* **Diálogos e Modais:** `md-dialog`;
* **Navegação e Menus:** `md-tabs`, `md-primary-tab`, `md-secondary-tab`, `md-navigation-bar`, `md-menu`, `md-list`, `md-list-item`, `md-divider`;
* **Feedback e Indicadores:** `md-circular-progress`, `md-linear-progress`, `md-filter-chip`.

### 2. Prioridade Secundária (Fallback): Angular Material (https://material.angular.dev/components)
Caso um componente não esteja disponível em Material Web ou exija recursos avançados do ecossistema Angular, é mandatório o uso de componentes do Angular Material:
* **Critérios Formais de Fallback:**
  * Tabelas de dados com paginação, filtros e ordenação atômica (`MatTable`, `MatPaginator`, `MatSort`);
  * Seleção de datas com suporte regional e navegação de calendário (`MatDatepicker`);
  * Autocomplete integrado a `ReactiveFormsModule` e `ControlValueAccessor` (`MatAutocomplete`);
  * Navegação hierárquica recursiva profunda (`MatTree`);
  * Notificações flutuantes transitórias (`MatSnackBar`) e painéis deslizantes gerenciados (`MatBottomSheet`);
  * Tooltips acessíveis conectados ao CDK Overlay (`MatTooltip`).
* **Conformidade Cromática:** Todo componente do Angular Material adotado deve ser estilizado exclusivamente sob o tema M3 (`@use '@angular/material' as mat; @include mat.theme(...)`), alinhado às cores institucionais das ENS (Azul Institucional `#1e3a8a`, Dourado Mariano `#d97706` e fundos suaves `#f8fafc`).


