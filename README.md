# Clube do Paper

Site do Clube do Paper: apresentação, turmas com sessões ao vivo (contador → **AO VIVO / Comece agora** → gravação), inscrição com GitHub e painel admin.

Stack: Next.js 16 · Auth.js (GitHub) · MongoDB · Tailwind. Roda no plano gratuito da Vercel.

## 1. Criar o GitHub OAuth App

1. Acesse https://github.com/settings/developers → **New OAuth App**.
2. **Homepage URL:** `https://SEU-DOMINIO.vercel.app`
3. **Authorization callback URL:** `https://SEU-DOMINIO.vercel.app/api/auth/callback/github`
4. Copie o **Client ID** e gere um **Client Secret**.

> Para testar localmente, crie um segundo OAuth App com `http://localhost:3000` e callback `http://localhost:3000/api/auth/callback/github` (um OAuth App aceita só uma URL de callback).

## 2. Variáveis de ambiente (Vercel → Project → Settings → Environment Variables)

| Variável | Valor |
|---|---|
| `AUTH_SECRET` | gere com `npx auth secret` (ou qualquer string aleatória longa) |
| `AUTH_GITHUB_ID` | Client ID do OAuth App |
| `AUTH_GITHUB_SECRET` | Client Secret do OAuth App |
| `MONGODB_URI` | já preenchida pela integração MongoDB da Vercel |
| `MONGODB_DB` | opcional, padrão `clube-do-paper` |
| `ADMIN_GITHUB_LOGINS` | logins com acesso ao `/admin`, separados por vírgula. Ex.: `guirossi,fulana` |

**Para adicionar/remover admins:** edite `ADMIN_GITHUB_LOGINS` e faça um redeploy. A checagem é feita no servidor em toda ação de admin — esconder o botão não é a única proteção.

## 3. Rodar localmente

```bash
cp .env.example .env.local   # preencha os valores
npm install
npm run dev                  # http://localhost:3000
npm test                     # testes de lógica
```

## Como usar

- **Admin → Nova turma:** título, descrição, paper (link externo ou PDF próprio no GitHub) e sessões (data/hora em horário de Brasília, duração, link ao vivo, gravação).
- Deixe **Publicada** desmarcado para salvar como rascunho (só admins veem).
- Depois de cada sessão, edite a turma e cole o link da gravação.
- Textos da página inicial: `src/content/sobre.ts`.

## Como a sessão aparece

- **Antes:** data + contador ("faltam 5 dias e 3h", depois "faltam 3h 20min").
- **Durante** (início até início + duração): selo vermelho **AO VIVO** e botão **Comece agora**; também aparece um banner no topo da home e da turma.
- **Depois:** botão da gravação, ou "gravação em breve".

A troca de estado acontece sozinha no navegador, sem recarregar.
