# Graph Report - ens  (2026-11-03)

## Corpus Check
- 173 files · ~95,389 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1546 nodes · 3590 edges · 57 communities (44 shown, 13 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 531 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bf3180db`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Equipe
- Casal
- org.springframework.web.bind.annotation.GetMapping
- LayoutService
- dependencies
- ens-frontend
- Reuniao
- NoEstrutura
- MovimentacaoCasal
- Sce
- AuthService
- EnsApplication.java
- agenda-reunioes-page.ts
- Arquitetura
- CasaisPage
- MandatosPage
- Mandato
- Usuario
- EquipesPage
- EstruturaSeed
- AgendaReunioesPage
- casal.service.ts
- AuthService
- PerfilUsuario
- MomentoMural
- SacerdotesPage
- equipe.service.ts
- MuralBordoPage
- EstruturaPage
- UsuarioLogado
- ConexaoGoogle
- br.org.ens:ens-backend
- SceService
- PerfilCasalPage
- 2. Componentização do Layout (App Shell)
- EnsFrontend
- MandatoDto
- GoogleIntegracaoService
- EquipeRepository
- UsuarioDto
- MomentoMuralService
- UsuarioRepository
- AuthController.java
- DashboardGeralPage
- Header
- app.ts
- CasalService
- MuralService
- UsuariosAdminPage
- PageResponse
- DashboardEquipePage
- SidebarItem
- StatusUsuario
- Sidebar
- sw.js

## God Nodes (most connected - your core abstractions)
1. `Equipe` - 66 edges
2. `Casal` - 59 edges
3. `Usuario` - 48 edges
4. `EquipeRepository` - 46 edges
5. `Reuniao` - 46 edges
6. `ConexaoGoogle` - 41 edges
7. `Mandato` - 38 edges
8. `Sce` - 36 edges
9. `CasalRepository` - 35 edges
10. `CasalService` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Casal` --references--> `StatusCasal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/StatusCasal.java
- `CasalRepository` --references--> `Casal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalRepository.java → backend/src/main/java/br/org/ens/casal/Casal.java
- `CasalController` --references--> `CasalService`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalController.java → backend/src/main/java/br/org/ens/casal/CasalService.java
- `CasalDto` --references--> `StatusCasal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalDto.java → backend/src/main/java/br/org/ens/casal/StatusCasal.java
- `CasalService` --references--> `CasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalService.java → backend/src/main/java/br/org/ens/casal/CasalRepository.java

## Import Cycles
- None detected.

## Communities (57 total, 13 thin omitted)

### Community 0 - "Equipe"
Cohesion: 0.05
Nodes (27): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, Equipe, EquipeDetalheDto, EquipeRequest (+19 more)

### Community 1 - "Casal"
Cohesion: 0.05
Nodes (19): Casal, CasalDto, CasalRequest, CasalService, PageResponse, Endereco, Filho, InativacaoRequest (+11 more)

### Community 2 - "org.springframework.web.bind.annotation.GetMapping"
Cohesion: 0.14
Nodes (12): CasalController, MovimentacaoDto, MovimentacaoRequest, EquipeController, EstruturaController, org.springframework.web.bind.annotation.DeleteMapping, org.springframework.web.bind.annotation.GetMapping, org.springframework.web.bind.annotation.PostMapping (+4 more)

### Community 3 - "LayoutService"
Cohesion: 0.20
Nodes (5): BreadcrumbItem, LayoutService, Injectable, MENU_ITEMS, NavItem

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (42): @angular/build, @angular/cli, @angular/common, @angular/compiler, @angular/compiler-cli, @angular/core, @angular/forms, @angular/platform-browser (+34 more)

### Community 5 - "ens-frontend"
Cohesion: 0.05
Nodes (41): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+33 more)

### Community 6 - "Reuniao"
Cohesion: 0.06
Nodes (16): PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, Reuniao, ReuniaoController, ReuniaoDto, ReuniaoRequest, ReuniaoDto (+8 more)

### Community 7 - "NoEstrutura"
Cohesion: 0.08
Nodes (15): EstruturaService, NoEstrutura, NivelEstrutura, EQUIPE, PROVINCIA, REGIAO, SETOR, SUPER_REGIAO (+7 more)

### Community 8 - "MovimentacaoCasal"
Cohesion: 0.09
Nodes (9): MovimentacaoCasal, TipoMovimentacao, FALECIMENTO, LICENCA, REMANEJAMENTO, RETORNO, SAIDA, SAIDA_VOLUNTARIA (+1 more)

