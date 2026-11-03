# Diretrizes Universais de Engenharia, Segurança e Operação de IA (Google Antigravity & Graphify)

Este documento estabelece as diretrizes arquiteturais, operacionais e de segurança obrigatórias para agentes de IA e desenvolvedores no ciclo de vida deste repositório.

---

## 1. Protocolo de Inteligência Artificial (Google Antigravity & Graphify)

- **Análise Prévia com Graphify (Foco Estrito em Negócio):**
  - Toda demanda complexa, refatoração ou criação de feature deve ser precedida por uma consulta estruturada via Graphify (`graphify query` ou `query_graph`).
  - **Filtro de Ruído:** Isole e alimente o modelo apenas com os nós relacionados às regras de domínio, contratos de interface (APIs/DTOs) e entidades de negócio. Exclua do grafo artefatos de infraestrutura transitória, linters, testes de cobertura e arquivos de configuração operacional.
  - **Minimização de Contexto:** Forneça ao modelo apenas as fronteiras contratuais impactadas, evitando saturação de tokens e alucinações.

- **Execução Paralela Obrigatória (Concurrent Tasking):**
  - Sempre que uma tarefa envolver mais de uma camada desacoplada sem bloqueios diretos, decomponha o plano de execução em trilhas simultâneas:
    - **Trilha Backend:** Modelos de domínio, serviços, controladores e contratos de API.
    - **Trilha Frontend:** Interfaces visuais, gerenciamento de estado e clientes de consumo de API.
    - **Trilha Persistência & Schemas:** Migrações de banco de dados, schemas e definições de dados.
    - **Trilha Documentação & Testes:** Atualização de documentação de negócio e testes automatizados isolados.
  - Cada trilha deve operar com contratos de entrada e saída claramente definidos (DTOs/tipagens) antes da escrita do código.

---

## 2. Governança de Escopo, Arquivos e Higiene de Repositório

- **Confinamento Absoluto de Workspace:**
  - O agente deve atuar exclusivamente dentro da pasta raiz deste repositório. É terminantemente proibido ler, listar, modificar ou referenciar arquivos e diretórios externos sem autorização prévia explícita.

- **Proteção de Arquivos Sensíveis e Privados:**
  - Arquivos de anotações pessoais (ex.: `anotacoes.txt`, `drafts/`, `.private/`) ou variáveis de ambiente locais (`.env*`) não devem ser lidos, indexados ou manipulados sob hipótese alguma.

- **Higiene Rígida do `.gitignore`:**
  - O repositório deve manter expressamente fora do controle de versão todo arquivo irrelevante ao funcionamento do software em produção:
    - Artefatos de compilação e pastas de build.
    - Diretórios de dependências gerenciadas por pacotes.
    - Arquivos de configuração de IDEs e editores locais.
    - Logs, dumps de banco locais e arquivos temporários.
    - Arquivos do sistema operacional (`.DS_Store`, `Thumbs.db`).

- **Caminhos Portáveis:**
  - Utilize sempre caminhos relativos à raiz do projeto para qualquer documentação, script ou link, garantindo compatibilidade entre diferentes sistemas operacionais e contêineres.

---

## 3. Padrões de Arquitetura e Engenharia de Software

- **Documentação de Código com Propósito Funcional:**
  - Todas as classes de negócio, serviços, modelos e componentes de interface devem conter documentação explicativa (Javadoc, TSDoc ou padrão nativo da linguagem) indicando o propósito na regra de negócio, comportamento esperado e integrações.

- **Isolamento de Autenticação e Dados Sensíveis:**
  - Controladores e serviços de autenticação devem limitar-se exclusivamente ao ciclo de vida da sessão e identificadores mínimos de acesso.
  - É vedado trafegar dados cadastrais sensíveis, documentos pessoais ou atributos de negócio detalhados em rotas exclusivas de autenticação/tokens.

- **Zero Hardcode (Configuração Externa e Injeção de Dependências):**
  - É proibido declarar endereços de hosts, portas locais (`localhost`, `127.0.0.1`), chaves secretas ou URLs de dependências externas diretamente no código-fonte.
  - Todo parâmetro ambiental deve ser fornecido via variáveis de ambiente injetadas centralizadamente por clientes de configuração ou serviços de bootstrap.

---

## 4. Segurança de Aplicação e DevSecOps (OWASP)

