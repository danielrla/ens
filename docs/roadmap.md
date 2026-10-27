# Roadmap

## Estado por trilha

| Trilha | Item | Estado |
|---|---|---|
| Contratos | OpenAPI com DTOs, enums e endpoints | Concluído |
| Infra | docker-compose com MongoDB 8.3.13 (replica set) e backend | Concluído e validado |
| Backend | Esqueleto Spring Boot 4.1.1 e Java 25 | Concluído e validado |
| Backend | Hierarquia (`estrutura`) e `GET /estrutura/{nivel}` | Concluído e validado |
| Backend | Seed: apenas Super-Região Brasil | Concluído |
| Frontend | Esqueleto Angular 21, design system e App Shell responsivo (Sidebar recursiva, Header e Footer) | Concluído e validado |
| Frontend | Filtro em cascata com estado na URL | Concluído (compila) |
| Backend | Coleção `equipes`, índices e `GET /equipes` com filtros | Concluído e validado |
| Frontend | Telas de gestão e listagem de Equipes integradas aos filtros | Concluído e validado |
| Backend | CRUD de casais: cadastro, inativação e transferência | Concluído e validado |
| Frontend | Telas de gestão, busca e cadastro de Casais | Concluído e validado |
| Backend | Autenticação JWT e RBAC com escopo territorial | Pendente |
| Backend | SCE: cadastro, listagem, inativação e vínculo | Pendente |
| Backend e Frontend | Vida da Equipe (Dashboard Equipe exclusivo, Agenda, Roteiro Litúrgico, Mural de Bordo) e Dashboard Geral para lideranças | Concluído e validado |
| Backend e Frontend | Perfil do Casal com foto no topo, Mural de Bordo com fotos (removidos diário e livro de ouro) | Concluído e validado |
| Transversal | Auditoria, cifragem de campos sensíveis, PWA | Pendente |

## Pendências abertas

- Dados oficiais de Províncias, Regiões e Setores para o seed (não foram inventados).
- Validação visual do frontend em navegador (o navegador automatizado não funcionou no ambiente de desenvolvimento).
- Análise das 2 vulnerabilidades reportadas pelo `npm audit` (1 moderada, 1 alta).
- Testes automatizados: ainda não existem no backend nem no frontend.

## Próximo passo recomendado

Implementar `equipes` com os 4 IDs de ancestrais e índices, e `GET /equipes` com todos os filtros do contrato. Isso destrava a listagem e o select de Equipe no frontend.

## Ordem de marcos

1. Contratos e infra. 2. Hierarquia e filtro em cascata. 3. Casais, SCE e equipes. 4. Mandatos e alertas. 5. Vida da Equipe. 6. Auditoria, LGPD e PWA.
