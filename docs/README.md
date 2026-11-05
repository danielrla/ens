# Sistema ENS: Gestão das Equipes de Nossa Senhora

Aplicação web e PWA para gestão da estrutura hierárquica, dos mandatos, da governança de acessos e da vida pastoral das Equipes de Nossa Senhora. A especificação funcional de origem encontra-se em [prompt.md](../prompt.md).

## Índice da Documentação

| [REGRAS_DOCUMENTACAO.md](REGRAS_DOCUMENTACAO.md) | Política mandatória de documentação contínua para toda evolução do projeto |
| [regras_negocio_notificacoes.md](regras_negocio_notificacoes.md) | Regras temporais de avisos de reuniões (Segunda, D-1, H-4), isolamento de equipe e Gmail |
| [arquitetura.md](arquitetura.md) | Stack, modelo de dados, matriz RBAC estatutária, integrações Google e decisões técnicas |
| [execucao.md](execucao.md) | Guia de execução local e containers, variáveis de ambiente, seeds e testes |
| [roadmap.md](roadmap.md) | Estado evolutivo de cada trilha de desenvolvimento e pendências |
| [openapi.yaml](openapi.yaml) | Contrato unificado da API REST, fonte única para DTOs e controladores |

## Estrutura do Repositório

```
backend/    API Spring Boot 4.1.1 (Java 25, MongoDB rs0, JJWT, Google Workspace APIs)
frontend/   Angular 21 (standalone components, signals, PWA offline, vanilla CSS)
docker/     Docker Compose com MongoDB 8.3.13 e backend na rede containers
docs/       Documentação técnica viva, roteiros e contrato OpenAPI
```

## Estado Atual da Aplicação

O sistema conta com as principais capacidades funcionais e de governança plenamente operacionais:
* **Estrutura Territorial e Equipes:** Navegação hierárquica em cascata (Super-Região, Província, Região e Setor), gestão de Equipes de Base, casais e conselheiros espirituais (SCE);
* **Vida da Equipe:** Gestão de reuniões mensais com suporte ao tipo formal, informal e outros (retiros/encontros livres), ata, controle de presenças e mural de bordo;
* **Integração com Google Workspace:** Sincronização automática em tempo real de reuniões na Google Agenda, com inclusão de todos os cônjuges da equipe e do SCE como convidados, sincronização de contatos com a Google People API e exportação de roteiros com o Google Drive;
* **Autenticação e Segurança:** Login institucional com JWT, recuperação de senha com envio por e-mail e redefinição segura;
* **Matriz de Perfis Estatutários (RBAC):** Diferenciação entre perfis individuais (`ADMINISTRADOR`, `SACERDOTE`) e vinculados ao casal (`MEMBRO_EQUIPE`, `CRE`, `RESPONSAVEL_SETOR`, `RESPONSAVEL_REGIAO`), com restrição de rotas e filtros dinâmicos no menu;
* **Gestão de Usuários na Administração:** Painel de controle para ativação/bloqueio, atribuição de perfis e reset administrativo de senhas temporárias;
* **Tecnologia PWA:** Suporte a instalação no dispositivo móvel como aplicativo, manifesto web completo e cache offline com o logo oficial das ENS;
* **Alertas e Notificações D-1:** Agendador automático configurado para o fuso de Cuiabá, disparando avisos na véspera das reuniões de equipe.

Consulte o documento [roadmap.md](roadmap.md) para detalhes de cada trilha.
