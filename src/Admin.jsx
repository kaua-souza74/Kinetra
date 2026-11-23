import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Boxes, ChartNoAxesColumn, LayoutGrid, LogOut, Package, ShoppingBag } from 'lucide-react'
import { date, money, payments, productImage, statuses } from './store'

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
  const health = stocks.length ? Math.round(stocks.filter(item => item.quantidade > 0).length / stocks.length * 100) : null
  const metrics = [['Pedidos no período', orders.length], ['Em andamento', orders.filter(item => ['recebido','em_preparacao','enviado'].includes(item.status)).length], ['Pagamentos aprovados · sim.', approved.length], ['Total recebido · sim.', money(approved.reduce((sum, item) => sum + Number(item.total), 0))]]
  const counts = days.map(day => orders.filter(item => date(item.criado_em) === day).length)
  const max = Math.max(1, ...counts)
  return <><div className="section-head dash-title"><div><p className="eyebrow">PAINEL DA LOJA</p><h1>Bom dia, {data.user.nome.split(' ')[0]}.</h1></div><div className="dash-tools"><label>Período<select value={period} onChange={e => setPeriod(Number(e.target.value))}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option></select></label><Link className="dash-account" to="/conta"><i aria-hidden="true">{data.user.nome.slice(0, 1).toUpperCase()}</i><span>Minha conta</span></Link></div></div>
    <div className="metrics">{metrics.map(([name, value]) => <div className="panel" key={name}><span>{name}</span><strong>{value}</strong></div>)}</div>
    <div className="dash-charts"><section className="panel"><h2>Saúde do estoque</h2>{health === null ? <p>Nenhuma variação cadastrada.</p> : <><div className="gauge" style={{ '--health': health + '%' }}><strong>{health}%</strong></div><p>{stocks.length} numerações em produtos ativos</p><p>{low.length} com estoque baixo ou esgotado</p></>}</section>
    <section className="panel"><h2><ChartNoAxesColumn size={21} /> Pedidos ao longo do tempo</h2><div className="bars" aria-label="Pedidos por dia">{days.map((day,i) => <div key={day} title={day + ' · ' + counts[i] + ' pedidos'}><i style={{ '--bar': Math.max(3, counts[i] / max * 100) + '%' }} />{(period === 7 || i % 5 === 0) && <small>{day.slice(0, 5)}</small>}</div>)}</div><div className="status-strip">{Object.entries(statuses).map(([key,label]) => <span key={key}>{label} <b>{orders.filter(row => row.status === key).length}</b></span>)}</div></section></div>
    <div className="dash-bottom"><section className="panel dark"><h2>Pedidos recentes</h2>{!data.orders.length && <p>Nenhum pedido registrado.</p>}{data.orders.slice(0, 4).map(order => <Link to={'/pedido/' + order.id} key={order.id}>#{String(order.id).slice(0,8)} · {statuses[order.status]}</Link>)}</section>
    <section className="panel"><h2>Estoque baixo</h2>{!low.length && <p>Nenhum alerta de estoque.</p>}{low.slice(0, 4).map(item => <p key={item.id}>{item.product} · BR {item.numeracao} · {item.quantidade} un.</p>)}</section>
    <section className="panel"><h2>Atalhos</h2><button className="button outline" onClick={() => select('produtos')}>Gerenciar produtos</button><button className="button outline" onClick={() => select('estoque')}>Atualizar estoque</button></section></div>
  </>
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
  return <main className="dashboard"><aside className="dash-nav"><Link className="brand" to="/" aria-label="Voltar à loja">K<span>.</span></Link><nav aria-label="Administração">{sections.map(([id, label, Icon]) => <button key={id} aria-pressed={tab === id} onClick={() => select(id)}><Icon size={20} /><span>{label}</span></button>)}</nav><button onClick={() => data.logout().catch(error => setMessage({ error: true, text: error.message }))}><LogOut size={20} /><span>Sair</span></button></aside>
    <div className="dash-main" aria-busy={busy}>{message && <p role={message.error ? 'alert' : 'status'} className={message.error ? 'error' : 'notice'}>{message.text}</p>}<div className="switch-content" key={tab}>{tab === 'visao' && <Overview data={data} select={select} />}{tab === 'produtos' && <ProductEditor data={data} save={save} />}{tab === 'estoque' && <StockEditor data={data} save={save} />}{tab === 'pedidos' && <OrderEditor data={data} save={save} />}</div></div>
  </main>
}