### Community 9 - "Sce"
Cohesion: 0.07
Nodes (9): Sce, SceRequest, SceService, TituloSce, BISPO, DIACONO, PADRE, RELIGIOSA (+1 more)

### Community 10 - "AuthService"
Cohesion: 0.09
Nodes (10): authGuard(), LoginResponse, AuthService, Injectable, EsqueciSenhaPage, Component, LoginPage, Component (+2 more)

### Community 11 - "EnsApplication.java"
Cohesion: 0.29
Nodes (7): EnsApplication, MongoTransactionManager, org.springframework.boot.autoconfigure.SpringBootApplication, org.springframework.context.annotation.Bean, org.springframework.data.mongodb.MongoDatabaseFactory, org.springframework.data.mongodb.MongoTransactionManager, org.springframework.scheduling.annotation.EnableScheduling

### Community 12 - "agenda-reunioes-page.ts"
Cohesion: 0.14
Nodes (10): Endereco, PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, ReuniaoRequest, ReuniaoService, StatusPresenca, TipoReuniao (+2 more)

### Community 13 - "Arquitetura"
Cohesion: 0.07
Nodes (23): Arquitetura, Decisões técnicas, Frontend, Integração Externa: Google Workspace, LGPD e segurança, RBAC e escopo territorial, Regras de negócio dos mandatos, Stack (+15 more)

### Community 15 - "MandatosPage"
Cohesion: 0.08
Nodes (14): AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto, MandatoRequest, MandatoService, NivelInstancia (+6 more)

### Community 16 - "Mandato"
Cohesion: 0.05
Nodes (25): FuncaoMandato, CL, CRE, CRP, CRR, CRS, CRSR, ERI (+17 more)

### Community 20 - "AgendaReunioesPage"
Cohesion: 0.09
Nodes (3): ReuniaoDto, AgendaReunioesPage, Component

### Community 21 - "casal.service.ts"
Cohesion: 0.20
Nodes (11): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoDto, MovimentacaoRequest, Pessoa, StatusCasal (+3 more)

### Community 22 - "AuthService"
Cohesion: 0.13
Nodes (11): AutenticacaoFilter, Override, AuthService, JwtService, AuthServiceTest, AuthService, io.jsonwebtoken.Claims, jakarta.servlet.FilterChain (+3 more)

### Community 23 - "PerfilUsuario"
Cohesion: 0.12
Nodes (12): AtualizarPerfisRequest, CriarUsuarioRequest, PerfilUsuario, ADMINISTRADOR, CRE, MEMBRO_EQUIPE, RESPONSAVEL_REGIAO, RESPONSAVEL_SETOR (+4 more)

### Community 25 - "SacerdotesPage"
Cohesion: 0.13
Nodes (7): mascararTelefone(), PageResponse, SceDto, SceRequest, TituloSce, SacerdotesPage, Component

### Community 26 - "equipe.service.ts"
Cohesion: 0.11
Nodes (18): PageResponse, EnsDatePipe, AlertaMandato, EquipeDetalheDto, EquipeRequest, EquipeResumoDto, EquipeService, FiltroEquipe (+10 more)

### Community 27 - "MuralBordoPage"
Cohesion: 0.13
Nodes (4): MomentoMuralDto, MuralBordoPage, Component, HostListener

### Community 28 - "EstruturaPage"
Cohesion: 0.07
Nodes (14): EstruturaService, NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, Injectable, DefinicaoNivel, FiltroEstrutura (+6 more)

### Community 29 - "UsuarioLogado"
Cohesion: 0.21
Nodes (8): PerfilUsuario, StatusUsuario, TipoUsuario, UsuarioLogado, CriarUsuarioPayload, PageUsuarios, Injectable, UsuarioAdminService

### Community 30 - "ConexaoGoogle"
Cohesion: 0.06
Nodes (9): ConexaoGoogle, GoogleAuthUrlResponse, GoogleCallbackRequest, GoogleStatusDto, SincronizacaoResultadoDto, GoogleAuthUrlResponse, GoogleStatusDto, GoogleIntegracaoAdminController (+1 more)

