-- Kinetra Forma: esquema e acesso da loja.
begin;
create extension if not exists pgcrypto;

create table if not exists public.perfis (
 id uuid primary key references auth.users(id) on delete cascade,
 nome text not null,
 email text not null,
 numeracao_preferida integer check (numeracao_preferida between 20 and 55),
 papel text not null default 'cliente' check (papel in ('cliente','admin')),
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);

create table if not exists public.produtos (
 id uuid primary key default gen_random_uuid(),
 nome text not null,
 slug text not null unique,
 descricao text not null,
 preco numeric(12,2) not null check (preco >= 0),
 firmware_versao text,
 caracteristicas jsonb not null default '{}'::jsonb,
 tecnologias text[] not null default '{}',
 ativo boolean not null default true,
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);

create table if not exists public.produto_imagens (
 id uuid primary key default gen_random_uuid(),
 produto_id uuid not null references public.produtos(id) on delete cascade,
 url text not null,
 texto_alternativo text,
 ordem integer not null default 0 check (ordem >= 0)
);

create table if not exists public.estoque (
 id uuid primary key default gen_random_uuid(),
 produto_id uuid not null references public.produtos(id) on delete cascade,
 numeracao integer not null check (numeracao between 20 and 55),
 quantidade integer not null default 0 check (quantidade >= 0),
 atualizado_em timestamptz not null default now(),
 unique (produto_id, numeracao)
);

create table if not exists public.carrinhos (
 id uuid primary key default gen_random_uuid(),
 usuario_id uuid not null unique references public.perfis(id) on delete cascade,
 atualizado_em timestamptz not null default now()
);

create table if not exists public.carrinho_itens (
 id uuid primary key default gen_random_uuid(),
 carrinho_id uuid not null references public.carrinhos(id) on delete cascade,
 estoque_id uuid not null references public.estoque(id),
 quantidade integer not null check (quantidade > 0),
 unique (carrinho_id, estoque_id)
);

create table if not exists public.enderecos (
 id uuid primary key default gen_random_uuid(),
 usuario_id uuid not null references public.perfis(id) on delete cascade,
 destinatario text not null,
 cep text not null,
 logradouro text not null,
 numero text not null,
 complemento text,
 bairro text not null,
 cidade text not null,
 estado char(2) not null,
 telefone text,
 principal boolean not null default false,
 criado_em timestamptz not null default now()
);

create table if not exists public.pedidos (
 id bigint generated always as identity primary key,
 usuario_id uuid not null references public.perfis(id),
 status text not null default 'recebido' check (status in ('recebido','em_preparacao','enviado','concluido','cancelado')),
 status_pagamento text not null default 'pendente' check (status_pagamento in ('pendente','aprovado','recusado','estornado')),
 subtotal numeric(12,2) not null check (subtotal >= 0),
 frete numeric(12,2) not null default 0 check (frete >= 0),
 total numeric(12,2) generated always as (subtotal + frete) stored,
 endereco_entrega jsonb not null,
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);

create table if not exists public.pedido_itens (
 id uuid primary key default gen_random_uuid(),
 pedido_id bigint not null references public.pedidos(id) on delete cascade,
 produto_id uuid references public.produtos(id) on delete set null,
 nome_produto text not null,
 numeracao integer not null,
 quantidade integer not null check (quantidade > 0),
 preco_unitario numeric(12,2) not null check (preco_unitario >= 0),
 total numeric(12,2) generated always as (quantidade * preco_unitario) stored
);

create table if not exists public.pagamentos (
 id uuid primary key default gen_random_uuid(),
 pedido_id bigint not null references public.pedidos(id) on delete cascade,
 provedor text not null,
 metodo text not null,
 referencia_externa text unique,
 status text not null default 'pendente' check (status in ('pendente','aprovado','recusado','estornado')),
 valor numeric(12,2) not null check (valor >= 0),
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);

create index if not exists idx_produtos_ativos on public.produtos(ativo);
create index if not exists idx_imagens_produto on public.produto_imagens(produto_id, ordem);
create index if not exists idx_estoque_produto on public.estoque(produto_id);
create index if not exists idx_pedidos_usuario on public.pedidos(usuario_id, criado_em desc);
create index if not exists idx_pedidos_status on public.pedidos(status);
create index if not exists idx_itens_pedido on public.pedido_itens(pedido_id);
create index if not exists idx_enderecos_usuario on public.enderecos(usuario_id);

