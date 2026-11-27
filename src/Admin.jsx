import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Activity, ArrowRight, ArrowUpRight, BadgeCheck, Boxes, ChartNoAxesColumn, CircleDollarSign, Clock3, LayoutGrid, LogOut, Package, Pencil, Plus, Search, ShoppingBag, Tag, TriangleAlert, X } from 'lucide-react'
import { date, displayProductName, money, payments, productImage, sizes, statuses } from './store'
import './Admin.css'

const sections = [['visao','Visão geral',LayoutGrid],['pedidos','Pedidos',ShoppingBag],['produtos','Produtos',Package]]

function Overview({ data, select }) {
  const [period, setPeriod] = useState(7)
  const days = Array.from({ length: period }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - period + index + 1)
    return date(day)
  })
  const orders = data.orders.filter(item => days.includes(date(item.criado_em)))
  const approved = orders.filter(item => item.status_pagamento === 'aprovado')
  const stocks = data.products.flatMap(product => product.estoque.map(item => ({ ...item, product: displayProductName(product) })))
  const low = stocks.filter(item => item.quantidade <= 3).toSorted((a,b) => a.quantidade - b.quantidade)
  const available = stocks.filter(item => item.quantidade > 0).length
  const lowCount = stocks.filter(item => item.quantidade > 0 && item.quantidade <= 3).length
  const soldOut = stocks.filter(item => item.quantidade === 0).length
  const health = stocks.length ? Math.round(available / stocks.length * 100) : null
  const pending = orders.filter(item => ['recebido','em_preparacao','enviado'].includes(item.status)).length
  const totalApproved = money(approved.reduce((sum, item) => sum + Number(item.total), 0))
  const periodLabel = period === 7 ? 'Últimos 7 dias' : 'Últimos 30 dias'
  const firstName = data.user?.nome?.split(' ')[0] || 'Admin'
  const featuredProduct = data.products.find(product => product.ativo) ?? data.products[0]
  const metrics = [
    { label: 'Pedidos no período', value: orders.length, note: periodLabel, Icon: ShoppingBag, tone: 'orange' },
    { label: 'Em andamento', value: pending, note: 'Recebidos, em preparo ou enviados', Icon: Clock3, tone: 'sand' },
    { label: 'Pagamentos aprovados', value: approved.length, note: 'Pagamentos simulados', Icon: BadgeCheck, tone: 'green' },
    { label: 'Total recebido', value: totalApproved, note: 'Aprovado no período · simulado', Icon: CircleDollarSign, tone: 'purple' },
  ]
  const counts = days.map(day => orders.filter(item => date(item.criado_em) === day).length)
  const max = Math.max(1, ...counts)
  return <div className="dashboard-overview">
    <section className="dashboard-hero" aria-labelledby="dashboard-title">
      <div className="dashboard-hero-copy">
        <p className="dashboard-eyebrow"><span /> Administração <i>·</i> Visão geral</p>
        <h1 id="dashboard-title">Bom dia, {firstName}.</h1>
        <p>Pedidos, pagamentos e estoque da Kinetra em um só lugar.</p>
      </div>
      {featuredProduct && <div className="dashboard-hero-visual" aria-hidden="true"><span /><img src={productImage(featuredProduct, 'gelo')} alt="" /></div>}
      <div className="dashboard-hero-tools">
        <div className="dashboard-date"><span>Hoje</span><strong>{date(new Date())}</strong></div>
        <label>Período<select value={period} onChange={e => setPeriod(Number(e.target.value))}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option></select></label>
        <Link className="dash-account" to="/conta"><i aria-hidden="true">{firstName.slice(0, 1).toUpperCase()}</i><span>Minha conta</span><ArrowUpRight size={16} /></Link>
      </div>
    </section>

    <div className="metrics" role="group" aria-label="Indicadores do período">
      {metrics.map(({ label, value, note, Icon, tone }) => <section className="panel dash-metric" data-tone={tone} key={label}>
        <div className="dash-metric-head"><span>{label}</span><i><Icon size={19} aria-hidden="true" /></i></div>
        <strong>{value}</strong><small>{note}</small>
      </section>)}
    </div>

    <div className="dash-insights">
      <section className="panel stock-panel">
        <div className="dash-panel-heading"><div><p className="dash-panel-kicker">INVENTÁRIO</p><h2>Saúde do estoque</h2></div><span className={'stock-flag ' + (health === null ? '' : low.length ? 'needs-attention' : 'in-good-shape')}>{health === null ? 'Sem dados' : low.length ? `${low.length} em atenção` : 'Estável'}</span></div>
        <div className="stock-overview">
          <div className="gauge" role="img" aria-label={health === null ? 'Sem dados de estoque' : `Disponibilidade do estoque: ${health}%`} style={{ '--health': (health ?? 0) + '%' }}><strong>{health === null ? '—' : `${health}%`}</strong></div>
          <div className="stock-overview-copy"><strong>{health === null ? 'Sem dados de estoque' : `${available} de ${stocks.length} numerações com estoque`}</strong><p>{health === null ? 'Cadastre numerações para acompanhar.' : low.length ? `${low.length} variações precisam de atenção.` : 'Nenhuma variação em nível crítico.'}</p><button className="dash-inline-action" onClick={() => select('estoque')}>Conferir estoque <ArrowRight size={15} /></button></div>
        </div>
        <div className="stock-breakdown"><div><i className="available-dot" /><span>Com estoque</span><strong>{available}</strong></div><div><i className="low-dot" /><span>Estoque baixo</span><strong>{lowCount}</strong></div><div><i className="empty-dot" /><span>Esgotado</span><strong>{soldOut}</strong></div></div>
      </section>

      <section className="panel orders-chart-panel">
        <div className="dash-panel-heading"><div><p className="dash-panel-kicker">ATIVIDADE</p><h2><ChartNoAxesColumn size={19} aria-hidden="true" /> Pedidos ao longo do tempo</h2></div><span className="chart-total">{orders.length}<small>no período</small></span></div>
        <div className="chart-stage">
          {!orders.length && <p className="chart-empty">Nenhum pedido neste período</p>}
          <div className="bars" role="img" aria-label={`${orders.length} pedidos nos ${period} dias selecionados`}>
            {days.map((day, i) => <div key={day} title={day + ' · ' + counts[i] + ' pedidos'}><i style={{ '--bar': counts[i] ? Math.max(8, counts[i] / max * 100) + '%' : '0%' }} />{(period === 7 || i % 5 === 0) && <small>{day.slice(0, 5)}</small>}</div>)}
          </div>
        </div>
        <div className="status-strip">{Object.entries(statuses).map(([key, label]) => <span key={key}>{label} <b>{orders.filter(row => row.status === key).length}</b></span>)}</div>
      </section>
    </div>

    <div className="dash-lower">
      <section className="panel recent-orders-panel"><div className="dash-panel-heading"><div><p className="dash-panel-kicker">ACOMPANHAMENTO</p><h2>Pedidos recentes</h2></div><ShoppingBag size={19} aria-hidden="true" /></div>
        {!data.orders.length && <p className="dash-empty"><ShoppingBag size={17} aria-hidden="true" /> Nenhum pedido registrado.</p>}
        {data.orders.slice(0, 4).map(order => <Link className="recent-order" to={'/pedido/' + order.id} key={order.id}><span className="recent-order-mark"><ShoppingBag size={16} aria-hidden="true" /></span><span className="recent-order-copy"><strong>Pedido #{String(order.id).slice(0, 8)}</strong><small>{date(order.criado_em)}</small></span><span className="recent-order-status">{statuses[order.status] ?? 'Em atualização'}</span><ArrowRight size={15} aria-hidden="true" /></Link>)}
      </section>

      <section className="panel low-stock-panel"><div className="dash-panel-heading"><div><p className="dash-panel-kicker">PONTO DE ATENÇÃO</p><h2>Estoque baixo</h2></div><TriangleAlert size={19} aria-hidden="true" /></div>
        {!low.length && <p className="dash-empty">Nenhum alerta de estoque.</p>}
        {low.slice(0, 4).map(item => <div className="stock-alert-row" key={item.id}><span className="stock-alert-mark"><TriangleAlert size={15} aria-hidden="true" /></span><span><strong>{item.product}</strong><small>BR {item.numeracao}</small></span><b>{item.quantidade === 0 ? 'Esgotado' : `${item.quantidade} un.`}</b></div>)}
      </section>

      <section className="panel quick-actions-panel"><div className="dash-panel-heading"><div><p className="dash-panel-kicker">ACESSO RÁPIDO</p><h2>Atalhos</h2></div><Activity size={19} aria-hidden="true" /></div>
        <button className="quick-action" onClick={() => select('produtos')}><span className="quick-action-icon"><Package size={18} aria-hidden="true" /></span><span><strong>Gerenciar produtos</strong><small>Editar catálogo e preços</small></span><ArrowRight size={16} aria-hidden="true" /></button>
        <button className="quick-action" onClick={() => select('estoque')}><span className="quick-action-icon"><Boxes size={18} aria-hidden="true" /></span><span><strong>Atualizar estoque</strong><small>Conferir numerações</small></span><ArrowRight size={16} aria-hidden="true" /></button>
      </section>
    </div>
  </div>
}

function ProductEditor({ data, save }) {
  const [selected, setSelected] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('todos')
  const item = data.catalog.find(product => product.id === selected)
  const activeCount = data.catalog.filter(product => product.ativo).length
  const totalUnits = data.catalog.reduce((sum, product) => sum + (product.estoque ?? []).reduce((stockSum, row) => stockSum + Number(row.quantidade || 0), 0), 0)
  const filtered = data.catalog.filter(product => {
    const matchesText = `${displayProductName(product)} ${product.slug}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = filter === 'todos' || (filter === 'ativos' ? product.ativo : !product.ativo)
    return matchesText && matchesStatus
  })
  const featured = data.catalog.find(product => product.ativo) ?? data.catalog[0]

  function openEditor(product = null) {
    setSelected(product?.id ?? '')
    setConfirm(false)
    setEditorOpen(true)
  }

  return <div className="admin-content products-admin">
    <section className="catalog-hero" aria-labelledby="catalog-title">
      <div className="catalog-hero-copy">
        <p className="catalog-eyebrow"><span /> CATÁLOGO <i>·</i> PRODUTOS E ESTOQUE</p>
        <h1 id="catalog-title">Produtos</h1>
        <p>Gerencie seus modelos, acompanhe as numerações e mantenha o catálogo atualizado.</p>
        <button className="button catalog-create-button" onClick={() => openEditor()}><Plus size={18} /> Cadastrar produto</button>
      </div>
      {featured && <div className="catalog-hero-shoe" aria-hidden="true"><span /><img src={productImage(featured, 'gelo')} alt="" /></div>}
      <div className="catalog-stats" aria-label="Resumo do catálogo">
        <div><strong>{data.catalog.length}</strong><span>Produtos cadastrados</span></div>
        <div><strong>{activeCount}</strong><span>Ativos na loja</span></div>
        <div><strong>{totalUnits}</strong><span>Unidades em estoque</span></div>
      </div>
    </section>

    <div className="catalog-toolbar">
      <label className="catalog-search"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar produto pelo nome" aria-label="Buscar produto pelo nome" /></label>
      <div className="catalog-filters" role="group" aria-label="Filtrar produtos por status">
        {['todos', 'ativos', 'inativos'].map(option => <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}
      </div>
      <span className="catalog-result-count">{filtered.length} de {data.catalog.length} produtos</span>
    </div>

    {filtered.length ? <div className="catalog-product-list">{filtered.map(product => <CatalogProduct key={product.id} product={product} onEdit={() => openEditor(product)} manageStock={data.manageStock} save={save} />)}</div> :
      <section className="catalog-empty"><span><Package size={23} /></span><h2>{data.catalog.length ? 'Nenhum produto encontrado' : 'Seu catálogo começa aqui'}</h2><p>{data.catalog.length ? 'Tente outro nome ou mude o filtro de status.' : 'Cadastre seu primeiro modelo para organizar preços e estoque.'}</p>{!data.catalog.length && <button className="button primary" onClick={() => openEditor()}><Plus size={17} /> Cadastrar produto</button>}</section>}

    {editorOpen && <section className="catalog-editor" aria-labelledby="product-editor-title">
      <div className="catalog-editor-heading"><div><p className="catalog-eyebrow">{item ? 'DETALHES DO CATÁLOGO' : 'NOVO NO CATÁLOGO'}</p><h2 id="product-editor-title">{item ? 'Editar produto' : 'Cadastrar produto'}</h2><p>Preencha as informações que aparecem na loja.</p></div><button type="button" className="catalog-close" aria-label="Fechar formulário" onClick={() => setEditorOpen(false)}><X size={19} /></button></div>
      <form className="catalog-product-form" key={selected} onSubmit={e => save(e, async f => {
        const value = JSON.parse(f.get('caracteristicas') || '{}')
        if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Informe as características como objeto JSON.')
        await data.manageProduct({ nome: f.get('nome').trim(), slug: f.get('slug').trim(), descricao: f.get('descricao').trim(), preco: Number(f.get('preco')), ativo: f.has('ativo'), tecnologias: f.get('tecnologias').split(',').map(v => v.trim()).filter(Boolean), caracteristicas: value }, selected || null, f.get('imagens').split(/\r?\n/).map(v => v.trim()).filter(Boolean))
        if (!selected) e.target.reset()
      })}>
        <div className="field-grid"><label>Nome do produto<input name="nome" required defaultValue={item?.nome} placeholder="Ex.: Adapt X 2050" /></label><label>Slug da página<input name="slug" required pattern="[a-z0-9-]+" defaultValue={item?.slug} placeholder="adapt-x-2050" /></label><label>Preço (R$)<input name="preco" type="number" min="0" step=".01" required defaultValue={item?.preco} placeholder="0,00" /></label><label>Tecnologias <small>Separe por vírgulas</small><input name="tecnologias" defaultValue={item?.tecnologias?.join(', ')} placeholder="Malha adaptativa, solado..." /></label></div>
        <label>Descrição<textarea name="descricao" required defaultValue={item?.descricao} placeholder="Descreva o produto para a loja." /></label>
        <div className="field-grid"><label>Características <small>Formato JSON</small><textarea name="caracteristicas" defaultValue={JSON.stringify(item?.caracteristicas ?? {}, null, 2)} /></label><label>Imagens <small>Uma URL por linha</small><textarea name="imagens" defaultValue={item?.produto_imagens?.toSorted((a,b) => a.ordem - b.ordem).map(img => img.url).join('\n')} placeholder="https://..." /></label></div>
        <div className="catalog-form-footer"><label className="check"><input name="ativo" type="checkbox" defaultChecked={item?.ativo ?? true} /> Produto ativo na loja</label><button className="button primary">{item ? 'Salvar alterações' : 'Cadastrar produto'}</button></div>
      </form>
      {item && <form className="catalog-delete-form" key={'remover-' + selected} onSubmit={e => save(e, async () => { await data.removeProduct(item.id); setSelected(''); setConfirm(false); setEditorOpen(false) })}><label className="check"><input type="checkbox" required checked={confirm} onChange={e => setConfirm(e.target.checked)} /> Confirmo a exclusão de {displayProductName(item)}.</label><button className="button outline" disabled={!confirm}>Excluir produto</button></form>}
    </section>}
  </div>
}

function CatalogProduct({ product, onEdit, manageStock, save }) {
  const stock = (product.estoque ?? []).toSorted((a, b) => Number(a.numeracao) - Number(b.numeracao))
  const availableSizes = [...new Set([...sizes, ...stock.map(row => Number(row.numeracao))])].sort((a, b) => a - b)
  const [selectedSize, setSelectedSize] = useState(stock[0]?.numeracao ?? availableSizes[0])
  const [quantityDrafts, setQuantityDrafts] = useState({})
  const selectedRow = stock.find(row => Number(row.numeracao) === Number(selectedSize))
  const quantity = quantityDrafts[selectedSize] ?? String(selectedRow?.quantidade ?? 0)
  const totalUnits = stock.reduce((sum, row) => sum + Number(row.quantidade || 0), 0)
  const lowSizes = stock.filter(row => Number(row.quantidade) > 0 && Number(row.quantidade) <= 3).length

  return <article className="catalog-product-card">
    <div className="catalog-product-info">
      <div className="catalog-product-image"><img src={productImage(product, 'gelo')} alt="" loading="lazy" /></div>
      <div className="catalog-product-details">
        <div className="catalog-product-meta"><span className={'catalog-status ' + (product.ativo ? 'is-active' : 'is-inactive')}>{product.ativo ? 'Ativo' : 'Inativo'}</span><span className="catalog-slug"><Tag size={13} /> {product.slug}</span></div>
        <h2>{displayProductName(product)}</h2>
        <p>{product.descricao}</p>
        <div className="catalog-product-bottom"><strong>{money(product.preco)}</strong><span>{stock.length} numerações</span></div>
      </div>
      <button className="catalog-edit-button" type="button" onClick={onEdit}><Pencil size={15} /> Editar produto</button>
    </div>

    <section className="catalog-stock" aria-label={'Estoque de ' + displayProductName(product)}>
      <div className="catalog-stock-heading"><div><p className="catalog-eyebrow">INVENTÁRIO</p><h3>Estoque por numeração</h3></div><div className="catalog-stock-summary"><strong>{totalUnits}</strong><span>unidades</span>{lowSizes > 0 && <i>{lowSizes} em baixa</i>}</div></div>
      <div className="catalog-size-grid">{availableSizes.map(numeracao => {
        const row = stock.find(item => Number(item.numeracao) === Number(numeracao))
        const amount = Number(row?.quantidade ?? 0)
        const level = amount === 0 ? 'empty' : amount <= 3 ? 'low' : 'ready'
        return <button key={numeracao} type="button" data-stock={level} aria-pressed={Number(selectedSize) === Number(numeracao)} aria-label={`Selecionar BR ${numeracao}, ${amount} unidades`} onClick={() => setSelectedSize(numeracao)}><small>BR {numeracao}</small><strong>{amount}</strong><span>un.</span></button>
      })}</div>
      <form className="catalog-stock-form" onSubmit={e => save(e, f => manageStock(product, Number(f.get('numeracao')), Number(f.get('quantidade'))))}>
        <label>Atualizar<select name="numeracao" value={selectedSize} onChange={e => setSelectedSize(Number(e.target.value))}>{availableSizes.map(numeracao => <option key={numeracao} value={numeracao}>BR {numeracao}</option>)}</select></label>
        <label>Unidades<input name="quantidade" type="number" min="0" required value={quantity} onChange={e => setQuantityDrafts(current => ({ ...current, [selectedSize]: e.target.value }))} /></label>
        <button className="button outline">Salvar estoque</button>
      </form>
    </section>
  </article>
}

function OrderEditor({ data, save }) {
  return <div className="admin-content"><h1>Pedidos</h1>{!data.orders.length && <p className="panel">Nenhum pedido registrado.</p>}{data.orders.map(order => <form className="panel row-form" key={order.id + order.status + order.status_pagamento} onSubmit={e => save(e, f => data.manageOrder(order.id, { status: f.get('status'), status_pagamento: f.get('pagamento') }))}><Link to={'/pedido/' + order.id}>#{String(order.id).slice(0,8)} · {money(order.total)}</Link><label>Pedido<select name="status" defaultValue={order.status}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Pagamento simulado<select name="pagamento" defaultValue={order.status_pagamento}>{Object.entries(payments).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button className="button primary">Atualizar</button></form>)}</div>
}

export function Admin({ data }) {
  const [params, setParams] = useSearchParams()
  const requestedTab = params.get('aba')
  const tab = requestedTab === 'estoque' ? 'produtos' : sections.find(([id]) => id === requestedTab)?.[0] ?? 'visao'
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  function select(value) { setParams({ aba: value === 'estoque' ? 'produtos' : value }); setMessage(null) }
  async function save(e, action) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage(null)
    try { await action(new FormData(e.currentTarget)); setMessage({ text: 'Alterações salvas.' }) } catch (error) { setMessage({ error: true, text: error.message }) } finally { setBusy(false) }
  }
  return <main className="dashboard"><aside className="dash-nav"><div className="dash-brand"><Link className="brand" to="/" aria-label="Voltar à loja"><span className="dash-brand-mark"><span className="dash-brand-letter">K</span><i className="dash-brand-dot" aria-hidden="true" /></span></Link><span><strong>KINETRA</strong><small>PAINEL ADMIN</small></span></div><p className="dash-nav-heading">MENU PRINCIPAL</p><nav aria-label="Administração">{sections.map(([id, label, Icon]) => <button className="dash-nav-item" key={id} aria-pressed={tab === id} onClick={() => select(id)}><Icon size={19} /><span>{label}</span><ArrowRight className="dash-nav-chevron" size={15} /></button>)}</nav><div className="dash-nav-spacer" /><Link className="dash-nav-store" to="/"><ArrowUpRight size={17} /><span>Ver loja</span></Link><button className="dash-nav-logout" onClick={() => data.logout().catch(error => setMessage({ error: true, text: error.message }))}><LogOut size={18} /><span>Sair</span></button></aside>
    <div className="dash-main" aria-busy={busy}>{message && <p role={message.error ? 'alert' : 'status'} className={message.error ? 'error' : 'notice'}>{message.text}</p>}<div className="switch-content" key={tab}>{tab === 'visao' && <Overview data={data} select={select} />}{tab === 'produtos' && <ProductEditor data={data} save={save} />}{tab === 'pedidos' && <OrderEditor data={data} save={save} />}</div></div>
  </main>
}
