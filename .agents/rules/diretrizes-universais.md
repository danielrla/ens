---
name: diretrizes-universais
description: Diretrizes universais de engenharia, segurança da informação, arquitetura e operação do agente no ecossistema ENS.
trigger: always_on
---

# Diretrizes Universais de Engenharia e Operação (Padrão GCCD)

## 1. Goal (Objetivo)
Estabelecer as normas mandatórias de engenharia de software, segurança de dados, arquitetura em camadas e governança operacional para agentes de IA e desenvolvedores durante todo o ciclo de vida do projeto ENS (Equipes de Nossa Senhora).

## 2. Context (Contexto)
* **Domínio:** Sistema integrado de gestão pastoral, administrativa e territorial das Equipes de Nossa Senhora.
* **Stack Tecnológica do Backend:** Java 25, Spring Boot 4.1.1, Spring Data MongoDB (Replica Set `rs0`), Spring Security Crypto com JJWT 0.12.6, Google APIs (Calendar, People, Drive) e Maven.
* **Stack Tecnológica do Frontend:** Angular 21 (Standalone Components, Signals, Router, Vanilla CSS estruturado, TypeScript 5.7+), PWA com Service Worker offline e Web Manifest.
* **Ambiente e Infraestrutura:** Containers Docker obrigatoriamente vinculados à rede `containers` e com timezone padronizado em `America/Cuiaba`.

## 3. Constraints (Restrições)
* **Confinamento Estrito de Workspace:** Toda e qualquer operação de leitura, escrita ou execução de comandos deve restringir-se estritamente à raiz deste projeto. É proibido navegar, inspecionar ou referenciar diretórios externos.
* **Proteção Absoluta de Arquivos Pessoais:** É expressamente vedado ler, processar ou referenciar arquivos de anotações ou dados estritamente pessoais, em especial o arquivo `anotacoes.txt`.
* **Zero Hardcode de Ambientes:** Proibido embutir URLs, portas ou credenciais de produção no código. Valores dinâmicos devem ser injetados por variáveis de ambiente via `application.yml` ou `.env`.
* **Segurança OWASP e Sanitização:**
  * O upload de arquivos deve validar obrigatoriamente a assinatura de bytes (magic bytes), rejeitando arquivos com extensões manipuladas.
  * O nome de arquivos em disco ou armazenamento deve ser substituído por identificadores únicos (UUID v4) para mitigar vulnerabilidades de Path Traversal.
  * O tráfego de autenticação (`/api/auth`) não deve expor dados cadastrais desnecessários.
* **Disciplina de Estilo e Comunicação:**
  * Respostas sem preâmbulo e sem termos de enchimento.
  * Nunca utilizar travessão em-dash nem hífen solto como recurso estilístico na prosa.
  * Utilizar prosa para decisões e narrativas, reservando listas exclusivamente para elementos enumeráveis.

## 4. Deliverables (Entregáveis e Critérios de Sucesso)
* Código modular, desacoplado e aderente aos padrões definidos de Spring Boot e Angular.
* Documentação funcional clara em serviços e contratos de negócio (Javadoc e TSDoc).
* Testes unitários automatizados cobrindo fluxos críticos de negócio e segurança com taxa de 100% de sucesso.
* Atualização simultânea da documentação técnica em `docs/` e reindexação do grafo via `graphify update .` ao término de alterações no código.