-- Mantém as cores de cada item e a chave de idempotência da simulação.
alter table public.carrinho_itens add column if not exists cor text not null default 'gelo' check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.carrinho_itens add column if not exists metodo text not null default 'entrega' check (metodo in ('entrega','retirada'));
alter table public.carrinho_itens drop constraint if exists carrinho_itens_carrinho_id_estoque_id_key;
create unique index if not exists kinetra_carrinho_variante on public.carrinho_itens(carrinho_id, estoque_id, cor);
alter table public.pedido_itens add column if not exists cor text not null default 'gelo' check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.carrinho_itens drop constraint if exists carrinho_itens_cor_check;
alter table public.pedido_itens drop constraint if exists pedido_itens_cor_check;
update public.carrinho_itens set cor = 'gelo' where cor is null or cor not in ('gelo','marinho','areia','grafite','laranja');
update public.pedido_itens set cor = 'gelo' where cor is null or cor not in ('gelo','marinho','areia','grafite','laranja');
alter table public.carrinho_itens alter column cor set default 'gelo';
alter table public.pedido_itens alter column cor set default 'gelo';
alter table public.carrinho_itens alter column cor set not null;
alter table public.pedido_itens alter column cor set not null;
alter table public.carrinho_itens add constraint carrinho_itens_cor_check check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.pedido_itens add constraint pedido_itens_cor_check check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.pedidos add column if not exists chave uuid;
create unique index if not exists kinetra_pedido_chave on public.pedidos(usuario_id, chave);

create schema if not exists kinetra_privado;
revoke all on schema kinetra_privado from public;
grant usage on schema kinetra_privado to anon, authenticated;

create or replace function kinetra_privado.criar_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis(id, nome, email, numeracao_preferida)
  values(new.id, coalesce(nullif(btrim(new.raw_user_meta_data->>'nome'), ''), 'Cliente'), coalesce(new.email, ''),
    case when (new.raw_user_meta_data->>'numeracao') ~ '^[0-9]{2}$'
      then case when (new.raw_user_meta_data->>'numeracao')::integer between 20 and 55
        then (new.raw_user_meta_data->>'numeracao')::integer end end)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function kinetra_privado.criar_perfil() from public;
drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users for each row execute function kinetra_privado.criar_perfil();
insert into public.perfis(id,nome,email)
select id, coalesce(nullif(raw_user_meta_data->>'nome',''),'Cliente'), coalesce(email,'')
from auth.users on conflict (id) do nothing;

create or replace function kinetra_privado.e_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id = (select auth.uid()) and papel = 'admin');
$$;
revoke all on function kinetra_privado.e_admin() from public;
grant execute on function kinetra_privado.e_admin() to anon, authenticated;

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

revoke all on public.perfis, public.produtos, public.produto_imagens, public.estoque, public.carrinhos, public.carrinho_itens, public.enderecos, public.pedidos, public.pedido_itens, public.pagamentos from anon, authenticated;
grant select on public.produtos, public.produto_imagens, public.estoque to anon, authenticated;
grant insert, update, delete on public.produtos, public.produto_imagens, public.estoque to authenticated;
grant select on public.perfis, public.pedido_itens to authenticated;
grant update (nome,numeracao_preferida) on public.perfis to authenticated;
grant select, insert, update, delete on public.carrinhos, public.carrinho_itens, public.enderecos to authenticated;
grant select on public.pedidos, public.pagamentos to authenticated;
grant update (status,status_pagamento,atualizado_em) on public.pedidos to authenticated;
grant update (status,atualizado_em) on public.pagamentos to authenticated;

drop policy if exists kinetra_perfil_select on public.perfis;
create policy kinetra_perfil_select on public.perfis for select to authenticated using (id = (select auth.uid()));
drop policy if exists kinetra_perfil_update on public.perfis;
create policy kinetra_perfil_update on public.perfis for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists kinetra_produto_select on public.produtos;
create policy kinetra_produto_select on public.produtos for select to anon, authenticated using (ativo or (select kinetra_privado.e_admin()));
drop policy if exists kinetra_imagem_select on public.produto_imagens;
create policy kinetra_imagem_select on public.produto_imagens for select to anon, authenticated using (exists(select 1 from public.produtos p where p.id = produto_id and (p.ativo or (select kinetra_privado.e_admin()))));
drop policy if exists kinetra_estoque_select on public.estoque;
create policy kinetra_estoque_select on public.estoque for select to anon, authenticated using (exists(select 1 from public.produtos p where p.id = produto_id and (p.ativo or (select kinetra_privado.e_admin()))));
do $$
declare tabela text;
begin
  foreach tabela in array array['produtos','produto_imagens','estoque'] loop
    execute format('drop policy if exists kinetra_admin on public.%I', tabela);
    execute format('create policy kinetra_admin on public.%I for all to authenticated using ((select kinetra_privado.e_admin())) with check ((select kinetra_privado.e_admin()))', tabela);
  end loop;
