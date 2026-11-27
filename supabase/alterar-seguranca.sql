-- Aplique no SQL Editor do projeto Supabase da Kinetra.
-- Recria o conjunto de RLS das tabelas da loja e atualiza o checkout demonstrativo.
-- Este script substitui todas as policies existentes nas tabelas listadas abaixo.
begin;

create schema if not exists kinetra_privado;
revoke all on schema kinetra_privado from public, anon, authenticated;
grant usage on schema kinetra_privado to anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Colunas usadas pela sacola, pelo pedido e pela chave de idempotência.
alter table public.carrinho_itens add column if not exists cor text not null default 'gelo';
alter table public.carrinho_itens add column if not exists metodo text not null default 'entrega';
alter table public.pedido_itens add column if not exists cor text not null default 'gelo';
alter table public.pedidos add column if not exists chave uuid;
alter table public.carrinho_itens drop constraint if exists carrinho_itens_cor_check;
alter table public.carrinho_itens drop constraint if exists carrinho_itens_metodo_check;
alter table public.pedido_itens drop constraint if exists pedido_itens_cor_check;
update public.carrinho_itens set cor = 'gelo' where cor is null or cor not in ('gelo','marinho','areia','grafite','laranja');
update public.carrinho_itens set metodo = 'entrega' where metodo is null or metodo not in ('entrega','retirada');
update public.pedido_itens set cor = 'gelo' where cor is null or cor not in ('gelo','marinho','areia','grafite','laranja');
alter table public.carrinho_itens alter column cor set default 'gelo';
alter table public.carrinho_itens alter column cor set not null;
alter table public.carrinho_itens alter column metodo set default 'entrega';
alter table public.carrinho_itens alter column metodo set not null;
alter table public.pedido_itens alter column cor set default 'gelo';
alter table public.pedido_itens alter column cor set not null;
alter table public.carrinho_itens add constraint carrinho_itens_cor_check check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.carrinho_itens add constraint carrinho_itens_metodo_check check (metodo in ('entrega','retirada'));
alter table public.pedido_itens add constraint pedido_itens_cor_check check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.carrinho_itens drop constraint if exists carrinho_itens_carrinho_id_estoque_id_key;
create unique index if not exists kinetra_carrinho_variante on public.carrinho_itens(carrinho_id, estoque_id, cor);
create unique index if not exists kinetra_pedido_chave on public.pedidos(usuario_id, chave);

-- Só o dono do projeto deve promover uma conta a admin. Clientes não alteram papel.
alter table public.perfis add column if not exists papel text not null default 'cliente';
update public.perfis set papel = 'cliente' where papel is null or papel not in ('cliente','admin');
alter table public.perfis alter column papel set default 'cliente';
alter table public.perfis alter column papel set not null;
alter table public.perfis drop constraint if exists perfis_papel_check;
alter table public.perfis add constraint perfis_papel_check check (papel in ('cliente','admin'));

create or replace function kinetra_privado.e_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id = (select auth.uid()) and papel = 'admin');
$$;
revoke all on function kinetra_privado.e_admin() from public, anon, authenticated;
grant execute on function kinetra_privado.e_admin() to anon, authenticated;

-- Remove policies antigas que poderiam ampliar acesso por combinação permissiva.
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename = any(array['perfis','produtos','produto_imagens','estoque','carrinhos','carrinho_itens','enderecos','pedidos','pedido_itens','pagamentos'])
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end;
$$;

alter table public.perfis enable row level security;
alter table public.produtos enable row level security;
alter table public.produto_imagens enable row level security;
alter table public.estoque enable row level security;
alter table public.carrinhos enable row level security;
alter table public.carrinho_itens enable row level security;
alter table public.enderecos enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;
alter table public.pagamentos enable row level security;

revoke all on public.perfis, public.produtos, public.produto_imagens, public.estoque,
  public.carrinhos, public.carrinho_itens, public.enderecos, public.pedidos,
  public.pedido_itens, public.pagamentos from public, anon, authenticated;
grant select on public.produtos, public.produto_imagens, public.estoque to anon, authenticated;
grant insert, update, delete on public.produtos, public.produto_imagens, public.estoque to authenticated;
grant select on public.perfis, public.pedido_itens to authenticated;
grant update (nome, numeracao_preferida) on public.perfis to authenticated;
grant select, insert, update, delete on public.carrinhos, public.carrinho_itens, public.enderecos to authenticated;
grant select on public.pedidos, public.pagamentos to authenticated;
grant update (status, status_pagamento, atualizado_em) on public.pedidos to authenticated;
grant update (status, atualizado_em) on public.pagamentos to authenticated;

create policy kinetra_perfil_select on public.perfis for select to authenticated
  using (id = (select auth.uid()));
create policy kinetra_perfil_update on public.perfis for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy kinetra_produto_select on public.produtos for select to anon, authenticated
  using (ativo or (select kinetra_privado.e_admin()));
