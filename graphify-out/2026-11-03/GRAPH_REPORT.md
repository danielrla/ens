# Graph Report - ens  (2026-11-03)

## Corpus Check
- 138 files · ~66,932 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1314 nodes · 2933 edges · 50 communities (42 shown, 8 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 432 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bf3180db`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Equipe
- .carregarCasaisAparecida
- org.springframework.web.bind.annotation.GetMapping
- Header
- dependencies
- ens-frontend
- .registrar
- NoEstrutura
- MovimentacaoCasal
- Sce
- Reuniao
- EnsApplication.java
- agenda-reunioes-page.ts
- Arquitetura
- CasaisPage
- MandatosPage
- Mandato
- ReuniaoDto
- EquipesPage
- EstruturaSeed
- AgendaReunioesPage
- casal.service.ts
- CargaOficialSeed.java
- Casal
- MomentoMural
- app.routes.ts
- equipe.service.ts
- MuralBordoPage
- EstruturaPage
- CasalDto
- ConexaoGoogle
- br.org.ens:ens-backend
- SceService
- PerfilCasalPage
- 2. Componentização do Layout (App Shell)
- EnsFrontend
- EquipeRepository
- GoogleIntegracaoService
- CasalRepository
- GoogleIntegracaoAdminController
- StatusCasal
- CriptografiaService
- AlertaMandato
- Endereco
- StatusPresenca
- CasalService
- mural-bordo-page.ts
- CasalService
- EquipeService

## God Nodes (most connected - your core abstractions)
1. `Equipe` - 64 edges
2. `Casal` - 57 edges
3. `Reuniao` - 45 edges
4. `EquipeRepository` - 41 edges
5. `ConexaoGoogle` - 41 edges
6. `Mandato` - 38 edges
7. `Sce` - 34 edges
8. `CasalService` - 33 edges
9. `AgendaReunioesPage` - 31 edges
10. `CasalRepository` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Casal` --references--> `Endereco`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/Endereco.java
- `Casal` --references--> `Filho`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/Filho.java
- `Casal` --references--> `Pessoa`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/Pessoa.java
- `Casal` --references--> `StatusCasal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/Casal.java → backend/src/main/java/br/org/ens/casal/StatusCasal.java
- `CasalRepository` --references--> `Casal`  [EXTRACTED]
  backend/src/main/java/br/org/ens/casal/CasalRepository.java → backend/src/main/java/br/org/ens/casal/Casal.java

## Import Cycles
- None detected.

## Communities (50 total, 8 thin omitted)

### Community 0 - "Equipe"
Cohesion: 0.05
Nodes (20): Equipe, EquipeResumoDto, CreInfo, EquipeDetalheDto, EquipeResumoDto, PageResponse, SituacaoMandato, EM_FASE_SUCESSAO (+12 more)

### Community 1 - ".carregarCasaisAparecida"
Cohesion: 0.14
Nodes (7): Pessoa, CargaOficialSeed, CasalDef, Endereco, Filho, Pessoa, org.springframework.context.annotation.Configuration

### Community 2 - "org.springframework.web.bind.annotation.GetMapping"
Cohesion: 0.05
Nodes (33): CasalController, MovimentacaoDto, MovimentacaoRequest, PageResponse, EquipeController, EquipeDetalheDto, EquipeRequest, EstruturaController (+25 more)

### Community 3 - "Header"
Cohesion: 0.05
Nodes (20): App, appConfig, routes, Component, Footer, Component, Header, Component (+12 more)

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (42): @angular/build, @angular/cli, @angular/common, @angular/compiler, @angular/compiler-cli, @angular/core, @angular/forms, @angular/platform-browser (+34 more)

### Community 5 - "ens-frontend"
Cohesion: 0.05
Nodes (41): build, serve, test, builder, configurations, defaultConfiguration, options, cli (+33 more)

### Community 6 - ".registrar"
Cohesion: 0.12
Nodes (6): PresencaCasal, RegistroPresencaRequest, TipoReuniao, FORMAL, INFORMAL, OUTROS

### Community 7 - "NoEstrutura"
Cohesion: 0.15
Nodes (10): NivelEstrutura, EQUIPE, PROVINCIA, REGIAO, SETOR, SUPER_REGIAO, pai(), NoArvoreDto (+2 more)

### Community 8 - "MovimentacaoCasal"
Cohesion: 0.09
Nodes (9): MovimentacaoCasal, TipoMovimentacao, FALECIMENTO, LICENCA, REMANEJAMENTO, RETORNO, SAIDA, SAIDA_VOLUNTARIA (+1 more)

### Community 9 - "Sce"
Cohesion: 0.08
Nodes (9): Sce, SceRequest, SceService, TituloSce, BISPO, DIACONO, PADRE, RELIGIOSA (+1 more)

### Community 11 - "EnsApplication.java"
Cohesion: 0.33
Nodes (6): EnsApplication, MongoTransactionManager, org.springframework.boot.autoconfigure.SpringBootApplication, org.springframework.context.annotation.Bean, org.springframework.data.mongodb.MongoDatabaseFactory, org.springframework.data.mongodb.MongoTransactionManager

### Community 12 - "agenda-reunioes-page.ts"
Cohesion: 0.11
Nodes (15): Endereco, EnsDatePipe, EquipeDetalheDto, PresencaCasal, PresencaDetalheDto, RegistroPresencaRequest, ReuniaoRequest, ReuniaoService (+7 more)

### Community 13 - "Arquitetura"
Cohesion: 0.07
Nodes (23): Arquitetura, Decisões técnicas, Frontend, Integração Externa: Google Workspace, LGPD e segurança, RBAC e escopo territorial, Regras de negócio dos mandatos, Stack (+15 more)

### Community 14 - "CasaisPage"
Cohesion: 0.11
Nodes (3): mascararCpf(), CasaisPage, Component

### Community 15 - "MandatosPage"
Cohesion: 0.08
Nodes (12): AlertaMandato, FiltroMandato, FuncaoMandato, InterrupcaoRequest, MandatoService, NivelInstancia, PageResponse, PrazoSugeridoDto (+4 more)

### Community 16 - "Mandato"
Cohesion: 0.05
Nodes (25): FuncaoMandato, CL, CRE, CRP, CRR, CRS, CRSR, ERI (+17 more)

### Community 17 - "ReuniaoDto"
Cohesion: 0.20
Nodes (4): ReuniaoController, ReuniaoDto, ReuniaoRequest, ReuniaoService

### Community 18 - "EquipesPage"
Cohesion: 0.15
Nodes (3): EquipeResumoDto, EquipesPage, Component

### Community 20 - "AgendaReunioesPage"
Cohesion: 0.05
Nodes (7): ReuniaoDto, DashboardGeralPage, Component, AgendaReunioesPage, Component, DashboardEquipePage, Component

### Community 21 - "casal.service.ts"
Cohesion: 0.21
Nodes (11): CasalDto, CasalRequest, Filho, FiltroCasal, MovimentacaoDto, MovimentacaoRequest, Pessoa, StatusCasal (+3 more)

### Community 22 - "CargaOficialSeed.java"
Cohesion: 0.15
Nodes (6): TransferenciaRequest, PapelVinculo, CRE, MEMBRO, org.springframework.data.mongodb.core.index.CompoundIndex, org.springframework.data.mongodb.core.mapping.Document

### Community 23 - "Casal"
Cohesion: 0.17
Nodes (3): Casal, com.google.api.services.calendar.model.Event, Event

### Community 25 - "app.routes.ts"
Cohesion: 0.12
Nodes (8): desmascarar(), mascararTelefone(), PageResponse, SceDto, SceRequest, TituloSce, SacerdotesPage, Component

### Community 26 - "equipe.service.ts"
Cohesion: 0.12
Nodes (12): PageResponse, AlertaMandato, EquipeRequest, EquipeService, FiltroEquipe, PapelVinculo, SituacaoMandato, StatusEquipe (+4 more)

### Community 27 - "MuralBordoPage"
Cohesion: 0.13
Nodes (4): MomentoMuralDto, MuralBordoPage, Component, HostListener

### Community 28 - "EstruturaPage"
Cohesion: 0.07
Nodes (14): EstruturaService, NivelEstrutura, NoArvore, NoEstrutura, NoEstruturaRequest, Injectable, DefinicaoNivel, FiltroEstrutura (+6 more)

### Community 29 - "CasalDto"
Cohesion: 0.17
Nodes (3): CasalDto, CasalRequest, Filho

### Community 30 - "ConexaoGoogle"
Cohesion: 0.10
Nodes (3): ConexaoGoogle, GoogleStatusDto, com.google.api.services.people.v1.PeopleService

### Community 34 - "2. Componentização do Layout (App Shell)"
Cohesion: 0.20
Nodes (9): 1. Identidade Visual e Variáveis de Estilo, 2. Componentização do Layout (App Shell), 3. Diretrizes Técnicas de Implementação, A. Topbar / Header (Topo), B. Sidebar Lateral Retrátil (Menu Recursivo / Árvore de Navegação), C. Área Principal de Dados (Main Content Area), D. Rodapé (Footer), Especificação de Interface e Layout: Shell de Aplicação Responsivo e Recursivo para ENS (+1 more)

### Community 35 - "EnsFrontend"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, EnsFrontend, Running end-to-end tests, Running unit tests

### Community 36 - "EquipeRepository"
Cohesion: 0.24
Nodes (3): EquipeRepository, EstruturaService, NoEstrutura

### Community 37 - "GoogleIntegracaoService"
Cohesion: 0.08
Nodes (10): GoogleAuthUrlResponse, GoogleCallbackRequest, GoogleIntegracaoService, GoogleStatusDto, SincronizacaoResultadoDto, Injectable, GoogleCallbackPage, Component (+2 more)

### Community 38 - "CasalRepository"
Cohesion: 0.19
Nodes (12): CasalRepository, GoogleAuthService, GoogleCalendarService, GoogleContactsService, GoogleDriveService, ReuniaoRepository, com.google.api.client.googleapis.auth.oauth2.GoogleCredential, com.google.api.client.http.HttpTransport (+4 more)

### Community 39 - "GoogleIntegracaoAdminController"
Cohesion: 0.13
Nodes (7): GoogleAuthUrlResponse, GoogleCallbackRequest, GoogleStatusDto, SincronizacaoResultadoDto, GoogleAuthUrlResponse, GoogleIntegracaoAdminController, org.springframework.http.ResponseEntity

### Community 40 - "StatusCasal"
Cohesion: 0.17
Nodes (8): PageResponse, StatusCasal, ATIVO, EM_PILOTAGEM, EMERITO, INATIVO, LICENCIADO, VIUVO

### Community 42 - "CriptografiaService"
Cohesion: 0.23
Nodes (6): CriptografiaService, CriptografiaServiceTest, java.security.SecureRandom, javax.crypto.SecretKey, org.junit.jupiter.api.BeforeEach, org.junit.jupiter.api.Test

### Community 43 - "AlertaMandato"
Cohesion: 0.33
Nodes (5): AlertaMandato, DOURADO, LARANJA, NENHUM, VERMELHO

### Community 44 - "Endereco"
Cohesion: 0.25
Nodes (3): Endereco, com.google.api.services.people.v1.model.Person, Person

### Community 45 - "StatusPresenca"
Cohesion: 0.29
Nodes (5): PresencaDetalheDto, StatusPresenca, FALTOU, JUSTIFICOU, PRESENTE

### Community 47 - "mural-bordo-page.ts"
Cohesion: 0.22
Nodes (3): MomentoMuralRequest, MuralService, Injectable

### Community 49 - "EquipeService"
Cohesion: 0.16
Nodes (10): MovimentacaoCasalRepository, EquipeService, ConexaoGoogleRepository, MandatoRepository, MandatoService, SceRepository, org.springframework.data.domain.Pageable, org.springframework.data.mongodb.core.MongoTemplate (+2 more)

## Knowledge Gaps
- **170 isolated node(s):** `br.org.ens:ens-backend`, `ATIVO`, `EM_PILOTAGEM`, `LICENCIADO`, `EMERITO` (+165 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mandato` connect `Mandato` to `Equipe`, `EquipeService`, `CargaOficialSeed.java`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Equipe` connect `Equipe` to `.carregarCasaisAparecida`, `EquipeRepository`, `CasalRepository`, `StatusCasal`, `EquipeService`, `CargaOficialSeed.java`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `Casal` connect `Casal` to `Equipe`, `.carregarCasaisAparecida`, `org.springframework.web.bind.annotation.GetMapping`, `CasalRepository`, `GoogleIntegracaoAdminController`, `StatusCasal`, `.sincronizarEventoReuniao`, `Reuniao`, `Endereco`, `CasalService`, `EquipeService`, `CargaOficialSeed.java`, `CasalDto`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `br.org.ens:ens-backend`, `ATIVO`, `EM_PILOTAGEM` to the rest of the system?**
  _170 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Equipe` be split into smaller, more focused modules?**
  _Cohesion score 0.05311542390194075 - nodes in this community are weakly interconnected._
- **Should `.carregarCasaisAparecida` be split into smaller, more focused modules?**
  _Cohesion score 0.14210526315789473 - nodes in this community are weakly interconnected._
- **Should `org.springframework.web.bind.annotation.GetMapping` be split into smaller, more focused modules?**
  _Cohesion score 0.0507048180096781 - nodes in this community are weakly interconnected._