# Kinetra — especificação das páginas

**Versão:** 0.1  
**Status:** paleta, logo provisória e imagens conceituais do Kinetra Forma preparadas para o protótipo.  
**Referência:** imagem enviada pelo usuário, com loja de tênis em fundo claro, painel branco arredondado, chamadas grandes, produto em destaque, etiquetas técnicas, faixa de benefícios e cards de coleção.

## 1. Objetivo

Criar uma loja demonstrativa para apresentar o **Kinetra Forma**. O conceito é um tênis sem cadarços que expande e contrai sua estrutura para acompanhar o comprimento, a largura e o volume do pé. A loja usa os dados do banco provisório, com pagamento e acompanhamento de pedidos simulados.

## 2. Direção visual da referência

- **Composição:** página desktop ampla sobre fundo cinza quente; conteúdo principal em painel branco com cantos arredondados e bastante espaço em branco.
- **Cabeçalho:** logo provisória enviada pela equipe à esquerda, navegação compacta ao centro, pesquisa e sacola à direita. O item ativo e as principais ações usam destaque laranja.
- **Tipografia:** títulos grandes, condensados, pesados e em caixa alta; textos auxiliares em sans-serif simples e legível.
- **Paleta definida:** azul-marinho `#1E223D` como cor principal; laranja `#F54F1B` para ações e destaques; bege `#E6D5B7` para superfícies quentes; branco-gelo `#F7F7F5` para fundo; preto profundo `#11131C` para textos e contraste.
- **Cards e controles:** cards claros com cantos arredondados, botões em formato pílula, ícones simples e etiquetas pequenas sobre fotos.
- **Produto hero:** tênis grande, recortado sobre o fundo, parcialmente sobreposto ao título; sombra suave para separar o produto da superfície.
- **Adaptação da faixa de marcas:** usar benefícios e tecnologias Kinetra (por exemplo, “ajuste automático”, “conforto” e “amortecimento”). Não exibir marcas de terceiros nem alegações de parceria sem autorização.

### Imagens do Kinetra Forma

Os arquivos da tabela ficam em `public/kinetra-forma/` e podem ser referenciados no site pelo caminho `/kinetra-forma/`.

| Arquivo | Telas e uso |
|---|---|
| `forma-marinho.png` | Imagem principal da home, card da loja e prévia Marinho no configurador. |
| `forma-areia.png` | Card da loja e prévia Areia no configurador. |
| `forma-ajuste.png` | Seção **Como funciona**, com os estados expandido e moldado ao pé. |
| `forma-campanha.png` | Painel de login, cadastro e redefinição de senha. Também serve como imagem conceitual do tênis em uso. |

Na sacola, no checkout, em pedidos e no cadastro de produtos do admin, usar o PNG da cor selecionada como miniatura. No dashboard, usar os ícones e os gráficos da interface. Na imagem de ajuste, incluir os rótulos dos dois estados em texto da página.

## 3. Mapa de navegação

| Rota | Tela | Acesso |
|---|---|---|
| `/` | Início | Público |
| `/loja` | Loja com busca e filtro por numeração | Público |
| `/colecao` | Coleção e variantes do Kinetra Forma | Público |
| `/como-funciona` | Explicação visual do ajuste | Público |
| `/simulador` | Conexão virtual e ajuste manual do tênis | Público |
| `/produto/:slug` | Detalhe e configurador do produto | Público |
| `/entrar` | Entrar, cadastrar e recuperar senha | Público |
| `/carrinho` | Sacola | Público; exige conta para concluir |
| `/finalizar` | Endereço e resumo do pedido | Conta autenticada |
| `/pedido/:id` | Confirmação e acompanhamento simulado | Dono do pedido ou administrador |
| `/conta` | Perfil, endereços e pedidos | Conta autenticada |
| `/admin` | Dashboard, produtos, estoque e pedidos | Perfil administrador |

