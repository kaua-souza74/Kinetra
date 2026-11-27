-- Corrige a constraint que impedia adicionar cores válidas do catálogo à sacola.
begin;

alter table public.carrinho_itens drop constraint if exists carrinho_itens_cor_check;
alter table public.pedido_itens drop constraint if exists pedido_itens_cor_check;

update public.carrinho_itens
set cor = 'gelo'
where cor is null or cor not in ('gelo','marinho','areia','grafite','laranja');
update public.pedido_itens
set cor = 'gelo'
where cor is null or cor not in ('gelo','marinho','areia','grafite','laranja');

alter table public.carrinho_itens alter column cor set default 'gelo';
alter table public.pedido_itens alter column cor set default 'gelo';
alter table public.carrinho_itens alter column cor set not null;
alter table public.pedido_itens alter column cor set not null;

alter table public.carrinho_itens add constraint carrinho_itens_cor_check
  check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.pedido_itens add constraint pedido_itens_cor_check
  check (cor in ('gelo','marinho','areia','grafite','laranja'));

commit;

select conrelid::regclass as tabela, conname, pg_get_constraintdef(oid) as regra
from pg_constraint
where conname in ('carrinho_itens_cor_check','pedido_itens_cor_check');
