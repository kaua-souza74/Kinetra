-- Execute uma vez no SQL Editor do projeto Supabase já existente.
-- Preserva IDs, estoque, sacolas e pedidos; o site também reconhece a URL antiga.
begin;

alter table public.carrinho_itens drop constraint if exists carrinho_itens_cor_check;
alter table public.carrinho_itens add constraint carrinho_itens_cor_check
  check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.carrinho_itens alter column cor set default 'gelo';

alter table public.pedido_itens drop constraint if exists pedido_itens_cor_check;
alter table public.pedido_itens add constraint pedido_itens_cor_check
  check (cor in ('gelo','marinho','areia','grafite','laranja'));
alter table public.pedido_itens alter column cor set default 'gelo';

update public.produtos
set nome = 'Kinetra Adapt X 2050',
    slug = 'kinetra-adapt-x-2050',
    descricao = 'Tênis inteligente com ajuste conceitual de comprimento, largura e volume para acompanhar o formato do seu pé.',
    tecnologias = array['Malha adaptativa','Módulo de ajuste conceitual','Câmara visível no calcanhar'],
    caracteristicas = '{"Estrutura":"Malha adaptativa","Solado":"Segmentado","Ajuste":"Comprimento, largura e volume","Módulo":"Controle ilustrativo no peito do pé"}'::jsonb,
    atualizado_em = now()
where slug = 'kinetra-forma';

commit;