No cabeçalho, **Início**, **Loja**, **Coleção**, **Como funciona** e **Simulador** abrem páginas próprias. A pesquisa direciona para a loja com a consulta preenchida. Os ícones abrem a conta e a sacola. O configurador, o checkout e os pedidos têm entradas pelo fluxo de compra.

## 4. Especificação por tela

### 4.1 Início — `/`

1. Cabeçalho claro com o nome “KINETRA” em texto, links de navegação, pesquisa e ícone da sacola com contador de itens.
2. Hero com a chamada **“FEITO PARA ACOMPANHAR CADA MOVIMENTO”** à esquerda, em título condensado e grande.
3. Foto renderizada do tênis Kinetra em destaque, atravessando a área central do hero.
4. Etiquetas visuais conectadas ao produto: **Ajuste automático**, **Conforto**, **Amortecimento** e **Leveza**. Usar apenas características confirmadas pela equipe.
5. Bloco de produto ao lado ou abaixo do hero, com nome, preço, breve descrição, botão **“Conheça o Kinetra”** e miniaturas de imagens quando houver mais de uma.
6. Faixa de benefícios/tecnologias, no lugar dos logotipos de marcas vistos na referência.
7. Seção **“Nossa coleção”** ou **“Em destaque”**, com cards de `produtos` ativos. Se houver apenas um produto cadastrado, mostrar um card destacado em vez de inventar outros modelos.
8. Seção **Sobre a Kinetra**, com a origem do projeto no SENAI e a proposta do tênis Forma.
9. Panorama do **Adapt X 2100**, com as etapas de ajuste, as tecnologias propostas, as metas de peso e autonomia e os quatro modelos conceituais da linha Adapt. O catálogo da loja apresenta o Kinetra Forma.

### 4.2 Loja e coleção — `/loja`

- Título condensado em caixa alta, texto curto de introdução e grade de produtos no estilo da referência.
- Card: imagem, nome, preço, etiqueta de novidade quando aplicável, seletor/favorito apenas visual se não houver função de favoritos e botão **“Ver produto”** ou **“Adicionar à sacola”**.
- Filtros do MVP: numeração disponível e ordenação por preço. Não apresentar filtros de categoria, avaliação ou marca porque o banco atual não contém esses campos.
- Os produtos vêm de `produtos`; imagens de `produto_imagens`; disponibilidade por numeração de `estoque`.

### 4.3 Detalhe e configurador do produto — `/produto/:slug`

Esta tela combina a página do produto com o configurador da segunda referência.

- **Cabeçalho:** navegação Kinetra, pesquisa e sacola. Abaixo, breadcrumb (`Início > Loja > [produto]`) e nome do tênis.
- **Coluna esquerda:** imagem grande do tênis, controles discretos para ampliar/visualizar e faixa de miniaturas clicáveis. A imagem principal muda quando a pessoa escolhe outra vista ou combinação, se houver os recursos visuais.
- **Abas abaixo da galeria:** **Descrição**, **Detalhes**, **Como funciona** e **Produtos semelhantes**. Mostrar semelhantes somente se houver outros produtos cadastrados. Não exibir avaliações como se fossem reais, porque o banco atual não tem tabela de reviews.
- **Coluna direita:** painel de configuração com etapas numeradas, divisores finos e seções que podem ser recolhidas. Manter o painel visível durante a rolagem no desktop.

#### Etapas do configurador

1. **Escolha a numeração:** grade de botões com os tamanhos disponíveis; tamanho preferido pode vir do perfil. Desabilitar numerações sem estoque e incluir link **“Guia de tamanhos”**.
2. **Escolha a cor:** duas variantes completas, **Marinho** (`#1E223D`) e **Areia** (`#E6D5B7`). A seleção troca a imagem principal mantendo o enquadramento. Identificar as amostras por nome e indicar a opção selecionada.
3. **Recebimento:** opções demonstrativas, como entrega e retirada. Identificar os valores como simulados.

Em **Como funciona**, mostrar o conceito em dois estados, **Expandido para calçar** e **Moldado ao pé**. A imagem explica a proposta do protótipo.

