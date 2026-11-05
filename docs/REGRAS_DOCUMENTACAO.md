# Regras Permanentes de Documentação do Projeto ENS

> **POLÍTICA OBRIGATÓRIA DE DESENVOLVIMENTO CONTÍNUO**  
> Toda e qualquer modificação arquitetural, nova funcionalidade, alteração de regras de negócio, inclusão de endpoints ou ajuste estrutural de layout DEVE ser imediatamente refletida nos arquivos da pasta `docs/`.

---

## 1. Princípios da Governança de Documentação

1. **Documentação Viva e Sincronizada**:
   - O código-fonte e a documentação em `docs/` devem avançar no mesmo commit ou ciclo de entrega.
   - Nenhuma regra de negócio deve existir apenas no código TypeScript sem sua especificação formal em `docs/`.

2. **Divisão de Responsabilidades dos Arquivos**:
   - `docs/REGRAS_DOCUMENTACAO.md`: Este guia, contendo a política e convenções da documentação.
   - `docs/arquitetura.md`: Visão técnica, componentes, fluxos de autenticação, serviços e integrações (Google Workspace, Gmail, WebAuthn).
   - `docs/regras_negocio_notificacoes.md`: Especificação detalhada dos alertas de agenda/reunião, filtros de equipe, regras de véspera (D-1), 4 horas antes (H-4) e envio por e-mail.
   - `docs/execucao.md`: Guia de inicialização, comandos e procedimentos operacionais.
   - `docs/roadmap.md`: Histórico de marcos cumpridos e próximos passos do produto.
   - `docs/README.md`: Índice geral da pasta de documentação.

---

## 2. Checklist Obrigatório para Cada Mudança

Antes de finalizar qualquer tarefa, verifique:

- [ ] **Novas Rotas ou Telas**: Adicionadas a `docs/arquitetura.md` na seção de Rotas e Navegação.
- [ ] **Novos Serviços e Endpoints**: Documentados em `docs/arquitetura.md` e `docs/openapi.yaml` (quando aplicável).
- [ ] **Regras de Negócio e Notificações**: Descritas com clareza em `docs/regras_negocio_notificacoes.md` ou arquivo específico de negócio.
- [ ] **Segurança e Credenciais**: Detalhado o método de proteção, criptografia e mascaramento adotado.
- [ ] **Componentes de Interface (UI)**: Validação da precedência prioritária do Material Design 3 (m3.material.io) e uso justificado de Angular Material (material.angular.dev) apenas para fallbacks técnicos.
- [ ] **Layout e Acessibilidade**: Registradas as decisões ergonômicas (ex: escala tipográfica para idosos e alvos mínimos de toque no mobile).

---

## 3. Padrão de Redação

- Utilize Markdown limpo com títulos hierárquicos (`#`, `##`, `###`).
- Inclua diagramas ASCII ou caixas conceituais para fluxos complexos.
- Destaque alertas críticos utilizando a sintaxe de callouts do GitHub (`> [!IMPORTANT]`, `> [!NOTE]`).
