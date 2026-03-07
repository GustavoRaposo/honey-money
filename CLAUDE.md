# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

**honey-money** é um sistema backend para gerenciamento de tarefas e controle de gastos, construído com NestJS.

## Comandos

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes unitários
npm run test

# Teste específico (Jest 30 — usar testPathPatterns no plural)
npm run test -- --testPathPatterns=nome-do-arquivo

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov

# Lint
npm run lint

# Formatar código
npm run format

# Verificar tipos (tsconfig de produção, sem gerar build)
npm run typecheck
```

## TypeScript

- Todo arquivo deve ser `.ts` — nunca `.js`.
- Tipar explicitamente parâmetros, retornos de funções e variáveis. Evitar `any`; usar `unknown` quando o tipo não for conhecido.
- Usar `interface` para contratos (ex: repositórios, respostas) e `type` para uniões/interseções.
- Habilitar `strict: true` no `tsconfig.json`. Nunca desabilitar regras de strict para contornar erros.
- Usar decorators do NestJS (`@Controller`, `@Injectable`, `@Module`, `@Get`, etc.) em vez de configuração manual.
- Decorators de validação (`@IsString`, `@IsNotEmpty`, etc.) em todos os campos de DTOs.
- Usar `import type` para importar apenas tipos do Prisma (ex: `import type { User } from '../../generated/prisma/client.js'`). Isso evita carregar o cliente gerado em módulos que não precisam instanciá-lo.
- Importar módulos locais com extensão `.js` nas declarações de import (exigência do `moduleResolution: nodenext`). O Jest resolve corretamente via `moduleNameMapper`.

## TDD — Test-Driven Development

**Sempre escrever o teste antes de implementar a funcionalidade.**

### Fluxo obrigatório

1. Escrever o teste (Red) — o teste deve falhar inicialmente.
2. Implementar o mínimo necessário para o teste passar (Green).
3. Refatorar mantendo os testes verdes (Refactor).

### Estrutura de testes

Cada arquivo de implementação tem um arquivo de teste correspondente:

```
src/
  <modulo>/
    <modulo>.service.spec.ts     # Testes unitários do Service
    <modulo>.controller.spec.ts  # Testes unitários do Controller
    <modulo>.repository.spec.ts  # Testes unitários do Repository
```

Testes e2e ficam em `test/` na raiz do projeto.

### Padrões de teste

- Usar `jest` com `@nestjs/testing` (`Test.createTestingModule`).
- Mockar dependências com `jest.fn()` — nunca usar implementações reais em testes unitários.
- Nomear describes como `describe('NomeDoServico')` e its como `it('deve [comportamento esperado] quando [condição]')`.
- Cobrir cenários de sucesso e de erro (ex: `NotFoundException`, `BadRequestException`) para cada método.
- Antes de implementar qualquer Service, Controller ou Repository, criar o arquivo `.spec.ts` correspondente com os casos de teste.

### Configuração do Jest com Prisma 7

O Prisma 7 gera o cliente em `generated/prisma/` usando sintaxe ESM (`import.meta`), incompatível com Jest em modo CommonJS. Por isso:

- O `moduleNameMapper` no `package.json` redireciona `@prisma/client` para `src/__mocks__/prisma-client.mock.ts`.
- O `PrismaClient` mockado expõe apenas os métodos base necessários (`$connect`, `$disconnect`, `user.*`).
- Nos testes unitários, o `PrismaService` é sempre substituído via `{ provide: PrismaService, useValue: mockObject }` — nunca instanciado diretamente.

## Arquitetura

### Estrutura de módulos

Cada domínio (ex: `tasks`, `expenses`, `users`) é um módulo NestJS independente com a seguinte estrutura:

```
src/
  <modulo>/
    dto/                        # Data Transfer Objects (entrada/saída)
    entities/                   # Entidades do banco de dados
    <modulo>.controller.ts      # Rotas HTTP
    <modulo>.controller.spec.ts # Testes do Controller
    <modulo>.service.ts         # Lógica de negócio
    <modulo>.service.spec.ts    # Testes do Service
    <modulo>.repository.ts      # Acesso a dados
    <modulo>.repository.spec.ts # Testes do Repository
    <modulo>.module.ts          # Configuração do módulo
