# Graph Report - ens  (2026-11-05)

## Corpus Check
- 264 files · ~174,629 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2437 nodes · 5112 edges · 113 communities (71 shown, 42 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 558 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41c52710`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Equipe
- IntegracaoAdminPage
- org.springframework.data.domain.Page
- LayoutService
- dependencies
- ens-frontend
- Reuniao
- NoEstrutura
- MovimentacaoCasal
- Sce
- LayoutService
- EnsApplication.java
- frontend/src/app/features/reunioes/agenda-reunioes-page.ts
- Arquitetura do Sistema ENS
- CasaisPage
- MandatosPage
- Mandato
- ens-frontend
- EquipesPage
- EstruturaSeed
- ReuniaoDto
- dependencies
- CasaisPage
- src/app/features/mandatos/mandatos-page.ts
- MomentoMural
- SacerdotesPage
- frontend/src/app/core/equipe.service.ts
- MuralBordoPage
- EstruturaPage
- SacerdotesPage
- src/app/features/reunioes/agenda-reunioes-page.ts
- br.org.ens:ens-backend
- AuthService
- PerfilCasalPage
- 2. Componentização do Layout (App Shell)
- EnsFrontend
- CasalRepository
- Casal
- CargaOficialSeed.java
- AgendaReunioesPage
- EquipeRequest
- EstruturaPage
- IntegracaoAdminPage
- AuthService
- EmailConfig
- BiometriaService
- BiometriaService
- CasalService
- MuralBordoPage
- .criar
- src/app/core/equipe.service.ts
- UsuarioLogado
- EquipesPage
- Header
- org.springframework.web.bind.annotation.GetMapping
- DashboardGeralPage
- SearchableSelect
- CasalService
- PerfilCasalPage
- StatusCasal
- DashboardEquipePage
- Instruções para Importação de Dados do ENS
- EnsFrontend
- ConexaoGoogle
- EquipeRepository
- MandatoDto
- FuncaoMandato
- UsuarioDto
- GoogleIntegracaoAdminController
- NivelInstancia
- 2. Detalhamento Técnico das Modificações
- CasalService
- UsuarioLogado
- Header
- SearchableSelect
- mock-api.interceptor.ts
- .toDto
- NotificacaoService
- AgendaReunioesPage
- NoEstrutura
- MandatoService
- Usuario
- frontend/src/app/app.routes.ts
- frontend/src/app/core/cuiaba-date.util.ts
- FiltroEstrutura
- PerfilUsuario
- Sidebar
- SceService
- AuthService
- LogEnvioEmail
- TipoReuniao
- src/app/core/casal.service.ts
- .fromEntity
- NoEstrutura
- frontend/src/app/features/mandatos/mandatos-page.ts
- EquipeResumoDto
- EstruturaService
- UsuarioAdminService
- org.springframework.data.mongodb.core.mapping.Document
- TipoMovimentacao
- StatusEquipe
- mascararTelefone
- .resetarSenha
- Vinculo
- LoginPage
- LoginPage
- StatusMandato
- EstruturaService
- StatusUsuario
- .enviarAlertasParaData
- FiltroEstrutura

## God Nodes (most connected - your core abstractions)
1. `Equipe` - 65 edges
2. `Casal` - 58 edges
3. `Usuario` - 48 edges
4. `Reuniao` - 46 edges
5. `EquipeRepository` - 44 edges
6. `EmailConfig` - 41 edges
7. `ConexaoGoogle` - 41 edges
8. `Mandato` - 38 edges
9. `Sce` - 35 edges
10. `CasalRepository` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Casal` --references--> `StatusCasal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/StatusCasal.java
- `CasalRepository` --references--> `Casal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalRepository.java → backend/src/main/java/br/org/ens/casal/Casal.java
- `CasalController` --references--> `CasalService`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalController.java → backend/src/main/java/br/org/ens/casal/CasalService.java
- `CasalDto` --references--> `Endereco`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalDto.java → backend/src/main/java/br/org/ens/casal/Endereco.java
- `CasalDto` --references--> `Filho`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalDto.java → backend/src/main/java/br/org/ens/casal/Filho.java

## Import Cycles
- None detected.

## Communities (113 total, 42 thin omitted)

### Community 0 - "Equipe"
Cohesion: 0.16
Nodes (5): Equipe, CreInfo, EquipeDetalheDto, EquipeResumoDto, VinculoDto

### Community 1 - "IntegracaoAdminPage"
Cohesion: 0.05
Nodes (19): EmailConfigDto, EmailIntegracaoService, LogEnvioEmailDto, MetodoEnvioEmail, SalvarEmailConfigRequest, TesteEmailRequest, TesteEmailResponse, Injectable (+11 more)

### Community 3 - "LayoutService"
Cohesion: 0.12
Nodes (8): BreadcrumbItem, LayoutService, Injectable, MENU_ITEMS, NavItem, SidebarItem, Component, Input

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+34 more)

