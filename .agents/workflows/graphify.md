---
name: graphify-workflow
description: Fluxo operacional para geração e atualização completa do grafo de conhecimento do projeto.
---

# Fluxo Operacional: Graphify (Padrão GCCD)

## 1. Goal (Objetivo)
Executar o pipeline completo de extração da Árvore Sintática Abstrata (AST), detecção de comunidades e enriquecimento semântico do código-fonte e documentos do repositório ENS.

## 2. Context (Contexto)
* **Entrada:** Arquivos do projeto na raiz ou em diretórios especificados (código backend em `backend/`, frontend em `frontend/`, documentação em `docs/`).
* **Saída:** Base de dados relacional e visual gerada em `graphify-out/`.

## 3. Constraints (Restrições)
* **Diretório Padrão:** Se nenhum argumento de caminho for explicitado na invocação do workflow, adotar a raiz do projeto atual (`.`).
* **Higiene e Exclusões:** Garantir a exclusão de diretórios de build (`target/`, `dist/`), módulos de terceiros (`node_modules/`), arquivos de versionamento (`.git/`) e arquivos privados (`anotacoes.txt`).
* **Economia de Recursos:** Utilizar o modo de atualização rápida local (`graphify update .`) após pequenas alterações, reservando o reprocessamento completo (`graphify run`) apenas para reestruturações globais.

## 4. Deliverables (Entregáveis e Critérios de Sucesso)
* Arquivo de dados serializado: `graphify-out/graph.json`.
* Mapa interativo em navegador: `graphify-out/graph.html`.
* Sumário executivo e relatório de comunidades: `graphify-out/GRAPH_REPORT.md`.
* Wiki navegável de arquitetura quando gerada: `graphify-out/wiki/`.
