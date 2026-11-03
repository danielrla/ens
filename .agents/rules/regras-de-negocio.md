

# Diretrizes de Contexto de Documentação
O agente deve indexar e manter em cache o conhecimento estruturado dos documentos do projeto ENS.

- Especificação funcional (fonte de regras de negócio): @/prompt.md
- Documentação técnica: @/docs/ (`README.md`, `arquitetura.md`, `execucao.md`, `roadmap.md`)
- Contrato da API (fonte única de DTOs e endpoints): @/docs/openapi.yaml

Instruções para o Agente:
1. Sempre valide as alterações de código e lógica contra a especificação e o contrato acima.
2. Ao mudar comportamento, endpoint, modelo de dados ou decisão técnica, atualize na mesma entrega o documento correspondente em `docs/` e o estado em `docs/roadmap.md`.
3. Não releia os arquivos novamente por comando de chat, a menos que os metadados do workspace indiquem que algum arquivo específico sofreu modificações recentes (hot-reload).