```

### Camadas e responsabilidades

- **Controller**: recebe requests HTTP, valida entrada via DTO, delega ao Service. Não contém lógica de negócio.
- **Service**: contém toda a lógica de negócio. Depende do Repository via injeção de dependência.
- **Repository**: única camada que acessa o banco de dados. Abstrai queries e operações de persistência.
- **DTO**: classes com decorators do `class-validator` para validação e `class-transformer` para transformação. DTOs de entrada (Create/Update) são separados dos de saída (Response).
- **Entity**: representa a tabela no banco. Não deve ser exposta diretamente nas respostas HTTP.

### Injeção de dependência

- Sempre injetar via construtor, nunca instanciar classes manualmente.
- Repositories devem ser registrados como `@Injectable()` e exportados no módulo.
- Usar interfaces para abstrair repositórios quando necessário para facilitar testes.

### Convenções de código

- Usar `async/await` consistentemente — nunca misturar com `.then()`.
- Lançar exceções do NestJS (`NotFoundException`, `BadRequestException`, etc.) no Service, nunca no Repository.
- DTOs de criação: prefixo `Create` (ex: `CreateTaskDto`).
- DTOs de atualização: prefixo `Update`, usando `PartialType(CreateTaskDto)`.
- DTOs de resposta: sufixo `ResponseDto` (ex: `TaskResponseDto`).
- Usar `@ApiProperty()` do Swagger em todos os DTOs.
- Mapear entidades para DTOs de resposta no Service antes de retornar ao Controller.

### Validação

- Usar `ValidationPipe` globalmente com `whitelist: true` e `forbidNonWhitelisted: true`.
- Toda entrada do usuário deve passar por um DTO com decorators do `class-validator`.

### Banco de dados

- ORM: **Prisma**.
- Banco: **MySQL**, banco de desenvolvimento chamado `honey_money_dev`.
- A connection string é lida exclusivamente do arquivo `.env` via variável `DATABASE_URL`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/honey_money_dev"
```

- O schema fica em `prisma/schema.prisma`. Toda alteração de modelo deve ser feita nesse arquivo.
- Usar migrations do Prisma para qualquer mudança de schema:

```bash
# Criar e aplicar migration em desenvolvimento
npx prisma migrate dev --name descricao-da-mudanca

# Aplicar migrations em produção
npx prisma migrate deploy

# Gerar o Prisma Client após mudanças no schema
npx prisma generate

# Inspecionar o banco via interface web
npx prisma studio
```

- **Prisma 7**: a URL de conexão é configurada em `prisma.config.ts` (via `process.env.DATABASE_URL`), não no `schema.prisma`. O schema define apenas o `provider`.
- O gerador usado é `prisma-client-js`, que publica o cliente em `node_modules/@prisma/client` (já pré-compilado e compatível com CommonJS). **Não usar o gerador `prisma-client`** — ele gera arquivos `.ts` com `import.meta.url` (ESM) que conflitam com o build CommonJS do NestJS.
- **Prisma 7 exige um driver adapter** — não aceita mais connection string direta no constructor do `PrismaClient`. Para MySQL usa-se `@prisma/adapter-mariadb` (pacote `@prisma/adapter-mariadb` + `mariadb`). O `PrismaService` instancia o adapter com a `DATABASE_URL` e o passa via `super({ adapter })`.
- O `PrismaClient` é importado de `@prisma/client`. A conexão é gerenciada pelo `PrismaMariaDb` adapter instanciado no constructor do `PrismaService`.
- Tipos do Prisma (ex: `User`) são importados de `@prisma/client` com `import type`.
- O `PrismaService` é um serviço global (`@Global()`) que encapsula o `PrismaClient`, registrado em `src/prisma/prisma.module.ts` e exportado para uso em todos os módulos.
- Repositories injetam o `PrismaService` em vez de usar o `PrismaClient` diretamente.
- Nunca commitar o arquivo `.env`. O repositório deve conter um `.env.example` com as variáveis necessárias sem valores reais.
- Após qualquer alteração no `schema.prisma`, rodar `npx prisma generate` para atualizar o cliente e adicionar o novo modelo ao mock em `src/__mocks__/prisma-client.mock.ts`.

