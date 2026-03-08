# CLAUDE.md — honey-money monorepo

Este arquivo fornece orientações ao Claude Code ao trabalhar com qualquer parte deste repositório.

## Estrutura do monorepo

```
honey-money/
├── apps/
│   ├── api/      # Backend NestJS + Prisma + MySQL
│   └── mobile/   # App Android Kotlin + Jetpack Compose + Hilt
├── .githooks/    # pre-commit hook (roda validações em apps/api/)
├── package.json  # Metadado raiz (sem workspaces)
└── .gitignore
```

## Git — GitHub Flow

`master` é sempre deployável. Todo trabalho novo sai de uma branch curta e volta via Pull Request.

### Nomenclatura de branches

```
feat/<descricao>      nova funcionalidade
fix/<descricao>       correção de bug
chore/<descricao>     manutenção, deps, config
refactor/<descricao>  refatoração sem mudança de comportamento
test/<descricao>      adição ou correção de testes
docs/<descricao>      apenas documentação
```

### Commits — Conventional Commits

```
feat(auth): adiciona tela de cadastro com validação de e-mail
fix(login): corrige crash ao submeter formulário vazio
test(tasks): adiciona testes unitários para TasksService
chore(deps): atualiza Retrofit para 2.11.0
```

### Regras

- Nunca commitar diretamente na `master`.
- Toda branch deve ter PR antes do merge.
- Nunca usar `--no-verify` para pular hooks. Se o hook falhar, corrija o erro.

---

## API — `apps/api/`

Backend NestJS para gerenciamento de tarefas e controle de gastos.

### Comandos

```bash
cd apps/api

npm install           # Instalar dependências
npm run start:dev     # Desenvolvimento (watch)
npm run build         # Build produção
npm run start:prod    # Iniciar em produção
npm run typecheck     # Verificar tipos (tsconfig produção, sem gerar build)
npm run lint          # ESLint + Prettier
npm run test          # Testes unitários
npm run test -- --testPathPatterns=nome-do-arquivo  # Teste específico
npm run test:e2e      # Testes end-to-end
npm run test:cov      # Cobertura de testes
npm run format        # Formatar código
npm run prepare       # Ativar git hooks (.githooks/)
npm run db:seed       # Popular banco com dados iniciais
```

### TypeScript

- Todo arquivo deve ser `.ts` — nunca `.js`.
- Tipar explicitamente parâmetros, retornos e variáveis. Evitar `any`; usar `unknown` quando o tipo não for conhecido.
- Usar `interface` para contratos e `type` para uniões/interseções.
- `strict: true` no `tsconfig.json`. Nunca desabilitar regras de strict.
- Usar decorators NestJS (`@Controller`, `@Injectable`, `@Module`, etc.) em vez de configuração manual.
- Decorators de validação (`@IsString`, `@IsNotEmpty`, etc.) em todos os campos de DTOs.
- Usar `import type` para importar apenas tipos do Prisma. Isso evita carregar o cliente gerado em módulos que não precisam instanciá-lo.
- Importar módulos locais com extensão `.js` (exigência do `moduleResolution: nodenext`). O Jest resolve via `moduleNameMapper`.

### TDD — Test-Driven Development

**Sempre escrever o teste antes de implementar a funcionalidade.**

Ciclo: **Red → Green → Refactor**

1. Escrever o teste (Red) — deve falhar inicialmente.
2. Implementar o mínimo para o teste passar (Green).
3. Refatorar mantendo os testes verdes (Refactor).

#### Estrutura de testes

```
apps/api/src/
  <modulo>/
    <modulo>.service.spec.ts
    <modulo>.controller.spec.ts
    <modulo>.repository.spec.ts
```

Testes e2e em `apps/api/test/`.

#### Padrões de teste

- Usar `jest` com `@nestjs/testing` (`Test.createTestingModule`).
- Mockar dependências com `jest.fn()` — nunca usar implementações reais em unitários.
- Describes: `describe('NomeDoServico')`. Its: `it('deve [comportamento] quando [condição]')`.
- Cobrir cenários de sucesso e de erro (`NotFoundException`, `BadRequestException`, etc.).
- Criar o `.spec.ts` antes do arquivo de implementação.

#### Jest com Prisma 7

O Prisma 7 gera o cliente com sintaxe ESM (`import.meta`), incompatível com Jest/CommonJS. Por isso:

