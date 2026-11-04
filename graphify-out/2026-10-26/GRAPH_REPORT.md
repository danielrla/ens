# Graph Report - ens  (2026-10-26)

## Corpus Check
- 106 files · ~35,050 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 907 nodes · 1862 edges · 32 communities (27 shown, 5 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 226 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Equipe
- Casal
- org.springframework.web.bind.annotation.GetMapping
- SidebarItem
- dependencies
- ens-frontend
- Reuniao
- NoEstrutura
- MovimentacaoCasal
- Sce
- Mandato
- EnsApplication.java
- EquipeRepository
- Arquitetura
- CasaisPage
- MandatosPage
- FuncaoMandato
- EquipesPage
- EstruturaSeed
- equipes-page.ts
- NivelInstancia
- casal.service.ts
- SacerdotesPage
- equipe.service.ts
- EstruturaPage
- StatusMandato
- SceService
- br.org.ens:ens-backend
- 2. Componentização do Layout (App Shell)
- EnsFrontend
- FiltroEstrutura

## God Nodes (most connected - your core abstractions)
1. `Equipe` - 53 edges
2. `Casal` - 45 edges
3. `Mandato` - 37 edges
4. `Sce` - 33 edges
5. `EquipeRepository` - 29 edges
6. `MovimentacaoCasal` - 28 edges
7. `NoEstrutura` - 28 edges
8. `CasaisPage` - 27 edges
9. `Reuniao` - 25 edges
10. `CasalService` - 24 edges

## Surprising Connections (you probably didn't know these)
- `CasalRepository` --references--> `Casal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalRepository.java → backend/src/main/java/br/org/ens/casal/Casal.java
- `CasalController` --references--> `CasalService`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalController.java → backend/src/main/java/br/org/ens/casal/CasalService.java
- `CasalService` --references--> `CasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalService.java → backend/src/main/java/br/org/ens/casal/CasalRepository.java
- `CasalService` --references--> `MovimentacaoCasalRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalService.java → backend/src/main/java/br/org/ens/casal/movimentacao/MovimentacaoCasalRepository.java
- `CasalService` --references--> `EquipeRepository`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalService.java → backend/src/main/java/br/org/ens/equipe/EquipeRepository.java

## Import Cycles
- None detected.

## Communities (32 total, 5 thin omitted)

### Community 0 - "Equipe"
Cohesion: 0.07
Nodes (11): Equipe, EquipeRequest, EquipeDetalheDto, EquipeResumoDto, PageResponse, StatusEquipe, ATIVA, EM_PILOTAGEM (+3 more)

### Community 1 - "Casal"
Cohesion: 0.05
Nodes (29): Casal, CasalDto, CasalRequest, CasalService, PageResponse, Endereco, Filho, Pessoa (+21 more)

### Community 2 - "org.springframework.web.bind.annotation.GetMapping"
Cohesion: 0.07
Nodes (26): CasalController, InativacaoRequest, MovimentacaoDto, MovimentacaoRequest, PageResponse, EquipeController, EquipeDetalheDto, AlertaMandato (+18 more)

### Community 3 - "SidebarItem"
Cohesion: 0.06
Nodes (20): App, appConfig, routes, Component, Footer, Component, Header, Component (+12 more)

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (42): @angular/build, @angular/cli, @angular/common, @angular/compiler, @angular/compiler-cli, @angular/core, @angular/forms, @angular/platform-browser (+34 more)

### Community 5 - "ens-frontend"
Cohesion: 0.05
Nodes (40): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+32 more)

### Community 6 - "Reuniao"
Cohesion: 0.08
Nodes (11): PresencaCasal, PresencaDetalheDto, Reuniao, ReuniaoController, ReuniaoDto, ReuniaoRequest, ReuniaoDto, StatusPresenca (+3 more)

### Community 7 - "NoEstrutura"
Cohesion: 0.08
Nodes (24): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO, EquipeResumoDto, SituacaoMandato, EM_FASE_SUCESSAO (+16 more)

### Community 8 - "MovimentacaoCasal"
Cohesion: 0.08
Nodes (9): MovimentacaoCasal, TipoMovimentacao, FALECIMENTO, LICENCA, REMANEJAMENTO, SAIDA_VOLUNTARIA, TRANSFERENCIA, org.springframework.data.mongodb.core.index.CompoundIndex (+1 more)

### Community 9 - "Sce"
Cohesion: 0.08
Nodes (8): Sce, SceService, TituloSce, BISPO, DIACONO, PADRE, RELIGIOSA, RELIGIOSO

### Community 11 - "EnsApplication.java"
Cohesion: 0.33
Nodes (6): EnsApplication, MongoTransactionManager, org.springframework.boot.autoconfigure.SpringBootApplication, org.springframework.context.annotation.Bean, org.springframework.data.mongodb.MongoDatabaseFactory, org.springframework.data.mongodb.MongoTransactionManager

### Community 12 - "EquipeRepository"
Cohesion: 0.10
Nodes (15): CasalRepository, MovimentacaoCasalRepository, EquipeRepository, EquipeService, MandatoRepository, MandatoService, ReuniaoRepository, ReuniaoService (+7 more)

### Community 13 - "Arquitetura"
Cohesion: 0.08
Nodes (22): Arquitetura, Decisões técnicas, Frontend, LGPD e segurança, RBAC e escopo territorial, Regras de negócio dos mandatos, Stack, Backend e banco (+14 more)

### Community 14 - "CasaisPage"
Cohesion: 0.12
Nodes (5): CasalDto, CasalRequest, mascararCpf(), CasaisPage, Component

### Community 15 - "MandatosPage"
Cohesion: 0.07
Nodes (16): CasalService, Injectable, AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoDto, MandatoRequest (+8 more)

### Community 17 - "FuncaoMandato"
Cohesion: 0.13
Nodes (10): FuncaoMandato, CL, CRE, CRP, CRR, CRS, CRSR, ERI (+2 more)

### Community 18 - "EquipesPage"
Cohesion: 0.17
Nodes (4): EquipeDetalheDto, EquipeResumoDto, EquipesPage, Component

### Community 20 - "equipes-page.ts"
Cohesion: 0.22
Nodes (8): PresencaCasal, PresencaDetalheDto, ReuniaoDto, ReuniaoRequest, ReuniaoService, StatusPresenca, Injectable, PresencaFormItem

### Community 21 - "NivelInstancia"
Cohesion: 0.14
Nodes (9): MandatoRequest, NivelInstancia, EQUIPE, INTERNACIONAL, PROVINCIA, REGIAO, SETOR, SUPER_REGIAO (+1 more)

### Community 22 - "casal.service.ts"
Cohesion: 0.31
Nodes (8): Endereco, Filho, FiltroCasal, MovimentacaoDto, MovimentacaoRequest, Pessoa, StatusCasal, TipoMovimentacao

### Community 25 - "SacerdotesPage"
Cohesion: 0.14
Nodes (8): desmascarar(), mascararTelefone(), PageResponse, SceDto, SceRequest, TituloSce, SacerdotesPage, Component

### Community 26 - "equipe.service.ts"
Cohesion: 0.12
Nodes (11): PageResponse, AlertaMandato, EquipeRequest, EquipeService, FiltroEquipe, PapelVinculo, SituacaoMandato, StatusEquipe (+3 more)

### Community 28 - "EstruturaPage"
Cohesion: 0.09
Nodes (12): EstruturaService, NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, Injectable, DefinicaoNivel, NIVEIS (+4 more)

### Community 29 - "StatusMandato"
Cohesion: 0.29
Nodes (4): StatusMandato, CONCLUIDO, INTERROMPIDO_ANTECIPADAMENTE, VIGENTE

### Community 34 - "2. Componentização do Layout (App Shell)"
Cohesion: 0.20
Nodes (9): 1. Identidade Visual e Variáveis de Estilo, 2. Componentização do Layout (App Shell), 3. Diretrizes Técnicas de Implementação, A. Topbar / Header (Topo), B. Sidebar Lateral Retrátil (Menu Recursivo / Árvore de Navegação), C. Área Principal de Dados (Main Content Area), D. Rodapé (Footer), Especificação de Interface e Layout: Shell de Aplicação Responsivo e Recursivo para ENS (+1 more)

### Community 35 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

## Knowledge Gaps
- **161 isolated node(s):** `br.org.ens:ens-backend`, `ATIVO`, `EM_PILOTAGEM`, `LICENCIADO`, `EMERITO` (+156 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Casal` connect `Casal` to `MovimentacaoCasal`, `Equipe`, `EquipeRepository`, `Reuniao`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `Mandato` connect `Mandato` to `Equipe`, `MovimentacaoCasal`, `EquipeRepository`, `.enrich`, `FuncaoMandato`, `NivelInstancia`, `StatusMandato`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `Equipe` connect `Equipe` to `MovimentacaoCasal`, `Casal`, `EquipeRepository`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `br.org.ens:ens-backend`, `ATIVO`, `EM_PILOTAGEM` to the rest of the system?**
  _161 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Equipe` be split into smaller, more focused modules?**
  _Cohesion score 0.07372229760289462 - nodes in this community are weakly interconnected._
- **Should `Casal` be split into smaller, more focused modules?**
  _Cohesion score 0.05170998632010944 - nodes in this community are weakly interconnected._
- **Should `org.springframework.web.bind.annotation.GetMapping` be split into smaller, more focused modules?**
  _Cohesion score 0.07236544549977386 - nodes in this community are weakly interconnected._