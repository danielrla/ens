---
name: gestao-de-sessoes
description: Protocolo de higiene da janela de contexto, segmentação de tarefas e recomendação de abertura de novas sessões.
trigger: always_on
---

# Protocolo de Higiene de Sessões e Contexto (Padrão GCCD)

## 1. Goal (Objetivo)
Maximizar a acurácia e a velocidade de resposta do agente de IA através da segmentação cirúrgica de tarefas, evitando a degradação de desempenho provocada pela saturação da janela de contexto com logs transitórios ou refatorações antigas.

## 2. Context (Contexto)
* **Ambiente Operacional:** Atuação em projeto full-stack multivariado (Backend Java, Frontend Angular, Banco MongoDB e integrações Google Workspace).
* **Ciclos de Desenvolvimento:** Transições frequentes entre modelagem de domínio, definição de contratos (DTOs), implementação de telas e resolução de bloqueios técnicos de infraestrutura.

## 3. Constraints (Restrições)
* **Limite de Tentativas Consecutivas:** Caso uma abordagem técnica falhe por mais de 2 interações consecutivas gerando erros no terminal, interromper imediatamente as tentativas automáticas, diagnosticar a causa raiz no chat e submeter uma revisão de estratégia.
* **Isolamento de Erros:** Não carregar no contexto ativo o histórico exaustivo de erros de compilação ou depuração já superados.
* **Preservação de Conhecimento:** Em conversas continuadas iniciadas com `@Conversation`, manter como válidas as decisões arquiteturais e contratos firmados, sem exigir que o usuário repita especificações já existentes na documentação.

## 4. Deliverables (Entregáveis e Critérios de Sucesso)
* Notificação proativa ao usuário sugerindo a abertura de nova sessão nas seguintes transições:
  * Conclusão de contratos de DTOs e transição para codificação de backend ou frontend;
  * Resolução definitiva de erros graves de build, execução ou containers;
  * Finalização do ciclo de uma feature e início de nova entidade.
* Emissão compulsória da mensagem padronizada de fechamento:
  > "💡 **Sugestão de Contexto:** Concluímos com sucesso [esta etapa/esta correção]. Para manter o contexto leve e com alto desempenho, abra uma nova conversa no botão **\"+\"** e inicie referenciando esta conversa com `@Conversation`."
