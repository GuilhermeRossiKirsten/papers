# Clube do Paper — Design

Data: 2026-11-03

## Intenção

Site do **Clube do Paper**: um grupo que se reúne para ler e debater papers (artigos científicos/técnicos). O clube organiza **turmas**, parecidas com uma "turma do livro", mas cada turma gira em torno de um paper. A turma é anunciada semanas antes, tem algumas sessões ao vivo em dias marcados e, depois que acontece, fica arquivada no site com as gravações e o paper debatido. Assim, o site serve ao mesmo tempo de vitrine, agenda e acervo.

## Objetivos

1. **Página inicial (visitante):** uma apresentação simples do Clube do Paper (o que é, como funciona), a lista das próximas turmas e um acesso ao arquivo das turmas que já aconteceram.
2. **Login com GitHub:** qualquer pessoa com conta no GitHub pode entrar.
3. **Turmas:** cada turma tem um paper e várias sessões ao vivo.
4. **Inscrição:** membros logados se inscrevem numa turma (e podem cancelar). A página da turma mostra os inscritos com o avatar do GitHub.
5. **Arquivo:** sessões que já passaram exibem a gravação. Turmas encerradas continuam acessíveis com o paper e todas as gravações.
6. **Admin:** uma tela onde só os usuários do GitHub listados manualmente criam, editam e removem turmas e sessões, e veem os inscritos.

## Fora do escopo (por enquanto)

- Comentários, chat ou fórum.
- Hospedagem de vídeo ou PDF no próprio site.
- Notificações por e-mail e lembretes.
- Gerenciar a lista de admins pela interface.
- Login por outros provedores.

## Anti-objetivos

- Qualquer custo: tudo precisa caber no **plano gratuito da Vercel** (Hobby) e no MongoDB que já existe lá.
- Bloquear a leitura: o conteúdo não deve ficar escondido atrás do login.
- Um usuário que não é admin conseguir alterar dados, mesmo chamando a API diretamente.

## Regras de acesso (decididas pelo usuário)

| Ação | Visitante | Logado (GitHub) | Admin |
|---|---|---|---|
| Ver página inicial, turmas, sessões, links ao vivo, gravações, paper | sim | sim | sim |
| Ver lista de inscritos de uma turma | sim (avatares) | sim | sim |
| Inscrever-se / cancelar inscrição | não (pede login) | sim | sim |
| Criar/editar/remover turmas e sessões | não | não | sim |
| Acessar `/admin` | não | não | sim |

"Qualquer visitante pode ler as coisas, mas para interagir apenas com conta GitHub."

## Modelo de dados

**Turma (`turmas`)**
- `slug` (único, usado na URL), `titulo`, `descricao` (markdown simples ou texto)
- `paper`: `{ titulo, autores, origem: "externo" | "proprio", url }`. O paper externo aponta para arXiv, DOI etc. O paper próprio aponta para um PDF num repositório do clube no GitHub.
- `status` calculado a partir das sessões: *em breve* (nenhuma sessão passou), *em andamento*, *encerrada* (todas passaram). Não é guardado.
- `publicada` (boolean): rascunhos só aparecem para admins.
- `criadoEm`, `atualizadoEm`

**Sessão**: guardada embutida na turma (`turma.sessoes[]`), porque são poucas por turma.
- `_id`, `titulo` (opcional, por exemplo "Parte 1: Introdução"), `inicio` (data/hora), `duracaoMin`
- `linkAoVivo` (Meet/Zoom/Discord/YouTube Live, externo)
- `gravacaoUrl` (YouTube/Drive, externo, preenchida depois)

**Inscrição (`inscricoes`)**: `{ turmaId, githubId, login, nome, avatarUrl, criadoEm }`, com índice único em `(turmaId, githubId)`.

**Usuários:** os dados do perfil vêm da sessão do GitHub. Não é preciso uma coleção própria além do que a inscrição já guarda.

## Exibição do link ao vivo

Os links são públicos para leitura. Cada sessão tem três estados visuais (pedido do usuário):

1. **Antes:** mostra a data e um **contador regressivo** ("faltam 5 dias"). Quando falta menos de 1 dia, o contador passa a mostrar horas e minutos ("faltam 3h 20min"). Ele atualiza sozinho no navegador. O link ao vivo também aparece, com menos destaque.
2. **Ao vivo** (do início até `inicio + duracaoMin`): o cartão da sessão ganha **destaque forte**, com selo vermelho pulsante "AO VIVO" e botão grande **"Comece agora"** que abre o link ao vivo. Quando há uma sessão ao vivo, ela também aparece em destaque no topo da página inicial e da página da turma.
3. **Depois:** destaca a gravação se houver, ou "gravação em breve" se ainda não houver.

Os estados são calculados no navegador a partir do horário atual, então a página muda de "antes" para "ao vivo" sem precisar recarregar.

## Admins

Lista em variável de ambiente `ADMIN_GITHUB_LOGINS` (logins separados por vírgula, comparação sem diferenciar maiúsculas e minúsculas). A verificação acontece **no servidor** em toda rota ou ação de admin, e não só escondendo botões. Para mudar a lista, basta editar a variável na Vercel e fazer um novo deploy.

## Como é feito (decisões técnicas, escolhas minhas e aceitas na conversa)

- **Next.js (App Router) + TypeScript**, hospedado na Vercel Hobby.
- **Auth.js (NextAuth v5)** com o provedor GitHub, usando sessão JWT (não precisa de adapter no banco).
- **MongoDB** pelo driver oficial `mongodb`, com conexão reaproveitada entre invocações serverless. A string de conexão fica em `MONGODB_URI` (fornecida pela integração da Vercel).
- **Tailwind CSS** para o visual.
- Escritas via Server Actions com validação (zod) e checagem de sessão e admin.
- Variáveis de ambiente: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `MONGODB_URI`, `ADMIN_GITHUB_LOGINS`.
- Um README explicando como criar o GitHub OAuth App (callback `https://<dominio>/api/auth/callback/github` e `http://localhost:3000/...` para testes locais) e como configurar as variáveis na Vercel.

## Páginas

- `/`: apresentação do clube, próximas turmas e link para o arquivo.
- `/turmas`: todas as turmas publicadas, separadas em *em breve / em andamento* e *encerradas*.
- `/turmas/[slug]`: paper, descrição, sessões (data, link ao vivo, gravação), inscritos e botão de inscrever/cancelar.
- `/admin`: lista de turmas, incluindo rascunhos.
- `/admin/turmas/nova` e `/admin/turmas/[id]`: formulário da turma com edição das sessões e lista de inscritos.
- Usuário que não é admin e acessa `/admin` recebe 404 ou é redirecionado.

## Deixado para quem for construir

- Visual e identidade (cores, tipografia, logo em texto). Deve ser limpo e com cara de "leitura acadêmica".
- Texto da apresentação do clube: placeholder fácil de editar num único arquivo.
- Fuso horário: guardar em UTC e exibir no fuso de `America/Sao_Paulo` (escolha minha).
