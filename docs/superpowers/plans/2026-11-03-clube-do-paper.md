# Clube do Paper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site Next.js com página de apresentação, turmas com sessões ao vivo (contador / AO VIVO / gravação), inscrição via GitHub e painel admin restrito por allowlist.

**Architecture:** Next.js App Router renderiza páginas públicas no servidor lendo do MongoDB; Auth.js (JWT) faz login GitHub e marca `isAdmin` a partir de `ADMIN_GITHUB_LOGINS`; escritas via Server Actions validadas por zod que reverificam sessão/admin. Estado da sessão (antes/ao vivo/depois) é lógica pura testada e recalculada no cliente a cada segundo.

**Tech Stack:** Next.js 15, React 19, TypeScript, Auth.js v5 (`next-auth@beta`), `mongodb` driver, zod, Tailwind CSS v4, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-03-clube-do-paper-design.md`

## Global Constraints

- Só plano gratuito Vercel Hobby; nenhum serviço pago; vídeo/PDF sempre por URL externa.
- Env: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `MONGODB_URI`, `ADMIN_GITHUB_LOGINS` (vírgula, case-insensitive). DB name: `MONGODB_DB` opcional, default `clube-do-paper`.
- Leitura pública; inscrição exige login; qualquer escrita de admin verificada no servidor.
- Horários armazenados em UTC, exibidos em `America/Sao_Paulo`, locale `pt-BR`.
- Textos da UI em português.

## Review Focus

1. Usuário não-admin chamando Server Action de admin diretamente → deve falhar (teste em `requireAdmin`).
2. Login admin com maiúsculas diferentes (`GuiRossi` vs `guirossi`) / espaços na env → deve ser admin (teste em `isAdminLogin`).
3. Sessão exatamente no instante de início e no fim da duração → início = ao vivo, fim = depois (teste em `getSessionState`).
4. Inscrever duas vezes na mesma turma → idempotente (índice único + upsert).
5. Turma não publicada acessada por slug por visitante → 404.

---

### Task 1: Scaffold + lógica pura testada

**Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `.env.example`, `src/lib/session-state.ts`, `src/lib/admin.ts`, `src/lib/schemas.ts`, `src/lib/*.test.ts`

**Produces:**
- `getSessionState(inicio: Date, duracaoMin: number, now: Date): "antes" | "aovivo" | "depois"`
- `formatCountdown(ms: number): string` — ≥1 dia: `"faltam N dias"` (`"falta 1 dia"`); <1 dia: `"faltam Xh Ymin"`; <1h: `"faltam Ymin"`; <1min: `"começa em instantes"`.
- `isAdminLogin(login: string | null | undefined, envList?: string): boolean`
- `turmaInputSchema` (zod) e `TurmaInput` type; `slugify(s: string): string`.

- [ ] Testes: `getSessionState` (antes, início exato = aovivo, fim exato = depois); `formatCountdown` (5 dias, 1 dia, 3h20min, 45min, 30s); `isAdminLogin` (case/espaços, vazio, undefined); `slugify("Attention Is All You Need!") === "attention-is-all-you-need"`.
- [ ] Rodar `npx vitest run` → FAIL; implementar; → PASS.

### Task 2: Dados + Auth

**Files:** `src/lib/db.ts`, `src/lib/turmas.ts`, `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/guards.ts`

**Produces:**
- `getDb(): Promise<Db>` (cliente cacheado em `globalThis`).
- Tipos `Turma`, `Sessao`, `Inscricao`; `listTurmas({ incluirRascunhos })`, `getTurmaBySlug(slug, { incluirRascunhos })`, `getTurmaById(id)`, `listInscritos(turmaId)`, `isInscrito(turmaId, githubId)`, `findSessaoAoVivo(now)`.
- `auth`, `signIn`, `signOut`, `handlers`; session.user tem `login`, `githubId`, `isAdmin`.
- `requireUser()`, `requireAdmin()` lançam erro se não autorizado.

- [ ] `npx tsc --noEmit` passa.

### Task 3: Páginas públicas + UI de sessão

**Files:** `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/turmas/page.tsx`, `src/app/turmas/[slug]/page.tsx`, `src/app/turmas/[slug]/actions.ts`, `src/components/*`, `src/content/sobre.ts`

- [ ] `SessaoCard` (client) recalcula estado a cada 1s: antes → contador + link discreto; aovivo → selo "AO VIVO" pulsante + botão "Comece agora"; depois → gravação ou "gravação em breve".
- [ ] Banner ao vivo no topo da home e da turma.
- [ ] Inscrever/cancelar (Server Actions com `requireUser`, upsert idempotente).
- [ ] Turma não publicada → `notFound()` para não-admin.

### Task 4: Admin

**Files:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/turmas/nova/page.tsx`, `src/app/admin/turmas/[id]/page.tsx`, `src/app/admin/actions.ts`, `src/components/admin/TurmaForm.tsx`

- [ ] Layout chama `auth()`; não-admin → `notFound()`.
- [ ] Form com sessões dinâmicas (adicionar/remover); Actions `salvarTurma`, `excluirTurma` com `requireAdmin` + zod.
- [ ] Página de edição mostra inscritos.

### Task 5: Verificação + README

- [ ] `npx vitest run`, `npx tsc --noEmit`, `npm run build` passam.
- [ ] README: criar GitHub OAuth App, env vars na Vercel, como adicionar admins.