- **Manipulação Segura de Uploads (OWASP File Upload Cheat Sheet):**
  - **Inspeção de Assinatura (Magic Bytes):** Não confie exclusivamente na extensão informada ou no header `Content-Type`. Valide os primeiros bytes do arquivo no servidor.
  - **Lista Branca Estrita:** Restrinja tipos permitidos unicamente aos formatos necessários para o negócio da funcionalidade.
  - **Mitigação de Path Traversal:** Rejeite ou sanitize o nome original do arquivo. Gere identificadores opacos criptograficamente seguros (como UUID v4) para persistência.
  - **Armazenamento Seguro:** Arquivos devem residir em serviços de Object Storage isolados, sem permissões de execução de scripts ou binários.
  - **Limites de Carga:** Configure tetos rígidos de tamanho máximo por arquivo e por requisição para mitigar ataques de negação de serviço (DoS).

- **Princípio do Menor Privilégio e Segregação de Ambientes:**
  - Backups de dados e credenciais em nuvem devem seguir estruturas hierárquicas claras e isoladas por ambiente (`dev/`, `staging/`, `prod/`), respeitando políticas de retenção e imutabilidade.

---

## 5. Ciclo de Vida de Execução, Containers e Decisão

- **Containers e Padronização:**
  - Todo container criado para o ambiente deve ser associado à rede padrão de contêineres do projeto e adotar explicitamente o timezone configurado (padrão: `America/Cuiaba`).
  - Priorize estratégias de hot reload em ambiente de desenvolvimento local. Reinicializações de contêineres devem ocorrer apenas mediante alterações de dependências, variáveis de ambiente ou migrações estruturais.

- **Análise de Causa Raiz e Autorização Prévia:**
  - Diante de falhas, erros de compilação ou regressões de testes, identifique e apresente a causa raiz no chat com alternativas de solução antes de aplicar alterações destrutivas ou de grande porte no código.

---

## 6. Especificações Deste Projeto (Preencher ao Iniciar)

> **Instruções:** Ao iniciar um novo projeto, preencha os campos abaixo com as definições específicas da stack e das regras de negócio.

- **Nome do Projeto:** Sistema de Gestão de Frotas e Condutores (FMS)
- **Stack Backend:** Java 25, Spring Boot 4.1.0, Spring Data MongoDB, Apache Kafka 3.9 (KRaft), Redis 7.4, Maven
- **Stack Frontend:** Angular 21 (Standalone Components, Signals, Router, Vanilla CSS, TypeScript 5.7+)
- **Banco de Dados & Migrações:** MongoDB 8.3.13 (`frotas_db`), Redis 7.4, Apache Kafka 3.9
- **Diretório das Regras de Negócio:** `docs/`
- **Variáveis Chave de Integração:**
  - URL Base BFF Unificado: `API_BFF_URL` (padrão local: `http://localhost:8000`)
  - URL Base Driver Service: `DRIVER_SERVICE_URL` (padrão local: `http://localhost:8085`)
  - URL Base Frontend Unificado: `FRONTEND_URL` (padrão local: `http://localhost:4200`)
- **Regra Geral de Paginação:**
  - Todas as consultas, listagens e tabelas de dados do sistema devem, obrigatoriamente, ser paginadas de 10 em 10 registros, dispondo de controles navegáveis padronizados (anterior, próxima, indicador de página atual e total de páginas e registros).
- **Regra Geral de Seleção de Unidades Organizacionais (Combobox Pesquisável):**
  - Todo formulário cadastral ou operacional que envolva seleção de Unidade Organizacional, Órgão de Lotação ou entidade governamental de alta densidade deve, obrigatoriamente, utilizar o componente compartilhado `app-combobox-unidade` (`ComponenteComboboxUnidade`). É vedado o uso de `<select>` nativo ou campos de texto livre não validados para esse fim.
- **Regra Geral de Máscaras Cadastrais (Apenas Frontend):**
  - Todas as máscaras de campos padronizados (CPF, CNPJ, telefone, CEP e datas) devem ser aplicadas estritamente na interface de usuário (frontend). Os dados enviados ao backend e persistidos nos bancos de dados devem ser armazenados exclusivamente em formato cru (apenas números/dígitos), sem caracteres de pontuação.
- **Regra Geral de Disponibilidade de Veículos e Frotas Multimodais:**
  - O sistema atende frotas terrestres, aquáticas e aéreas (carros, motos, camionetes, ônibus, caminhões, tratores/maquinários, barcos, lanchas, helicópteros e aviões).
  - Um veículo só pode estar apto e assumir a situação operacional de `DISPONIVEL` se estiver expressamente vinculado a uma Unidade Organizacional ativa (`unidadeId`). Caso esteja sem lotação, seu status compulsório no banco e na interface é `AGUARDANDO_LOTACAO`, bloqueando emissão de termos de custódia e liberação em portaria.
- **Massa de Dados / Telefones para Teste:** Números fictícios autorizados (`11999990001`, `11999990002`, `11999990003`) e CPFs cadastrais mockados para validação das travas TRV-04-01 a TRV-04-08.