import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Activity, ArrowRight, ArrowUpRight, BadgeCheck, Boxes, ChartNoAxesColumn, CircleDollarSign, Clock3, LayoutGrid, LogOut, Package, ShoppingBag, TriangleAlert } from 'lucide-react'
import { date, money, payments, productImage, statuses } from './store'
import './Admin.css'

const sections = [['visao','Visão geral',LayoutGrid],['pedidos','Pedidos',ShoppingBag],['produtos','Produtos',Package],['estoque','Estoque',Boxes]]

function Overview({ data, select }) {
  const [period, setPeriod] = useState(7)
  const days = Array.from({ length: period }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - period + index + 1)
    return date(day)
  })
  const orders = data.orders.filter(item => days.includes(date(item.criado_em)))
  const approved = orders.filter(item => item.status_pagamento === 'aprovado')
  const stocks = data.products.flatMap(product => product.estoque.map(item => ({ ...item, product: product.nome })))
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
      {featuredProduct && <div className="dashboard-hero-visual" aria-hidden="true"><span /><img src={productImage(featuredProduct, 'marinho')} alt="" /></div>}
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
  const item = data.catalog.find(product => product.id === selected)
  return <div className="admin-content"><h1>Produtos</h1><div className="admin-list">{data.catalog.map(product => <button className="panel product-manage" key={product.id} onClick={() => setSelected(product.id)} aria-pressed={selected === product.id}><img src={productImage(product, 'marinho')} alt="" /><span><strong>{product.nome}</strong><small>{product.ativo ? 'Ativo' : 'Inativo'} · {money(product.preco)}</small></span></button>)}<button className="button outline" onClick={() => setSelected('')}>Novo produto</button></div>
    <form className="panel" key={selected} onSubmit={e => save(e, async f => {
      const value = JSON.parse(f.get('caracteristicas') || '{}')
      if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Informe as características como objeto JSON.')
      await data.manageProduct({ nome: f.get('nome').trim(), slug: f.get('slug').trim(), descricao: f.get('descricao').trim(), preco: Number(f.get('preco')), ativo: f.has('ativo'), tecnologias: f.get('tecnologias').split(',').map(v => v.trim()).filter(Boolean), caracteristicas: value }, selected || null, f.get('imagens').split(/\r?\n/).map(v => v.trim()).filter(Boolean))
      if (!selected) e.target.reset()
    })}><h2>{item ? 'Editar produto' : 'Cadastrar produto'}</h2><div className="field-grid"><label>Nome<input name="nome" required defaultValue={item?.nome} /></label><label>Slug<input name="slug" required pattern="[a-z0-9-]+" defaultValue={item?.slug} /></label><label>Preço (R$)<input name="preco" type="number" min="0" step=".01" required defaultValue={item?.preco} /></label><label>Tecnologias (separadas por vírgulas)<input name="tecnologias" defaultValue={item?.tecnologias?.join(', ')} /></label></div><label>Descrição<textarea name="descricao" required defaultValue={item?.descricao} /></label><div className="field-grid"><label>Características (JSON)<textarea name="caracteristicas" defaultValue={JSON.stringify(item?.caracteristicas ?? {}, null, 2)} /></label><label>URLs de imagens (uma por linha)<textarea name="imagens" defaultValue={item?.produto_imagens?.toSorted((a,b) => a.ordem - b.ordem).map(img => img.url).join('\n')} /></label></div><label className="check"><input name="ativo" type="checkbox" defaultChecked={item?.ativo ?? true} /> Produto ativo</label><button className="button primary">Salvar produto</button></form>
    {item && <form className="panel" key={'remover-' + selected} onSubmit={e => save(e, async () => { await data.removeProduct(item.id); setSelected(''); setConfirm(false) })}>
      <label className="check"><input type="checkbox" required checked={confirm} onChange={e => setConfirm(e.target.checked)} /> Confirmo a exclusão de {item.nome}.</label>
      <button className="button outline" disabled={!confirm}>Excluir produto</button>
    </form>}
  </div>
}