### Community 34 - "2. Componentização do Layout (App Shell)"
Cohesion: 0.20
Nodes (9): 1. Identidade Visual e Variáveis de Estilo, 2. Componentização do Layout (App Shell), 3. Diretrizes Técnicas de Implementação, A. Topbar / Header (Topo), B. Sidebar Lateral Retrátil (Menu Recursivo / Árvore de Navegação), C. Área Principal de Dados (Main Content Area), D. Rodapé (Footer), Especificação de Interface e Layout: Shell de Aplicação Responsivo e Recursivo para ENS (+1 more)

### Community 35 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 36 - "MandatoDto"
Cohesion: 0.15
Nodes (9): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, calcular(), MandatoController, MandatoDto (+1 more)

### Community 37 - "GoogleIntegracaoService"
Cohesion: 0.08
Nodes (10): GoogleAuthUrlResponse, GoogleCallbackRequest, GoogleIntegracaoService, GoogleStatusDto, SincronizacaoResultadoDto, Injectable, GoogleCallbackPage, Component (+2 more)

### Community 38 - "EquipeRepository"
Cohesion: 0.06
Nodes (45): CasalRepository, MovimentacaoCasalRepository, StatusCasal, ATIVO, EM_PILOTAGEM, EMERITO, INATIVO, LICENCIADO (+37 more)

### Community 39 - "UsuarioDto"
Cohesion: 0.24
Nodes (5): UsuarioDto, UsuarioAdminController, UsuarioContext, org.springframework.http.ResponseEntity, org.springframework.web.bind.annotation.PatchMapping

### Community 40 - "MomentoMuralService"
Cohesion: 0.22
Nodes (5): MomentoMuralController, MomentoMuralDto, MomentoMuralRequest, MomentoMuralRequest, MomentoMuralService

### Community 41 - "UsuarioRepository"
Cohesion: 0.16
Nodes (7): UsuarioAdminService, UsuarioRepository, Override, UsuarioSeed, org.springframework.boot.CommandLineRunner, org.springframework.security.crypto.password.PasswordEncoder, org.springframework.stereotype.Component

### Community 42 - "AuthController.java"
Cohesion: 0.22
Nodes (6): NegocioException, AuthController, EsqueciSenhaRequest, LoginRequest, LoginResponse, ResetSenhaRequest

### Community 44 - "Header"
Cohesion: 0.14
Nodes (3): Header, Component, HostListener

### Community 45 - "app.ts"
Cohesion: 0.23
Nodes (7): App, appConfig, routes, Component, authInterceptor(), Footer, Component

### Community 47 - "MuralService"
Cohesion: 0.20
Nodes (3): MomentoMuralRequest, MuralService, Injectable

### Community 49 - "PageResponse"
Cohesion: 0.16
Nodes (5): PageResponse, SceController, SceDto, org.springframework.data.domain.Page, org.springframework.data.domain.Pageable

### Community 52 - "SidebarItem"
Cohesion: 0.25
Nodes (3): SidebarItem, Component, Input

### Community 54 - "StatusUsuario"
Cohesion: 0.40
Nodes (3): StatusUsuario, ATIVO, BLOQUEADO

### Community 55 - "Sidebar"
Cohesion: 0.40
Nodes (3): Sidebar, Component, HostListener

## Knowledge Gaps
- **181 isolated node(s):** `br.org.ens:ens-backend`, `ATIVO`, `EM_PILOTAGEM`, `LICENCIADO`, `EMERITO` (+176 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Equipe` connect `Equipe` to `Casal`, `NoEstrutura`, `EquipeRepository`, `Reuniao`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `Casal` connect `Casal` to `Equipe`, `org.springframework.web.bind.annotation.GetMapping`, `Reuniao`, `NoEstrutura`, `EquipeRepository`, `ConexaoGoogle`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Usuario` connect `Usuario` to `NoEstrutura`, `UsuarioRepository`, `PageResponse`, `.criar`, `.resetarSenha`, `StatusUsuario`, `PerfilUsuario`, `AuthService`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `br.org.ens:ens-backend`, `ATIVO`, `EM_PILOTAGEM` to the rest of the system?**
  _181 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Equipe` be split into smaller, more focused modules?**
  _Cohesion score 0.050724637681159424 - nodes in this community are weakly interconnected._
- **Should `Casal` be split into smaller, more focused modules?**
  _Cohesion score 0.05421686746987952 - nodes in this community are weakly interconnected._
- **Should `org.springframework.web.bind.annotation.GetMapping` be split into smaller, more focused modules?**
  _Cohesion score 0.1371794871794872 - nodes in this community are weakly interconnected._