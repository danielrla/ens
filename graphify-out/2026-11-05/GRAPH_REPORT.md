# Graph Report - ens  (2026-11-05)

## Corpus Check
- 217 files · ~165,877 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2059 nodes · 4009 edges · 88 communities (62 shown, 26 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 318 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41c52710`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Equipe
- IntegracaoAdminPage
- PageResponse
- LayoutService
- dependencies
- ens-frontend
- Reuniao
- NoEstrutura
- MovimentacaoCasal
- Sce
- LayoutService
- EnsApplication.java
- agenda-reunioes-page.ts
- Arquitetura do Sistema ENS
- CasaisPage
- frontend/src/app/features/mandatos/mandatos-page.ts
- Mandato
- ens-frontend
- EquipesPage
- EstruturaSeed
- AgendaReunioesPage
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
- MandatoService.java
- AgendaReunioesPage
- EquipeDetalheDto
- EstruturaPage
- IntegracaoAdminPage
- AuthService
- MomentoMuralService
- BiometriaService
- BiometriaService
- CasalService
- MuralBordoPage
- CargaOficialSeed.java
- mock-api.interceptor.ts
- UsuarioLogado
- EquipesPage
- Header
- org.springframework.web.bind.annotation.ResponseStatus
- DashboardGeralPage
- SearchableSelect
- CasalService
- PerfilCasalPage
- StatusCasal
- DashboardEquipePage
- Instruções para Importação de Dados do ENS
- EnsFrontend
- src/app/app.ts
- EquipeRepository
- MandatoDto
- FuncaoMandato
- UsuariosAdminPage
- NotificacaoService
- MandatoService
- 2. Detalhamento Técnico das Modificações
- CasalService
- UsuarioLogado
- Header
- SearchableSelect
- MuralService
- org.springframework.web.bind.annotation.GetMapping
- NotificacaoService
- UsuariosAdminPage
- src/app/app.routes.ts
- EstruturaService
- MandatoService
- EquipeService
- frontend/src/app/app.config.ts
- frontend/src/app/core/cuiaba-date.util.ts
- FiltroEstrutura
- frontend/src/app/features/auth/reset-senha-page.ts
- Sidebar

## God Nodes (most connected - your core abstractions)
1. `Equipe` - 61 edges
2. `Casal` - 47 edges
3. `Mandato` - 38 edges
4. `Reuniao` - 37 edges
5. `CasalService` - 33 edges
6. `Sce` - 33 edges
7. `EquipeRepository` - 32 edges
8. `AgendaReunioesPage` - 32 edges
9. `AgendaReunioesPage` - 31 edges
10. `CasaisPage` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Casal` --references--> `Endereco`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/Endereco.java
- `Casal` --references--> `Filho`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/Filho.java
- `Casal` --references--> `StatusCasal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/StatusCasal.java
- `CasalRepository` --references--> `Casal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalRepository.java → backend/src/main/java/br/org/ens/casal/Casal.java
- `CasalController` --references--> `CasalService`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalController.java → backend/src/main/java/br/org/ens/casal/CasalService.java

## Import Cycles
- None detected.

## Communities (88 total, 26 thin omitted)

### Community 0 - "Equipe"
Cohesion: 0.06
Nodes (23): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, Equipe, EquipeResumoDto, CreInfo (+15 more)

### Community 1 - "IntegracaoAdminPage"
Cohesion: 0.05
Nodes (19): EmailConfigDto, EmailIntegracaoService, LogEnvioEmailDto, MetodoEnvioEmail, SalvarEmailConfigRequest, TesteEmailRequest, TesteEmailResponse, Injectable (+11 more)

### Community 2 - "PageResponse"
Cohesion: 0.22
Nodes (4): MovimentacaoDto, MovimentacaoRequest, PageResponse, org.springframework.data.domain.Page

### Community 3 - "LayoutService"
Cohesion: 0.12
Nodes (8): BreadcrumbItem, LayoutService, Injectable, MENU_ITEMS, NavItem, SidebarItem, Component, Input

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+34 more)

### Community 5 - "ens-frontend"
Cohesion: 0.05
Nodes (41): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+33 more)

### Community 6 - "Reuniao"
Cohesion: 0.07
Nodes (16): PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, Reuniao, ReuniaoController, ReuniaoDto, ReuniaoRequest, ReuniaoDto (+8 more)

### Community 7 - "NoEstrutura"
Cohesion: 0.12
Nodes (13): EstruturaService, NoEstrutura, NivelEstrutura, EQUIPE, PROVINCIA, REGIAO, SETOR, SUPER_REGIAO (+5 more)