- O `moduleNameMapper` redireciona `@prisma/client` para `src/__mocks__/prisma-client.mock.ts`.
- Nos testes, o `PrismaService` é sempre substituído via `{ provide: PrismaService, useValue: mockObject }`.

### Arquitetura

#### Estrutura de módulos

```
apps/api/src/
  <modulo>/
    dto/
    entities/
    <modulo>.controller.ts
    <modulo>.service.ts
    <modulo>.repository.ts
    <modulo>.module.ts
    *.spec.ts
```

#### Camadas e responsabilidades

- **Controller**: recebe requests HTTP, valida via DTO, delega ao Service. Sem lógica de negócio.
- **Service**: lógica de negócio. Depende do Repository via injeção de dependência.
- **Repository**: única camada que acessa o banco. Abstrai queries e persistência.
- **DTO**: `class-validator` para validação, `class-transformer` para transformação. DTOs de entrada (Create/Update) separados dos de saída (Response).
- **Entity**: representa a tabela no banco. Nunca exposta diretamente nas respostas HTTP.

#### Convenções de código

- `async/await` consistentemente — nunca misturar com `.then()`.
- Exceções do NestJS lançadas no Service, nunca no Repository.
- DTOs de criação: prefixo `Create`. Atualização: `Update` com `PartialType`. Resposta: sufixo `ResponseDto`.
- `@ApiProperty()` do Swagger em todos os DTOs.
- Mapear entidades para DTOs de resposta no Service.
- `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true`.

### Banco de dados — Prisma 7

- ORM: **Prisma 7**. Banco: **MySQL** (`honey_money_dev`).
- Connection string no `.env` via `DATABASE_URL`.
- Schema em `apps/api/prisma/schema.prisma`.

```bash
npx prisma migrate dev --name descricao   # Criar e aplicar migration
npx prisma migrate deploy                 # Aplicar em produção
npx prisma generate                       # Atualizar Prisma Client
npx prisma studio                         # Interface web do banco
```

- A URL de conexão é configurada em `prisma.config.ts`, não no `schema.prisma`.
- Gerador: `prisma-client-js` (publica em `node_modules/@prisma/client`, compatível com CommonJS). **Não usar `prisma-client`** — gera arquivos ESM que conflitam com o build NestJS.
- Prisma 7 exige driver adapter. MySQL usa `@prisma/adapter-mariadb`. O `PrismaService` instancia o adapter com `DATABASE_URL` e passa via `super({ adapter })`.
- `PrismaService` é global (`@Global()`), registrado em `src/prisma/prisma.module.ts`.
- Tipos do Prisma importados com `import type`.
- Após alterar `schema.prisma`: rodar `npx prisma generate` e atualizar o mock em `src/__mocks__/prisma-client.mock.ts`.
- Nunca commitar o `.env`. O repositório contém `.env.example`.

### Versionamento semântico

**Ao iniciar qualquer nova implementação**, atualizar `"version"` em `apps/api/package.json`:

| Tipo | Campo | Exemplo |
|------|-------|---------|
| Quebra de compatibilidade / reestruturação | MAJOR | 1.0.0 → 2.0.0 |
| Nova funcionalidade sem quebra | MINOR | 1.2.0 → 1.3.0 |
| Correção de bug / ajuste pequeno | PATCH | 1.2.3 → 1.2.4 |

A rota `GET /` retorna `{ name, version }` lidos do `package.json`.

### Validações antes do commit

O pre-commit hook (`.githooks/pre-commit`) executa automaticamente a partir de `apps/api/`:

```
typecheck → lint → test → postman:generate
```

#### Por que testes passando não garantem build passando

O Jest usa `ts-jest` com tsconfig mais permissivo (`module: CommonJS`, `moduleResolution: node`). Erros específicos do tsconfig de produção (`isolatedModules`, `emitDecoratorMetadata`, `moduleResolution: nodenext`) **não são detectados pelo `npm test`**.

| Erro | Causa | Detectado por |
|------|-------|---------------|
| TS1272: `import type` obrigatório | `isolatedModules` + `emitDecoratorMetadata` | `typecheck` / `build` |
| TS2352: conversão inválida | Prisma infers type | `typecheck` / `build` |
| Imports sem `.js` | `moduleResolution: nodenext` | `typecheck` / `build` |

Checklist manual (na ordem):