end;
$$;

drop policy if exists kinetra_sacola on public.carrinhos;
create policy kinetra_sacola on public.carrinhos for all to authenticated using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
drop policy if exists kinetra_itens_sacola on public.carrinho_itens;
create policy kinetra_itens_sacola on public.carrinho_itens for all to authenticated
using (exists(select 1 from public.carrinhos c where c.id = carrinho_id))
with check (exists(select 1 from public.carrinhos c where c.id = carrinho_id));
drop policy if exists kinetra_endereco on public.enderecos;
create policy kinetra_endereco on public.enderecos for all to authenticated using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

create or replace function kinetra_privado.endereco_principal()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.principal then
    update public.enderecos set principal = false where usuario_id = new.usuario_id and id <> new.id and principal;
  end if;
  return new;
end
$$;
revoke all on function kinetra_privado.endereco_principal() from public;
drop trigger if exists kinetra_endereco_principal on public.enderecos;
create trigger kinetra_endereco_principal before insert or update of principal on public.enderecos for each row execute function kinetra_privado.endereco_principal();

drop policy if exists kinetra_pedido_select on public.pedidos;
create policy kinetra_pedido_select on public.pedidos for select to authenticated using (usuario_id = (select auth.uid()) or (select kinetra_privado.e_admin()));
drop policy if exists kinetra_pedido_update on public.pedidos;
create policy kinetra_pedido_update on public.pedidos for update to authenticated using ((select kinetra_privado.e_admin())) with check ((select kinetra_privado.e_admin()));
drop policy if exists kinetra_itens_pedido on public.pedido_itens;
create policy kinetra_itens_pedido on public.pedido_itens for select to authenticated using (exists(select 1 from public.pedidos p where p.id = pedido_id));
drop policy if exists kinetra_pagamento_select on public.pagamentos;
create policy kinetra_pagamento_select on public.pagamentos for select to authenticated using (exists(select 1 from public.pedidos p where p.id = pedido_id));
drop policy if exists kinetra_pagamento_update on public.pagamentos;
create policy kinetra_pagamento_update on public.pagamentos for update to authenticated using ((select kinetra_privado.e_admin())) with check ((select kinetra_privado.e_admin()));

create or replace function public.kinetra_ler_sacola()
returns jsonb language sql stable set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'key', e.id::text || ':' || i.cor, 'estoque_id', e.id, 'produto_id', e.produto_id,
    'numeracao', e.numeracao, 'cor', i.cor, 'metodo', i.metodo, 'quantidade', i.quantidade
  ) order by i.id), '[]'::jsonb)
  from public.carrinho_itens i join public.carrinhos c on c.id = i.carrinho_id
  join public.estoque e on e.id = i.estoque_id where c.usuario_id = (select auth.uid());
$$;

create or replace function public.kinetra_salvar_sacola(itens jsonb)
returns void language plpgsql set search_path = '' as $$
declare sacola uuid;
begin
  if auth.uid() is null or jsonb_typeof(itens) is distinct from 'array' or jsonb_array_length(itens) > 60 then
    raise exception 'Sacola inválida.';
  end if;
  insert into public.carrinhos(usuario_id) values (auth.uid()) on conflict (usuario_id) do nothing;
  select id into sacola from public.carrinhos where usuario_id = auth.uid() for update;
  if exists(
    select 1 from jsonb_to_recordset(itens) as i(estoque_id uuid, quantidade integer)
    left join public.estoque e on e.id = i.estoque_id
    group by i.estoque_id, e.quantidade
    having e.quantidade is null or bool_or(i.quantidade is null or i.quantidade < 1) or sum(i.quantidade) > e.quantidade
  ) then raise exception 'Estoque insuficiente para a seleção.'; end if;
  delete from public.carrinho_itens where carrinho_id = sacola;
  insert into public.carrinho_itens(carrinho_id, estoque_id, quantidade, cor, metodo)
  select sacola, i.estoque_id, i.quantidade, i.cor, i.metodo
  from jsonb_to_recordset(itens) as i(estoque_id uuid, quantidade integer, cor text, metodo text);
