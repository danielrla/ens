---
name: regras-de-negocio
description: Diretrizes de conformidade funcional com as regras estatutárias do movimento ENS e alinhamento de contratos de API.
trigger: always_on
---

# Diretrizes de Negócio e Contratos de API (Padrão GCCD)

## 1. Goal (Objetivo)
Garantir que todas as implementações de software respeitem rigorosamente o carisma, o estatuto e a dinâmica pastoral das Equipes de Nossa Senhora (ENS), mantendo perfeita aderência aos contratos de API documentados.

## 2. Context (Contexto)
* **Estrutura Hierárquica:** Setor, Região, Província e Super-Região (Brasil), agrupando Equipes de Base de 5 a 7 casais e um Conselheiro Espiritual (SCE).
* **Perfis Estatutários (RBAC):**
  * `ADMINISTRADOR` (Individual): Gestão global do sistema e integrações;
  * `SACERDOTE` (Individual): Assistência espiritual, com acesso à agenda, mural, dashboard e avisos da equipe;
  * `MEMBRO_EQUIPE` (Casal): Acesso estrito à agenda e mural de bordo da sua equipe;
  * `CRE` (Casal): Casal Responsável de Equipe, acumulando visão de membro mais dashboard e avisos da equipe;
  * `RESPONSAVEL_SETOR` (Casal): Acumula funções de equipe mais dashboard geral e equipes do setor;
  * `RESPONSAVEL_REGIAO` (Casal): Acumula funções de equipe mais dashboard geral e equipes da região.
* **Fontes Canônicas:**
  * Especificação funcional e regras de negócio: `prompt.md`;
  * Contrato unificado de endpoints e DTOs: `docs/openapi.yaml`;
  * Documentação técnica viva: pasta `docs/` (`arquitetura.md`, `execucao.md`, `roadmap.md`).

## 3. Constraints (Restrições)
* **Validação Obrigatória de Contratos:** É proibido criar endpoints ou alterar parâmetros de requisição/resposta que divirjam de `docs/openapi.yaml`.
* **Privacidade dos Casais:** Dados de vida conjugal, anotações de partilha e histórico espiritual não devem ser expostos fora do escopo da própria equipe.
* **Manutenção Documental Síncrona:** Qualquer alteração em endpoints, modelos de dados ou regras funcionais exige a atualização imediata do documento em `docs/` e do status no `docs/roadmap.md` no mesmo turno de entrega.
* **Higiene de Leitura:** Não reler arquivos inteiros repetidamente no chat se não houver indício de alteração recente no workspace.

## 4. Deliverables (Entregáveis e Critérios de Sucesso)
* Endpoints RESTful estritamente compatíveis com as especificações OpenAPI.
* DTOs e entidades alinhadas com as definições de records do Java e interfaces do TypeScript.
* Documentação atualizada no repositório refletindo com precisão as capacidades operacionais entregues.