create policy kinetra_imagem_select on public.produto_imagens for select to anon, authenticated
  using (exists(select 1 from public.produtos p where p.id = produto_id and (p.ativo or (select kinetra_privado.e_admin()))));
create policy kinetra_estoque_select on public.estoque for select to anon, authenticated
  using (exists(select 1 from public.produtos p where p.id = produto_id and (p.ativo or (select kinetra_privado.e_admin()))));
create policy kinetra_produto_admin on public.produtos for all to authenticated
  using ((select kinetra_privado.e_admin())) with check ((select kinetra_privado.e_admin()));
create policy kinetra_imagem_admin on public.produto_imagens for all to authenticated
  using ((select kinetra_privado.e_admin())) with check ((select kinetra_privado.e_admin()));
create policy kinetra_estoque_admin on public.estoque for all to authenticated
  using ((select kinetra_privado.e_admin())) with check ((select kinetra_privado.e_admin()));

create policy kinetra_sacola on public.carrinhos for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy kinetra_itens_sacola on public.carrinho_itens for all to authenticated
  using (exists(select 1 from public.carrinhos c where c.id = carrinho_id))
  with check (exists(select 1 from public.carrinhos c where c.id = carrinho_id));
create policy kinetra_endereco on public.enderecos for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

create policy kinetra_pedido_select on public.pedidos for select to authenticated
  using (usuario_id = (select auth.uid()) or (select kinetra_privado.e_admin()));
create policy kinetra_pedido_update on public.pedidos for update to authenticated
  using ((select kinetra_privado.e_admin())) with check ((select kinetra_privado.e_admin()));
create policy kinetra_itens_pedido on public.pedido_itens for select to authenticated
  using (exists(select 1 from public.pedidos p where p.id = pedido_id));
create policy kinetra_pagamento_select on public.pagamentos for select to authenticated
  using (exists(select 1 from public.pedidos p where p.id = pedido_id));
create policy kinetra_pagamento_update on public.pagamentos for update to authenticated
  using ((select kinetra_privado.e_admin())) with check ((select kinetra_privado.e_admin()));

-- A aprovação é apenas demonstrativa: não existe cobrança nem baixa/reserva de estoque.
create or replace function kinetra_privado.checkout(endereco_id uuid, entrega text, metodo_pagamento text, resultado text, pedido_chave uuid)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  usuario uuid := auth.uid();
  sacola uuid;
  pedido bigint;
  endereco jsonb;
  parcial numeric(12,2) := 0;
  custo_frete numeric(12,2);
  dados_itens jsonb;
  linha record;
begin
  if usuario is null or pedido_chave is null or entrega is null or entrega not in ('entrega','retirada')
    or metodo_pagamento is null or metodo_pagamento not in ('pix','cartao')
    or resultado is distinct from 'aprovado' then raise exception 'Pagamento simulado inválido.'; end if;

  select id into sacola from public.carrinhos where usuario_id = usuario for update;
  select id into pedido from public.pedidos where usuario_id = usuario and chave = pedido_chave;
  if pedido is not null then return pedido; end if;
  if sacola is null then raise exception 'Sacola vazia.'; end if;
  custo_frete := case when entrega = 'entrega' then 24.90 else 0 end;

  if entrega = 'retirada' then endereco := '{"retirada":true}'::jsonb;
  else
    select to_jsonb(e) - 'id' - 'usuario_id' - 'criado_em' into endereco
    from public.enderecos e where e.id = endereco_id and e.usuario_id = usuario;
    if endereco is null
      or nullif(btrim(endereco->>'destinatario'),'') is null
      or nullif(btrim(endereco->>'logradouro'),'') is null
      or nullif(btrim(endereco->>'numero'),'') is null
      or nullif(btrim(endereco->>'bairro'),'') is null
      or nullif(btrim(endereco->>'cidade'),'') is null
      or regexp_replace(coalesce(endereco->>'cep',''), '[^0-9]', '', 'g') !~ '^[0-9]{8}$'
      or upper(btrim(coalesce(endereco->>'estado',''))) !~ '^[A-Z]{2}$'
    then raise exception 'Complete os dados do endereço antes de continuar.'; end if;
  end if;

  perform e.id from public.estoque e
    where exists(select 1 from public.carrinho_itens i where i.carrinho_id = sacola and i.estoque_id = e.id)
    order by e.id for update of e;

  select jsonb_agg(jsonb_build_object(
    'estoque_id', e.id, 'produto_id', p.id, 'nome', p.nome, 'preco', p.preco,
    'numeracao', e.numeracao, 'quantidade', i.quantidade, 'cor', i.cor,
    'disponivel', e.quantidade, 'ativo', p.ativo
  )), coalesce(sum(i.quantidade * p.preco),0)
  into dados_itens, parcial
  from public.carrinho_itens i join public.estoque e on e.id = i.estoque_id
  join public.produtos p on p.id = e.produto_id where i.carrinho_id = sacola;
  if dados_itens is null then raise exception 'Sacola vazia.'; end if;

  for linha in select i.estoque_id, sum(i.quantidade) as quantidade, min(i.disponivel) as disponivel
    from jsonb_to_recordset(dados_itens) as i(estoque_id uuid, quantidade integer, disponivel integer, ativo boolean)
    group by i.estoque_id having sum(i.quantidade) > min(i.disponivel) or not bool_and(i.ativo)
  loop
    raise exception 'Estoque insuficiente para a seleção.';
  end loop;

  insert into public.pedidos(usuario_id, chave, status, status_pagamento, subtotal, frete, endereco_entrega)
  values(usuario,pedido_chave,'recebido','aprovado',parcial,custo_frete,endereco)
  returning id into pedido;
  insert into public.pedido_itens(pedido_id,produto_id,nome_produto,numeracao,quantidade,preco_unitario,cor)
    select pedido,i.produto_id,i.nome,i.numeracao,i.quantidade,i.preco,i.cor
    from jsonb_to_recordset(dados_itens) as i(produto_id uuid,nome text,numeracao integer,quantidade integer,preco numeric,cor text);
  insert into public.pagamentos(pedido_id,provedor,metodo,status,valor)
    values(pedido,'simulado',metodo_pagamento,'aprovado',parcial + custo_frete);
  -- Simulação sem cobrança e sem baixa ou reserva de estoque.
  delete from public.carrinho_itens where carrinho_id = sacola;
  return pedido;
