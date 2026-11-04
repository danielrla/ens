# Execução do Ambiente

## Pré-requisitos

* Docker com a rede `containers` criada: `docker network create containers`;
* Node 22 e npm para o ambiente de frontend;
* JDK 25 e Maven instalados caso opte por executar o backend fora de containers;
* Fuso horário operacional padronizado: `America/Cuiaba`.

## Variáveis de Ambiente e Configuração

O arquivo `.env` na raiz do projeto ou variáveis do sistema controlam as parametrizações da aplicação:

| Variável | Padrão | Finalidade |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/ens?replicaSet=rs0` | URI de conexão ao MongoDB (no Docker Compose: `mongodb://mongo:27017/ens?replicaSet=rs0`) |
| `GOOGLE_CLIENT_ID` | Vazio | Client ID da aplicação no Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Vazio | Client Secret do cliente OAuth do Google |
| `GOOGLE_REDIRECT_URI` | `http://localhost:4200/admin/integracao/callback` | URI autorizada de redirecionamento OAuth 2.0 |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | `ens-chave-secreta-aes-gcm-256-bit!` | Chave AES de 256 bits para cifrar tokens em repouso |
| `JWT_SECRET` | Chave padrão de 32 bytes | Chave secreta de assinatura HMAC-SHA256 dos tokens JWT |
| `SPRING_MAIL_HOST` | `localhost` | Endereço do servidor SMTP para envio de e-mails |
| `SPRING_MAIL_PORT` | `25` | Porta de comunicação SMTP |
| `APP_FRONTEND_URL` | `http://localhost:4200` | URL base do frontend para montagem de links de reset de senha |

## Usuário Inicial do Sistema (Seed Administrativo)

Ao inicializar o backend com a base de dados de usuários vazia, a rotina `UsuarioSeed` cria automaticamente o administrador padrão:
* **E-mail:** `admin@ens.org.br`
* **Senha inicial:** `Admin@ENS2026`
* **Perfil:** `ADMINISTRADOR` (Natureza Individual)

Recomenda-se a alteração da senha após o primeiro acesso através da área de perfil ou de gestão de usuários.

## Inicialização via Docker Compose

```bash
# Iniciar MongoDB replica set e backend
docker compose -f docker/docker-compose.yml up --build -d

# Acompanhar logs do backend
docker compose -f docker/docker-compose.yml logs backend --tail 50 -f

# Verificar status da saúde da API
curl http://localhost:8080/api/actuator/health
```

Para reiniciar a base de dados do zero, eliminando os volumes:
```bash
docker compose -f docker/docker-compose.yml down -v
```

## Inicialização do Backend Local

```bash
cd backend
mvn spring-boot:run
```

Para rodar a suíte completa de testes automatizados do backend:
```bash
cd backend
mvn test
```

## Inicialização do Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npx ng serve
```

A aplicação ficará disponível em `http://localhost:4200`. O arquivo `proxy.conf.json` direciona chamadas com prefixo `/api` para a porta 8080.

Para compilar a versão de produção com PWA e assets estáticos:
```bash
cd frontend
npm run build
```

Os arquivos compilados são gerados em `frontend/dist/ens-frontend/browser`, incluindo `manifest.webmanifest`, `sw.js` e a pasta `icons/`.

## Problemas Conhecidos e Soluções

| Sintoma | Causa Raiz | Procedimento de Correção |
|---|---|---|
| Erro `redirect_uri_mismatch` no Google OAuth | URI no Google Cloud Console difere da informada na chamada | Certifique-se de cadastrar `http://localhost:4200/admin/integracao/callback` nas URIs de redirecionamento autorizadas no console do Google |
| Erro 403 `ACCESS_TOKEN_SCOPE_INSUFFICIENT` no Calendar | Escopo restrito a eventos (`calendar.events`) sem permissão de criar calendário próprio | O escopo configurado no backend é `https://www.googleapis.com/auth/calendar`. Caso a criação de calendário secundário seja negada, o sistema aplica fallback para o calendário primário |
| E-mails não enviados em ambiente local sem SMTP | Servidor SMTP local inexistente | O serviço `EmailService` captura a falha e simula o envio no log do console, exibindo o conteúdo e links de recuperação para permitir testes locais sem bloqueios |
| `npm install` falha com conflito de peers | Incompatibilidade transitória do gerenciador com pacotes opcionais | Utilize a flag `--legacy-peer-deps` na instalação de dependências |