### Community 5 - "ens-frontend"
Cohesion: 0.05
Nodes (41): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+33 more)

### Community 7 - "NoEstrutura"
Cohesion: 0.19
Nodes (8): NivelEstrutura, EQUIPE, PROVINCIA, REGIAO, SETOR, SUPER_REGIAO, pai(), NoEstrutura

### Community 9 - "Sce"
Cohesion: 0.11
Nodes (7): Sce, TituloSce, BISPO, DIACONO, PADRE, RELIGIOSA, RELIGIOSO

### Community 10 - "LayoutService"
Cohesion: 0.10
Nodes (10): BreadcrumbItem, LayoutService, Injectable, MENU_ITEMS, NavItem, SidebarItem, Component, Input (+2 more)

### Community 11 - "EnsApplication.java"
Cohesion: 0.29
Nodes (7): EnsApplication, MongoTransactionManager, org.springframework.boot.autoconfigure.SpringBootApplication, org.springframework.context.annotation.Bean, org.springframework.data.mongodb.MongoDatabaseFactory, org.springframework.data.mongodb.MongoTransactionManager, org.springframework.scheduling.annotation.EnableScheduling

### Community 12 - "frontend/src/app/features/reunioes/agenda-reunioes-page.ts"
Cohesion: 0.13
Nodes (10): Endereco, PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, ReuniaoRequest, ReuniaoService, StatusPresenca, TipoReuniao (+2 more)

