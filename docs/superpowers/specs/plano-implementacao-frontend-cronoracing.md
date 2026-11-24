# Plano de Implementacao do Frontend Cronoracing

## Objetivo

Construir o frontend da Cronoracing consumindo exclusivamente o contrato OpenAPI publicado pelo backend:

- Desenvolvimento: `GET /api-docs-json`
- Swagger UI: `/api-docs`
- Producao: URL HTTPS do backend configurada em `VITE_API_BASE_URL`

O frontend deve tratar o OpenAPI como fonte de verdade para paths, payloads, enums, campos nullable, respostas e mensagens de erro. Nao duplicar regras de negocio vindas do banco ou criar IDs, categorias, kits, tamanhos ou resultados manualmente.

## Premissas Tecnicas

- Aplicacao hospedada na Vercel.
- API backend hospedada na VPS Hostinger.
- Autenticacao por JWT Bearer.
- Mercado Pago PIX iniciado pelo backend; o frontend nunca acessa tokens do Mercado Pago.
- Mobile-first, responsivo e acessivel.
- Estado remoto com cache e invalidacao por endpoint; estado de formulario separado do estado da API.
- Valores monetarios exibidos em BRL e datas no fuso local do usuario, preservando ISO 8601 internamente.

## Bloqueios Conhecidos

O agente de frontend deve sinalizar estes pontos antes de considerar a entrega final:

1. Recuperacao de senha ainda nao esta disponivel no contrato implementado.
2. CRUD completo de Super Admin e painel completo do organizador ainda esta parcial.
3. A assinatura criptografica do webhook Mercado Pago e responsabilidade exclusiva do backend; nunca implementar isso no navegador.
4. A integracao real com Mercado Pago exige credenciais e um ambiente de homologacao; usar mock apenas durante desenvolvimento local.
5. O endpoint de standings de campeonato deve ser tratado como feature futura ate estar presente no OpenAPI.

## Fases de Execucao

### Fase 0 - Preparacao e Contrato

1. Configurar `VITE_API_BASE_URL` sem incluir `/api` duplicado.
2. Baixar `/api-docs-json` no ambiente de desenvolvimento.
3. Gerar tipos TypeScript a partir do OpenAPI ou manter tipos manuais sincronizados com o arquivo baixado.
4. Criar um cliente HTTP unico com:
   - prefixo `/api`;
   - `Authorization: Bearer <token>` quando autenticado;
   - parse uniforme de erros `{ error }`;
   - timeout e tratamento de indisponibilidade;
   - redirecionamento para login somente quando o token expirar.
5. Criar um modo mock para respostas de eventos, checkout e resultados, sem mascarar erros de contrato.

**Aceite:** a aplicacao inicia sem URL hard-coded, o cliente consegue chamar `/api/health` e erros da API aparecem em formato utilizavel.

### Fase 1 - Fundacao Visual e Navegacao

Criar uma estrutura de paginas com navegacao baseada em permissao:

- `/` vitrine publica;
- `/eventos/:idOrSlug` detalhe do evento;
- `/eventos/:idOrSlug/inscricao` checkout;
- `/resultados/:eventId` resultados ao vivo;
- `/login` autenticacao;
- `/cadastro` cadastro legal;
- `/minha-conta` dados do usuario;
- `/meus-pedidos` pedidos PIX;
- `/meus-resultados` inscricoes do cliente;
- `/organizador/*` painel protegido;
- `/admin/*` painel protegido quando o backend disponibilizar os endpoints.

Implementar estados globais de:

- usuario atual;
- token e expiracao;
- carregamento;
- erro de rede;
- evento selecionado;
- pedido PIX ativo.

**Aceite:** rotas publicas funcionam sem login; rotas protegidas preservam o destino original apos autenticacao; usuario sem permissao nao ve menus nem acessa a pagina diretamente.

### Fase 2 - Vitrine Publica

Consumir `GET /api/public/landing-showcase`.

Exibir:

- `featured_events` como destaque principal;
- `upcoming_events` como grade de eventos;
- filtros por `city`, `state_uf` e `search`;
- estados de carregamento, vazio e erro;
- CTA para abrir o detalhe do evento.

Nao exibir evento cancelado e nao inventar disponibilidade localmente. A URL deve usar `slug` quando disponivel.

**Aceite:** filtros atualizam a consulta, a grade funciona em mobile e desktop, e cada card abre a rota publica do evento.

### Fase 3 - Detalhe do Evento e Formulario de Inscricao

Consumir `GET /api/public/events/{idOrSlug}`.

Exibir:

- titulo, banner, data, cidade e local;
- regulamento em `rules_text`;
- termo em `liability_waiver_text`;
- `distances`;
- `categories`;
- `kits` e `available_shirt_sizes`.

Regras obrigatorias de interface:

- `distance_id`, `category_id`, `kit_id` e `shirt_size` devem ser selects ou controles equivalentes fechados;
- nao permitir texto livre nesses campos;
- atualizar as opcoes de tamanho conforme o kit selecionado;
- usar `NONE` apenas quando `includes_shirt` for falso;
- validar campos obrigatorios antes de enviar;
- bloquear inscricao para evento sem status elegivel;
- mostrar o termo completo antes do aceite.

**Aceite:** um usuario consegue selecionar uma combinacao valida sem digitar IDs, e o payload final corresponde exatamente ao schema do OpenAPI.

### Fase 4 - Cadastro, Login e Sessao

Implementar:

- `POST /api/auth/register`;
- `POST /api/auth/login`;
- `GET /api/auth/me`.

Cadastro deve conter:

- nome, CPF, email e senha;
- data de nascimento anterior ao ano atual;
- genero `M` ou `F`;
- telefone e contato de emergencia diferentes;
- endereco completo;
- `terms_accepted: true`.

