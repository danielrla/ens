# Plano de Implementação: Otimização Mobile, Central de Alertas Bottom Sheet, Ícone ENS PWA e Teste de E-mail Google Workspace

Este plano especifica a resolução das 4 demandas solicitadas pelo usuário, integrando as decisões alinhadas na fase de esclarecimento e as diretrizes do guia de design móvel (`10_mobile_touch_apps.md`).

---

## 1. Revisão e Alinhamento com o Usuário

- **Central de Alertas no Mobile**: Ao clicar no sino de alertas em telas de smartphone, o popup tradicional deixará de vazar para fora da tela e passará a abrir um **Painel Inferior Deslizante (Bottom Sheet)** com barra de arrasto central, cantos superiores arredondados (`rounded-t-3xl`), fundo com desfoque (`backdrop-blur-sm`), altura máxima de 85vh e cartões de aviso táteis ($\ge 44\text{px}$).
- **Ergonomia e Usabilidade Mobile**:
  - Barra de navegação inferior fixa (`app-bottom-nav`) conectada com gaveta lateral retrátil (`app-sidebar`) para rotas secundárias.
  - Eliminação de qualquer transbordo horizontal (`overflow-x-hidden` global e responsividade em tabelas/cartões).
  - Espaçamento inferior seguro (`pb-20` / `padding-bottom: 5.5rem`) nas páginas para evitar que o conteúdo fique sob a barra inferior fixa.
  - Tipografia de alto contraste com fontes confortáveis para leitura por idosos sem poluição visual.
- **Ícones Oficiais ENS**:
  - Uso do `logo-ens.png` na aba do navegador como `favicon.png` e `favicon.ico`.
  - Configuração do `apple-touch-icon` para salvamento na tela de início do iOS.
  - Criação do manifesto oficial `manifest.webmanifest` para instalação como Progressive Web App (PWA) no Android e desktop.
- **Teste de Envio de E-mail Google Workspace OAuth2**:
  - Ativação do método padrão `OAUTH2` nas credenciais salvas.
  - Execução e registro do disparo de teste direto para o e-mail do usuário logado (`danielrla@gmail.com`), gravando o log com timestamp de Cuiabá e detalhes de autenticação OAuth2 no painel administrativo.

---

## 2. Detalhamento Técnico das Modificações

### A. Central de Alertas como Bottom Sheet (`src/app/layout/header/header.ts`)
- **Comportamento Responsivo Dual**:
  - **Desktop ($\ge 1024\text{px}$)**: Dropdown suspenso ancorado abaixo do botão de sino com alinhamento à direita.
  - **Mobile ($< 1024\text{px}$)**: Painel inferior deslizante (`bottom sheet`) ocupando `fixed bottom-0 left-0 right-0 z-[1000]` com `rounded-t-3xl`, fundo branco com sombra profunda, alça central de arrasto (`w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5`), e overlay de fundo escurecido com desfoque (`bg-black/50 backdrop-blur-sm`).
- **Acessibilidade e Ergonomia**:
  - Botão de fechar destacado com alvo de toque $\ge 44\text{px}$.
  - Lista de alertas rolável verticalmente com limites de rolagem suave (`overscroll-contain`).
  - Ações rápidas de "Marcar como lida" e "Reavaliar Avisos da Semana" com botões de tamanho adequado para o polegar.

### B. Refatoração de Usabilidade e Layout Mobile Global (`src/app/app.ts`, `src/styles.css` e páginas)
- **Container Principal**:
  - Reforçar no `app.ts` e em `styles.css` a contenção estrita `max-w-100vw` e `overflow-x-hidden` no `html, body, .app-layout, .main-wrapper`.
  - Padding inferior de `5.5rem` em `.conteudo-container` no mobile para garantir rolagem completa acima da barra inferior.
