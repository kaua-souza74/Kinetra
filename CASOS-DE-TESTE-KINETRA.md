# Kinetra — casos de teste

**Roteiros de execução — 23/11/2026**  
**Uso:** preencher durante a execução e converter em um único PDF, com um caso por página.  
**Atenção:** o enunciado pede os casos específicos do catálogo do projeto e o modelo do Arquivo 05. Esses arquivos não foram enviados aqui; estes roteiros foram preparados a partir dos requisitos compartilhados e devem ser conferidos com o catálogo antes do PDF final.

## Regras de execução

- Executar em ambiente de demonstração, com dados de teste.
- Em cada página, identificar o desenvolvedor responsável pela funcionalidade e um executor diferente.
- Preencher resultado obtido, selecionar exatamente um status e inserir evidência real (captura de tela ou link autorizado).
- Não registrar senhas, tokens, chaves Supabase nem dados financeiros reais nas evidências ou no PDF.
- Status possíveis: **Aprovado / Reprovado / Bloqueado**. Deixar sem seleção até executar; não presumir aprovação.
- Para executar no banco real, aplique `supabase/instalar.sql` no projeto correto. A operação de checkout lê os preços e ajusta o estoque no servidor. Cada conta só deve acessar os próprios dados, com a exceção dos pedidos acessíveis à administração.

**Conexão observada em 23/11/2026:** após aplicar o SQL, a configuração do Auth e a consulta pública ao catálogo responderam HTTP 200. O Supabase retornou o Kinetra Forma com 10 numerações, 9 disponíveis. Cadastro, login, recuperação e checkout autenticado ainda precisam de execução com contas de teste.

**Verificação local em 23/11/2026:** a prévia serviu as rotas e as quatro imagens. No Chrome, foi possível escolher a cor Areia, configurar o produto, abrir a sacola, entrar em demonstração, concluir uma compra simulada, consultar o pedido na conta e atualizá-lo pelo administrador. Também foram abertas as telas de cadastro, solicitação e redefinição de senha. As verificações locais não preenchem os campos de execução da entrega do SENAI.

**Revisão após aplicar o SQL:** no Chrome, a página leu o catálogo real do Supabase e adicionou uma numeração disponível à sacola antes do login. As páginas de Coleção e Como funciona abriram por rotas próprias. A seta do login retornou à home ou à sacola conforme o ponto de entrada, e a foto deslizou entre login e cadastro.

<div style="break-after: page;"></div>

## CT-01 — Cadastro de cliente

**Objetivo:** verificar que uma pessoa consegue criar conta e que o perfil de cliente correspondente é criado.

**Pré-condições:** site conectado ao projeto Supabase de teste; pessoa deslogada; e-mail de teste único e acessível; política de confirmação de e-mail conhecida.

**Dados de teste:** nome: `Cliente Teste`; e-mail: ____________________; senha: usar segredo temporário fora deste documento; numeração preferida: ______ (20–55, opcional).

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Abrir **Criar conta**. | Formulário de cadastro visível, com nome, e-mail, senha e numeração preferida opcional. |
| 2 | Preencher dados válidos e enviar. | Cadastro aceito; mensagem clara orienta a pessoa sobre confirmação de e-mail, se estiver ativada. |
| 3 | Concluir confirmação, se solicitada, e entrar na conta. | Sessão autenticada; interface identifica a pessoa como cliente. |
| 4 | Conferir o perfil pelo meio administrativo seguro. | Existe perfil associado ao usuário do Auth; nome/e-mail/numeração correspondem aos dados e `papel` é `cliente`. Nenhuma senha foi gravada em tabela pública. |

**Resultado obtido:** ____________________________________________________________

**Status:** ☐ Aprovado  ☐ Reprovado  ☐ Bloqueado

**Evidência:** _________________________________________________________________

**Executor:** ____________________  **Desenvolvedor da página:** ____________________

**Data/hora:** ____________________  **Navegador/ambiente:** ______________________

<div style="break-after: page;"></div>

## CT-02 — Login

**Objetivo:** verificar autenticação com credenciais válidas e tratamento seguro de credenciais inválidas.

**Pré-condições:** conta de cliente de teste cadastrada e confirmada; pessoa deslogada.

**Dados de teste:** e-mail: ____________________; senha temporária: não registrar neste arquivo.

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Abrir **Entrar** e informar e-mail e senha corretos. | Login aceito; a interface leva à área definida pelo produto e mostra estado autenticado. |
| 2 | Atualizar a página ou navegar para outra página protegida. | Sessão continua válida conforme configuração de Auth; dados protegidos não aparecem para outra conta. |
| 3 | Sair da conta. | Sessão encerrada e páginas protegidas deixam de ser acessíveis. |
| 4 | Tentar entrar com senha incorreta. | Login recusado com mensagem compreensível; nenhuma sessão é criada e a senha não é exibida em logs/evidências. |

**Resultado obtido:** ____________________________________________________________

**Status:** ☐ Aprovado  ☐ Reprovado  ☐ Bloqueado

**Evidência:** _________________________________________________________________

**Executor:** ____________________  **Desenvolvedor da página:** ____________________

**Data/hora:** ____________________  **Navegador/ambiente:** ______________________

<div style="break-after: page;"></div>

