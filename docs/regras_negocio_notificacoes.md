# Regras de Negócio: Notificações de Agenda, Reuniões e Envio via Gmail

Este documento detalha o funcionamento formal das regras de aviso para compromissos e reuniões de equipes das Equipes de Nossa Senhora (ENS).

---

## 1. Princípio de Isolamento Rigoroso por Equipe (Multi-Tenant Pastoral)

> [!IMPORTANT]
> **REGRA DE ISOLAMENTO TOTAL**  
> Um usuário **NUNCA** deve receber avisos, notificações no app ou e-mails sobre compromissos de equipes das quais ele NÃO participa.
>
> Critério de Validação:
> `reuniao.equipeId === usuarioLogado.equipeId`
>
> Se o usuário não tiver uma equipe vinculada (ou pertencer a outra equipe), as reuniões de terceiros são filtradas antes de qualquer processamento temporal.

---

## 2. As Três Regras Temporais de Aviso

### Regra 1: Resumo Semanal (Toda Segunda-feira)
- **Quando dispara**: Toda segunda-feira (ou no primeiro acesso da semana).
- **Escopo**: Todos os compromissos e reuniões agendados para a semana corrente (de segunda a domingo) da equipe do usuário.
- **Canais**:
  - Alerta no aplicativo (Sino no cabeçalho + Banner na Dashboard).
  - Envio automático de e-mail com resumo semanal da equipe.
- **Conteúdo**: Data, horário, tema da reunião, casal anfitrião e casal animador.

### Regra 2: Aviso Prévio de Véspera (1 Dia Antes / D-1)
- **Quando dispara**: Exatamente no dia anterior à reunião (entre 24h e 48h de antecedência).
- **Objetivo**: Permitir que o casal prepare o estudo do tema, a oração conjugal e organize os deslocamentos.
- **Canais**:
  - Alerta com badge destacada "Amanhã" no aplicativo.
  - E-mail com o roteiro litúrgico e detalhes do anfitrião.

### Regra 3: Alerta Imediato no Dia (4 Horas Antes / H-4)
- **Quando dispara**: No próprio dia da reunião, com aproximadamente 4 horas de antecedência ao horário previsto (ex: às 15h30 para uma reunião às 19h30).
- **Objetivo**: Lembrar o casal do compromisso do dia, endereço da residência do casal anfitrião e pontualidade.
- **Canais**:
  - Alerta de alta prioridade no app com endereço e orientações de trânsito/pontualidade.
  - E-mail urgente de lembrete com telefone/endereço do anfitrião.

---

## 3. Integração com o Gmail para Disparo de E-mails

O sistema conta com motor de e-mail com credenciais cadastradas na área administrativa (`/admin/integracao`):

1. **Método SMTP do Gmail**:
   - Host: `smtp.gmail.com`
   - Portas: 587 (STARTTLS) ou 465 (SSL)
   - Remetente oficial (ex: `notificacoes.ens@gmail.com`)
   - Senha de Aplicativo de 16 caracteres com segurança no banco/armazenamento mascarada (`••••••••••••••••`).
2. **Método OAuth2 Google Workspace**:
   - Client ID e Client Secret oficiais.
   - Escopo `https://www.googleapis.com/auth/gmail.send`.
3. **Área Administrativa e Teste**:
   - Interface segura para o administrador inserir, atualizar e salvar as credenciais.
   - Teste em tempo real com envio de e-mail de verificação para o endereço informado.