```bash
cd apps/api
npm run typecheck
npm run lint
npm test
npm run build   # opcional local, obrigatório na CI
```

---

## Mobile — `apps/mobile/`

App Android de gerenciamento de tarefas e controle financeiro.

- **Min SDK**: 24 | **Target/Compile SDK**: 36
- **AGP**: 9.0.1 | **Kotlin**: 2.0.21
- **UI**: Jetpack Compose + Material3 com dynamic color (Android 12+)

### Comandos

```bash
cd apps/mobile

./gradlew assembleDebug                         # Build debug APK
./gradlew assembleRelease                       # Build release APK
./gradlew test                                  # Todos os testes unitários
./gradlew test --tests "dev.gustavoraposo.honey_money_mobile.ExampleUnitTest"
./gradlew connectedAndroidTest                  # Testes instrumentados (requer device/emulador)
./gradlew clean                                 # Limpar build
```

No Windows, substituir `./gradlew` por `gradlew.bat`.

### Arquitetura — MVVM

App single-module (`:app`). Código-fonte em `app/src/main/java/dev/gustavoraposo/honey_money_mobile/`.

#### Estrutura de pacotes

```
honey_money_mobile/
├── data/
│   ├── local/          # Room DAOs, Database, Entities
│   ├── remote/         # Retrofit API interfaces, DTOs
│   └── repository/     # Implementações dos repositories
├── domain/
│   ├── model/          # Modelos de domínio (sem dependências Android)
│   ├── repository/     # Interfaces dos repositories
│   └── usecase/        # Use cases (um por arquivo, um método invoke())
├── ui/
│   ├── feature/
│   │   └── <feature>/
│   │       ├── <Feature>Screen.kt
│   │       └── <Feature>ViewModel.kt
│   └── theme/          # Theme.kt, Color.kt, Type.kt
├── di/                 # Módulos Hilt (DatabaseModule, NetworkModule, RepositoryModule)
└── MainActivity.kt
```

#### Camadas e responsabilidades

- **`domain/model`**: classes puras, sem dependências Android.
- **`domain/repository`**: interfaces de acesso a dados.
- **`domain/usecase`**: lógica de negócio; um único método `invoke()`.
- **`data/repository`**: implementações concretas, ponte entre `local` e `remote`.
- **`data/local`**: Room — `@Entity`, `@Dao`, `@Database`.
- **`data/remote`**: Retrofit — interfaces `@Api` e DTOs de resposta.
- **`ui/.../ViewModel`**: expõe `StateFlow`/`LiveData`, chama use cases, sem lógica de negócio.
- **`di/`**: módulos Hilt com `@Module` + `@InstallIn`.

#### Stack de bibliotecas

| Função | Biblioteca |
|--------|-----------|
| Persistência local | Room |
| Chamadas REST | Retrofit |
| Injeção de dependência | Dagger/Hilt |
| UI | Jetpack Compose + Material3 |

Dependências gerenciadas via version catalog em `apps/mobile/gradle/libs.versions.toml`.

### TDD — Test-Driven Development

Ciclo obrigatório: **Red → Green → Refactor**. Nunca entregar funcionalidade sem testes correspondentes passando.

#### Estrutura de testes

```
apps/mobile/app/src/
├── test/                          # Testes unitários (JUnit + Mockk/Mockito)
│   └── java/dev/gustavoraposo/honey_money_mobile/
│       ├── domain/usecase/
│       ├── data/repository/
│       └── ui/<feature>/          # ViewModels
└── androidTest/                   # Testes instrumentados / E2E
    └── java/dev/gustavoraposo/honey_money_mobile/
        ├── data/local/            # Room (in-memory database)
        └── ui/<feature>/          # Compose Testing
```

#### Convenções de teste

- Nome: `dado_<contexto>_quando_<acao>_entao_<resultado>`
- Use cases testados com repositórios mockados.
- ViewModels testados com use cases mockados.
- Room testado com banco em memória (`Room.inMemoryDatabaseBuilder`).
- UI com `ComposeTestRule` do `androidx.compose.ui.test`.

### Testes de integração Mobile ↔ API

No monorepo, o contrato entre mobile e API é definido pelos **DTOs de resposta da API** e mantido pela **Postman collection** gerada automaticamente em cada commit da API.

#### Fonte de verdade do contrato

