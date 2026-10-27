# Sistema ENS: Gestão das Equipes de Nossa Senhora

Aplicação web para gestão da estrutura hierárquica, dos mandatos e da vida das Equipes de Nossa Senhora. A especificação funcional de origem está em [prompt.md](../prompt.md).

## Índice

| Documento | Conteúdo |
|---|---|
| [arquitetura.md](arquitetura.md) | Stack, modelo de dados, RBAC, LGPD e decisões técnicas |
| [execucao.md](execucao.md) | Como subir o ambiente, comandos e problemas conhecidos |
| [roadmap.md](roadmap.md) | Estado de cada trilha e próximos passos |
| [openapi.yaml](openapi.yaml) | Contrato da API, fonte única para DTOs e endpoints |

## Estrutura do repositório

```
backend/    API Spring Boot (Java 25, Spring Boot 4.1.1)
frontend/   Angular 21 (standalone, signals)
docker/     docker-compose (MongoDB 8.3.13 e backend)
docs/       documentação e contrato OpenAPI
```

## Estado atual

Fundação concluída: backend com hierarquia e endpoint de cascata, frontend com design system e filtro em cascata, infraestrutura em containers. Detalhes em [roadmap.md](roadmap.md).
