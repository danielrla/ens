# Graph Report - ens  (2026-11-04)

## Corpus Check
- 180 files · ~121,671 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1700 nodes · 3372 edges · 67 communities (49 shown, 18 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 316 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a4a9093d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Equipe
- Casal
- org.springframework.web.bind.annotation.ResponseStatus
- Header
- dependencies
- ens-frontend
- Reuniao
- NoEstrutura
- MovimentacaoCasal
- Sce
- Header
- EnsApplication.java
- agenda-reunioes-page.ts
- Arquitetura do Sistema ENS
- CasaisPage
- MandatosPage
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
- src/app/core/equipe.service.ts
- br.org.ens:ens-backend
- SceService
- PerfilCasalPage
- 2. Componentização do Layout (App Shell)
- EnsFrontend
- org.springframework.web.bind.annotation.GetMapping
- .criar
- EquipeRepository
- AgendaReunioesPage
- MomentoMuralDto
- EstruturaPage
- CargaOficialSeed.java
- DashboardGeralPage
- src/app/features/reunioes/agenda-reunioes-page.ts
- NoEstrutura
- CasalService
- MuralService
- MuralBordoPage
- SceService
- mock-api.interceptor.ts
- DashboardEquipePage
- EquipesPage
- git.md
- org.springframework.web.bind.annotation.PostMapping
- DashboardGeralPage
- EquipeResumoDto
- CasalService
- PerfilCasalPage
- SearchableSelect
- DashboardEquipePage
- Instruções para Importação de Dados do ENS
- EnsFrontend
- MuralService
- EquipeService
- AlertaMandato
- FiltroEstrutura

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
- `CasalRepository` --references--> `Casal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalRepository.java → backend/src/main/java/br/org/ens/casal/Casal.java
- `CasalController` --references--> `CasalService`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalController.java → backend/src/main/java/br/org/ens/casal/CasalService.java
- `CasalService` --references--> `CasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalService.java → backend/src/main/java/br/org/ens/casal/CasalRepository.java
- `EquipeService` --references--> `CasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/equipe/EquipeService.java → backend/src/main/java/br/org/ens/casal/CasalRepository.java
- `ReuniaoService` --references--> `CasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/reuniao/ReuniaoService.java → backend/src/main/java/br/org/ens/casal/CasalRepository.java

## Import Cycles
- None detected.

## Communities (67 total, 18 thin omitted)

### Community 0 - "Equipe"
Cohesion: 0.15
Nodes (4): Equipe, EquipeDetalheDto, EquipeResumoDto, Vinculo

### Community 1 - "Casal"
Cohesion: 0.06
Nodes (22): Casal, CasalDto, CasalRequest, CasalService, PageResponse, Endereco, Filho, InativacaoRequest (+14 more)

### Community 2 - "org.springframework.web.bind.annotation.ResponseStatus"
Cohesion: 0.19
Nodes (7): EquipeController, EstruturaController, org.springframework.web.bind.annotation.DeleteMapping, org.springframework.web.bind.annotation.PutMapping, org.springframework.web.bind.annotation.RequestMapping, org.springframework.web.bind.annotation.ResponseStatus, org.springframework.web.bind.annotation.RestController

### Community 3 - "Header"
Cohesion: 0.05
Nodes (20): App, appConfig, routes, Component, Footer, Component, Header, Component (+12 more)

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
Cohesion: 0.13
Nodes (13): EstruturaService, NoEstrutura, NivelEstrutura, EQUIPE, PROVINCIA, REGIAO, SETOR, SUPER_REGIAO (+5 more)

### Community 8 - "MovimentacaoCasal"
Cohesion: 0.06
Nodes (17): MovimentacaoCasal, MovimentacaoCasalRepository, TipoMovimentacao, FALECIMENTO, LICENCA, REMANEJAMENTO, RETORNO, SAIDA (+9 more)

### Community 9 - "Sce"
Cohesion: 0.11
Nodes (7): Sce, TituloSce, BISPO, DIACONO, PADRE, RELIGIOSA, RELIGIOSO

### Community 10 - "Header"
Cohesion: 0.05
Nodes (18): App, Component, Footer, Component, Header, Component, HostListener, BreadcrumbItem (+10 more)

### Community 11 - "EnsApplication.java"
Cohesion: 0.33
Nodes (6): EnsApplication, MongoTransactionManager, org.springframework.boot.autoconfigure.SpringBootApplication, org.springframework.context.annotation.Bean, org.springframework.data.mongodb.MongoDatabaseFactory, org.springframework.data.mongodb.MongoTransactionManager

### Community 12 - "agenda-reunioes-page.ts"
Cohesion: 0.14
Nodes (10): Endereco, PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, ReuniaoRequest, ReuniaoService, StatusPresenca, TipoReuniao (+2 more)

### Community 13 - "Arquitetura do Sistema ENS"
Cohesion: 0.07
Nodes (24): Arquitetura do Sistema ENS, Decisões Técnicas, Integração com Google Workspace, Matriz de Perfis Estatutários (RBAC), Modelo de Dados das Principais Entidades, Notificações e Agendamento D-1, Progressive Web App (PWA), Stack Tecnológica (+16 more)

### Community 14 - "CasaisPage"
Cohesion: 0.09
Nodes (13): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoDto, MovimentacaoRequest, Pessoa, StatusCasal (+5 more)

### Community 15 - "MandatosPage"
Cohesion: 0.08
Nodes (14): AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto, MandatoRequest, MandatoService, NivelInstancia (+6 more)

### Community 16 - "Mandato"
Cohesion: 0.05
Nodes (24): FuncaoMandato, CL, CRE, CRP, CRR, CRS, CRSR, ERI (+16 more)

### Community 17 - "ens-frontend"
Cohesion: 0.05
Nodes (42): build, serve, test, builder, configurations, defaultConfiguration, options, analytics (+34 more)

### Community 20 - "AgendaReunioesPage"
Cohesion: 0.10
Nodes (3): ReuniaoDto, AgendaReunioesPage, Component

### Community 21 - "dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+34 more)

### Community 22 - "CasaisPage"
Cohesion: 0.09
Nodes (12): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoRequest, Pessoa, StatusCasal, TipoMovimentacao (+4 more)

### Community 23 - "src/app/features/mandatos/mandatos-page.ts"
Cohesion: 0.09
Nodes (14): AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto, MandatoRequest, MandatoService, NivelInstancia (+6 more)

### Community 25 - "SacerdotesPage"
Cohesion: 0.13
Nodes (7): mascararTelefone(), PageResponse, SceDto, SceRequest, TituloSce, SacerdotesPage, Component

### Community 26 - "frontend/src/app/core/equipe.service.ts"
Cohesion: 0.10
Nodes (19): PageResponse, EnsDatePipe, Pipe, AlertaMandato, EquipeDetalheDto, EquipeRequest, EquipeResumoDto, EquipeService (+11 more)

### Community 27 - "MuralBordoPage"
Cohesion: 0.13
Nodes (4): MomentoMuralDto, MuralBordoPage, Component, HostListener

### Community 28 - "EstruturaPage"
Cohesion: 0.07
Nodes (14): EstruturaService, NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, Injectable, DefinicaoNivel, FiltroEstrutura (+6 more)

### Community 29 - "SacerdotesPage"
Cohesion: 0.09
Nodes (9): mascararTelefone(), PageResponse, SceDto, SceRequest, SceService, TituloSce, Injectable, SacerdotesPage (+1 more)

### Community 30 - "src/app/core/equipe.service.ts"
Cohesion: 0.11
Nodes (17): PageResponse, EnsDatePipe, Pipe, AlertaMandato, EquipeDetalheDto, EquipeResumoDto, EquipeService, FiltroEquipe (+9 more)

### Community 34 - "2. Componentização do Layout (App Shell)"
Cohesion: 0.20
Nodes (9): 1. Identidade Visual e Variáveis de Estilo, 2. Componentização do Layout (App Shell), 3. Diretrizes Técnicas de Implementação, A. Topbar / Header (Topo), B. Sidebar Lateral Retrátil (Menu Recursivo / Árvore de Navegação), C. Área Principal de Dados (Main Content Area), D. Rodapé (Footer), Especificação de Interface e Layout: Shell de Aplicação Responsivo e Recursivo para ENS (+1 more)

### Community 35 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 36 - "org.springframework.web.bind.annotation.GetMapping"
Cohesion: 0.17
Nodes (5): PageResponse, MandatoController, MandatoDto, PageResponse, org.springframework.web.bind.annotation.GetMapping

### Community 37 - ".criar"
Cohesion: 0.16
Nodes (3): EquipeDetalheDto, EquipeRequest, TemaAno

### Community 38 - "EquipeRepository"
Cohesion: 0.10
Nodes (8): CasalRepository, EquipeRepository, MandatoRepository, MandatoService, org.springframework.data.mongodb.core.index.CompoundIndex, org.springframework.data.mongodb.core.mapping.Document, org.springframework.data.mongodb.core.MongoTemplate, org.springframework.transaction.annotation.Transactional

### Community 40 - "MomentoMuralDto"
Cohesion: 0.26
Nodes (4): MomentoMuralController, MomentoMuralDto, MomentoMuralRequest, MomentoMuralRequest

### Community 42 - "CargaOficialSeed.java"
Cohesion: 0.10
Nodes (15): TransferenciaRequest, PapelVinculo, CRE, MEMBRO, StatusEquipe, ATIVA, EM_PILOTAGEM, EM_REESTRUTURACAO (+7 more)

### Community 44 - "src/app/features/reunioes/agenda-reunioes-page.ts"
Cohesion: 0.12
Nodes (11): Endereco, PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, ReuniaoDto, ReuniaoRequest, ReuniaoService, StatusPresenca (+3 more)

### Community 45 - "NoEstrutura"
Cohesion: 0.12
Nodes (11): EstruturaService, NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, Injectable, DefinicaoNivel, NIVEIS (+3 more)

### Community 48 - "MuralBordoPage"
Cohesion: 0.13
Nodes (5): MomentoMuralDto, MomentoMuralRequest, MuralBordoPage, Component, HostListener

### Community 49 - "SceService"
Cohesion: 0.15
Nodes (4): SceController, SceDto, SceRequest, SceService

### Community 50 - "mock-api.interceptor.ts"
Cohesion: 0.17
Nodes (14): appConfig, routes, MovimentacaoDto, getStored(), mockApiInterceptor(), setStored(), INITIAL_CASAIS, INITIAL_EQUIPES (+6 more)

### Community 52 - "EquipesPage"
Cohesion: 0.14
Nodes (3): EquipeRequest, EquipesPage, Component

### Community 53 - "git.md"
Cohesion: 0.11
Nodes (18): 1. Garanta que você está na branch principal, 1. Volte para a main e garanta que ela está atualizada, 2. Baixe as atualizações mais recentes do GitHub (boa prática), 2. Crie e mude para a branch de hotfix, 3. Adicione e commite a correção, 3. Crie e mude para a nova branch de funcionalidade, 4. Adicione os arquivos alterados para o commit, 4. Volte para a branch principal (+10 more)

### Community 54 - "org.springframework.web.bind.annotation.PostMapping"
Cohesion: 0.20
Nodes (4): CasalController, MovimentacaoDto, MovimentacaoRequest, org.springframework.web.bind.annotation.PostMapping

### Community 56 - "EquipeResumoDto"
Cohesion: 0.15
Nodes (10): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, EquipeResumoDto, SituacaoMandato, EM_FASE_SUCESSAO (+2 more)

### Community 59 - "SearchableSelect"
Cohesion: 0.25
Nodes (5): Output, SearchableSelect, Component, HostListener, Input

### Community 61 - "Instruções para Importação de Dados do ENS"
Cohesion: 0.25
Nodes (7): 1. Importação com Dump Nativo (`mongorestore`), 2. Importação dos Arquivos JSON (`mongoimport`), 3. Importação Gráfica via MongoDB Compass, 4. Relação de Coleções Exportadas, Instruções para Importação de Dados do ENS, Opção A: Restaurar em container Docker local, Opção B: Restaurar em instância remota ou MongoDB Atlas

### Community 62 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 64 - "EquipeService"
Cohesion: 0.38
Nodes (3): CreInfo, EquipeService, PageResponse

### Community 65 - "AlertaMandato"
Cohesion: 0.33
Nodes (6): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, calcular()

## Knowledge Gaps
- **271 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+266 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Equipe` connect `Equipe` to `EquipeService`, `Casal`, `.criar`, `EquipeRepository`, `CargaOficialSeed.java`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Casal` connect `Casal` to `Equipe`, `EquipeService`, `EquipeRepository`, `Reuniao`, `CargaOficialSeed.java`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `NoEstrutura` connect `NoEstrutura` to `Equipe`, `EquipeService`, `org.springframework.web.bind.annotation.ResponseStatus`, `org.springframework.web.bind.annotation.GetMapping`, `.criar`, `EquipeRepository`, `org.springframework.web.bind.annotation.PostMapping`, `EquipeResumoDto`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _271 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Casal` be split into smaller, more focused modules?**
  _Cohesion score 0.05630252100840336 - nodes in this community are weakly interconnected._
- **Should `Header` be split into smaller, more focused modules?**
  _Cohesion score 0.050072568940493466 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._