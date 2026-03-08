# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Visão Geral do Projeto

**honey-money-mobile** é um app Android de **gerenciamento de tarefas e controle financeiro**, desenvolvido em Kotlin com Jetpack Compose. Atualmente no estado inicial de scaffold com uma única `MainActivity`.

- **Min SDK**: 24 | **Target/Compile SDK**: 36
- **AGP**: 9.0.1 | **Kotlin**: 2.0.21
- **UI**: Jetpack Compose + Material3 com dynamic color (Android 12+)

## Comandos de Build

```bash
# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Rodar todos os testes unitários
./gradlew test

# Rodar uma classe de teste específica
./gradlew test --tests "dev.gustavoraposo.honey_money_mobile.ExampleUnitTest"

# Rodar testes instrumentados (requer dispositivo/emulador conectado)
./gradlew connectedAndroidTest

# Limpar build
./gradlew clean
```

No Windows, use `gradlew.bat` em vez de `./gradlew`.

## Arquitetura

App Android single-module (`:app`) seguindo o padrão **MVVM** com separação estrita de camadas. O código-fonte fica em `app/src/main/java/dev/gustavoraposo/honey_money_mobile/`.

### Estrutura de Pacotes

```
honey_money_mobile/
├── data/
│   ├── local/          # Room DAOs, Database, Entities
│   ├── remote/         # Retrofit API interfaces, DTOs
│   └── repository/     # Implementações dos repositories
├── domain/
│   ├── model/          # Modelos de domínio (entidades de negócio)
│   ├── repository/     # Interfaces dos repositories
│   └── usecase/        # Use cases (um por arquivo, uma responsabilidade)
├── ui/
│   ├── feature/        # Telas organizadas por funcionalidade (tasks/, finance/)
│   │   └── <feature>/
│   │       ├── <Feature>Screen.kt
│   │       └── <Feature>ViewModel.kt
│   └── theme/          # Theme.kt, Color.kt, Type.kt
├── di/                 # Módulos Hilt (DatabaseModule, NetworkModule, RepositoryModule)
└── MainActivity.kt
```

### Camadas e Responsabilidades

- **`domain/model`** — classes de dados puras, sem dependências do Android
- **`domain/repository`** — interfaces que definem contratos de acesso a dados
- **`domain/usecase`** — lógica de negócio; cada use case tem um único método `invoke()`
- **`data/repository`** — implementações concretas dos repositories, fazendo ponte entre `local` e `remote`
- **`data/local`** — Room: `@Entity`, `@Dao`, `@Database`
- **`data/remote`** — Retrofit: `@Api` interfaces e DTOs de resposta
- **`ui/.../ViewModel`** — expõe `StateFlow`/`LiveData`, chama use cases, sem lógica de negócio
- **`di/`** — módulos Hilt com `@Module` + `@InstallIn`

### Stack de Bibliotecas

| Função                  | Biblioteca                  |
|-------------------------|-----------------------------|
| Persistência local      | Room                        |
| Chamadas REST           | Retrofit                    |
| Injeção de dependência  | Dagger/Hilt                 |
| UI                      | Jetpack Compose + Material3 |

As dependências são gerenciadas via version catalog em `gradle/libs.versions.toml`.

## Metodologia de Desenvolvimento: TDD

**Todo desenvolvimento deve seguir o ciclo Red → Green → Refactor.**

### Fluxo obrigatório

1. **RED** — Escrever o teste antes da implementação. O teste deve falhar.
2. **GREEN** — Implementar o mínimo necessário para o teste passar.
3. **REFACTOR** — Melhorar o código mantendo todos os testes verdes.

Nunca entregar uma funcionalidade sem que os testes correspondentes já existam e passem.

### Estrutura de Testes

```
app/src/
├── test/                          # Testes unitários (JUnit + Mockk/Mockito)
│   └── java/dev/gustavoraposo/honey_money_mobile/
│       ├── domain/
│       │   └── usecase/           # Testes dos use cases
│       ├── data/
│       │   └── repository/        # Testes dos repositories (com mocks)
│       └── ui/
│           └── <feature>/         # Testes dos ViewModels
└── androidTest/                   # Testes E2E / instrumentados
    └── java/dev/gustavoraposo/honey_money_mobile/
        ├── data/
        │   └── local/             # Testes do Room (in-memory database)
        └── ui/
            └── <feature>/         # Testes de UI com Compose Testing
```

### Convenções de Teste

- Nome dos testes: `dado_<contexto>_quando_<acao>_entao_<resultado>` (ou em inglês: `given_when_then`)
- Use cases testados com repositórios mockados
- ViewModels testados com use cases mockados
- Room testado com banco em memória (`Room.inMemoryDatabaseBuilder`)
- Testes de UI com `ComposeTestRule` do `androidx.compose.ui.test`

## Fluxo de Desenvolvimento: GitHub Flow

O projeto adota **GitHub Flow**: toda branch nasce da `master` e é mergeada de volta na `master`.

### Nomenclatura de Branches

```
<tipo>/<descricao-curta-em-kebab-case>
```

| Tipo        | Uso                                               |
|-------------|---------------------------------------------------|
| `feat/`     | Nova funcionalidade                               |
| `fix/`      | Correção de bug                                   |
| `refactor/` | Refatoração sem mudança de comportamento          |
| `test/`     | Adição ou correção de testes                      |
| `chore/`    | Tarefas de manutenção (deps, build, CI)           |
| `docs/`     | Documentação                                      |

Exemplos: `feat/tela-de-cadastro`, `fix/crash-no-login`, `refactor/viewmodel-auth`

### Nomenclatura de Commits

Seguir **Conventional Commits**:

```
<tipo>(<escopo>): <descrição no imperativo, em português>
```

Exemplos:
```
feat(auth): adiciona tela de cadastro com validação de e-mail
fix(login): corrige crash ao submeter formulário vazio
test(auth): adiciona testes unitários para LoginUseCase
chore(deps): atualiza Retrofit para 2.11.0
```

### Regras

- Nunca commitar diretamente na `master`
- Toda branch deve ter PR antes do merge
- O pre-commit hook (abaixo) bloqueia commits com testes falhando

## Pre-commit Hook

O arquivo `.git/hooks/pre-commit` executa todos os testes unitários antes de cada commit. Se qualquer teste falhar, o commit é bloqueado até que os erros sejam corrigidos e os testes passem.

Para instalar/reinstalar o hook manualmente:

```bash
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

O hook roda: `./gradlew testDevelopmentDebugUnitTest`