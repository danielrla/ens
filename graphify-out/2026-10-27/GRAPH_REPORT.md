# Graph Report - ens  (2026-10-27)

## Corpus Check
- 122 files · ~56,221 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1139 nodes · 2429 edges · 37 communities (28 shown, 9 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 310 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Equipe
- Casal
- org.springframework.web.bind.annotation.GetMapping
- Header
- dependencies
- ens-frontend
- Reuniao
- EquipeRepository
- MovimentacaoCasal
- Sce
- Mandato
- EnsApplication.java
- agenda-reunioes-page.ts
- Arquitetura
- CasaisPage
- mandatos-page.ts
- FuncaoMandato
- app.routes.ts
- EquipesPage
- EstruturaSeed
- AgendaReunioesPage
- casal.service.ts
- CasalService
- MandatoService
- MomentoMural
- SacerdotesPage
- equipe.service.ts
- MuralBordoPage
- EstruturaPage
- NivelInstancia
- EquipeService.java
- br.org.ens:ens-backend
- sacerdotes-page.ts
- PerfilCasalPage
- 2. Componentização do Layout (App Shell)
- EnsFrontend
- AlertaMandato

## God Nodes (most connected - your core abstractions)
1. `Equipe` - 60 edges
2. `Casal` - 46 edges
3. `Mandato` - 38 edges
4. `Reuniao` - 37 edges
5. `CasalService` - 33 edges
6. `Sce` - 33 edges
7. `EquipeRepository` - 32 edges
8. `AgendaReunioesPage` - 31 edges
9. `CasaisPage` - 30 edges
10. `MovimentacaoCasal` - 28 edges

## Surprising Connections (you probably didn't know these)
- `CasalController` --references--> `CasalService`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalController.java → backend/src/main/java/br/org/ens/casal/CasalService.java
- `EquipeService` --references--> `CasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/equipe/EquipeService.java → backend/src/main/java/br/org/ens/casal/CasalRepository.java
- `MandatoService` --references--> `CasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/mandato/MandatoService.java → backend/src/main/java/br/org/ens/casal/CasalRepository.java
- `ReuniaoService` --references--> `CasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/reuniao/ReuniaoService.java → backend/src/main/java/br/org/ens/casal/CasalRepository.java
- `CasalService` --references--> `MovimentacaoCasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalService.java → backend/src/main/java/br/org/ens/casal/movimentacao/MovimentacaoCasalRepository.java

## Import Cycles
- None detected.

## Communities (37 total, 9 thin omitted)

### Community 0 - "Equipe"
Cohesion: 0.06
Nodes (25): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, Equipe, EquipeDetalheDto, EquipeRequest (+17 more)

### Community 1 - "Casal"
Cohesion: 0.06
Nodes (25): Casal, CasalDto, CasalRepository, CasalRequest, CasalService, PageResponse, Endereco, Filho (+17 more)

### Community 2 - "org.springframework.web.bind.annotation.GetMapping"
Cohesion: 0.06
Nodes (23): CasalController, InativacaoRequest, MovimentacaoDto, MovimentacaoRequest, PageResponse, EquipeController, EstruturaController, MandatoController (+15 more)

### Community 3 - "Header"
Cohesion: 0.05
Nodes (18): App, Component, Footer, Component, Header, Component, HostListener, BreadcrumbItem (+10 more)

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (42): @angular/build, @angular/cli, @angular/common, @angular/compiler, @angular/compiler-cli, @angular/core, @angular/forms, @angular/platform-browser (+34 more)

### Community 5 - "ens-frontend"
Cohesion: 0.05
Nodes (41): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+33 more)

### Community 6 - "Reuniao"
Cohesion: 0.06
Nodes (16): PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, Reuniao, ReuniaoController, ReuniaoDto, ReuniaoRequest, ReuniaoDto (+8 more)

### Community 7 - "EquipeRepository"
Cohesion: 0.06
Nodes (23): MovimentacaoCasalRepository, EquipeRepository, EstruturaService, NoEstrutura, NivelEstrutura, EQUIPE, PROVINCIA, REGIAO (+15 more)

### Community 8 - "MovimentacaoCasal"
Cohesion: 0.06
Nodes (17): MovimentacaoCasal, TipoMovimentacao, FALECIMENTO, LICENCA, REMANEJAMENTO, RETORNO, SAIDA, SAIDA_VOLUNTARIA (+9 more)

### Community 9 - "Sce"
Cohesion: 0.08
Nodes (8): Sce, SceService, TituloSce, BISPO, DIACONO, PADRE, RELIGIOSA, RELIGIOSO

### Community 11 - "EnsApplication.java"
Cohesion: 0.33
Nodes (6): EnsApplication, MongoTransactionManager, org.springframework.boot.autoconfigure.SpringBootApplication, org.springframework.context.annotation.Bean, org.springframework.data.mongodb.MongoDatabaseFactory, org.springframework.data.mongodb.MongoTransactionManager

