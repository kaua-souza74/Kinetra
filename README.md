# Kinetra Forma

Loja acadêmica em React e Vite para o projeto Fábrica do Futuro do SENAI. O Kinetra Forma é um conceito de tênis que se expande para calçar e se molda ao pé.

## Rodar na máquina

```powershell
npm ci
npm run dev
```

Acesse a URL indicada pelo Vite. Em **Minha conta → Demonstração local**, escolha cliente ou administrador para apresentar o fluxo com dados armazenados apenas no navegador. Use dados fictícios.

## Supabase

1. No painel do projeto, abra **Connect** e copie a **Project URL** e a **Publishable key** desse mesmo projeto para `.env`. Use os nomes de `.env.example`. Reinicie o Vite após editar.
2. No SQL Editor desse projeto, execute `supabase/instalar.sql`. O script prepara as tabelas, as políticas de acesso, as funções da sacola e do checkout simulado e uma entrada de demonstração do Forma.
3. Em **Authentication → URL Configuration**, adicione as URLs do ambiente usado. Para a execução local, inclua `http://localhost:5173/entrar` e `http://localhost:5173/redefinir-senha`. Em hospedagem com histórico do navegador, configure o retorno de rotas para `index.html`.
4. Cadastre uma conta de teste e confirme seu e-mail. No SQL Editor, defina o papel de administrador para essa conta específica usando o UUID de **Authentication → Users**:

```sql
update public.perfis
set papel = 'admin'
where id = '<UUID_DO_USUARIO_DE_TESTE>';
```

No GitHub, identifique o administrador de teste pelo e-mail escolhido. Entregue a senha por um canal separado. O checkout registra valores e status simulados.

## Integrantes

- DS A — [nome 1], [nome 2]
- DS B — [nome 3], [nome 4]
- Multimídia — [nome 5], [nome 6]

Design e rotas em `SPEC-KINETRA.md`. Roteiros em `CASOS-DE-TESTE-KINETRA.md`.