end;
$$;

-- A operação privilegiada fica em schema privado. Preços e estoque são lidos no banco.
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
revoke all on function kinetra_privado.checkout(uuid,text,text,text,uuid) from public;
grant execute on function kinetra_privado.checkout(uuid,text,text,text,uuid) to authenticated;

create or replace function public.kinetra_checkout(endereco_id uuid, entrega text, metodo_pagamento text, resultado text, pedido_chave uuid)
returns bigint language sql set search_path = '' as $$
  select kinetra_privado.checkout(endereco_id,entrega,metodo_pagamento,resultado,pedido_chave);
$$;

create or replace function public.kinetra_salvar_produto(produto_id uuid, campos jsonb, imagens text[])
returns uuid language plpgsql set search_path = '' as $$
declare alvo uuid;
begin
  if not kinetra_privado.e_admin() then raise exception 'Acesso restrito.'; end if;
  if produto_id is null then
    insert into public.produtos(nome,slug,descricao,preco,ativo,tecnologias,caracteristicas)
    values(campos->>'nome',campos->>'slug',campos->>'descricao',(campos->>'preco')::numeric,
      (campos->>'ativo')::boolean,array(select jsonb_array_elements_text(campos->'tecnologias')),campos->'caracteristicas')
    returning id into alvo;
  else
    update public.produtos set nome = campos->>'nome', slug = campos->>'slug', descricao = campos->>'descricao',
      preco = (campos->>'preco')::numeric, ativo = (campos->>'ativo')::boolean,
      tecnologias = array(select jsonb_array_elements_text(campos->'tecnologias')), caracteristicas = campos->'caracteristicas', atualizado_em = now()
    where id = produto_id returning id into alvo;
  end if;
  if alvo is null then raise exception 'Produto indisponível.'; end if;
  delete from public.produto_imagens img where img.produto_id = alvo;
  insert into public.produto_imagens(produto_id,url,ordem)
  select alvo, imagem, (pos - 1)::integer from unnest(imagens) with ordinality as galeria(imagem,pos);
  return alvo;
end;
$$;

create or replace function public.kinetra_atualizar_pedido(alvo bigint, novo_status text, novo_pagamento text)
returns void language plpgsql set search_path = '' as $$
begin
  if not kinetra_privado.e_admin() then raise exception 'Acesso restrito.'; end if;
  update public.pedidos set status = novo_status, status_pagamento = novo_pagamento, atualizado_em = now() where id = alvo;
  update public.pagamentos set status = novo_pagamento, atualizado_em = now() where pedido_id = alvo and provedor in ('simulado','pendente');
end;
$$;

revoke all on function public.kinetra_ler_sacola(), public.kinetra_salvar_sacola(jsonb), public.kinetra_checkout(uuid,text,text,text,uuid),
  public.kinetra_salvar_produto(uuid,jsonb,text[]), public.kinetra_atualizar_pedido(bigint,text,text) from public, anon;
grant execute on function public.kinetra_ler_sacola(), public.kinetra_salvar_sacola(jsonb), public.kinetra_checkout(uuid,text,text,text,uuid),
  public.kinetra_salvar_produto(uuid,jsonb,text[]), public.kinetra_atualizar_pedido(bigint,text,text) to authenticated;

with novo as (
  insert into public.produtos(nome, slug, descricao, preco, caracteristicas, tecnologias)
  values('Kinetra Forma','kinetra-forma',
    'Tênis sem cadarços que se expande para calçar e se contrai para acompanhar o comprimento, a largura e o volume do pé.',
    599.90,'{"Estrutura":"Malha adaptativa","Solado":"Segmentado","Ajuste":"Comprimento, largura e volume"}',
    array['Malha adaptativa','Solado segmentado','Estrutura sem cadarços'])
  on conflict (slug) do nothing returning id
)
insert into public.estoque(produto_id,numeracao,quantidade)
select novo.id, n, case when n = 44 then 0 when n = 35 then 2 else 12 end from novo cross join generate_series(35,44) as g(n);

commit;


