---
name: regras-componentes-ui-m3
description: Diretrizes obrigatórias de interface com prioridade para Material Design 3 (m3.material.io) e fallback para Angular Material (material.angular.dev).
behavior: always-on
---

# Governança de Interface: Material Design 3 (M3) e Angular Material

Este documento estabelece o padrão arquitetural e ergonômico para todos os componentes de interface do sistema ENS.

---

## 1. Hierarquia Mandatória de Componentes

### Prioridade 1 (Primária): Material Design 3 Oficial (https://m3.material.io/)
Todos os elementos e padrões visuais devem adotar primordialmente as especificações, design tokens e componentes do Material Design 3 (Material Web / `@material/web` e tokens CSS M3):

* **Botões e Ações:** `md-filled-button`, `md-outlined-button`, `md-text-button`, `md-elevated-button`, `md-tonal-button`, `md-icon-button`;
* **Controles de Entrada e Formulários:** `md-outlined-text-field`, `md-filled-text-field`, `md-outlined-select`, `md-checkbox`, `md-radio`, `md-switch`, `md-slider`;
* **Diálogos e Modais:** `md-dialog` para confirmações e fluxos sobrepostos;
* **Navegação e Estrutura:** `md-tabs`, `md-primary-tab`, `md-secondary-tab`, `md-navigation-bar`, `md-navigation-drawer`;
* **Chips e Filtros:** `md-filter-chip`, `md-input-chip`, `md-assist-chip`, `md-suggestion-chip`;
* **Menus e Listas:** `md-menu`, `md-menu-item`, `md-list`, `md-list-item`, `md-divider`;
* **Feedback e Progresso:** `md-circular-progress`, `md-linear-progress`;
* **Tokens de Cores e Superfícies:** Papéis M3 institucionais (`primary`, `on-primary`, `primary-container`, `surface`, `surface-container`, `outline`, `error`).

### Prioridade 2 (Fallback Técnico): Angular Material (https://material.angular.dev/components)
O uso dos componentes da biblioteca Angular Material é restrito e autorizado exclusivamente nas seguintes situações:

1. **Inexistência ou Imaturidade no Catálogo M3 Web:** Componentes que não possuem equivalente direto no `@material/web` ou cuja implementação web pura não disponha de comportamento acessível completo;
2. **Integração Profunda com Angular CDK e Formulários Reativos:**
   - Tabelas de dados com paginação e ordenação atômica (`MatTable`, `MatPaginator`, `MatSort`);
   - Seleção de datas com suporte regional e calendários interativos (`MatDatepicker`);
   - Autocomplete complexo conectado a `ReactiveFormsModule` e `ControlValueAccessor` (`MatAutocomplete`);
   - Estruturas em árvore hierárquica recursiva (`MatTree`);
   - Alertas flutuantes transitórios (`MatSnackBar`);
   - Painéis inferiores deslizantes com ciclo de vida gerenciado (`MatBottomSheet`);
   - Tooltips acessíveis ancorados via CDK Overlay (`MatTooltip`).

> **Regra Obrigatória de Fallback:** Sempre que um componente do Angular Material for adotado, sua folha de estilos deve utilizar o sistema de temas baseado em M3 (`@use '@angular/material' as mat; @include mat.theme(...)`), mantendo total coesão visual e cromática com os componentes M3 primários.

---

## 2. Padrão de Integração Técnica no Angular 21

- **Schema para Web Components:** Componentes standalone que renderizarem tags nativas do Material Web devem declarar `CUSTOM_ELEMENTS_SCHEMA` na propriedade `schemas` do `@Component`;
- **Importação Otimizada:** As importações de elementos M3 devem ocorrer sob demanda via tree-shaking no topo do arquivo (ex.: `import '@material/web/button/filled-button.js'`);
- **Acessibilidade e Ergonomia:** Todos os botões e alvos de toque interativos no mobile devem atender à dimensão mínima de 44px por 44px;
- **Paleta Institucional:** As variáveis e papéis M3 devem respeitar o Azul Institucional ENS (`#1e3a8a`), Dourado Mariano (`#d97706` e `#f59e0b`) e superfícies suaves (`#f8fafc`).