Mapear erros:

- `BIRTH_YEAR_INVALID`;
- `EMERGENCY_PHONE_CONFLICT`;
- `TERMS_NOT_ACCEPTED`;
- CPF ou email em conflito;
- credenciais invalidas.

Armazenar o token apenas no mecanismo escolhido pelo projeto, com preferencia por cookie seguro httpOnly quando o backend suportar; nunca enviar JWT para analytics ou logs.

**Aceite:** refresh da pagina preserva uma sessao valida, logout remove a sessao local e `/me` preenche o cadastro do usuario.

### Fase 5 - Checkout PIX Individual e em Grupo

Consumir `POST /api/orders/checkout-pix`.

Fluxo:

1. usuario escolhe `Inscrever a mim mesmo` ou adiciona participantes;
2. para `is_self: true`, carregar dados de `/api/auth/me`;
3. validar cada participante no formulario;
4. exigir `liability_terms_accepted: true` e informar `liability_terms_version`;
5. revisar participantes, kit, tamanho e valor total;
6. enviar um unico array `participants`;
7. exibir QR Code, copia-e-cola, valor, expiracao e split informativo;
8. consultar `GET /api/orders/{orderId}/status` em intervalo controlado;
9. ao receber `PAID`, mostrar confirmacao e comprovantes;
10. parar polling ao receber `PAID`, `EXPIRED`, `CANCELLED` ou erro de autorizacao.

Nao calcular estoque no frontend como fonte de verdade. O total local serve apenas para preview; o valor oficial e o retornado pelo backend.

**Aceite:** o fluxo suporta 1 ou N participantes, nao duplica pedidos por duplo clique, exibe o QR Code em mobile e recupera o status apos recarregar a pagina.

### Fase 6 - Minha Conta, Pedidos e Inscricoes

Implementar telas para:

- dados cadastrais do usuario;
- pedidos pendentes, pagos, expirados e cancelados;
- QR Code de pedidos pendentes;
- comprovantes e dados das inscricoes.

Enquanto os endpoints de listagem ainda nao estiverem no contrato, nao criar chamadas especulativas. Manter a tela marcada como aguardando contrato ou usar mock isolado.

### Fase 7 - Resultados em Tempo Real

Consumir `GET /api/public/events/{eventId}/results`.

Interface obrigatoria:

- `available_category_buttons` deve ser renderizado como botoes clicaveis, nao select;
- `ALL_RANKING_GENERAL` usa `rank_general` em ordem crescente;
- `CATEGORY_GENERAL` filtra registros com `rank_category === null` e ordena por `rank_general`;
- demais categorias usam `category_name` e ordenam por `rank_category`;
- preservar `null` como valor sem converter para zero;
- filtros de distancia, genero e busca usam os query params documentados;
- atualizar a lista sem perder o filtro atual;
- informar `last_updated_at` ao usuario.

Para atualizacao automatica, usar polling com backoff e pausar quando a aba estiver oculta. Nao consultar a tabela do banco diretamente.

**Aceite:** ranking geral, Categoria Geral e categorias especificas exibem ordem correta, sem misturar `rank_general` com `rank_category`.

### Fase 8 - Painel do Organizador

Implementar somente endpoints presentes no OpenAPI:

- criacao e listagem de eventos;
- configuracao de distancias, categorias e kits quando disponibilizadas;
- inscricoes do proprio tenant;
- mudanca de status;
- exportacao CSV quando documentada.

Regras:

- nunca aceitar `organizer_id` vindo de um campo livre para decidir tenant;
- esconder credenciais Mercado Pago;
- nao permitir edicao comum de evento `FINISHED`;
- confirmar operacoes destrutivas ou irreversiveis;
- mostrar diferenca entre estoque disponivel e estoque reservado somente se a API fornecer esses campos.

### Fase 9 - Qualidade e Entrega

Testes obrigatorios:

- cliente HTTP adiciona e remove Bearer corretamente;
- erros `400`, `401`, `403`, `404`, `409` e `503` geram estados visuais coerentes;
- cadastro bloqueia ano atual;
- combos nunca enviam valores fora do OpenAPI;
- checkout envia 1 e N participantes;
- duplo clique nao cria dois pedidos;
- polling encerra ao pagar ou expirar;
- `rank_category: null` aparece na Categoria Geral;
- ranking geral usa `rank_general`;
- layout funciona em 390px, 768px e desktop;
- acessibilidade basica: foco visivel, labels, teclado, contraste e mensagens associadas aos campos.

Antes de publicar:

1. baixar novamente `/api-docs-json`;
2. verificar paths usados pelo frontend contra o contrato;
3. executar lint, typecheck, testes unitarios e build;
4. testar contra backend local;
5. validar variaveis de ambiente da Vercel;
6. testar CORS com o dominio real da Vercel;
7. nao publicar tokens, dados de teste reais ou credenciais Mercado Pago.

## Ordem Recomendada de Entrega

1. Cliente HTTP, tipos, sessao e navegacao.
2. Login, cadastro e `/me`.
3. Vitrine e detalhe do evento.
4. Checkout PIX individual.
5. Checkout multiatleta e polling de pagamento.
6. Resultados e filtros de ranking.
7. Conta, pedidos e comprovantes.
8. Painel do organizador conforme o contrato crescer.
9. Testes, acessibilidade, responsividade e deploy.

## Criterio Final de Aceite

O frontend esta pronto quando um cliente consegue descobrir um evento, autenticar, preencher a si mesmo ou varios participantes, aceitar os termos, gerar um unico PIX, acompanhar a confirmacao e consultar resultados publicos, sem depender de endpoints nao documentados e sem expor segredos financeiros.
