# Especificação de Interface e Layout: Shell de Aplicação Responsivo e Recursivo para ENS

## Objetivo
Implementar o layout base (App Shell) do sistema de gestão das Equipes de Nossa Senhora (ENS). O layout deve ser elegante, fluído e adaptável, com paleta clara inspirada no portal institucional `ens.org.br`. A arquitetura de interface deve contar com:
1. **Header (Topo)** fixo/estático com ações rápidas, perfil e breadcrumbs.
2. **Sidebar (Menu Lateral Retrátil)** com suporte a navegação hierárquica/recursiva em múltiplos níveis e botão de toggle (expandir/recolher).
3. **Área Principal de Conteúdo (Main Content Area)** dinâmica, com container adaptativo para apresentação de dados (tabelas, grids, formulários, murais).
4. **Footer (Rodapé)** sóbrio e discreto fixado na base do fluxo visual.

---

## 1. Identidade Visual e Variáveis de Estilo

- **Cores Principais:**
  - Azul Institucional Primário: `#1E3A8A` (Header, destaques, nós ativos no menu)
  - Azul Acento / Interação: `#2563EB` (Hover, botões primários)
  - Dourado Mariano: `#D97706` / `#F59E0B` (Alertas de mandatos, detalhes decorativos, tags)
  - Fundo Geral da Página: `#F8FAFC` (Slate 50 - visual suave, sem branco ofuscante)
  - Superfícies (Cards, Sidebar aberta, Header): `#FFFFFF`
  - Superfície da Sidebar (Versão elegante): `#0F172A` (Navy escuro) OU `#FFFFFF` com borda lateral `#E2E8F0`
  - Texto Principal: `#0F172A` / `#1E293B`
  - Texto Secundário / Mudo: `#64748B`
  - Bordas e Divisores: `#E2E8F0`

---

## 2. Componentização do Layout (App Shell)

### A. Topbar / Header (Topo)
- **Altura:** 64px fixa.
- **Lado Esquerdo:**
  - Botão de Toggle da Sidebar (ícone Hamburger / Painel Lateral com tooltip acessível).
  - Breadcrumb dinâmico refletindo o caminho percorrido (ex.: *Super-Região Brasil > Província Sul 1 > Região PR > Setor Curitiba Norte > Equipe 04*).
- **Lado Direito:**
  - Seletor rápido de ano pastoral / ciclo vigente.
  - Central de Notificações (alertas de mandatos a vencer em 60/30 dias).
  - Avatar do Casal / Usuário com menu dropdown (Perfil, Configurações, Troca de Papel ativo, Logout).

### B. Sidebar Lateral Retrátil (Menu Recursivo / Árvore de Navegação)
- **Comportamento de Retração:**
  - **Desktop (telas >= 1024px):**
    - Estado expandido: largura de 280px, exibindo ícones, rótulos de texto, badges e setas indicativas de expansão.
    - Estado recolhido (mini-sidebar): largura de 72px, exibindo apenas ícones com flyout/tooltip suspenso ao passar o mouse.
    - Animação suave via CSS Transition (`width 200ms cubic-bezier(0.4, 0, 0.2, 1)`).
  - **Mobile/Tablet (telas < 1024px):**
    - Gaveta oculta (`transform: translateX(-100%)`).
    - Ao abrir, exibe overlay semitransparente escuro no fundo (`backdrop-blur-sm bg-black/40`) e desliza para a tela (largura de 85vw ou máx 320px).
- **Recursividade da Navegação (Tree Menu Multi-nível):**
  - O componente de menu deve aceitar um esquema recursivo tipado no formato:
    ```typescript
    interface NavItem {
      id: string;
      label: string;
      icon?: string;
      route?: string;
      badge?: string | number;
      badgeColor?: string;
      children?: NavItem[]; // Chamada recursiva para submenus
    }
    ```
  - **Níveis Recursivos Exemplo:**
    - Dashboard Geral
    - Estrutura Organizacional
      - Super-Região
        - Províncias
          - Regiões
            - Setores
              - Equipes
    - Vida da Equipe (Mural, Agenda, Atas, PCEs)
    - Gestão de Mandatos e Prazos
    - Cadastro de Membros e SCEs
  - Indentação visual proporcional ao nível de profundidade (`padding-left: calc(1rem * level)`).
  - Ícone de chevron animado (`rotate-90`) para itens que possuem filhos.
  - Persistência no `localStorage` do estado aberto/fechado de cada pasta da árvore e do estado colapsado da sidebar.

### C. Área Principal de Dados (Main Content Area)
- **Container Responsivo:**
  - `flex-1`, ocupando todo o espaço restante entre a sidebar e o rodapé.
  - `overflow-y: auto` independente com scroll suave.
  - Padding adaptativo: `p-4` em dispositivos móveis, `p-6` ou `p-8` em desktops.
- **Layout dos Dados Apresentados:**
  - Seção superior fixa para a **Barra de Filtros em Cascata** (Super-Região > Província > Região > Setor > Status).
  - Cabeçalho de página contextualizado com Título, Descrição da visualização e botões de ação primária (Ex.: *+ Novo Casal*, *+ Registrar Mandato*, *+ Nova Reunião*).
  - Grid flexível (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) para murais de fotos, cards de equipes ou painéis de alertas.
  - Tabela com paginação e rolagem horizontal suave para listagens densas de membros e mandatos.

### D. Rodapé (Footer)
- **Altura:** 48px a 56px.
- **Estilo:** Discreto, fixo na parte inferior do fluxo de página, com linha superior fina `#E2E8F0`.
- **Conteúdo:**
  - Lado esquerdo: Nome institucional: *Equipes de Nossa Senhora — Super-Região Brasil* e identificação da versão do sistema.
  - Lado direito: Links para termos de uso, política de privacidade (LGPD) e status da conexão/versão.

---

## 3. Diretrizes Técnicas de Implementação

- **Acessibilidade (a11y):**
  - Suporte completo à navegação por teclado (`Tab`, `Enter`, `Espaço`, `Esc` para fechar a sidebar móvel).
  - Atributos `aria-expanded`, `aria-haspopup` e `aria-controls` nos nós expansíveis do menu recursivo.
- **Transições e Performance:**
  - Animações fluidas em GPU (utilizar `transform` e `opacity`).
  - Renderização otimizada dos nós recursivos para evitar renderizações desnecessárias em listas grandes de setores e equipes.
- **Responsividade Sem Quebra:**
  - Nenhum elemento de conteúdo dentro da área de dados deve transbordar a viewport horizontalmente (`overflow-x-hidden` no invólucro externo).