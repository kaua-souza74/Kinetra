# Kinetra — checklist de entregas SENAI

**Prazo informado:** 27/11/2026  
**Equipe:** 2 integrantes de DS A, 2 de DS B e 2 de Multimídia. Inserir os seis nomes completos em todos os materiais finais.  
**Nome comercial:** Kinetra.  
**Base visual:** paleta definida; ver `SPEC-KINETRA.md`. Logo final e imagens do produto ainda serão escolhidas.

## Status do projeto nesta pasta

- [x] Scaffold React + Vite criado (`package.json`, `src/`, `vite.config.js`).
- [x] Spec inicial das telas registrada em `SPEC-KINETRA.md`.
- [x] Roteiros preliminares dos cinco casos criados em `CASOS-DE-TESTE-KINETRA.md`.
- [ ] Páginas e funcionalidades do site implementadas e integradas ao banco.
- [ ] Casos executados, evidências coletadas e status preenchidos.
- [ ] Entregáveis finais exportados e links liberados.

## Atividade 01 — Documentação do projeto (1 PDF)

- [ ] Usar o **Arquivo 04** como modelo.
- [ ] Capa com nome comercial **Kinetra** e nomes dos seis integrantes.
- [ ] Levantamento de requisitos do tênis autoajustável e da plataforma.
- [ ] Concepção do projeto e problema que o produto resolve.
- [ ] Planejamento do MVP, incluindo recursos financeiros, marketing, materiais e profissionais necessários.
- [ ] Diagrama de caso de uso.
- [ ] Identidade visual aplicada (logo, cores, tipografia e aplicações).
- [ ] Plano de futuro: evolução do produto e expansão para novos públicos.
- [ ] Revisão final: um único PDF, texto legível, sem contradições com o site e apresentação.

**Responsáveis sugeridos:** DS A — requisitos técnicos e banco; DS B — plataforma/MVP; Multimídia — identidade e apresentação visual; revisão por todos.

## Atividade 02 — Casos de teste (1 PDF, 5 páginas) - Após criação do site

- [ ] Conferir e substituir/ajustar os roteiros preliminares em `CASOS-DE-TESTE-KINETRA.md` com os casos específicos do catálogo e o **Arquivo 05**.
- [ ] Manter exatamente cinco casos, cada um em sua própria página: Cadastro; Login; Redefinição de senha; Administrador; Funcionalidade principal.
- [ ] Executar cada caso no site conectado ao banco de teste.
- [ ] Em cada página, preencher executor, desenvolvedor da página, data/ambiente, passos executados, resultado obtido e status **Aprovado/Reprovado/Bloqueado**.
- [ ] Garantir que o executor seja uma pessoa diferente do integrante que desenvolveu a página testada.
- [ ] Inserir evidência real por caso; ocultar dados pessoais, senhas, tokens e chaves.
- [ ] Exportar tudo em um único PDF, uma página por caso.

**Importante:** não marcar aprovado sem execução. O SQL atual ainda precisa de um fluxo servidor confiável e persistência do pagamento simulado antes de aprovar o caso da funcionalidade principal.

## Atividade 03 — Protótipo de interfaces (Figma) - após criação do site

- [ ] Criar as cinco telas obrigatórias: **Cadastro**, **Login**, **Redefinição de senha**, **Administrador** e **Funcionalidade principal do produto**.
- [ ] Usar uma identidade visual consistente da Kinetra.
- [ ] Escolher como tela principal a página de produto/configurador ou o fluxo principal definido pela equipe e refletir isso também no site e nos testes.
- [ ] Incluir estados relevantes: erro de formulário, carregamento, sucesso, estoque indisponível e acesso negado, conforme a tela.
- [ ] Liberar acesso de visualização do arquivo Figma sem exigir autorização individual.
- [ ] Copiar e revisar o link de visualização.

## Atividade 04 — Modelo 3D e aplicação no mundo real 

