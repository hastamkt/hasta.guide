# IA para Leigos — plataforma (cadastro + assinatura)

App Next.js que coloca o catálogo atrás de login + assinatura paga, hospedável em
`iaparaleigos.hastamarketing.com`.

## O que já está pronto
- Cadastro por email/senha (`/signup`) e login com Google (`/login`).
- Checkout Stripe: mensal e anual, **ambos assinatura recorrente** (Stripe cobra
  automático a cada ciclo, sem precisar o cliente voltar pra pagar).
- Cupons cadastrados em `/admin/cupons` (não mais hardcoded):
  - desconto % pro cliente, comissão % pro afiliado, ou "libera sem cartão" (100% grátis,
    não passa pelo Stripe, sem comissão).
  - `BLACK2026` (70% off) e `CLIENTEVIP` (grátis sem cartão) são inseridos pelo seed
    (`npm run db:seed`) pra manter os dois cupons que já existiam.
- Afiliados cadastrados em `/admin/afiliados` (nome + contato pra pagar a comissão por fora —
  Pix, WhatsApp etc. Não há split automático no Stripe).
- `/admin/relatorio`: por cupom, mostra nº de clientes, quantos estão adimplentes
  (assinatura ativa) vs inadimplentes (pagamento atrasado/cancelado), e a comissão a pagar
  pro afiliado (do mês e total), calculada sobre o valor realmente pago em cada fatura
  (`invoice.paid` do Stripe grava um `Payment` no banco).
- Acesso ao `/admin` é restrito ao email em `ADMIN_EMAIL` (`src/lib/admin.ts`).
- Webhook do Stripe (`/api/webhooks/stripe`) atualiza o status da assinatura e grava os
  pagamentos no banco.
- `/painel` mostra status da assinatura e libera o link do catálogo (`/catalogo.html`,
  cópia estática do artifact publicado).

## O que falta você fazer (contas e configuração — não posso criar por você)
1. **Banco de dados**: suba um Postgres (Vercel Postgres, Supabase, Neon, Railway — qualquer
   um serve) e cole a URL em `DATABASE_URL`.
2. **Stripe**: crie conta em stripe.com, pegue as chaves em Developers → API keys.
   - Crie dois produtos recorrentes: "Mensal" (intervalo "month", R$ 9,90) e "Anual"
     (intervalo "year"), copie os `price_...` pra `STRIPE_PRICE_MONTHLY` e `STRIPE_PRICE_ANNUAL`.
   - Crie o endpoint de webhook apontando pra `https://iaparaleigos.hastamarketing.com/api/webhooks/stripe`,
     evento mínimo: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
     `customer.subscription.deleted`. Copie o signing secret pra `STRIPE_WEBHOOK_SECRET`.
3. **Login com Google**: console.cloud.google.com → crie um projeto → OAuth consent screen →
   Credentials → OAuth client ID (tipo "Web application") → redirect URI:
   `https://iaparaleigos.hastamarketing.com/api/auth/callback/google`.
4. **Domínio**: no DNS de `hastamarketing.com`, crie um CNAME `iaparaleigos` apontando
   pro host (ex.: `cname.vercel-dns.com` se usar Vercel) ou um registro A se preferir outro
   provedor. Configure o domínio custom no painel da hospedagem escolhida.
5. Copie `.env.example` pra `.env`, preenche tudo e define `ADMIN_EMAIL` com seu email
   (o mesmo que você usa pra logar no site) pra liberar o `/admin`.
6. Depois do primeiro `npm run db:push`, rode `npm run db:seed` pra criar os cupons
   `BLACK2026` e `CLIENTEVIP`. Novos cupons (com comissão de afiliado) se cadastram em
   `/admin/cupons`, sem precisar editar código.

## Cadastrando um cupom de afiliado (ex.: Jefferson / jick50)
1. `/admin/afiliados` → cadastra "Jefferson" com o contato pra pagar a comissão.
2. `/admin/cupons` → código `JICK50`, 50% desconto cliente, 40% comissão, afiliado = Jefferson.
3. `/admin/relatorio` mostra, pra esse cupom: nº de clientes, quantos estão em dia, e a
   comissão a pagar pro Jefferson (sobre o valor que o cliente realmente pagou — ex.:
   mensalidade R$ 9,90 com 50% off = R$ 4,95 pago, 40% disso = R$ 1,98 de comissão por mês
   enquanto o cliente continuar pagando).

## Rodar local
```
npm install
npm run db:push
npm run dev
```

## Segurança
- Senhas com bcrypt (12 rounds), nunca em texto puro.
- Webhook do Stripe valida assinatura (`constructEvent`) antes de confiar no payload.
- `/painel` e `/catalogo.html` exigem login (middleware). **Pendência conhecida**: o
  middleware roda em edge e hoje só confere login, não assinatura ativa (Prisma não é
  edge-friendly sem Accelerate) — quem logar sem pagar não vê o link no `/painel`, mas
  acessar `/catalogo.html` direto por URL só é bloqueado por não estar logado, não por
  não ter pago. Pra fechar esse buraco: habilite Prisma Accelerate, ou mova a checagem de
  assinatura pra uma rota Node (`/api/catalogo` servindo o arquivo) em vez de servir estático.
- Depois de publicado com URL real, rode a skill `hawkscan` (scan de segurança automático)
  contra a URL de produção.
- Nunca commite `.env` (já no padrão ignorado pelo Next/git).