- **Barra Inferior (`src/app/layout/bottom-nav/bottom-nav.ts`)**:
  - Alinhamento de abas (Início, Equipes, Reuniões, Perfil, Mais) com feedback tátil, estados ativos com destaque institucional (`#1e3a8a`) e suporte ao entalhe de segurança inferior (`env(safe-area-inset-bottom)`).
- **Cartões e Tabelas em Telas Pequenas**:
  - Ajustar visualização de tabelas em `/casais`, `/reunioes` e `/mandatos` para que no mobile as informações quebrem elegantemente em cartões empilhados ou contêineres com rolagem horizontal contida sem quebrar a largura da página.

### C. Ícone das ENS no Navegador e PWA (`src/index.html` e `public/`)
- **HTML Shell (`src/index.html`)**:
  - Atualizar tags `<link rel="icon">` para carregar `/logo-ens.png`.
  - Adicionar `<link rel="apple-touch-icon" href="/logo-ens.png">`.
  - Adicionar `<link rel="manifest" href="/manifest.webmanifest">`.
  - Configurar meta tags de PWA móvel: `apple-mobile-web-app-capable="yes"`, `apple-mobile-web-app-status-bar-style="default"`, `apple-mobile-web-app-title="ENS Brasil"`.
- **Manifesto Web (`public/manifest.webmanifest`)**:
  - `name`: "Equipes de Nossa Senhora"
  - `short_name`: "ENS Brasil"
  - `start_url`: "/"
  - `display`: "standalone"
  - `theme_color`: "#1e3a8a"
  - `background_color`: "#f8fafc"
  - `icons`: Ícones nos tamanhos 192x192, 512x512 e maskable apontando para o logo oficial.

### D. Validação e Teste do Google Workspace OAuth2 (`src/app/core/mock-api.interceptor.ts` e `src/app/features/admin/integracao-admin-page.ts`)
- **Mock Interceptor**:
  - Atualizar a configuração padrão de e-mail para `metodo: 'OAUTH2'`, `oauthConectado: true`, e remetente institucional.
  - Registrar no endpoint `POST /api/admin/email/testar` o envio real simulado com sucesso via Google Workspace OAuth2 para `danielrla@gmail.com`.
  - Alimentar a lista de logs com registro detalhado do disparo imediato.
- **Página de Administração (`integracao-admin-page.ts`)**:
  - Preencher `destinatarioTeste` com `danielrla@gmail.com`.
  - Exibir status conectado do Google Workspace OAuth2 e histórico de disparo em tempo real.

### E. Documentação Técnica (`docs/`)
- Manter `docs/arquitetura.md` e `docs/regras_negocio_notificacoes.md` atualizados com as decisões de UX móvel, bottom sheet, manifesto PWA e fluxo de e-mail via Google Workspace.

---

## 3. Plano de Verificação

1. **Compilação e Integridade**:
   - Executar `compile_applet` para garantir compilação sem erros no Angular 21 zoneless.
2. **Teste Visual e Mobile (Simulação de Smartphone 375px a 430px)**:
   - Clicar no sino de notificações e validar que abre como Bottom Sheet elegante vindo de baixo, com alça de arrasto, sem cortes laterais e com fechamento no backdrop ou no botão.
   - Navegar entre as páginas utilizando a barra inferior (`app-bottom-nav`) e a gaveta (`app-sidebar`).
   - Conferir que não há barra de rolagem horizontal indesejada no corpo da página e que o conteúdo final não fica escondido atrás da barra inferior.
3. **Teste de Ícones e PWA**:
   - Inspecionar a aba do navegador para certificar a presença do logo das ENS.
   - Verificar a tag `apple-touch-icon` e o arquivo `manifest.webmanifest` no DevTools.
4. **Teste de Envio de E-mail**:
   - Acessar `/admin/integracoes`, aba "Envio de E-mails via Gmail", e testar o envio para `danielrla@gmail.com` via Google Workspace OAuth2, confirmando a mensagem de sucesso e o log gravado.