end;
$$;
revoke all on function kinetra_privado.checkout(uuid,text,text,text,uuid) from public, anon, authenticated;
grant execute on function kinetra_privado.checkout(uuid,text,text,text,uuid) to authenticated;

create or replace function public.kinetra_checkout(endereco_id uuid, entrega text, metodo_pagamento text, resultado text, pedido_chave uuid)
returns bigint language sql set search_path = '' as $$
  select kinetra_privado.checkout(endereco_id,entrega,metodo_pagamento,resultado,pedido_chave);
$$;
revoke all on function public.kinetra_checkout(uuid,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.kinetra_checkout(uuid,text,text,text,uuid) to authenticated;

create or replace function public.kinetra_atualizar_pedido(alvo bigint, novo_status text, novo_pagamento text)
returns void language plpgsql set search_path = '' as $$
begin
  if not kinetra_privado.e_admin() then raise exception 'Acesso restrito.'; end if;
  update public.pedidos set status = novo_status, status_pagamento = novo_pagamento, atualizado_em = now() where id = alvo;
  update public.pagamentos set status = novo_pagamento, atualizado_em = now()
    where pedido_id = alvo and provedor in ('simulado','pendente');
end;
$$;
revoke all on function public.kinetra_atualizar_pedido(bigint,text,text) from public, anon, authenticated;
grant execute on function public.kinetra_atualizar_pedido(bigint,text,text) to authenticated;

revoke all on function public.kinetra_ler_sacola(), public.kinetra_salvar_sacola(jsonb),
  public.kinetra_salvar_produto(uuid,jsonb,text[]) from public, anon, authenticated;
grant execute on function public.kinetra_ler_sacola(), public.kinetra_salvar_sacola(jsonb),
  public.kinetra_salvar_produto(uuid,jsonb,text[]) to authenticated;

-- Promova o primeiro administrador manualmente no SQL Editor, substituindo o e-mail:
-- update public.perfis set papel = 'admin'
-- where id = (select id from auth.users where lower(email) = lower('admin@exemplo.com'));

commit;
notify pgrst, 'reload schema';

-- Checagem pós-aplicação: deve listar RLS ligado em todas as tabelas do Kinetra.
select c.relname as tabela, c.relrowsecurity as rls_ativo
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = any(array['perfis','produtos','produto_imagens','estoque','carrinhos','carrinho_itens','enderecos','pedidos','pedido_itens','pagamentos'])
order by c.relname;

-- Esperado: anon_ve_perfis=false, anon_executa_checkout=false, authenticated_executa_checkout=true.
select has_table_privilege('anon', 'public.perfis', 'select') as anon_ve_perfis,
  has_function_privilege('anon', 'public.kinetra_checkout(uuid,text,text,text,uuid)', 'execute') as anon_executa_checkout,
  has_function_privilege('authenticated', 'public.kinetra_checkout(uuid,text,text,text,uuid)', 'execute') as authenticated_executa_checkout;

select tablename, policyname, roles, cmd
from pg_policies where schemaname = 'public'
  and tablename = any(array['perfis','produtos','produto_imagens','estoque','carrinhos','carrinho_itens','enderecos','pedidos','pedido_itens','pagamentos'])
order by tablename, policyname;