`apps/api/honey-money.postman_collection.json` — gerado pelo hook a cada commit. Contém os shapes reais de request/response de todos os endpoints. **Consultar este arquivo antes de escrever qualquer mock no mobile.**

#### Regras de consistência

- Campos dos `data class` em `data/remote/dto/` devem corresponder exatamente aos campos dos `ResponseDto` da API (nome, tipo e nullabilidade).
- Campos opcionais na API (TypeScript `?` ou sem `@IsNotEmpty`) devem ser `nullable` no Kotlin.
- Status HTTP usados nos mocks (MockWebServer) devem corresponder ao que a API retorna de fato.
- Nunca escrever um mock de resposta sem conferir o shape no Postman collection ou no Swagger da API.

```kotlin
// API: description?: string  →  Mobile data class:
data class TaskDto(
    val id: Int,
    val name: String,
    val description: String?,  // nullable — campo opcional na API
    val priority: Int,
    val statusCode: Int,
)
```

#### Três camadas de testes de integração no mobile

| Camada | O que testa | Onde fica | Ferramentas |
|--------|------------|-----------|-------------|
| **Contrato** | Retrofit desserializa corretamente a resposta da API | `test/data/remote/` | JUnit + MockWebServer |
| **Repository** | Orquestração local (Room) + remoto (Retrofit) | `test/data/repository/` | JUnit + MockWebServer + Room in-memory |
| **E2E** | Fluxo completo com API real rodando localmente | `androidTest/` | Compose Testing + API local |

#### Testes de contrato com MockWebServer

Validam que o Retrofit desserializa a resposta real da API. O JSON do mock deve ser copiado diretamente do Postman collection.

```kotlin
// test/data/remote/TaskApiTest.kt
class TaskApiTest {
    private lateinit var mockWebServer: MockWebServer
    private lateinit var api: TaskApi

    @Before
    fun setUp() {
        mockWebServer = MockWebServer()
        api = Retrofit.Builder()
            .baseUrl(mockWebServer.url("/"))
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(TaskApi::class.java)
    }

    @Test
    fun `dado resposta valida da api, quando buscar tarefas, entao deserializa corretamente`() {
        // JSON copiado de apps/api/honey-money.postman_collection.json
        mockWebServer.enqueue(
            MockResponse()
                .setResponseCode(200)
                .setBody("""[{"id":1,"name":"Tarefa","priority":1,"statusCode":0,"description":null}]""")
        )

        val result = runBlocking { api.getTasks() }

        assertThat(result).hasSize(1)
        assertThat(result[0].name).isEqualTo("Tarefa")
        assertThat(result[0].description).isNull()
    }

    @After
    fun tearDown() = mockWebServer.shutdown()
}
```

#### Fluxo TDD para uma funcionalidade cross-app (API + Mobile)

**1. API — Red → Green → Refactor**
- Escrever testes do endpoint na API.
- Implementar o endpoint com seu `ResponseDto`.
- Commitar — o hook gera a Postman collection atualizada automaticamente.

**2. Mobile — teste de contrato (Red)**
- Consultar o shape de resposta em `apps/api/honey-money.postman_collection.json`.
- Escrever `*ApiTest` com MockWebServer usando o JSON exato da collection.
- O teste falha porque o `data class` ou a interface Retrofit ainda não existe.

**3. Mobile — data layer (Green)**
- Criar o `data class` em `data/remote/dto/` espelhando o `ResponseDto` da API.
- Criar/atualizar a interface Retrofit em `data/remote/`.
- Teste de contrato passa.

**4. Mobile — teste do repository (Red → Green)**
- Escrever teste do repository com MockWebServer + Room in-memory.
- Implementar o repository orquestrando remoto e local.

**5. Mobile — use case e ViewModel (Red → Green → Refactor)**
- Seguir o ciclo TDD normal com mocks do repository.

---

### Pre-commit hook

O hook raiz (`.githooks/pre-commit`) cobre **ambos os apps**:

- **API**: sempre executa `typecheck → lint → test → postman:generate`.
- **Mobile**: executa `./gradlew testDevelopmentDebugUnitTest` apenas se houver arquivos de `apps/mobile/` no staging (evita build Gradle desnecessário em commits só da API).

Ativado via `npm run prepare` dentro de `apps/api/`. Para reativar após um clone:

```bash
cd apps/api && npm run prepare
```