### Community 13 - "Arquitetura do Sistema ENS"
Cohesion: 0.04
Nodes (43): 1. Prioridade Primária: Material Design 3 Oficial (https://m3.material.io/), 2. Prioridade Secundária (Fallback): Angular Material (https://material.angular.dev/components), Arquitetura do Sistema ENS, Decisões Técnicas, Ergonomia Mobile e Central de Alertas em Bottom Sheet, Fuso Horário Padronizado (Cuiabá - UTC-4), Gestão de Casais e Movimentações, Governança de Mandatos Estatutários e Sucessão (+35 more)

### Community 14 - "CasaisPage"
Cohesion: 0.08
Nodes (14): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoDto, MovimentacaoRequest, Pessoa, StatusCasal (+6 more)

### Community 17 - "ens-frontend"
Cohesion: 0.05
Nodes (42): build, serve, test, builder, configurations, defaultConfiguration, options, analytics (+34 more)

### Community 20 - "ReuniaoDto"
Cohesion: 0.09
Nodes (5): ReuniaoDto, DashboardGeralPage, Component, DashboardEquipePage, Component

### Community 21 - "dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+34 more)

### Community 23 - "src/app/features/mandatos/mandatos-page.ts"
Cohesion: 0.08
Nodes (16): hojeCuiabaStr(), AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto, MandatoRequest, MandatoService (+8 more)

### Community 24 - "MomentoMural"
Cohesion: 0.09
Nodes (7): MomentoMural, MomentoMuralController, MomentoMuralDto, MomentoMuralRepository, MomentoMuralRequest, MomentoMuralRequest, MomentoMuralService

### Community 25 - "SacerdotesPage"
Cohesion: 0.11
Nodes (8): PageResponse, SceDto, SceRequest, SceService, TituloSce, Injectable, SacerdotesPage, Component

### Community 26 - "frontend/src/app/core/equipe.service.ts"
Cohesion: 0.10
Nodes (18): PageResponse, EnsDatePipe, Pipe, AlertaMandato, EquipeDetalheDto, EquipeRequest, EquipeResumoDto, EquipeService (+10 more)

### Community 27 - "MuralBordoPage"
Cohesion: 0.09
Nodes (7): MomentoMuralDto, MomentoMuralRequest, MuralService, Injectable, MuralBordoPage, Component, HostListener

### Community 30 - "src/app/features/reunioes/agenda-reunioes-page.ts"
Cohesion: 0.11
Nodes (18): Endereco, formatarDataCuiaba(), EnsDatePipe, Pipe, EquipeDetalheDto, EquipeResumoDto, PresencaCasal, PresencaDetalheDto (+10 more)

### Community 32 - "AuthService"
Cohesion: 0.09
Nodes (11): LoginResponse, AuthService, Injectable, AlertaReuniao, TipoNotificacao, EsqueciSenhaPage, Component, BottomNav (+3 more)

### Community 34 - "2. Componentização do Layout (App Shell)"
Cohesion: 0.20
Nodes (9): 1. Identidade Visual e Variáveis de Estilo, 2. Componentização do Layout (App Shell), 3. Diretrizes Técnicas de Implementação e Biblioteca de Componentes, A. Topbar / Header (Topo), B. Sidebar Lateral Retrátil (Menu Recursivo / Árvore de Navegação), C. Área Principal de Dados (Main Content Area), D. Rodapé (Footer), Especificação de Interface e Layout: Shell de Aplicação Responsivo e Recursivo para ENS (+1 more)

### Community 35 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 36 - "CasalRepository"
Cohesion: 0.14
Nodes (11): CasalRepository, MovimentacaoCasalRepository, EmailConfigRepository, LogEnvioEmailRepository, EquipeService, NoEstruturaRepository, MandatoRepository, MandatoService (+3 more)

### Community 37 - "Casal"
Cohesion: 0.08
Nodes (11): Casal, Endereco, Filho, Pessoa, CasalDef, Endereco, Filho, Pessoa (+3 more)

### Community 38 - "CargaOficialSeed.java"
Cohesion: 0.24
Nodes (6): TransferenciaRequest, PapelVinculo, CRE, MEMBRO, CargaOficialSeed, org.springframework.context.annotation.Configuration

### Community 42 - "IntegracaoAdminPage"
Cohesion: 0.05
Nodes (19): EmailConfigDto, EmailIntegracaoService, LogEnvioEmailDto, MetodoEnvioEmail, SalvarEmailConfigRequest, TesteEmailRequest, TesteEmailResponse, Injectable (+11 more)

### Community 43 - "AuthService"
Cohesion: 0.06
Nodes (19): App, appConfig, routes, Component, authGuard(), LoginResponse, AuthService, Injectable (+11 more)

### Community 44 - "EmailConfig"
Cohesion: 0.06
Nodes (15): EmailConfigDto, EnviarEmailRequest, LogEnvioEmailDto, SalvarEmailConfigRequest, TesteEmailRequest, TesteEmailResponse, EmailAdminController, EmailAdminService (+7 more)

### Community 46 - "BiometriaService"
Cohesion: 0.19
Nodes (3): BiometriaRegistro, BiometriaService, Injectable

### Community 48 - "MuralBordoPage"
Cohesion: 0.13
Nodes (3): MuralBordoPage, Component, HostListener

### Community 50 - "src/app/core/equipe.service.ts"
Cohesion: 0.08
Nodes (14): PageResponse, AlertaMandato, EquipeRequest, EquipeService, FiltroEquipe, PapelVinculo, SituacaoMandato, StatusEquipe (+6 more)

### Community 51 - "UsuarioLogado"
Cohesion: 0.09
Nodes (12): PerfilUsuario, StatusUsuario, TipoUsuario, UsuarioLogado, NotificacaoService, Injectable, CriarUsuarioPayload, PageUsuarios (+4 more)

### Community 54 - "org.springframework.web.bind.annotation.GetMapping"
Cohesion: 0.09
Nodes (17): CasalController, InativacaoRequest, MovimentacaoDto, MovimentacaoRequest, PageResponse, EquipeController, EquipeDetalheDto, EstruturaController (+9 more)

### Community 56 - "SearchableSelect"
Cohesion: 0.23
Nodes (5): SearchableSelect, Component, HostListener, Input, Output

### Community 59 - "StatusCasal"
Cohesion: 0.18
Nodes (8): PageResponse, StatusCasal, ATIVO, EM_PILOTAGEM, EMERITO, INATIVO, LICENCIADO, VIUVO

### Community 61 - "Instruções para Importação de Dados do ENS"
Cohesion: 0.25
Nodes (7): 1. Importação com Dump Nativo (`mongorestore`), 2. Importação dos Arquivos JSON (`mongoimport`), 3. Importação Gráfica via MongoDB Compass, 4. Relação de Coleções Exportadas, Instruções para Importação de Dados do ENS, Opção A: Restaurar em container Docker local, Opção B: Restaurar em instância remota ou MongoDB Atlas

### Community 62 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 63 - "ConexaoGoogle"
Cohesion: 0.10
Nodes (4): ConexaoGoogle, ConexaoGoogleRepository, GoogleStatusDto, com.google.api.services.people.v1.PeopleService

### Community 64 - "EquipeRepository"
Cohesion: 0.13
Nodes (16): EmailService, EquipeRepository, GoogleAuthService, GoogleCalendarService, GoogleContactsService, GoogleDriveService, ReuniaoAlertaScheduler, ReuniaoRepository (+8 more)

### Community 65 - "MandatoDto"
Cohesion: 0.18
Nodes (8): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, calcular(), MandatoDto, PageResponse

### Community 66 - "FuncaoMandato"
Cohesion: 0.13
Nodes (10): FuncaoMandato, CL, CRE, CRP, CRR, CRS, CRSR, ERI (+2 more)

### Community 67 - "UsuarioDto"
Cohesion: 0.12
Nodes (11): NegocioException, AuthController, AtualizarPerfisRequest, CriarUsuarioRequest, LoginRequest, ResetSenhaRequest, UsuarioDto, UsuarioAdminController (+3 more)

### Community 68 - "GoogleIntegracaoAdminController"
Cohesion: 0.15
Nodes (5): GoogleAuthUrlResponse, GoogleStatusDto, SincronizacaoResultadoDto, GoogleAuthUrlResponse, GoogleIntegracaoAdminController

### Community 69 - "NivelInstancia"
Cohesion: 0.14
Nodes (9): MandatoRequest, NivelInstancia, EQUIPE, INTERNACIONAL, PROVINCIA, REGIAO, SETOR, SUPER_REGIAO (+1 more)

### Community 70 - "2. Detalhamento Técnico das Modificações"
Cohesion: 0.20
Nodes (9): 1. Revisão e Alinhamento com o Usuário, 2. Detalhamento Técnico das Modificações, 3. Plano de Verificação, A. Central de Alertas como Bottom Sheet (`src/app/layout/header/header.ts`), B. Refatoração de Usabilidade e Layout Mobile Global (`src/app/app.ts`, `src/styles.css` e páginas), C. Ícone das ENS no Navegador e PWA (`src/index.html` e `public/`), D. Validação e Teste do Google Workspace OAuth2 (`src/app/core/mock-api.interceptor.ts` e `src/app/features/admin/integracao-admin-page.ts`), E. Documentação Técnica (`docs/`) (+1 more)

### Community 71 - "CasalService"
Cohesion: 0.18
Nodes (3): CasalDto, CasalRequest, CasalService

### Community 72 - "UsuarioLogado"
Cohesion: 0.14
Nodes (10): PerfilUsuario, StatusUsuario, TipoUsuario, UsuarioLogado, CriarUsuarioPayload, PageUsuarios, Injectable, UsuarioAdminService (+2 more)

### Community 74 - "SearchableSelect"
Cohesion: 0.19
Nodes (6): SearchableOption, SearchableSelect, Component, HostListener, Input, Output

### Community 75 - "mock-api.interceptor.ts"
Cohesion: 0.10
Nodes (22): agoraCuiaba(), calcularDiasRestantesCuiaba(), FUSO_CUIABA, getStored(), INITIAL_USUARIOS, mockApiInterceptor(), setStored(), INITIAL_CASAIS (+14 more)

### Community 76 - ".toDto"
Cohesion: 0.15
Nodes (6): PresencaDetalheDto, ReuniaoController, ReuniaoDto, ReuniaoRequest, ReuniaoDto, ReuniaoService

### Community 80 - "NoEstrutura"
Cohesion: 0.15
Nodes (10): EstruturaService, NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, Injectable, DefinicaoNivel, NIVEIS (+2 more)

### Community 83 - "frontend/src/app/app.routes.ts"
Cohesion: 0.18
Nodes (7): App, appConfig, routes, Component, authGuard(), ResetSenhaPage, Component

### Community 84 - "frontend/src/app/core/cuiaba-date.util.ts"
Cohesion: 0.40
Nodes (3): calcularDiasRestantesCuiaba(), FUSO_CUIABA, hojeCuiabaStr()

### Community 86 - "PerfilUsuario"
Cohesion: 0.13
Nodes (11): LoginResponse, PerfilUsuario, ADMINISTRADOR, CRE, MEMBRO_EQUIPE, RESPONSAVEL_REGIAO, RESPONSAVEL_SETOR, SACERDOTE (+3 more)

### Community 88 - "SceService"
Cohesion: 0.18
Nodes (4): SceController, SceDto, SceRequest, SceService

### Community 89 - "AuthService"
Cohesion: 0.16
Nodes (10): AutenticacaoFilter, Override, AuthService, JwtService, io.jsonwebtoken.Claims, jakarta.servlet.FilterChain, jakarta.servlet.http.HttpServletRequest, jakarta.servlet.http.HttpServletResponse (+2 more)

### Community 91 - "TipoReuniao"
Cohesion: 0.12
Nodes (10): PresencaCasal, RegistroPresencaRequest, StatusPresenca, FALTOU, JUSTIFICOU, PRESENTE, TipoReuniao, FORMAL (+2 more)

### Community 92 - "src/app/core/casal.service.ts"
Cohesion: 0.25
Nodes (11): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoDto, MovimentacaoRequest, Pessoa, StatusCasal (+3 more)

### Community 94 - "NoEstrutura"
Cohesion: 0.20
Nodes (8): NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, DefinicaoNivel, NIVEIS, NivelFiltro, AbaVisualizacao

### Community 95 - "frontend/src/app/features/mandatos/mandatos-page.ts"
Cohesion: 0.23
Nodes (10): AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto, MandatoRequest, NivelInstancia, PageResponse (+2 more)

### Community 96 - "EquipeResumoDto"
Cohesion: 0.15
Nodes (10): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, EquipeResumoDto, SituacaoMandato, EM_FASE_SUCESSAO (+2 more)

### Community 97 - "EstruturaService"
Cohesion: 0.26
Nodes (4): EstruturaService, NoEstrutura, NoArvoreDto, NoEstruturaRequest

### Community 98 - "UsuarioAdminService"
Cohesion: 0.23
Nodes (5): UsuarioAdminService, Override, UsuarioSeed, org.springframework.boot.CommandLineRunner, org.springframework.security.crypto.password.PasswordEncoder

### Community 100 - "TipoMovimentacao"
Cohesion: 0.18
Nodes (8): TipoMovimentacao, FALECIMENTO, LICENCA, REMANEJAMENTO, RETORNO, SAIDA, SAIDA_VOLUNTARIA, TRANSFERENCIA

### Community 101 - "StatusEquipe"
Cohesion: 0.18
Nodes (6): PageResponse, StatusEquipe, ATIVA, EM_PILOTAGEM, EM_REESTRUTURACAO, INATIVA

### Community 107 - "StatusMandato"
Cohesion: 0.25
Nodes (4): StatusMandato, CONCLUIDO, INTERROMPIDO_ANTECIPADAMENTE, VIGENTE

### Community 109 - "StatusUsuario"
Cohesion: 0.33
Nodes (3): StatusUsuario, ATIVO, BLOQUEADO

## Knowledge Gaps
- **308 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+303 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Usuario` connect `Usuario` to `org.springframework.data.domain.Page`, `org.springframework.data.mongodb.core.mapping.Document`, `.resetarSenha`, `StatusUsuario`, `PerfilUsuario`, `.fromEntity`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Equipe` connect `Equipe` to `EquipeRepository`, `org.springframework.data.mongodb.core.mapping.Document`, `CasalRepository`, `StatusEquipe`, `CargaOficialSeed.java`, `Casal`, `Vinculo`, `EquipeRequest`, `.setStatus`, `.criar`, `StatusCasal`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `Casal` connect `Casal` to `Equipe`, `EquipeRepository`, `org.springframework.data.mongodb.core.mapping.Document`, `GoogleIntegracaoAdminController`, `CasalRepository`, `Reuniao`, `CargaOficialSeed.java`, `CasalService`, `StatusEquipe`, `.toDto`, `.enviarAlertasParaData`, `org.springframework.web.bind.annotation.GetMapping`, `StatusCasal`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _308 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `IntegracaoAdminPage` be split into smaller, more focused modules?**
  _Cohesion score 0.05411764705882353 - nodes in this community are weakly interconnected._
- **Should `LayoutService` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._