- **Resumo fixo no rodapé do painel:** total estimado e botão **“Continuar para a sacola”**. Desabilitar até que numeração e escolhas obrigatórias estejam definidas.
- A personalização é visual e comercial: não controla o dispositivo IoT nem altera firmware. Preço e estoque continuam vindo do banco; qualquer adicional de personalização/frete deve ser explicitamente definido como valor demonstrativo.
- **Fonte atual:** `produtos`, `produto_imagens`, `estoque` e `perfis`.

### 4.4 Entrar e criar conta — `/entrar`

- **Composição:** fundo escuro com imagem esportiva desfocada e cartão claro com cantos arredondados. No desktop, a foto fica à esquerda no login e desliza para a direita ao abrir o cadastro, com o formulário no lado oposto.
- **Painel do formulário:** nome Kinetra em texto no alto, sem logo provisória; título **“Bem-vindo de volta à Kinetra”** e subtítulo curto. Labels ficam acima dos campos; inputs são arredondados, claros e com borda discreta. A ação principal usa alto contraste.
- **Modo entrar:** campos de e-mail e senha; link **“Esqueci minha senha”** alinhado ao campo de senha; botão **“Entrar”**; divisor **“ou continue com”**; link final **“Ainda não tem uma conta? Cadastre-se”**.
- **Modo cadastro:** nome, e-mail, senha e numeração preferida opcional; checkbox de termos e privacidade; botão **“Criar conta”**; link para voltar ao login. A tela pode alternar os modos sem mudar a composição geral.
- **Entrar com Google/Apple:** exibir somente se os provedores estiverem configurados no Supabase Auth. Caso contrário, omitir os botões; não simular autenticação social.
- **Painel de campanha:** usar a imagem esportiva do Kinetra Forma com escurecimento leve e nome Kinetra no topo. Reaproveitar no login, cadastro e redefinição de senha. No login, a seta volta à home ou à sacola quando a pessoa veio do checkout.
- O Supabase Auth cuida da autenticação; o trigger do SQL cria `perfis` com papel `cliente`. O papel de administrador nunca aparece como opção no formulário público.
- **Responsivo:** no celular, transformar em uma coluna; priorizar o formulário e reduzir a imagem a um banner curto ou ocultá-la. Garantir labels visíveis, foco por teclado, mensagens de erro junto aos campos e botão para mostrar/ocultar senha.

### 4.5 Sacola — `/carrinho`

- **Referência visual:** cabeçalho de loja no topo; fundo quente muito claro; título grande **“SACOLA”**; área principal clara à esquerda e resumo escuro à direita com cantos arredondados. Usar o coral/laranja Kinetra no botão de ação.
- **Lista de itens:** linhas com miniatura, nome do produto, numeração e personalização escolhidas, preço unitário, controle `− / quantidade / +`, total da linha e ação **“Remover”**. No celular, reorganizar cada item em cartão vertical.
- **Resumo lateral:** barra de progresso de frete grátis apenas se a equipe definir um limite demonstrativo; resumo do subtotal; seção recolhível **“Estimar entrega”** usando CEP e valor de frete simulado; checkbox de termos, se exigido pela equipe; botão destacado **“Continuar para entrega”**.
- **Pagamento:** não exibir logos de bandeiras nem sugerir cobrança real na sacola. A etapa seguinte informa que o pagamento é demonstrativo.
- **Observações e embrulho para presente:** aparecem na imagem de referência, mas não existem no SQL. Omitir no MVP ou adicionar campos ao banco antes de apresentá-los como opções funcionais.
- **Estados:** sacola vazia com CTA para voltar à loja; carregando; erro ao atualizar; estoque insuficiente; item removido com opção de desfazer quando possível.
- Visitante pode manter a sacola localmente até entrar; ao autenticar, associá-la ao carrinho da conta. Fonte autenticada: `carrinhos`, `carrinho_itens`, `estoque` e `produtos`.

### 4.6 Finalizar pedido — `/finalizar`

