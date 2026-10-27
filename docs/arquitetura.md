# Arquitetura

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Spring Boot (webmvc, data-mongodb, validation, actuator) | 4.1.1 |
| Linguagem | Java | 25 |
| Banco | MongoDB em replica set `rs0` | 8.3.13 |
| Frontend | Angular (standalone, signals, rotas lazy) servido por Nginx Alpine | 21 |
| Infra | Docker Compose, rede `containers`, timezone `America/Cuiaba` | |

O replica set é obrigatório mesmo em desenvolvimento, porque a transição de mandato exige transação multi-documento.

## Decisões técnicas

| Tema | Decisão | Razão |
|---|---|---|
| Hierarquia | Coleção `estrutura` única para Super-Região, Província, Região e Setor, com `nivel` e `paiId` e índice composto | Cascata vira consulta indexada simples |
| Equipe | Coleção `equipes` própria, com os 4 IDs de ancestrais desnormalizados | Filtrar por qualquer nó sem `$lookup` |
| Mandatos | Coleção `mandatos` imutável: encerra, nunca apaga | Histórico e auditoria |
| Casais | Coleção `casais` com `esposo` e `esposa` embutidos | Sempre lidos juntos |
| Vínculos | Coleção `vinculos_equipe` (casal, equipe, papel, período) | Transferências com histórico |
| Vida da Equipe | `avisos`, `reunioes`, `mural_momentos`, todas com `equipe_id` | Isolamento estrito por equipe (LGPD e privacidade de registros fraternos) |
| Dashboard Equipe | `/vida-equipe/dashboard` e `/reunioes/minha-equipe` travados na equipe do usuário | Membros de uma equipe não visualizam nem operam reuniões de outras equipes |
| Dashboard Geral | `/dashboard` com cascata territorial (UF, Município, Equipe) | Visão executiva para lideranças e setores avaliarem qualquer equipe selecionada |
| Resolução de CRE | Sincronização atômica em `mandatos` e fallback em `EquipeService` | Garante que o casal com mandato CRE ativo seja exibido como titular mesmo com vínculos pendentes |
| Mural de Bordo | Endpoint `/api/mural/meu-mural` vinculado estritamente à equipe do casal ativo | Impede visualização e manipulação de murais entre equipes distintas |
| Auditoria | Coleção `auditoria` append-only | Mandatos, transferências e movimentações |
| Autenticação | Login próprio com JWT (access e refresh) | Decisão do projeto |
| WhatsApp | Link `wa.me` com mensagem pronta | Sem custo nem aprovação |
| Geocodificação | Nominatim (OpenStreetMap) | Gratuito |
| Fotos | GridFS ou storage de objetos, com compressão no upload | Evita documentos grandes |

Limitação conhecida: o MongoDB não impõe integridade referencial. Ela deve ser garantida nos serviços.

- `estrutura`: `id`, `nome`, `nivel` (`SUPER_REGIAO`, `PROVINCIA`, `REGIAO`, `SETOR`), `paiId`. Índice composto `hierarquia_idx`.
- `equipes`: `id`, `numero` (sequencial automático gerado pelo sistema caso omitido), `nomeDevocao`, `superRegiaoId`, `provinciaId`, `regiaoId`, `setorId`, `status` (`ATIVA`, `EM_PILOTAGEM`, `EM_REESTRUTURACAO`, `INATIVA`), `emPilotagem`, `dataFundacao`, `dataInicioPilotagem`, `dataTerminoPilotagem`, `sceId`, `temaEstudoAno`, `vinculos` (lista de `casalId`, `papel`, `desde`).
- `casais`: `id`, `esposo` (`nomeCompleto`, `cpf`, `email`, `celular`, `dataNascimento`, `dataFalecimento`, `profissao`, `falecido`), `esposa` (`nomeCompleto`, `cpf`, `email`, `celular`, `dataNascimento`, `dataFalecimento`, `profissao`, `falecido`), `dataMatrimonio`, `paroquiaCasamento`, `recebeCartaMensal`, `endereco`, `status` (`ATIVO`, `EM_PILOTAGEM`, `LICENCIADO`, `EMERITO`, `VIUVO`, `INATIVO`), `equipeId`, `fotoUrl`, `motivoInativacao`, `filhos`. Transição automática para `VIUVO` quando registrada data de falecimento de um cônjuge.
- `sacerdotes`: `id`, `nomeCompleto`, `titulo` (`PADRE`, `DIACONO`, `BISPO`, `RELIGIOSO`, `RELIGIOSA`), `dioceseCongregacao`, `paroquia`, `telefones`, `email`, `dataNascimento`, `dataOrdenacaoConsagracao`, `status` (`ATIVO`, `INATIVO`).
- `reunioes`: `id`, `equipeId`, `data`, `horario`, `tipo` (`FORMAL`, `INFORMAL`), `casalAnimadorId`, `tema`, `casalAnfitriaoId`, `scePresente` (booleano indicando presença do Sacerdote/SCE), `presencas` (lista com `casalId`, `status`: `PRESENTE`, `FALTOU`, `JUSTIFICOU`, `observacao`), `anotacoesCre`. Lançamento oficial de reuniões mensais pelo Casal Responsável de Equipe (CRE), com emissão de roteiro para reuniões formais e KPIs de assiduidade.
- `movimentacoes_casal`: `id`, `casalId`, `tipo` (`TRANSFERENCIA`, `SAIDA`, `LICENCA`, `RETORNO`), `equipeOrigemId`, `equipeDestinoId`, `data`, `motivo` (obrigatório), `observacoes`. Registro histórico auditável de saídas e remanejamentos de equipe.
- `mandatos`: `id`, `casalId`, `sceId`, `funcao` (`CRE`, `CL`, `CRS`, `CRR`, `CRP`, `CRSR`, `ERI`), `nivelInstancia` (`EQUIPE`, `SETOR`, `REGIAO`, `PROVINCIA`, `SUPER_REGIAO`, `INTERNACIONAL`), `instanciaId`, `dataInicio`, `dataPrevistaTermino`, `dataEncerramentoEfetivo`, `status` (`VIGENTE`, `CONCLUIDO`, `INTERROMPIDO_ANTECIPADAMENTE`), `observacoes`. Suporte a acúmulo de funções pelo casal em instâncias sem perda da equipe base.

