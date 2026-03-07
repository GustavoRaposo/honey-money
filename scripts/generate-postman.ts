/**
 * Gera/atualiza a Postman Collection a partir dos controllers NestJS.
 * Executado automaticamente pelo hook pre-commit via `npm run postman:generate`.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const OUTPUT = path.join(ROOT, 'honey-money.postman_collection.json');

// ID fixo para evitar diff desnecessário a cada geração
const COLLECTION_ID = 'f47ac10b-58cc-4372-a567-honey-money-01';

// Métodos HTTP que não devem ter corpo
const BODYLESS_METHODS = new Set(['GET', 'HEAD', 'DELETE']);

// ── Utilitários de arquivo ────────────────────────────────────────────────────

function findFiles(dir: string, suffix: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full, suffix));
    } else if (entry.name.endsWith(suffix) && !entry.name.endsWith('.spec.ts')) {
      results.push(full);
    }
  }
  return results;
}

// ── Parsing de DTOs ───────────────────────────────────────────────────────────

interface Field {
  name: string;
  example: unknown;
}

const dtoCache = new Map<string, Field[]>();

function parseDtoFields(className: string, dtoFiles: string[]): Field[] {
  if (dtoCache.has(className)) return dtoCache.get(className)!;

  for (const file of dtoFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (!new RegExp(`class\\s+${className}\\b`).test(content)) continue;

    const fields: Field[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      // Captura @ApiProperty({ example: 'texto' }) ou @ApiProperty({ example: 123 })
      const m = lines[i].match(/@ApiProperty\([^)]*example:\s*(?:'([^']*)'|([\d.]+))/);
      if (!m) continue;

      const example: unknown = m[1] !== undefined ? m[1] : Number(m[2]);

      // Localiza o nome do campo nas próximas linhas (após outros decorators)
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const fieldMatch = lines[j].match(/^\s+(\w+)\s*[?!]?\s*:/);
        if (fieldMatch && fieldMatch[1] !== 'constructor') {
          fields.push({ name: fieldMatch[1], example });
          break;
        }
      }
    }

    dtoCache.set(className, fields);
    return fields;
  }

  dtoCache.set(className, []);
  return [];
}

// ── Parsing de Controllers ────────────────────────────────────────────────────

interface Route {
  method: string;
  path: string;
  summary: string;
  needsAuth: boolean;
  body?: Record<string, unknown>;
}

/**
 * Determina os limites do bloco de decorators de um método.
 *
 * Retorna [blockStart, blockEnd] onde:
 *   blockStart = primeira linha do grupo de decorators (inclusive)
 *   blockEnd   = linha da assinatura `async methodName(...)` (inclusive)
 *
 * Exemplo:
 *   blockStart → @Post()
 *                @ApiOperation(...)
 *   blockEnd   → async create(@Body() dto: CreateUserDto): Promise<...> {
 */
function findMethodBlock(lines: string[], httpDecoratorLine: number): [number, number] {
  // Vai para trás incluindo linhas vazias e outros decorators (@)
  let blockStart = httpDecoratorLine;
  while (blockStart > 0) {
    const prev = lines[blockStart - 1].trim();
    if (prev === '' || prev.startsWith('@')) {
      blockStart--;
    } else {
      break;
    }
  }

  // Vai para frente até o fim da assinatura do método (fecha o parêntese)
  let blockEnd = httpDecoratorLine;
  while (blockEnd < lines.length - 1) {
    blockEnd++;
    const trimmed = lines[blockEnd].trim();

    const isMethodSignature =
      trimmed.startsWith('async ') ||
      trimmed.startsWith('public async') ||
      trimmed.startsWith('private async') ||
      trimmed.startsWith('protected async');

    if (isMethodSignature) {
      // Rastreia profundidade de parênteses para capturar assinaturas multiline
      let depth =
        (trimmed.match(/\(/g) ?? []).length - (trimmed.match(/\)/g) ?? []).length;
      while (depth > 0 && blockEnd < lines.length - 1) {
        blockEnd++;
        const next = lines[blockEnd].trim();
        depth += (next.match(/\(/g) ?? []).length - (next.match(/\)/g) ?? []).length;
      }
      break;
    }

    if (!trimmed.startsWith('@') && trimmed !== '') {
      break;
    }
  }

  return [blockStart, blockEnd];
}

function parseClassLevelAuth(content: string): boolean {
  // Detecta @UseGuards(JwtAuthGuard) ou @ApiBearerAuth() aplicados na classe
  const classMatch = content.search(/export\s+class\s+\w+/);
  if (classMatch === -1) return false;
  const header = content.substring(0, classMatch);
  return (
    header.includes('@UseGuards(JwtAuthGuard)') || header.includes('@ApiBearerAuth()')
  );
}