function StockEditor({ data, save }) {
  const [selected, setSelected] = useState('')
  const item = data.catalog.find(product => product.id === selected) ?? data.catalog[0]
  return <div className="admin-content"><h1>Estoque</h1>{!item ? <p>Cadastre um produto para gerenciar o estoque.</p> : <><label>Produto<select value={item.id} onChange={e => setSelected(e.target.value)}>{data.catalog.map(product => <option key={product.id} value={product.id}>{product.nome}</option>)}</select></label>
    <form className="panel row-form" key={item.id} onSubmit={e => save(e, f => data.manageStock(item, Number(f.get('numeracao')), Number(f.get('quantidade'))))}><label>Numeração<input name="numeracao" type="number" min="20" max="55" required /></label><label>Quantidade<input name="quantidade" type="number" min="0" required /></label><button className="button primary">Salvar estoque</button></form>
    <div className="panel">{item.estoque.toSorted((a,b) => a.numeracao - b.numeracao).map(row => <div className="inventory-row" key={row.id}><strong>BR {row.numeracao}</strong><span>{row.quantidade} un.</span><span>{row.quantidade === 0 ? 'Esgotado' : row.quantidade <= 3 ? 'Estoque baixo' : 'Disponível'}</span></div>)}</div></>}</div>
}

function OrderEditor({ data, save }) {
  return <div className="admin-content"><h1>Pedidos</h1>{!data.orders.length && <p className="panel">Nenhum pedido registrado.</p>}{data.orders.map(order => <form className="panel row-form" key={order.id + order.status + order.status_pagamento} onSubmit={e => save(e, f => data.manageOrder(order.id, { status: f.get('status'), status_pagamento: f.get('pagamento') }))}><Link to={'/pedido/' + order.id}>#{String(order.id).slice(0,8)} · {money(order.total)}</Link><label>Pedido<select name="status" defaultValue={order.status}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Pagamento simulado<select name="pagamento" defaultValue={order.status_pagamento}>{Object.entries(payments).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button className="button primary">Atualizar</button></form>)}</div>
}

export function Admin({ data }) {
  const [params, setParams] = useSearchParams()
  const tab = sections.find(([id]) => id === params.get('aba'))?.[0] ?? 'visao'
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  function select(value) { setParams({ aba: value }); setMessage(null) }
  async function save(e, action) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage(null)
    try { await action(new FormData(e.currentTarget)); setMessage({ text: 'Alterações salvas.' }) } catch (error) { setMessage({ error: true, text: error.message }) } finally { setBusy(false) }
  }
  return <main className="dashboard"><aside className="dash-nav"><div className="dash-brand"><Link className="brand" to="/" aria-label="Voltar à loja"><span className="dash-brand-mark"><span className="dash-brand-letter">K</span><i className="dash-brand-dot" aria-hidden="true" /></span></Link><span><strong>KINETRA</strong><small>PAINEL ADMIN</small></span></div><p className="dash-nav-heading">MENU PRINCIPAL</p><nav aria-label="Administração">{sections.map(([id, label, Icon]) => <button className="dash-nav-item" key={id} aria-pressed={tab === id} onClick={() => select(id)}><Icon size={19} /><span>{label}</span><ArrowRight className="dash-nav-chevron" size={15} /></button>)}</nav><div className="dash-nav-spacer" /><Link className="dash-nav-store" to="/"><ArrowUpRight size={17} /><span>Ver loja</span></Link><button className="dash-nav-logout" onClick={() => data.logout().catch(error => setMessage({ error: true, text: error.message }))}><LogOut size={18} /><span>Sair</span></button></aside>
    <div className="dash-main" aria-busy={busy}>{message && <p role={message.error ? 'alert' : 'status'} className={message.error ? 'error' : 'notice'}>{message.text}</p>}<div className="switch-content" key={tab}>{tab === 'visao' && <Overview data={data} select={select} />}{tab === 'produtos' && <ProductEditor data={data} save={save} />}{tab === 'estoque' && <StockEditor data={data} save={save} />}{tab === 'pedidos' && <OrderEditor data={data} save={save} />}</div></div>
  </main>
}