### Community 8 - "MovimentacaoCasal"
Cohesion: 0.09
Nodes (9): MovimentacaoCasal, TipoMovimentacao, FALECIMENTO, LICENCA, REMANEJAMENTO, RETORNO, SAIDA, SAIDA_VOLUNTARIA (+1 more)

### Community 9 - "Sce"
Cohesion: 0.07
Nodes (11): Sce, SceController, SceDto, SceRequest, SceService, TituloSce, BISPO, DIACONO (+3 more)

### Community 10 - "LayoutService"
Cohesion: 0.12
Nodes (8): BreadcrumbItem, LayoutService, Injectable, MENU_ITEMS, NavItem, SidebarItem, Component, Input

### Community 11 - "EnsApplication.java"
Cohesion: 0.33
Nodes (6): EnsApplication, MongoTransactionManager, org.springframework.boot.autoconfigure.SpringBootApplication, org.springframework.context.annotation.Bean, org.springframework.data.mongodb.MongoDatabaseFactory, org.springframework.data.mongodb.MongoTransactionManager

### Community 12 - "agenda-reunioes-page.ts"
Cohesion: 0.14
Nodes (10): Endereco, PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, ReuniaoRequest, ReuniaoService, StatusPresenca, TipoReuniao (+2 more)

### Community 13 - "Arquitetura do Sistema ENS"
Cohesion: 0.04
Nodes (43): 1. Prioridade Primária: Material Design 3 Oficial (https://m3.material.io/), 2. Prioridade Secundária (Fallback): Angular Material (https://material.angular.dev/components), Arquitetura do Sistema ENS, Decisões Técnicas, Ergonomia Mobile e Central de Alertas em Bottom Sheet, Fuso Horário Padronizado (Cuiabá - UTC-4), Gestão de Casais e Movimentações, Governança de Mandatos Estatutários e Sucessão (+35 more)

### Community 14 - "CasaisPage"
Cohesion: 0.09
Nodes (13): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoDto, MovimentacaoRequest, Pessoa, StatusCasal (+5 more)

### Community 15 - "frontend/src/app/features/mandatos/mandatos-page.ts"
Cohesion: 0.12
Nodes (12): AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto, MandatoRequest, NivelInstancia, PageResponse (+4 more)

### Community 17 - "ens-frontend"
Cohesion: 0.05
Nodes (42): build, serve, test, builder, configurations, defaultConfiguration, options, analytics (+34 more)

### Community 18 - "EquipesPage"
Cohesion: 0.15
Nodes (3): EquipeResumoDto, EquipesPage, Component

### Community 20 - "AgendaReunioesPage"
Cohesion: 0.05
Nodes (7): ReuniaoDto, DashboardGeralPage, Component, AgendaReunioesPage, Component, DashboardEquipePage, Component

### Community 21 - "dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+34 more)

### Community 22 - "CasaisPage"
Cohesion: 0.08
Nodes (14): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoRequest, Pessoa, StatusCasal, TipoMovimentacao (+6 more)

### Community 23 - "src/app/features/mandatos/mandatos-page.ts"
Cohesion: 0.08
Nodes (17): calcularDiasRestantesCuiaba(), FUSO_CUIABA, hojeCuiabaStr(), AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto (+9 more)

### Community 25 - "SacerdotesPage"
Cohesion: 0.11
Nodes (8): PageResponse, SceDto, SceRequest, SceService, TituloSce, Injectable, SacerdotesPage, Component

### Community 26 - "frontend/src/app/core/equipe.service.ts"
Cohesion: 0.11
Nodes (15): PageResponse, AlertaMandato, EquipeDetalheDto, EquipeRequest, EquipeService, FiltroEquipe, PapelVinculo, SituacaoMandato (+7 more)

### Community 27 - "MuralBordoPage"
Cohesion: 0.08
Nodes (7): MomentoMuralDto, MomentoMuralRequest, MuralService, Injectable, MuralBordoPage, Component, HostListener

### Community 28 - "EstruturaPage"
Cohesion: 0.07
Nodes (14): EstruturaService, NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, Injectable, DefinicaoNivel, FiltroEstrutura (+6 more)

### Community 29 - "SacerdotesPage"
Cohesion: 0.12
Nodes (8): PageResponse, SceDto, SceRequest, SceService, TituloSce, Injectable, SacerdotesPage, Component

### Community 30 - "src/app/features/reunioes/agenda-reunioes-page.ts"
Cohesion: 0.09
Nodes (15): Endereco, formatarDataCuiaba(), EnsDatePipe, Pipe, PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, ReuniaoDto (+7 more)

### Community 32 - "AuthService"
Cohesion: 0.09
Nodes (12): authGuard(), LoginResponse, AuthService, Injectable, AlertaReuniao, TipoNotificacao, EsqueciSenhaPage, Component (+4 more)

### Community 33 - "PerfilCasalPage"
Cohesion: 0.14
Nodes (3): mascararTelefone(), PerfilCasalPage, Component

### Community 34 - "2. Componentização do Layout (App Shell)"
Cohesion: 0.20
Nodes (9): 1. Identidade Visual e Variáveis de Estilo, 2. Componentização do Layout (App Shell), 3. Diretrizes Técnicas de Implementação e Biblioteca de Componentes, A. Topbar / Header (Topo), B. Sidebar Lateral Retrátil (Menu Recursivo / Árvore de Navegação), C. Área Principal de Dados (Main Content Area), D. Rodapé (Footer), Especificação de Interface e Layout: Shell de Aplicação Responsivo e Recursivo para ENS (+1 more)

### Community 35 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 36 - "CasalRepository"
Cohesion: 0.15
Nodes (9): CasalRepository, MovimentacaoCasalRepository, MandatoRepository, ReuniaoRepository, SceRepository, org.springframework.data.domain.Pageable, org.springframework.data.mongodb.core.MongoTemplate, org.springframework.data.mongodb.repository.MongoRepository (+1 more)

### Community 37 - "Casal"
Cohesion: 0.14
Nodes (5): Casal, Pessoa, Endereco, Filho, Pessoa

### Community 38 - "MandatoService.java"
Cohesion: 0.12
Nodes (8): TransferenciaRequest, PapelVinculo, CRE, MEMBRO, VinculoDto, VinculoRequest, org.springframework.data.mongodb.core.index.CompoundIndex, org.springframework.data.mongodb.core.mapping.Document

### Community 40 - "EquipeDetalheDto"
Cohesion: 0.39
Nodes (3): EquipeController, EquipeDetalheDto, EquipeRequest

### Community 42 - "IntegracaoAdminPage"
Cohesion: 0.05
Nodes (19): EmailConfigDto, EmailIntegracaoService, LogEnvioEmailDto, MetodoEnvioEmail, SalvarEmailConfigRequest, TesteEmailRequest, TesteEmailResponse, Injectable (+11 more)

### Community 43 - "AuthService"
Cohesion: 0.09
Nodes (10): authGuard(), LoginResponse, AuthService, Injectable, AlertaReuniao, TipoNotificacao, EsqueciSenhaPage, Component (+2 more)

### Community 44 - "MomentoMuralService"
Cohesion: 0.16
Nodes (6): MomentoMuralController, MomentoMuralDto, MomentoMuralRepository, MomentoMuralRequest, MomentoMuralRequest, MomentoMuralService

### Community 45 - "BiometriaService"
Cohesion: 0.11
Nodes (5): BiometriaRegistro, BiometriaService, Injectable, LoginPage, Component

### Community 46 - "BiometriaService"
Cohesion: 0.11
Nodes (5): BiometriaRegistro, BiometriaService, Injectable, LoginPage, Component

### Community 47 - "CasalService"
Cohesion: 0.12
Nodes (4): CasalService, Injectable, EnsDatePipe, Pipe

### Community 48 - "MuralBordoPage"
Cohesion: 0.13
Nodes (5): MomentoMuralDto, MomentoMuralRequest, MuralBordoPage, Component, HostListener

### Community 49 - "CargaOficialSeed.java"
Cohesion: 0.19
Nodes (6): Filho, CargaOficialSeed, CasalDef, org.slf4j.Logger, org.springframework.boot.ApplicationRunner, org.springframework.context.annotation.Configuration

### Community 50 - "mock-api.interceptor.ts"
Cohesion: 0.11
Nodes (27): MovimentacaoDto, PageResponse, AlertaMandato, EquipeDetalheDto, EquipeRequest, EquipeResumoDto, FiltroEquipe, PapelVinculo (+19 more)

### Community 51 - "UsuarioLogado"
Cohesion: 0.26
Nodes (8): PerfilUsuario, StatusUsuario, TipoUsuario, UsuarioLogado, CriarUsuarioPayload, PageUsuarios, Injectable, UsuarioAdminService

### Community 54 - "org.springframework.web.bind.annotation.ResponseStatus"
Cohesion: 0.24
Nodes (7): EstruturaController, org.springframework.web.bind.annotation.DeleteMapping, org.springframework.web.bind.annotation.PostMapping, org.springframework.web.bind.annotation.PutMapping, org.springframework.web.bind.annotation.RequestMapping, org.springframework.web.bind.annotation.ResponseStatus, org.springframework.web.bind.annotation.RestController

### Community 56 - "SearchableSelect"
Cohesion: 0.15
Nodes (9): NivelEstrutura, NoEstruturaRequest, AbaVisualizacao, SearchableOption, SearchableSelect, Component, HostListener, Input (+1 more)

### Community 59 - "StatusCasal"
Cohesion: 0.11
Nodes (10): CasalRequest, PageResponse, Endereco, StatusCasal, ATIVO, EM_PILOTAGEM, EMERITO, INATIVO (+2 more)

### Community 61 - "Instruções para Importação de Dados do ENS"
Cohesion: 0.25
Nodes (7): 1. Importação com Dump Nativo (`mongorestore`), 2. Importação dos Arquivos JSON (`mongoimport`), 3. Importação Gráfica via MongoDB Compass, 4. Relação de Coleções Exportadas, Instruções para Importação de Dados do ENS, Opção A: Restaurar em container Docker local, Opção B: Restaurar em instância remota ou MongoDB Atlas

### Community 62 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 63 - "src/app/app.ts"
Cohesion: 0.15
Nodes (8): App, Component, BottomNav, Component, Footer, Component, Sidebar, Component

### Community 65 - "MandatoDto"
Cohesion: 0.16
Nodes (9): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, calcular(), MandatoController, MandatoDto (+1 more)

### Community 66 - "FuncaoMandato"
Cohesion: 0.10
Nodes (14): FuncaoMandato, CL, CRE, CRP, CRR, CRS, CRSR, ERI (+6 more)

### Community 69 - "MandatoService"
Cohesion: 0.11
Nodes (10): MandatoRequest, MandatoService, NivelInstancia, EQUIPE, INTERNACIONAL, PROVINCIA, REGIAO, SETOR (+2 more)

### Community 70 - "2. Detalhamento Técnico das Modificações"
Cohesion: 0.20
Nodes (9): 1. Revisão e Alinhamento com o Usuário, 2. Detalhamento Técnico das Modificações, 3. Plano de Verificação, A. Central de Alertas como Bottom Sheet (`src/app/layout/header/header.ts`), B. Refatoração de Usabilidade e Layout Mobile Global (`src/app/app.ts`, `src/styles.css` e páginas), C. Ícone das ENS no Navegador e PWA (`src/index.html` e `public/`), D. Validação e Teste do Google Workspace OAuth2 (`src/app/core/mock-api.interceptor.ts` e `src/app/features/admin/integracao-admin-page.ts`), E. Documentação Técnica (`docs/`) (+1 more)

### Community 72 - "UsuarioLogado"
Cohesion: 0.22
Nodes (8): PerfilUsuario, StatusUsuario, TipoUsuario, UsuarioLogado, CriarUsuarioPayload, PageUsuarios, Injectable, UsuarioAdminService

### Community 74 - "SearchableSelect"
Cohesion: 0.19
Nodes (6): SearchableOption, SearchableSelect, Component, HostListener, Input, Output

### Community 76 - "org.springframework.web.bind.annotation.GetMapping"
Cohesion: 0.27
Nodes (3): CasalController, CasalDto, org.springframework.web.bind.annotation.GetMapping

### Community 79 - "src/app/app.routes.ts"
Cohesion: 0.27
Nodes (6): appConfig, routes, agoraCuiaba(), getStored(), mockApiInterceptor(), setStored()

### Community 83 - "frontend/src/app/app.config.ts"
Cohesion: 0.40
Nodes (4): App, appConfig, routes, Component

### Community 84 - "frontend/src/app/core/cuiaba-date.util.ts"
Cohesion: 0.40
Nodes (3): calcularDiasRestantesCuiaba(), FUSO_CUIABA, hojeCuiabaStr()

## Knowledge Gaps
- **297 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+292 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mandato` connect `Mandato` to `FuncaoMandato`, `CasalRepository`, `Casal`, `MandatoService`, `MandatoService.java`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Equipe` connect `Equipe` to `EquipeRepository`, `PageResponse`, `Casal`, `MandatoService.java`, `CargaOficialSeed.java`, `StatusCasal`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `NotificacaoService` connect `NotificacaoService` to `AuthService`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _297 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Equipe` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `IntegracaoAdminPage` be split into smaller, more focused modules?**
  _Cohesion score 0.05411764705882353 - nodes in this community are weakly interconnected._
- **Should `LayoutService` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._