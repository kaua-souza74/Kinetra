# Kinetra

## Calçados adaptativos

A Kinetra apresenta o Adapt X 2050, um conceito de calçado esportivo com ajuste adaptativo. A experiência de loja foi desenvolvida em **React + Vite**, com **Supabase** para autenticação e dados. Pagamentos e acompanhamento de pedidos são simulados; não há cobrança real nem conexão com um tênis físico.

## Integrantes

| Área | Integrante | Responsabilidade |
| --- | --- | --- |
| Dev A | Gabriel Bastos | Banco de dados e back-end |
| Dev A | Giovanni Moretti | Banco de dados e back-end |
| Dev B | Kauã de Souza Oliveira | Front-end |
| Dev B | Lucas Lima Silva | Front-end |
| Multimídia | Kathleen Silva | Identidade visual e produto |
| Multimídia | Isabelly Vaz | Identidade visual e produto |

## Funcionalidades

- Landing page, loja e coleção com variantes de cor do tênis Kinetra.
- Página do produto com escolha de cor, numeração e recebimento.
- Sacola e checkout com pagamento simulado.
- Cadastro, login, recuperação de senha e área da conta.
- Página “Como funciona”, simulador virtual de ajuste e painel administrativo.

## Como executar

É necessário ter **Node.js** e **npm** instalados. No terminal:

```powershell
git clone https://github.com/kaua-souza74/Kinetra.git
cd Kinetra
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite no terminal, normalmente `http://localhost:5173`. Para conferir a compilação e o código:

```powershell
npm run lint
npm run build
```

### Uso sem Supabase

Sem as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, cadastro, login, conta, sacola, pedidos, produtos e estoque usam o armazenamento deste navegador. Cada conta local mantém sua própria sacola; a senha é armazenada como hash. Esses dados não sincronizam entre navegadores ou dispositivos. O botão **ADM** abre o painel local para editar o catálogo e o estoque.

## Configuração do Supabase

1. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com a URL e a chave publicável **do mesmo projeto**. Reinicie o Vite após editar o arquivo.
2. No **SQL Editor** de um projeto novo, execute [`supabase/instalar.sql`](supabase/instalar.sql). O script cria as tabelas, políticas de acesso e funções usadas pela loja.
3. Em **Authentication → URL Configuration**, configure os redirecionamentos de login e recuperação de senha para o endereço usado. No ambiente local padrão, inclua `http://localhost:5173/entrar` e `http://localhost:5173/redefinir-senha`. Se o Vite escolher outra porta, use a porta exibida no terminal.
4. Crie e confirme uma conta de teste no Supabase Auth. Para torná-la administradora, copie o UUID em **Authentication → Users** e execute no SQL Editor:

```sql
update public.perfis
set papel = 'admin'
where id = '<UUID_DO_USUARIO_DE_TESTE>';
```

Não existe e-mail ou senha padrão de administrador no Supabase real. A equipe deve informar o e-mail da conta de teste na entrega e compartilhar a senha separadamente. **Não publique senhas, tokens ou chaves privadas no GitHub.** O arquivo `.env` está no `.gitignore`.

## Documentação

- [`SPEC-KINETRA.md`](SPEC-KINETRA.md): páginas, navegação e identidade visual.
- [`CASOS-DE-TESTE-KINETRA.md`](CASOS-DE-TESTE-KINETRA.md): roteiros de testes.
- [`CHECKLIST-ENTREGAS-KINETRA.md`](CHECKLIST-ENTREGAS-KINETRA.md): entregas do projeto.

