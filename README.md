# honey-money

Backend para gerenciamento de tarefas e controle de gastos pessoais. API REST construída com NestJS, autenticação JWT e banco de dados MySQL.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 + TypeScript |
| Banco de dados | MySQL via Prisma 7 |
| Autenticação | JWT (passport-jwt) |
| Hash de senhas | Argon2 |
| Testes | Jest + TDD |
| Documentação | Swagger / OpenAPI |

---

## Arquitetura

O projeto segue uma arquitetura em camadas por módulo de domínio:

```
src/
├── app.controller.ts       # GET / — informações da aplicação
├── app.service.ts
├── app.module.ts
├── auth/                   # Autenticação JWT
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                  # Gerenciamento de usuários
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── users.module.ts
├── tasks/                  # Gerenciamento de tarefas
│   ├── dto/
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.repository.ts
│   └── tasks.module.ts
├── task-time-tracks/       # Rastreamento de tempo por tarefa
│   ├── dto/
│   ├── task-time-tracks.controller.ts
│   ├── task-time-tracks.service.ts
│   ├── task-time-tracks.repository.ts
│   └── task-time-tracks.module.ts
└── prisma/                 # Serviço global de banco de dados
```

Cada camada tem responsabilidade única:

- **Controller** — recebe a requisição HTTP e delega ao Service
- **Service** — contém a lógica de negócio
- **Repository** — único ponto de acesso ao banco de dados
- **DTO** — valida e tipifica a entrada/saída via `class-validator`

---

## Rotas

### App

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/` | Retorna nome e versão da aplicação | — |

### Auth

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Autentica o usuário e retorna um JWT | — |

### Users

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/users` | Cria um novo usuário | — |
| `GET` | `/users/me` | Retorna os dados do usuário autenticado | Bearer |

### Tasks

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/tasks` | Cria uma nova tarefa | Bearer |
| `GET` | `/tasks` | Lista todas as tarefas | Bearer |
| `GET` | `/tasks/:id` | Busca tarefa por ID | Bearer |
| `PATCH` | `/tasks/:id` | Atualiza uma tarefa | Bearer |
| `DELETE` | `/tasks/:id` | Remove uma tarefa | Bearer |

### Task Time Tracks

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/tasks/:taskId/time-tracks/start` | Inicia rastreamento de tempo | Bearer |
| `PATCH` | `/tasks/:taskId/time-tracks/:id/stop` | Encerra rastreamento de tempo | Bearer |
| `GET` | `/tasks/:taskId/time-tracks` | Lista rastreamentos de uma tarefa | Bearer |

A documentação interativa completa está disponível em `/docs` (Swagger UI) quando o servidor está rodando.

---

## Configuração

### Pré-requisitos

- Node.js 20+
- MySQL rodando localmente

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus valores:

```bash
cp .env.example .env
```

```env
DATABASE_URL="mysql://user:password@localhost:3306/honey_money_dev"
JWT_SECRET="seu-segredo-jwt"
```

### Banco de dados

```bash
# Aplicar migrations
npx prisma migrate dev

# Visualizar os dados
npx prisma studio
```

---

## Rodando

```bash
# Desenvolvimento (hot reload)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

---

## Testes

O projeto é desenvolvido com **TDD** — todo código de produção tem um arquivo `.spec.ts` correspondente escrito antes da implementação.

```bash
# Todos os testes unitários
npm run test

# Modo watch
npm run test:watch

# Cobertura
npm run test:cov

# Testes e2e
npm run test:e2e
```

Cada módulo tem testes para as três camadas:

```
<modulo>.controller.spec.ts
<modulo>.service.spec.ts
<modulo>.repository.spec.ts
```

---

## Postman

O arquivo `honey-money.postman_collection.json` na raiz do projeto pode ser importado diretamente no Postman. Ele contém todas as rotas com exemplos de corpo e header de autenticação prontos.

A collection é **atualizada automaticamente** a cada `git commit` via hook pre-commit — sem necessidade de manutenção manual.

Para gerar manualmente:

```bash
npm run postman:generate
```

> **Novo desenvolvedor?** Após clonar o repositório, rode `npm install` — o script `prepare` configura o hook automaticamente.

---

## Segurança

- Senhas armazenadas com **Argon2id** (recomendado pelo OWASP)
- Tokens JWT com expiração configurável
- `ValidationPipe` global com `whitelist: true` — campos não declarados no DTO são bloqueados
- `.env` nunca commitado — apenas `.env.example` no repositório