- [ ] Criar o modelo 3D do tênis autoajustável no Tinkercad **ou** circuito correspondente no Wokwi, conforme catálogo.
- [ ] Representar os componentes/elementos previstos para o funcionamento do produto.
- [ ] Gerar imagem de IA mostrando **o tênis Kinetra desenvolvido** sendo usado no mundo real; não usar apenas uma cena genérica de esporte.
- [ ] Revisar coerência entre modelo, imagem, concepção do produto e identidade visual.
- [ ] Separar link do Tinkercad/Wokwi e arquivo de imagem para entrega.

## Atividade 05 — Site desenvolvido (GitHub)

- [x] Scaffold React + Vite iniciado.
- [ ] Implementar as cinco páginas obrigatórias: Cadastro; Login; Redefinição de senha; Administrador; Funcionalidade principal.
- [ ] Conectar o site a banco real Supabase e validar permissões seguras.
- [ ] Manter qualquer chave secret/service role apenas no servidor; nunca publicar senhas, tokens ou chaves no GitHub.
- [ ] Implementar pedido/pagamento apenas em modo demonstrativo, sem cobrança real.
- [ ] Conferir que nenhum conteúdo de demonstração seja apresentado como dado real.
- [ ] Criar README com nome do produto, seis integrantes, instruções para instalar/executar e usuário administrador de teste.
- [ ] Incluir no README o identificador e o modo seguro de obter/provisionar o usuário administrador; não commitar senha real ou segredo.
- [ ] Confirmar que `.env` e `.env.local` não entram no Git; manter apenas exemplo sem valores secretos, se necessário.
- [ ] Fazer revisão funcional e visual entre DS A, DS B e Multimídia.
- [ ] Criar repositório GitHub, conferir arquivos/segredos e copiar link.

## Atividade 06 — Apresentação comercial (Canva, exatamente 7 slides)

- [ ] **Slide 1 — Capa:** nome Kinetra, identidade visual e produto.
- [ ] **Slide 2 — Missão, visão e valores.**
- [ ] **Slide 3 — Problemática:** problema atendido pelo tênis autoajustável.
- [ ] **Slide 4 — Solução:** funcionamento, diferenciais e funcionalidades.
- [ ] **Slide 5 — Viabilidade comercial:** custo de produção, preço de venda e cálculo do ROI, com premissas visíveis.
- [ ] **Slide 6 — CTA:** convite para conhecer, testar ou comprar.
- [ ] **Slide 7 — Livre:** conteúdo complementar escolhido pela equipe.
- [ ] Manter exatamente sete slides, linguagem comercial e identidade visual Kinetra.
- [ ] Liberar link de visualização do Canva e validar acesso.

## Organização do trabalho por grupo

| Grupo | Frente principal | Revisão/testes cruzados |
|---|---|---|
| DS A (2) | Banco, autenticação, permissões e endpoints/fluxos confiáveis | Testar páginas/funções que não desenvolveram; apoiar validação do pedido e estoque |
| DS B (2) | React + Vite, páginas e integração do front-end | Testar páginas/funções que não desenvolveram; revisar execução e README |
| Multimídia (2) | Identidade, protótipo Figma, modelo/imagem e Canva | Revisar aplicação visual no site; executar teste somente em tela não desenvolvida por quem testa |

Registrar nomes individuais e a dupla **desenvolvedor → executor** em cada caso de teste. A divisão organiza o trabalho; todos participam da apresentação e ajudam no que for necessário.

## Conferência final antes de enviar

- [ ] Os seis nomes e o nome Kinetra estão corretos em todos os entregáveis.
- [ ] Os PDFs abrem, estão legíveis e respeitam os formatos exigidos.
- [ ] O PDF de testes contém exatamente cinco páginas com resultados, status e evidências reais.
- [ ] O Figma, Tinkercad/Wokwi, Canva e GitHub abrem por seus links compartilhados.
- [ ] O repositório não contém `.env`, senha, token, publishable key copiada em texto de documentação ou chave secret/service role.
- [ ] Apresentação, protótipo, modelo e site descrevem o mesmo produto e as mesmas funcionalidades.
