# CLAUDE.md — honey-money monorepo

## Estrutura

```
honey-money/
├── apps/
│   ├── api/      # Backend NestJS — ver apps/api/CLAUDE.md
│   └── mobile/   # App Android (Kotlin + Jetpack Compose)
├── package.json  # Metadado do monorepo (sem workspaces)
└── .gitignore
```

## Apps

| App | Tecnologia | Diretório |
|-----|-----------|-----------|
| API | NestJS + Prisma + MySQL | `apps/api/` |
| Mobile | Android Kotlin + Jetpack Compose + Hilt | `apps/mobile/` |

## Comandos por app

```bash
# API
cd apps/api
npm install
npm run start:dev

# Mobile — abrir no Android Studio
# apps/mobile/
```

## Git — GitHub Flow

Branch sempre a partir de `master`. Prefixos:

```
feat/<descricao>
fix/<descricao>
chore/<descricao>
refactor/<descricao>
test/<descricao>
docs/<descricao>
```

Para guia completo da API, ver `apps/api/CLAUDE.md`.