- Etapa 1: escolher um endereço existente ou preencher destinatário, CEP, endereço, telefone e complemento.
- Etapa 2: mostrar itens, numeração, subtotal, frete demonstrativo e total.
- Etapa 3: ação **“Simular pagamento”**. Não solicitar número de cartão, CVV, senha bancária nem fazer cobrança real. A simulação pode retornar “aprovado” ou “recusado” e registrar o método e status para a apresentação.
- Fonte: `enderecos`, `pedidos`, `pedido_itens` e `pagamentos`.

### 4.7 Pedido e acompanhamento simulado — `/pedido/:id`

- Mostrar número do pedido, data, itens, endereço resumido e status do pagamento simulado.
- Exibir linha do tempo visual usando os estados existentes: **Recebido → Em preparação → Enviado → Concluído**. Também tratar **Cancelado**.
- O status é atualizado pela administração ou por dados de demonstração; não há mapa, GPS, transportadora ou código de rastreio real.
- Fonte: `pedidos`, `pedido_itens` e `pagamentos`.

### 4.8 Minha conta — `/conta`

- Abas ou blocos para **Meu perfil**, **Endereços** e **Meus pedidos**.
- Perfil permite atualizar nome e numeração preferida; endereços permitem adicionar, editar e escolher o principal; pedidos levam à tela de acompanhamento.
- Fonte: `perfis`, `enderecos` e `pedidos`.

### 4.9 Dashboard administrativo — `/admin`

**Leitura da imagem:** a referência está borrada; os nomes e valores exatos não são legíveis. Esta especificação usa os elementos visuais que aparecem com clareza — navegação vertical, saudação, indicadores, gráfico de barras, medidor circular e cartões inferiores — e os adapta à loja Kinetra. Ela não trata o texto ilegível do print como requisito.

- **Estrutura:** fundo cinza muito claro, cartões brancos com bordas arredondadas, barra lateral vertical escura em formato estreito e acento coral no item selecionado. No topo, saudação **“Bom dia, [nome]”**, período selecionado e avatar/menu da conta.
- **Barra lateral:** Visão geral, Pedidos, Produtos, Estoque e sair. Usar ícones simples e rótulos acessíveis; em telas estreitas, recolher em menu.
- **Faixa de indicadores:** quatro cartões compactos para **Pedidos no período**, **Em andamento**, **Pagamentos aprovados (simulados)** e **Total recebido simulado**. Mostrar comparação de período somente se houver dados para calcular; senão, omitir a comparação.
- **Cartão esquerdo com medidor circular:** **Saúde do estoque**, calculada como percentual de variações ativas com quantidade maior que zero. Abaixo do medidor, listar itens/numerações com estoque baixo e esgotado. Se não houver estoque cadastrado, mostrar estado vazio em vez de exibir um valor fictício como 90.
- **Cartão principal à direita:** **Pedidos ao longo do tempo**, com barras por dia para o período selecionado (por exemplo, últimos 7 ou 30 dias) e resumo por status. Fonte de datas e status: `pedidos.criado_em` e `pedidos.status`.
- **Faixa inferior:** cartão escuro de destaque com resumo de pedidos recentes; cartão claro de estoque baixo; cartão compacto com atividade recente ou atalhos para cadastrar produto e atualizar estoque. Não gerar dados de telemetria do tênis.
- Valores de faturamento e pagamento devem ser identificados como **simulados**. Não apresentar receita real, dados de sensor ou métricas que não possam ser calculadas a partir das tabelas existentes.
- Fonte: `pedidos`, `pedido_itens`, `pagamentos`, `produtos` e `estoque`.

### 4.10 Gestão administrativa — dentro de `/admin`

- A área é protegida por papel `admin` e organizada em abas ou subrotas **Produtos**, **Estoque** e **Pedidos**.
- Produtos: nome, slug, descrição, preço, características, tecnologias, imagens e ativo/inativo.
- Estoque: quantidade por numeração; destacar variações sem estoque e abaixo do limite baixo definido para a demonstração.
- Pedidos: lista, status do pedido e status de pagamento simulado; atualizar o status alimenta a linha do tempo do cliente.
- Não permitir que o cliente altere seu próprio papel para `admin`.

