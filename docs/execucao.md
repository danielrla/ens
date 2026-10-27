# Execução do ambiente

## Pré-requisitos

- Docker, com a rede `containers` criada: `docker network create containers`
- Node 22 e npm (somente para o frontend)
- JDK não é necessário: o backend compila dentro do container

## Backend e banco

```bash
docker compose -f docker/docker-compose.yml up --build -d
docker compose -f docker/docker-compose.yml logs backend --tail 50
curl http://localhost:8080/api/estrutura/SUPER_REGIAO
```

Resposta esperada: lista com "Super-Região Brasil". Para recriar do zero, incluindo os dados: `docker compose -f docker/docker-compose.yml down -v`.

## Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npx ng serve
```

Acesso em `http://localhost:4200`. O proxy encaminha `/api` ao backend na porta 8080.

## Problemas conhecidos

| Sintoma | Causa | Solução |
|---|---|---|
| Backend conecta em `localhost:27017` e falha | No Spring Boot 4 a URI é `spring.mongodb.uri`, não `spring.data.mongodb.uri` | Já corrigido em `application.yml` |
| `npm install` falha com `Cannot read properties of null (reading 'edgesOut')` | Bug do npm 10.9.3 com peers opcionais (`jsdom`, `canvas`) | Usar `--legacy-peer-deps` |
| `curl` falha logo após `docker compose up` | `up` sem `-d` mantém o terminal preso | Usar `up -d` |
| Backend sobe antes do replica set | Replica set inicia pelo healthcheck do Mongo | O `depends_on` com `service_healthy` já resolve |

## Configuração

| Variável | Padrão | Uso |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/ens?replicaSet=rs0` | Conexão do backend (no compose: `mongodb://mongo:27017/ens?replicaSet=rs0`) |
