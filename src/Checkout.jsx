import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { colors, date, displayProductName, isAdaptXProduct, money, payments, productImage, shipping, statuses } from './store'

const fields = [
  ['destinatario', 'Destinatário'], ['cep', 'CEP'], ['logradouro', 'Logradouro'], ['numero', 'Número'],
  ['complemento', 'Complemento', false], ['bairro', 'Bairro'], ['cidade', 'Cidade'], ['estado', 'UF'], ['telefone', 'Telefone', false],
]
export function AddressFields({ address = {} }) {
  return <div className="field-grid">{fields.map(([key, label, required = true]) => <label key={key}>{label}<input name={key} required={required} defaultValue={address[key] ?? ''} maxLength={key === 'estado' ? 2 : key === 'cep' ? 9 : 160} pattern={key === 'estado' ? '[A-Za-z]{2}' : key === 'cep' ? '[0-9]{5}-?[0-9]{3}' : undefined} /></label>)}</div>
}
function addressData(form) {
  const data = new FormData(form)
  return { ...Object.fromEntries(fields.map(([key]) => [key, data.get(key)?.trim() ?? ''])), estado: data.get('estado').toUpperCase(), principal: data.has('principal') }
}
function compactAddress(item) {
  return item.retirada ? 'Retirada na loja' : [item.logradouro && item.logradouro + ', ' + item.numero, item.cidade, item.estado, item.cep].filter(Boolean).join(' · ')
}
function enrich(data) {
  return data.cart.map(item => {
    const product = data.products.find(product => product.id === item.produto_id)
    const quantity = data.cart.filter(line => line.estoque_id === item.estoque_id).reduce((sum, line) => sum + line.quantidade, 0)
    const stock = product?.estoque.find(stock => stock.id === item.estoque_id)
    return { ...item, product, stock, available: !!stock && quantity <= stock.quantidade, canAdd: !!stock && quantity < stock.quantidade }
  })
}
function EmptyCart() {
  return <div className="empty panel"><ShoppingBag size={38} /><h2>Sua sacola está vazia</h2><Link className="button primary" to="/loja">Voltar para a loja</Link></div>
}
function Totals({ subtotal, fee }) {
  return <dl className="totals"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>{fee !== undefined && <><div><dt>Frete simulado</dt><dd>{money(fee)}</dd></div><div><dt>Total</dt><dd>{money(subtotal + fee)}</dd></div></>}</dl>
}