function parseController(filePath: string, dtoFiles: string[]): Route[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const routes: Route[] = [];

  const prefixMatch = content.match(/@Controller\(\s*'([^']*)'\s*\)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';

  const classLevelAuth = parseClassLevelAuth(content);

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const methodMatch = lines[i].match(
      /@(Get|Post|Put|Patch|Delete)\(\s*(?:'([^']*)')?\s*\)/i,
    );
    if (!methodMatch) continue;

    const httpMethod = methodMatch[1].toUpperCase();
    const suffix = methodMatch[2] ?? '';
    const segments = [prefix, suffix].filter(Boolean);
    const fullPath = segments.length ? `/${segments.join('/')}` : '/';

    // Limita o scan ao bloco de decorators deste método
    const [blockStart, blockEnd] = findMethodBlock(lines, i);

    let summary = '';
    let needsAuth = false;
    let bodyClassName: string | undefined;

    for (let j = blockStart; j <= blockEnd; j++) {
      const line = lines[j];

      const sumMatch = line.match(/@ApiOperation\([^)]*summary:\s*'([^']+)'/);
      if (sumMatch) summary = sumMatch[1];

      if (
        line.includes('@UseGuards(JwtAuthGuard)') ||
        line.includes('@ApiBearerAuth()')
      ) {
        needsAuth = true;
      }

      if (classLevelAuth) needsAuth = true;

      // Só busca @Body() para métodos que aceitam corpo
      if (!BODYLESS_METHODS.has(httpMethod)) {
        const bodyMatch = line.match(/@Body\(\)\s+\w+:\s+(\w+)/);
        if (bodyMatch) bodyClassName = bodyMatch[1];
      }
    }

    let body: Record<string, unknown> | undefined;
    if (bodyClassName) {
      const fields = parseDtoFields(bodyClassName, dtoFiles);
      if (fields.length > 0) {
        body = Object.fromEntries(fields.map((f) => [f.name, f.example]));
      }
    }

    routes.push({ method: httpMethod, path: fullPath, summary, needsAuth, body });
  }

  return routes;
}

// ── Construção da Collection ──────────────────────────────────────────────────

function buildItem(route: Route): object {
  const pathSegments = route.path.replace(/^\//, '').split('/').filter(Boolean);
  const rawUrl =
    pathSegments.length > 0
      ? `{{baseUrl}}/${pathSegments.join('/')}`
      : '{{baseUrl}}';

  const headers: object[] = [];

  if (route.body) {
    headers.push({ key: 'Content-Type', value: 'application/json' });
  }

  const pathVariables = pathSegments
    .filter((s) => s.startsWith(':'))
    .map((s) => ({ key: s.slice(1), value: '1', type: 'string' }));

  const request: Record<string, unknown> = {
    method: route.method,
    header: headers,
    url: {
      raw: rawUrl,
      host: ['{{baseUrl}}'],
      path: pathSegments,
      ...(pathVariables.length > 0 && { variable: pathVariables }),
    },
  };

  if (route.needsAuth) {
    request.auth = {
      type: 'bearer',
      bearer: [{ key: 'token', value: '{{token}}', type: 'string' }],
    };
  }

  if (route.body) {
    request.body = {
      mode: 'raw',
      raw: JSON.stringify(route.body, null, 2),
      options: { raw: { language: 'json' } },
    };
  }

  return {
    name: route.summary || `${route.method} ${route.path}`,
    request,
    response: [],
  };
}

function buildCollection(routes: Route[]): object {
  return {
    info: {
      _postman_id: COLLECTION_ID,
      name: 'Honey Money API',
      description: 'Sistema de gerenciamento de tarefas e controle de gastos',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      { key: 'baseUrl', value: 'http://localhost:5000', type: 'string' },
      { key: 'token', value: '', type: 'string' },
    ],
    item: routes.map(buildItem),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  const controllerFiles = findFiles(SRC_DIR, '.controller.ts');
  const dtoFiles = findFiles(SRC_DIR, '.dto.ts');

  const routes: Route[] = [];
  for (const file of controllerFiles) {
    routes.push(...parseController(file, dtoFiles));
  }

  const collection = buildCollection(routes);
  fs.writeFileSync(OUTPUT, JSON.stringify(collection, null, 2) + '\n');

  const rel = path.relative(ROOT, OUTPUT);
  console.log(`Postman collection atualizada: ${rel} (${routes.length} rota(s))`);
}

main();
