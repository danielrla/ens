---
name: graphify-rules
description: Diretrizes de consulta e sincronização do grafo de conhecimento do projeto em graphify-out/.
trigger: always_on
---

# Diretrizes do Grafo de Conhecimento (Padrão GCCD)

## 1. Goal (Objetivo)
Utilizar o grafo de conhecimento semântico e estrutural do projeto para acelerar a compreensão da arquitetura, mapear impactos de alterações e manter o repositório indexado com mínimo consumo de contexto.

## 2. Context (Contexto)
* **Localização do Grafo:** Diretório `graphify-out/` contendo o índice serializado (`graph.json`), visualização interativa (`graph.html`) e relatório detalhado (`GRAPH_REPORT.md`).
* **Estrutura Indexada:** Nós representando classes Java, componentes Angular, contratos de DTO, entidades de domínio, rotas e arquivos de documentação.

## 3. Constraints (Restrições)
* **Prioridade de Ferramentas Estruturadas:**
  * Para dúvidas de código ou arquitetura, quando `graphify-out/graph.json` existir, executar prioritariamente `graphify query "<pergunta>"` (CLI) ou `query_graph` (MCP).
  * Para análise de relacionamentos entre dois nós, utilizar `graphify path "<A>" "<B>"` ou `shortest_path`.
  * Para detalhamento conceitual de um nó ou entidade, empregar `graphify explain "<conceito>"` ou `get_node`.
* **Navegação Eficiente:** Se o arquivo `graphify-out/wiki/index.md` existir, priorizar a navegação nele em vez de inspecionar arquivos brutos indiscriminadamente.
* **Leitura Seletiva de Relatório:** Consultar `graphify-out/GRAPH_REPORT.md` apenas para análises arquiteturais amplas ou quando as consultas direcionadas não fornecerem contexto suficiente.

## 4. Deliverables (Entregáveis e Critérios de Sucesso)
* Subgrafos e respostas pontuais contendo apenas os nós e dependências diretamente impactados pela tarefa.
* Atualização compulsória do grafo via `graphify update .` (operação baseada em AST local, sem custo de LLM) após qualquer modificação de arquivos de código no workspace.
