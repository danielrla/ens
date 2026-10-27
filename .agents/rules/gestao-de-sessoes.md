---
trigger: always_on
---

---
name: gestao-de-sessoes-e-contexto
description: Diretrizes para otimização da janela de contexto através da abertura de novas sessões e segmentação de tarefas.
behavior: always-on
---

# Protocolo de Higiene de Contexto (Novas Sessões e Ciclo de Vida)

Para maximizar a eficiência da janela de contexto e evitar a poluição da memória de curto prazo do agente com logs transitórios ou refatorações antigas, o agente deve seguir as regras de ciclo de vida abaixo.

---

## 1. Gatilhos para Recomendação de Nova Sessão
O agente deve analisar o andamento da conversa e recomendar proativamente ao usuário a criação de uma nova sessão de chat nas seguintes transições de cenário:

- **Mudança de Trilha de Desenvolvimento:** Ao concluir a definição de contratos (DTOs/Interfaces) no chat principal e iniciar a implementação técnica (seja mudando para a Trilha Backend em Java ou Trilha Frontend em Angular 21).
- **Resolução de Bloqueios Críticos:** Assim que um bug complexo, erro de compilação do Spring Boot ou falha de container for totalmente resolvido e estabilizado. O histórico de tentativas e erros acumulados deve ser isolado.
- **Transição de Entidade ou Feature:** Ao finalizar o ciclo de um endpoint ou componente específico e mover o escopo para outra funcionalidade do sistema ENS.

### Mensagem Padrão de Recomendação:
Sempre que um gatilho for acionado, o agente deve encerrar sua resposta com a seguinte instrução:
> "💡 **Sugestão de Contexto:** Concluímos com sucesso [esta etapa/esta correção]. Para manter o contexto leve e com alto desempenho, abra uma nova conversa no botão **\"+\"** e inicie referenciando esta conversa com `@Conversation`."

---

## 2. Resolução de Erros Consecutivos
- Se uma abordagem de código proposta pelo agente falhar consecutivamente por mais de 2 interações, gerando logs extensos no terminal, o agente deve interromper as tentativas automáticas, reportar a causa raiz com transparência e propor uma revisão estruturada da estratégia antes de prosseguir.

---

## 3. Preservação de Conhecimento Transversal
- Ao operar em um chat continuado via menção `@Conversation`, o agente deve reter como verdades absolutas as decisões arquiteturais validadas no histórico anterior, cruzando-as continuamente com as regras ativas de negócio (`regras-de-negocio.md`) e de arquitetura (`docs/arquitetura.md`).
- O agente não deve exigir que o usuário repita especificações técnicas, URLs da API ou estruturas de contratos já estabelecidas na documentação do projeto.
