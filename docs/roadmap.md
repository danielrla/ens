# Roadmap do Projeto ENS

## Estado Atual por Trilha de Desenvolvimento

| Trilha | Entregável / Capacidade | Estado |
|---|---|---|
| Contratos | Especificação OpenAPI 3.0 completa (`openapi.yaml`) com schemas e DTOs | Concluído e sincronizado |
| Infraestrutura | Docker Compose com MongoDB 8.3.13 (replica set `rs0`) e backend na rede `containers` | Concluído e validado |
| Backend | Esqueleto Spring Boot 4.1.1 e Java 25 com arquitetura em camadas | Concluído e validado |
| Backend | Hierarquia territorial (`estrutura`) com endpoint de busca em cascata | Concluído e validado |
| Backend | CRUD e ciclo de vida de Equipes de Base com filtros ancestrais | Concluído e validado |
| Backend | CRUD de Casais com histórico de movimentações e transição de viuvez | Concluído e validado |
| Backend | Gestão de Sacerdotes e Conselheiros Espirituais (SCE) e vínculos | Concluído e validado |
| Backend | Registro e controle de mandatos com alertas de sucessão estatutários | Concluído e validado |
| Backend | Gestão de Reuniões com tipo `OUTROS`, ata, pauta, assiduidade e mural | Concluído e validado |
| Backend | Integração com Google Workspace (Google Calendar, People API e Google Drive) | Concluído e validado |
| Backend | Sincronização automática de reuniões na Google Agenda com convidados e SCE | Concluído e validado |
| Backend | Autenticação JWT (JJWT 0.12.6), BCrypt, recuperação de senha e seed administrativo | Concluído e validado |
| Backend | Matriz RBAC estatutária (individual vs casal) e governança em `UsuarioAdminService` | Concluído e validado |
| Backend | Agendador de alertas D-1 (`ReuniaoAlertaScheduler`) com cron diário às 08:00 de Cuiabá | Concluído e validado |
| Backend | Suíte de testes unitários automatizados com 100% de aprovação (`mvn test`) | Concluído e validado |
| Frontend | Aplicação Angular 21 com standalone components, signals e design system | Concluído e validado |
| Frontend | Layout responsivo com Sidebar expansível, Header e Footer institucionais | Concluído e validado |
| Frontend | Telas de consulta e gestão de Estrutura Territorial, Equipes, Casais, SCE e Mandatos | Concluído e validado |
| Frontend | Dashboard Geral (visão de liderança) e Dashboard Equipe (visão interna de base) | Concluído e validado |
| Frontend | Agenda de Reuniões com modal para reuniões formais, informais e outros | Concluído e validado |
| Frontend | Painel administrativo de Integração com Google OAuth (`/admin/integracao`) | Concluído e validado |
| Frontend | Telas de autenticação: Login, Esqueci Senha e Redefinir Senha | Concluído e validado |
| Frontend | Painel administrativo de Gestão de Usuários e Acessos (`/admin/usuarios`) | Concluído e validado |
| Frontend | Filtragem dinâmica de rotas e itens de menu de acordo com o perfil logado | Concluído e validado |
| Frontend | Interceptor HTTP Bearer e Auth Guard de segurança | Concluído e validado |
| Frontend | Progressive Web App (PWA) com manifesto, ícones oficiais e service worker offline | Concluído e validado |
| Frontend | Compilação de produção com Angular CLI (`npm run build`) | Concluído e validado |

## Pendências e Oportunidades de Evolução

* Carga de dados reais de Províncias, Regiões e Setores no banco de dados definitivo;
* Implementação de Web Push Notifications nativas complementando os e-mails nos navegadores suportados;
* Criação de suíte de testes de ponta a ponta (E2E) para as interfaces do frontend;
* Integração direta com gateway de WhatsApp via API oficial caso surja demanda pastoral de mensageria instantânea.

## Marcos Históricos Alcançados

1. **Marco 1:** Infraestrutura em containers, replica set MongoDB e contratos OpenAPI fundamentais;
2. **Marco 2:** Hierarquia territorial e filtro dinâmico em cascata;
3. **Marco 3:** Gestão de Casais, Sacerdotes (SCE), Equipes de Base e Mandatos com alertas;
4. **Marco 4:** Vida da Equipe, Dashboard de Equipe, Reuniões e Mural de Bordo;
5. **Marco 5:** Integração plena com Google Workspace (Google Calendar, People e Drive);
6. **Marco 6:** Reuniões livres do tipo "Outros" com sincronização automática em tempo real;
7. **Marco 7:** PWA com instalação móvel, segurança JWT, RBAC estatutário, gestão de usuários e notificações D-1.