### Módulos

- Cada módulo deve importar apenas o que precisa.
- Módulos compartilhados (ex: autenticação, database) ficam em `src/common/` ou `src/shared/`.
- Guards, Interceptors e Pipes reutilizáveis ficam em `src/common/`.

## Validações obrigatórias antes do commit

### Por que testes passando não garantem build passando

O Jest usa `ts-jest` com um tsconfig sobrescrito (`module: CommonJS`, `moduleResolution: node`), que é mais permissivo que o tsconfig de produção. Isso significa que erros específicos das configurações de produção (`isolatedModules: true`, `emitDecoratorMetadata: true`, `moduleResolution: nodenext`) **não são detectados durante `npm test`**.

Exemplos de erros que passam nos testes mas quebram o build:

| Erro | Causa | Detectado por |
|------|-------|---------------|
| TS1272: `import type` obrigatório | `isolatedModules` + `emitDecoratorMetadata` | `typecheck` / `build` |
| TS2352: conversão de tipo inválida | Prisma infers type doesn't overlap | `typecheck` / `build` |
| Imports sem extensão `.js` | `moduleResolution: nodenext` | `typecheck` / `build` |

### Checklist antes de commitar

Execute **na ordem** (o pre-commit hook faz isso automaticamente):

```bash
npm run typecheck   # Valida o tsconfig de produção sem gerar build
npm run lint        # ESLint + Prettier
npm test            # Testes unitários
npm run build       # Opcional localmente, obrigatório na CI
```

### Pre-commit hook

O hook em `.githooks/pre-commit` executa `typecheck → lint → test → postman:generate` automaticamente. Ativado via `npm run prepare` (ou `git config core.hooksPath .githooks`).

**Nunca usar `--no-verify`** para pular o hook. Se o hook falhar, corrija o erro antes de commitar.

### Typecheck separado do build

`npm run typecheck` executa `tsc --noEmit` usando o `tsconfig.json` de produção — mesmos flags do build real, sem gerar arquivos. É mais rápido que `npm run build` e deve ser o primeiro passo de qualquer validação.

## Git — GitHub Flow

O projeto segue o **GitHub Flow**: `master` é sempre deployável e todo trabalho novo sai de uma branch curta.

### Fluxo obrigatório para qualquer mudança

1. Criar uma branch a partir de `master` com o prefixo adequado.
2. Fazer commits atômicos na branch.
3. Abrir Pull Request para `master`.
4. Após aprovação e CI verde, fazer merge e deletar a branch.

### Nomenclatura de branches

```
feat/<descricao-curta>     nova funcionalidade
fix/<descricao-curta>      correção de bug
chore/<descricao-curta>    tarefas de manutenção, deps, config
refactor/<descricao-curta> refatoração sem mudança de comportamento
test/<descricao-curta>     adição ou correção de testes
docs/<descricao-curta>     apenas documentação
```

Exemplos:

```bash
git checkout -b feat/expenses-module
git checkout -b fix/jwt-expiration
git checkout -b chore/upgrade-prisma
```

### Commits

Seguir Conventional Commits:

```
feat: adiciona módulo de despesas
fix: corrige validação de email duplicado
chore: atualiza dependências
refactor: extrai lógica de hash para helper
test: adiciona testes do ExpensesService
docs: atualiza README com novas rotas
```