### Como funciona e Simulador

- Em **Como funciona**, mostrar a passagem do tênis expandido ao ajuste, explicar os componentes previstos e responder às dúvidas sobre limites, bateria e conexão. A abertura usa parallax quando o navegador oferece suporte às animações de rolagem.
- No **Simulador**, conectar ou desconectar um tênis virtual. A conexão habilita os controles de comprimento e largura com níveis de −3 a +3, prévia visual e retorno ao padrão. Os níveis são ilustrativos.

## 5. Comportamentos e adaptação responsiva

- **Rodapé:** fundo escuro, assinatura Kinetra em destaque e links para a loja, a coleção, a tecnologia, a conta e a sacola. Na home, a foto de campanha acompanha um atalho para a coleção.
- **Movimento:** manter o cabeçalho estável, animar o indicador do menu e revelar seções durante a rolagem. O login e o rodapé oferecem um controle de animações para todo o site.

- **Desktop:** preservar hero em duas áreas, produto grande, cards em grade/carrossel e cabeçalho horizontal, como na referência.
- **Tablet:** reduzir o tamanho do título e do produto; converter a coleção em grade de duas colunas.
- **Celular:** cabeçalho compacto com menu; hero em coluna (texto, imagem, CTA); cards em uma coluna ou carrossel horizontal; resumo do carrinho abaixo dos itens.
- Todos os botões devem ter estados de foco, carregando, sucesso e erro. Imagens precisam de texto alternativo; contraste dos textos e foco por teclado devem ser mantidos.
- Preço e total vêm do banco. O cliente não deve enviar preço confiável durante a criação do pedido.

## 6. Dados e limites do banco atual

| Conteúdo da interface | Tabelas/campos principais |
|---|---|
| Perfil e papel | `perfis` |
| Vitrine e detalhe | `produtos`, `produto_imagens` |
| Numerações e disponibilidade | `estoque` |
| Sacola | `carrinhos`, `carrinho_itens` |
| Endereços | `enderecos` |
| Pedidos e itens | `pedidos`, `pedido_itens` |
| Pagamento demonstrativo | `pagamentos` |

O esquema atual não tem categorias, avaliações, favoritos, cupons ou rastreamento logístico. Esses elementos não devem aparecer como funções reais do MVP.

O configurador visual também não está persistido no esquema: `carrinho_itens` guarda apenas estoque e quantidade, enquanto `pedido_itens` guarda numeração e dados do produto. Para uma demonstração, as escolhas podem ficar temporariamente no estado do front-end. Para mantê-las no carrinho e no pedido, será necessário adicionar um campo JSON de configuração ou uma tabela de configurações por item e salvar uma cópia da escolha no pedido.

**Atenção de integração:** o SQL provisório desativa RLS e revoga acesso às tabelas para `anon` e `authenticated`. Portanto, o cliente React não consegue consultar nem alterar essas tabelas diretamente com a publishable key. Antes da integração, a equipe precisa definir políticas RLS apropriadas ou usar endpoints confiáveis no servidor. A chave `service_role`/secret nunca deve ir para o navegador.

## 7. Variáveis de ambiente — React + Vite

Conforme informado pela equipe, a URL do projeto e a publishable key já estão no ambiente. Não é necessário copiar os valores para esta spec nem publicá-los no Git. No React + Vite, a convenção usada no código é:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave
```

No código Vite, ler com `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`. O prefixo `VITE_` é necessário para disponibilizar essas variáveis ao front-end; use somente a publishable key nesse contexto. Não colocar a chave secret/service role em nenhuma variável `VITE_`. Se o `.env` existente usa esses nomes, o app deve apenas consumi-los, sem duplicar a configuração.

Adicionar `.env.local` ao `.gitignore`; compartilhar apenas um `.env.example` com valores vazios ou fictícios. O padrão documentado atualmente pelo Supabase para React com Vite é `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