### Community 12 - "agenda-reunioes-page.ts"
Cohesion: 0.14
Nodes (10): Endereco, PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, ReuniaoRequest, ReuniaoService, StatusPresenca, TipoReuniao (+2 more)

### Community 13 - "Arquitetura"
Cohesion: 0.08
Nodes (22): Arquitetura, Decisões técnicas, Frontend, LGPD e segurança, RBAC e escopo territorial, Regras de negócio dos mandatos, Stack, Backend e banco (+14 more)

### Community 15 - "mandatos-page.ts"
Cohesion: 0.09
Nodes (14): AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto, MandatoRequest, MandatoService, NivelInstancia (+6 more)

### Community 16 - "FuncaoMandato"
Cohesion: 0.12
Nodes (10): FuncaoMandato, CL, CRE, CRP, CRR, CRS, CRSR, ERI (+2 more)

### Community 20 - "AgendaReunioesPage"
Cohesion: 0.06
Nodes (7): ReuniaoDto, DashboardGeralPage, Component, AgendaReunioesPage, Component, DashboardEquipePage, Component

### Community 21 - "casal.service.ts"
Cohesion: 0.30
Nodes (10): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoDto, MovimentacaoRequest, Pessoa, StatusCasal (+2 more)

### Community 23 - "MandatoService"
Cohesion: 0.25
Nodes (3): MandatoDto, PageResponse, MandatoService

### Community 26 - "equipe.service.ts"
Cohesion: 0.11
Nodes (18): PageResponse, EnsDatePipe, AlertaMandato, EquipeDetalheDto, EquipeRequest, EquipeResumoDto, EquipeService, FiltroEquipe (+10 more)

### Community 27 - "MuralBordoPage"
Cohesion: 0.09
Nodes (7): MomentoMuralDto, MomentoMuralRequest, MuralService, Injectable, MuralBordoPage, Component, HostListener

### Community 28 - "EstruturaPage"
Cohesion: 0.07
Nodes (14): EstruturaService, NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, Injectable, DefinicaoNivel, FiltroEstrutura (+6 more)

### Community 29 - "NivelInstancia"
Cohesion: 0.18
Nodes (8): MandatoRequest, NivelInstancia, EQUIPE, INTERNACIONAL, PROVINCIA, REGIAO, SETOR, SUPER_REGIAO

### Community 30 - "EquipeService.java"
Cohesion: 0.22
Nodes (4): StatusMandato, CONCLUIDO, INTERROMPIDO_ANTECIPADAMENTE, VIGENTE

### Community 32 - "sacerdotes-page.ts"
Cohesion: 0.20
Nodes (6): PageResponse, SceDto, SceRequest, SceService, TituloSce, Injectable

### Community 33 - "PerfilCasalPage"
Cohesion: 0.11
Nodes (4): mascararCpf(), mascararTelefone(), PerfilCasalPage, Component

### Community 34 - "2. Componentização do Layout (App Shell)"
Cohesion: 0.20
Nodes (9): 1. Identidade Visual e Variáveis de Estilo, 2. Componentização do Layout (App Shell), 3. Diretrizes Técnicas de Implementação, A. Topbar / Header (Topo), B. Sidebar Lateral Retrátil (Menu Recursivo / Árvore de Navegação), C. Área Principal de Dados (Main Content Area), D. Rodapé (Footer), Especificação de Interface e Layout: Shell de Aplicação Responsivo e Recursivo para ENS (+1 more)

### Community 35 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 36 - "AlertaMandato"
Cohesion: 0.33
Nodes (6): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, calcular()

## Knowledge Gaps
- **166 isolated node(s):** `br.org.ens:ens-backend`, `ATIVO`, `EM_PILOTAGEM`, `LICENCIADO`, `EMERITO` (+161 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Sce` connect `Sce` to `MovimentacaoCasal`, `EquipeRepository`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `Equipe` connect `Equipe` to `MovimentacaoCasal`, `Casal`, `EquipeRepository`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `Mandato` connect `Mandato` to `Equipe`, `EquipeRepository`, `MovimentacaoCasal`, `FuncaoMandato`, `MandatoService`, `NivelInstancia`, `EquipeService.java`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `br.org.ens:ens-backend`, `ATIVO`, `EM_PILOTAGEM` to the rest of the system?**
  _166 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Equipe` be split into smaller, more focused modules?**
  _Cohesion score 0.0577324973876698 - nodes in this community are weakly interconnected._
- **Should `Casal` be split into smaller, more focused modules?**
  _Cohesion score 0.05720122574055159 - nodes in this community are weakly interconnected._
- **Should `org.springframework.web.bind.annotation.GetMapping` be split into smaller, more focused modules?**
  _Cohesion score 0.06172839506172839 - nodes in this community are weakly interconnected._