export function Cart({ data }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [removed, setRemoved] = useState(null)
  const [estimate, setEstimate] = useState(false)
  const items = enrich(data)
  const subtotal = items.reduce((sum, item) => sum + Number(item.product?.preco ?? 0) * item.quantidade, 0)
  const blocked = items.some(item => !item.available) || busy
  async function update(next, lastRemoved) {
    setBusy(true)
    setError('')
    try { await data.saveCart(next); setRemoved(lastRemoved ?? null) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  function quantity(key, delta) {
    update(data.cart.map(item => item.key === key ? { ...item, quantidade: item.quantidade + delta } : item))
  }
  return <main className="page-pad inner-page"><p className="eyebrow">SUA SELEÇÃO</p><h1>SACOLA</h1>
    {error && <p role="alert" className="error">{error}</p>}
    {removed && <p className="notice">Item removido. <button className="text-button" disabled={busy} onClick={() => update([...data.cart, removed])}>Desfazer</button></p>}
    {items.length === 0 ? <EmptyCart /> : <div className="checkout-grid"><div className="panel cart-items">
      <div className="cart-head"><span>Produto</span><span>Quantidade</span><span>Total</span></div>
      {items.map(item => <div className="cart-line" key={item.key}>
        <div className="line-product"><img src={productImage(item.product, item.cor)} alt="" /><div><strong>{item.product?.nome ?? 'Produto indisponível'}</strong><small>{colors[item.cor]?.name} · BR {item.numeracao}</small>{item.product && <small>{money(item.product.preco)} / un.</small>}{!item.available && <small className="error">Estoque insuficiente</small>}</div></div>
        <div className="line-actions"><div className="stepper"><button disabled={busy || item.quantidade <= 1} aria-label="Reduzir quantidade" onClick={() => quantity(item.key, -1)}><Minus size={16} /></button><span>{item.quantidade}</span><button disabled={busy || !item.canAdd} aria-label="Aumentar quantidade" onClick={() => quantity(item.key, 1)}><Plus size={16} /></button></div><button className="text-button" disabled={busy} onClick={() => update(data.cart.filter(line => line.key !== item.key), data.cart.find(line => line.key === item.key))}><Trash2 size={14} /> Remover</button></div>
        <strong>{money(Number(item.product?.preco ?? 0) * item.quantidade)}</strong>
      </div>)}
    </div><aside className="panel dark summary"><h2>Resumo</h2><Totals subtotal={subtotal} /><details><summary>Estimar entrega</summary><form onSubmit={e => { e.preventDefault(); setEstimate(true) }}><label>CEP<input required pattern="[0-9]{5}-?[0-9]{3}" placeholder="00000-000" onChange={() => setEstimate(false)} /></label><button className="button outline">Calcular</button></form>{estimate && <p>Frete simulado {money(shipping('entrega'))}</p>}</details>
      {blocked ? <button className="button primary" type="button" disabled>Continuar para entrega</button> : <Link className="button primary" to="/finalizar">Continuar para entrega</Link>}
    </aside></div>}
    <Link className="back-link" to="/loja"><ArrowLeft size={16} /> Continuar comprando</Link>
  </main>
}

export function Checkout({ data }) {
  const navigate = useNavigate()
  const [method, setMethod] = useState(() => data.cart.at(-1)?.metodo ?? 'entrega')
  const [addressId, setAddressId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const requestId = useRef(null)
  const items = enrich(data)
  if (!items.length) return <main className="page-pad inner-page"><EmptyCart /></main>
  const selected = addressId ?? (data.addresses.find(item => item.principal) ?? data.addresses[0])?.id ?? 'novo'
  const total = items.reduce((sum, item) => sum + Number(item.product?.preco ?? 0) * item.quantidade, 0)
  async function submit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setBusy(true)
    setError('')
    requestId.current ??= crypto.randomUUID()
    try {
      const address = method === 'retirada' ? null : selected === 'novo' ? await data.saveAddress(addressData(form)) : data.addresses.find(row => row.id === selected)
      if (address) setAddressId(address.id)
      const id = await data.checkout(address, method, formData.get('pagamento'), formData.get('resultado'), requestId.current)
      navigate('/pedido/' + id)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <main className="page-pad inner-page"><p className="eyebrow">CHECKOUT</p><h1>FINALIZAR PEDIDO</h1><form className="checkout-grid" onSubmit={submit}>
    <div className="checkout-steps">
      <section className="panel"><h2>1. Recebimento</h2><label>Como você quer receber?<select value={method} onChange={e => setMethod(e.target.value)}><option value="entrega">Entrega simulada</option><option value="retirada">Retirada simulada</option></select></label>
      {method === 'entrega' && <><label>Endereço<select value={selected} onChange={e => setAddressId(e.target.value)}>{data.addresses.map(item => <option key={item.id} value={item.id}>{compactAddress(item)}</option>)}<option value="novo">Adicionar endereço</option></select></label>{selected === 'novo' && <AddressFields />}</>}</section>
      <section className="panel"><h2>2. Pagamento</h2><p>Escolha um método e confira o resultado do pagamento simulado.</p><div className="field-grid"><label>Método<select name="pagamento"><option value="pix">Pix simulado</option><option value="cartao">Cartão simulado</option></select></label><label>Resultado<select name="resultado"><option value="aprovado">Aprovado</option><option value="recusado">Recusado</option></select></label></div></section>
    </div><aside className="panel dark summary"><h2>3. Revise o pedido</h2>{items.map(item => <div className="line-product small" key={item.key}><img alt="" src={productImage(item.product, item.cor)} /><div><strong>{item.product?.nome ?? 'Produto indisponível'}</strong><small>{colors[item.cor]?.name} · BR {item.numeracao} · {item.quantidade} un.</small></div></div>)}<Totals subtotal={total} fee={shipping(method)} /><button className="button primary" disabled={busy || items.some(item => !item.available)}>{busy ? 'Processando…' : 'Simular pagamento'}</button>{error && <p role="alert" className="error">{error}</p>}</aside>
  </form></main>
}

export function Order({ order, products, admin }) {
  const back = admin ? '/admin?aba=pedidos' : '/conta?aba=pedidos'
  const backLabel = admin ? 'Voltar à gestão de pedidos' : 'Voltar aos meus pedidos'
  if (!order) return <main className="page-pad inner-page"><h1>Pedido indisponível</h1><Link className="button outline" to={back}>{backLabel}</Link></main>
  const steps = Object.keys(statuses).slice(0, 4)
  const current = steps.indexOf(order.status)
  return <main className="page-pad inner-page"><p className="eyebrow">ACOMPANHAMENTO SIMULADO</p><h1>{order.status === 'cancelado' ? 'PEDIDO CANCELADO' : 'PEDIDO REGISTRADO'}</h1><p>Pedido #{String(order.id).slice(0, 8)} · {date(order.criado_em)}</p>
    <section className="panel order-summary"><h2>{statuses[order.status]}</h2><p>Pagamento simulado · <strong>{payments[order.status_pagamento]}</strong></p>
    {current >= 0 && <ol className="timeline">{steps.map((step, index) => <li key={step} data-complete={index <= current} aria-current={index === current ? 'step' : undefined}><i>{index <= current ? <Check size={16} /> : index + 1}</i>{statuses[step]}</li>)}</ol>}
    <h3>Recebimento</h3><p>{compactAddress(order.endereco_entrega ?? {})}</p>
    {order.pedido_itens?.map((item, i) => { const product = products.find(p => p.id === item.produto_id); return <div className="line-product small" key={item.id ?? i}><img alt="" src={productImage(product, item.cor)} /><div><strong>{isAdaptXProduct(product) ? displayProductName(product) : item.nome_produto}</strong><small>{colors[item.cor]?.name} · BR {item.numeracao} · {item.quantidade} un. · {money(item.preco_unitario)}</small></div></div> })}<Totals subtotal={Number(order.subtotal)} fee={Number(order.frete)} /></section>
    <Link className="back-link" to={back}><ArrowLeft size={16} /> {backLabel}</Link>
  </main>
}

export function Account({ data }) {
  const [params, setParams] = useSearchParams()
  const requestedTab = params.get('aba')
  const tab = ['enderecos', 'pedidos'].includes(requestedTab) ? requestedTab : 'perfil'
  const [edit, setEdit] = useState(null)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  async function save(e, action) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    try { await action(e.currentTarget); setMessage({ text: 'Alterações salvas.' }) } catch (error) { setMessage({ text: error.message, error: true }) } finally { setBusy(false) }
  }
  return <main className="page-pad inner-page"><p className="eyebrow">OLÁ, {data.user.nome}</p><h1>MINHA CONTA</h1>
    {data.role === 'admin' && <Link className="button outline" to="/admin">Abrir administração</Link>}
    <div className="tabs">{[['perfil','Meu perfil'],['enderecos','Endereços'],['pedidos','Meus pedidos']].map(([key, label]) => <button key={key} aria-pressed={key === tab} onClick={() => { setParams({ aba: key }); setMessage(null) }}>{label}</button>)}<button onClick={() => data.logout().catch(error => setMessage({ error: true, text: error.message }))}>Sair</button></div>
    {data.issue && <p className="notice" role="status">{data.issue}</p>}
    {message && <p role={message.error ? 'alert' : 'status'} className={message.error ? 'error' : 'notice'}>{message.text}</p>}
    <div className="switch-content" key={tab}>{tab === 'perfil' && <form className="panel narrow" key={data.user.id + data.user.nome} onSubmit={e => save(e, form => { const f = new FormData(form); return data.saveProfile({ nome: f.get('nome').trim(), numeracao_preferida: Number(f.get('numeracao')) || null }) })}><label>Nome<input required name="nome" defaultValue={data.user.nome} /></label><label>E-mail<input disabled value={data.user.email ?? ''} /></label><label>Numeração preferida<input name="numeracao" type="number" min="20" max="55" defaultValue={data.user.numeracao_preferida ?? ''} /></label><button disabled={busy} className="button primary">Salvar perfil</button></form>}
    {tab === 'enderecos' && <div className="account-items">{data.addresses.map(item => <section className="panel" key={item.id}><strong>{item.destinatario} {item.principal && '· Principal'}</strong><p>{compactAddress(item)}</p><button className="text-button" onClick={() => setEdit(item)}>Editar</button></section>)}<button className="button outline" onClick={() => setEdit({})}>Adicionar endereço</button>
      {edit && <form key={edit.id ?? 'novo'} className="panel switch-content" onSubmit={e => save(e, async form => { await data.saveAddress(addressData(form), edit.id); setEdit(null) })}><h2>{edit.id ? 'Editar endereço' : 'Novo endereço'}</h2><AddressFields address={edit} /><label className="check"><input name="principal" type="checkbox" defaultChecked={edit.principal} /> Endereço principal</label><button disabled={busy} className="button primary">Salvar endereço</button> <button type="button" className="button outline" onClick={() => setEdit(null)}>Cancelar</button></form>}</div>}
    {tab === 'pedidos' && <div className="account-items">{!data.orders.length && <p className="panel">Nenhum pedido registrado.</p>}{data.orders.filter(order => order.usuario_id === data.user.id).map(order => <Link className="panel account-order" key={order.id} to={'/pedido/' + order.id}><strong>Pedido #{String(order.id).slice(0, 8)}</strong><span>{date(order.criado_em)}</span><span>{statuses[order.status]}</span><b>{money(order.total)}</b></Link>)}</div>}</div>
  </main>
}