## Regras de negócio dos mandatos

Prazos estatutários (anos): CRE 1, CL 1 a 3 (padrão 3), CRS 3, CRR 4, CRP 5, CRSR 5, ERI 6.

Alertas de sucessão dinâmicos:
- `DOURADO`: de 90 a 60 dias antes do término previsto (fase de discernimento).
- `LARANJA`: a menos de 30 dias do término.
- `VERMELHO`: quando o prazo estatutário expirou sem registro de sucessor ativo.
- `NENHUM`: regular ou mandato encerrado.

Ao registrar um novo mandato para uma mesma instância e função, o mandato anterior ativo passa automaticamente a `CONCLUIDO` com a data de encerramento efetivo igual à data de início do novo mandato na mesma transação atômica. Suporte a interrupção antecipada com registro de justificativa formal.

## RBAC e escopo territorial

O escopo é resolvido no backend e injetado nas consultas, nunca decidido pelo frontend.

| Perfil | Escopo |
|---|---|
| MEMBRO | Própria equipe; edita só o próprio casal |
| CRE | Gestão da própria equipe; avisos do Setor em leitura |
| CL | Equipes sob seu acompanhamento, em leitura |
| CRS | Setor fixo; CRUD de mandatos locais |
| CRR, CRP, CRSR | Filtros em cascata até Região, Província ou Super-Região |
| ADMIN | Irrestrito, com logs de auditoria |

Notas do diário marcadas como `INTERNA_CRE` só são devolvidas ao CRE.

Estado: perfis e escopo estão no contrato (`/auth/me`), mas a autenticação ainda não foi implementada. O endpoint `/estrutura` hoje não aplica escopo.

## LGPD e segurança

- CPF, endereço e contatos cifrados em campo (AES-GCM), com hash separado do CPF para busca.
- Dados isolados por equipe e setor.
- Auditoria de mandatos, transferências e movimentações de equipes.

## Frontend

- **Design System:** em `frontend/src/styles.css` (tokens de cores institucionais, tipografia Inter e Lora, superfícies, botões e badges).
- **App Shell Responsivo:** estruturado em `app.ts` e submódulos em `src/app/layout/`:
  - `Header` (altura fixa de 64px, botão de toggle da sidebar, breadcrumbs dinâmicos, seletor de ano pastoral, central de notificações/alertas de mandatos e menu suspenso de perfil/casal).
  - `Sidebar` (superfície Navy `#0F172A`, largura de 280px expandida e 72px recolhida com transição suave em desktop, drawer móvel com overlay semitransparente em telas menores que 1024px e fechamento via tecla `Esc`).
  - `SidebarItem` (componente recursivo multi-nível com indentação proporcional, rotação animada de chevron, atributos ARIA e persistência do estado no `localStorage`).
  - `Footer` (altura entre 48px e 56px, discreto, com identificação da Super-Região Brasil, versão do sistema, links para LGPD/Termos e indicador de status).
  - `Main Content Area` (ocupando o espaço restante com rolagem vertical independente suave e proteção contra overflow horizontal).
- **Filtro em cascata:** em `features/equipes/filtro-estrutura.ts`: o estado de cada nível vive nos `queryParams` da URL, o que permite compartilhar links filtrados. Trocar um nível limpa os descendentes. Se existir só uma Super-Região, ela é selecionada por padrão.
- Em desenvolvimento, `proxy.conf.json` encaminha `/api` para `http://localhost:8080`.