## CT-03 — Redefinição de senha

**Objetivo:** confirmar que uma pessoa com conta consegue solicitar e concluir a troca de senha.

**Pré-condições:** conta de teste cadastrada; acesso à caixa de e-mail; fluxo de recuperação e URLs de retorno configurados no Supabase Auth.

**Dados de teste:** e-mail: ____________________; senha nova temporária: não registrar neste arquivo.

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Na tela de login, selecionar **Esqueci minha senha** e informar o e-mail cadastrado. | Mensagem neutra confirma o envio sem revelar se um e-mail existe no sistema. |
| 2 | Abrir a mensagem de recuperação e seguir o link. | Link abre a tela Kinetra de redefinição, em domínio permitido e sem erro de sessão/token. |
| 3 | Informar e confirmar uma senha nova válida. | Senha atualizada; mensagem de sucesso é exibida. |
| 4 | Entrar com a senha nova e, em seguida, tentar com a antiga. | Nova senha funciona; antiga é recusada. |

**Resultado obtido:** ____________________________________________________________

**Status:** ☐ Aprovado  ☐ Reprovado  ☐ Bloqueado

**Evidência:** _________________________________________________________________

**Executor:** ____________________  **Desenvolvedor da página:** ____________________

**Data/hora:** ____________________  **Navegador/ambiente:** ______________________

<div style="break-after: page;"></div>

## CT-04 — Acesso e funções de administrador

**Objetivo:** validar que uma conta administradora consegue usar as funções administrativas e uma conta cliente não consegue acessá-las.

**Pré-condições:** usuário administrador de demonstração provisionado por processo seguro; pelo menos um produto e uma variação de estoque de teste; conta cliente comum disponível. Não incluir senhas no PDF ou no GitHub.

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Entrar com a conta administradora e abrir `/admin`. | Dashboard administrativo carrega e identifica a sessão autorizada. |
| 2 | Criar um produto descartável, editar um dado e cadastrar estoque de teste. Conferir na vitrine e excluir o produto antes de usar a sacola. | Cadastro, alteração e estoque persistem. Após a exclusão, o produto deixa de aparecer na vitrine. |
| 3 | Atualizar o status de um pedido de teste. | Status permitido é salvo e aparece no detalhe/acompanhamento do pedido. |
| 4 | Sair e entrar com conta cliente; tentar abrir `/admin` diretamente. | Acesso negado ou redirecionado; nenhuma informação ou ação administrativa fica disponível. |
| 5 | Verificar o cadastro público de cliente. | Não existe opção para escolher ou promover a própria conta a `admin`. |

**Resultado obtido:** ____________________________________________________________

**Status:** ☐ Aprovado  ☐ Reprovado  ☐ Bloqueado

**Evidência:** _________________________________________________________________

**Executor:** ____________________  **Desenvolvedor da página:** ____________________

**Data/hora:** ____________________  **Navegador/ambiente:** ______________________

<div style="break-after: page;"></div>

## CT-05 — Funcionalidade principal: escolher e comprar o tênis (simulação)

**Objetivo:** verificar o fluxo principal da loja Kinetra, da escolha da numeração à criação do pedido demonstrativo, sem pagamento real.

**Pré-condições:** produto ativo; numeração escolhida com estoque disponível; cliente autenticado; endereço de teste válido; fluxo de pedido chamado por endpoint/servidor confiável. O banco deve ser restaurável após o teste.

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Abrir **Kinetra Forma**, conferir a aba **Como funciona**, alternar entre Marinho e Areia e escolher uma numeração em estoque. | A aba apresenta o tênis expandido e moldado ao pé. A imagem muda com a cor e numerações esgotadas ficam desabilitadas. |
| 2 | Adicionar à sacola e conferir item, quantidade, numeração, cor e miniatura. | A sacola mostra a variante selecionada e calcula o subtotal com o preço do produto. |
| 3 | Finalizar com endereço de teste e escolher **Simular pagamento**. | Tela informa explicitamente que não haverá cobrança; nenhum dado de cartão/senha bancária é solicitado ou armazenado. |
| 4 | Confirmar a simulação aprovada. | Pedido é criado com itens, numeração, preço e endereço corretos; status inicial é `recebido`; estoque diminui exatamente pela quantidade comprada e carrinho é esvaziado. |
| 5 | Abrir confirmação/detalhe do pedido. | Número, total, status do pedido e status demonstrativo de pagamento são coerentes e visíveis apenas ao dono/admin. |
| 6 | Em uma nova compra de teste, simular pagamento com resultado **Recusado**. | Pedido cancelado e pagamento recusado. A sacola permanece disponível e o estoque não diminui. |

**Resultado obtido:** ____________________________________________________________

**Status:** ☐ Aprovado  ☐ Reprovado  ☐ Bloqueado

**Evidência:** _________________________________________________________________

**Executor:** ____________________  **Desenvolvedor da página:** ____________________

**Data/hora:** ____________________  **Navegador/ambiente:** ______________________

**Checagem extra da interface:** na home, em desktop, conferir que título, tênis, seletor de cor e CTA aparecem juntos no primeiro quadro. Testar rodinha, trackpad, navegação por teclado e preferência por movimento reduzido. Em celular, conferir que o título não corta e que o seletor pode ser usado por toque.
