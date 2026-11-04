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

## Progressive Web App (PWA)

O frontend dispõe de suporte completo a PWA:
* **Manifesto Web (`manifest.webmanifest`):** Nome institucional, cor de tema `#1E3A8A`, display `standalone` e orientação retrato;
* **Ícones Redimensionados:** Gerados a partir do logo oficial `logo-ens.png` nos formatos 192x192, 512x512, maskable e apple-touch-icon;
* **Service Worker (`sw.js`):** Gerenciamento de cache de recursos estáticos e interceptação de navegação offline, registrado dinamicamente no `index.html`.
