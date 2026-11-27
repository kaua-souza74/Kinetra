import { useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUpRight, Box, Expand, Feather, Footprints, SlidersHorizontal, MoveDiagonal, Plus, X } from 'lucide-react'
import { assets, colors, displayProductName, isAdaptXProduct, money, productImage, shipping } from './store'
import { BrandOverview } from './BrandOverview'
import './Home.css'

const features = [
  [MoveDiagonal, 'Ajuste automático', 'Comprimento, largura e volume'],
  [Footprints, 'Conforto', 'Malha que envolve o pé'],
  [Box, 'Amortecimento', 'Solado segmentado'],
  [Feather, 'Leveza', 'Estrutura sem cadarços'],
]

export function Home({ products, motion }) {
  const [color, setColor] = useState('gelo')
  const benefits = useRef(null)
  const product = products.find(isAdaptXProduct) ?? products[0]
  const target = product ? '/produto/' + product.slug + '?cor=' + color : '/loja'
  return <main className="home">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span /> CALÇADO ADAPTATIVO</p>
        <h1 id="hero-title">
          <span>Feito para <span className="hero-outline">acompanhar</span></span>{' '}
          <em>cada <span className="hero-underline">movimento<svg viewBox="0 0 250 15" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 10 Q72 2 141 4 T247 6" /><path pathLength="1" d="M16 13 Q102 6 216 8" /></svg></span>.</em>
        </h1>
      </div>
      <div className="hero-showcase" data-color={color}>
        <div className="hero-art">
          <div className="hero-ring" aria-hidden="true" />
          <div className="hero-particles" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
          <img key={color} src={productImage(product, color)} alt={displayProductName(product) + ' na cor ' + colors[color].name} fetchPriority="high" width="1536" height="1024" />
          <span className="hero-note hero-note-fit" aria-hidden="true">Ajuste automático</span>
          <span className="hero-note hero-note-sole" aria-hidden="true">Solado segmentado</span>
        </div>
      </div>
      <aside className="hero-product">
        <h2>{displayProductName(product)}</h2>
        <p className="hero-description">O tênis se expande para calçar e se molda ao seu pé.</p>
        {product && <strong>{money(product.preco)}</strong>}
        <Link to={target} className="button primary">Conheça o Kinetra <ArrowUpRight size={17} /></Link>
        <div className="hero-variants">
          <p aria-live="polite">{colors[color].name}</p>
          <div className="miniatures" role="group" aria-label="Cor do Adapt X 2050">{Object.keys(colors).map(key => <button key={key} type="button" aria-label={colors[key].name} aria-pressed={color === key} onClick={() => setColor(key)}><img src={productImage(product, key)} alt="" /></button>)}</div>
        </div>
      </aside>
      <button type="button" className="hero-scroll" onClick={() => {
        benefits.current?.focus({ preventScroll: true })
        benefits.current?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' })
      }}><ArrowDown size={17} aria-hidden="true" /> Continue explorando</button>
    </section>
    <section ref={benefits} className="feature-strip" tabIndex={-1} aria-label="Características do Adapt X 2050">{features.map(([Icon, title, description]) => <div key={title}><Icon size={21} aria-hidden="true" /><div><strong>{title}</strong><small>{description}</small></div></div>)}</section>
    <section id="colecao" className="collection page-pad" data-reveal>
      <div className="section-head"><div><p className="eyebrow">EM DESTAQUE</p><h2>NOSSA COLEÇÃO</h2></div><Link className="button outline" to="/colecao">Ver coleção <ArrowUpRight size={16} /></Link></div>
      <CollectionCards products={products} />
    </section>
    <section id="ajuste" className="home-adjust page-pad" data-reveal>
      <div><p className="eyebrow">COMO FUNCIONA</p><h2>UM TÊNIS QUE SE MOLDA AO SEU PÉ.</h2><p>A estrutura se expande para calçar e se contrai para acompanhar o comprimento, a largura e o volume do pé.</p><Link className="button primary" to="/como-funciona">Explore o ajuste</Link></div>
      <Adjustment />
    </section>
    <BrandOverview />
  </main>
}

function CollectionCards({ products }) {
  if (!products.length) return <p className="notice">Nenhum produto disponível no momento.</p>
  return <div className="product-grid collection-grid">{products.flatMap((item, index) => isAdaptXProduct(item)
    ? Object.keys(colors).map(variant => <ProductCard key={item.id + variant} item={item} variant={variant} />)
    : <ProductCard key={item.id} item={item} index={index} />)}</div>
}

export function Collection({ products }) {
  const forma = products.find(isAdaptXProduct)
  return <main className="page-pad inner-page editorial-page">
    <section className="editorial-hero collection-hero">
      <div>
        <p className="eyebrow">COLEÇÃO KINETRA</p>
        <h1>Conheça o <em>Adapt X.</em></h1>
        <p>O Kinetra Adapt X 2050 está disponível em cinco combinações de cores. Selecione a sua para configurar o par.</p>
        <Link to="/loja" className="button primary">Ver todos na loja</Link>
      </div>
      <img src={productImage(forma, 'gelo')} alt="Tênis Kinetra Adapt X 2050 na cor Gelo / Azul" width="1536" height="1024" />
    </section>
    <section className="editorial-section" aria-labelledby="colecao-titulo" data-reveal>
      <div className="section-head"><h2 id="colecao-titulo">Escolha sua cor</h2><Link to="/como-funciona" className="button outline">Como funciona o ajuste</Link></div>
      <CollectionCards products={products} />
    </section>
  </main>
}

function ProductCard({ item, index = 0, variant }) {
  const color = variant ?? (isAdaptXProduct(item) ? 'gelo' : Object.keys(colors)[index % Object.keys(colors).length])
  return <Link className="product-card" data-color={color} to={'/produto/' + item.slug + (variant ? '?cor=' + variant : '')}>
    <div className="card-art"><img src={productImage(item, color)} alt="" loading="lazy" /></div>
    <div className="card-meta"><div><small>{variant ? colors[variant].name : isAdaptXProduct(item) ? '5 cores disponíveis' : 'Kinetra'}</small><h3>{displayProductName(item)}</h3><strong>{money(item.preco)}</strong></div><span className="round-link" aria-hidden="true"><ArrowUpRight size={20} /></span></div>
  </Link>
}

export function Shop({ products }) {
  const [params] = useSearchParams()
  const [size, setSize] = useState('')
  const [sort, setSort] = useState('')
  const query = params.get('q')?.trim() ?? ''
  const stockSizes = [...new Set(products.flatMap(item => item.estoque.filter(stock => stock.quantidade > 0).map(stock => stock.numeracao)))].sort((a, b) => a - b)
  const shown = products.filter(item => (!query || (displayProductName(item) + ' ' + item.nome + ' ' + item.descricao).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))) && (!size || item.estoque.some(stock => stock.numeracao === Number(size) && stock.quantidade > 0)))
  if (sort) shown.sort((a, b) => sort === 'asc' ? a.preco - b.preco : b.preco - a.preco)
  return <main className="page-pad inner-page"><p className="eyebrow">ADAPT X 2050</p><h1>LOJA KINETRA</h1><p>{query ? 'Resultados para “' + query + '”' : 'Veja as cores disponíveis e filtre pela sua numeração.'}</p>
    <div className="filters"><SlidersHorizontal size={16} /><label>Numeração <select value={size} onChange={e => setSize(e.target.value)}><option value="">Todas</option>{stockSizes.map(n => <option key={n}>{n}</option>)}</select></label><label>Ordenar por <select value={sort} onChange={e => setSort(e.target.value)}><option value="">Destaques</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option></select></label></div>
    <div className="product-grid">{shown.flatMap((item, index) => isAdaptXProduct(item)
      ? Object.keys(colors).map(variant => <ProductCard key={item.id + variant} item={item} variant={variant} />)
      : <ProductCard key={item.id} item={item} index={index} />)}</div>{!shown.length && <p className="notice">Nenhum produto encontrado.</p>}
  </main>
}

export function Adjustment({ eager = false }) {
  return <figure className="adjustment adapt-x-adjustment"><div className="adjustment-art"><span>CALÇADO ADAPTATIVO <i>·</i> ADAPT X 2050</span><img src={assets.ajuste} alt="Kinetra Adapt X 2050 na cor Gelo / Azul" loading={eager ? 'eager' : 'lazy'} width="1536" height="1024" /><i className="adjustment-pulse" aria-hidden="true" /></div><figcaption><span>Módulo de ajuste</span><span>Câmara no calcanhar</span></figcaption></figure>
}

export function Product({ products, add, preferred }) {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const product = products.find(item => item.slug === slug)
  if (!product) return <main className="page-pad inner-page"><h1>Produto indisponível</h1><Link to="/loja">Voltar para a loja</Link></main>
  return <Configurator key={slug} product={product} products={products} initialColor={params.get('cor')} initialTab={params.get('aba')} add={add} preferred={preferred} />
}

function Configurator({ product, products, initialColor, initialTab, add, preferred }) {
  const [color, setColor] = useState(Object.hasOwn(colors, initialColor) ? initialColor : 'gelo')
  const [size, setSize] = useState(null)
  const [method, setMethod] = useState('entrega')
  const [tab, setTab] = useState(initialTab === 'ajuste' ? 'ajuste' : 'descricao')
  const [dialogMode, setDialogMode] = useState('foto')
  const [magnified, setMagnified] = useState(false)
  const dialog = useRef(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const stock = product.estoque.find(item => item.numeracao === (size ?? preferred))
  const image = productImage(product, color)
  const others = products.filter(item => item.id !== product.id)
  const tabs = [['descricao', 'Descrição'], ['detalhes', 'Detalhes'], ['ajuste', 'Como funciona'], ...(others.length ? [['similares', 'Produtos semelhantes']] : [])]
  function openDialog(mode) {
    setDialogMode(mode)
    setMagnified(false)
    dialog.current?.showModal()
  }
  async function submit() {
    setBusy(true)
    setMessage('')
    try { await add(product, stock, color, method) } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }
  return <main className="page-pad inner-page">
    <p className="breadcrumb"><Link to="/">Início</Link> / <Link to="/loja">Loja</Link> / {displayProductName(product)}</p>
    <div className="config-grid">
      <div><h1>{displayProductName(product)}</h1><div className="gallery"><button className="icon-button zoom" type="button" onClick={() => openDialog('foto')} aria-label="Ampliar imagem"><Expand size={20} /></button><button className="gallery-image-button" type="button" onClick={() => openDialog('foto')} aria-label={'Ampliar imagem ' + colors[color].name}><img key={image} src={image} alt={displayProductName(product) + ' na cor ' + colors[color].name} /></button></div>
        <div className="miniatures">{Object.keys(colors).map(key => <button key={key} aria-label={colors[key].name} aria-pressed={color === key} onClick={() => setColor(key)}><img alt="" src={productImage(product, key)} /></button>)}</div>
        <div className="tabs" aria-label="Informações do produto">{tabs.map(([key, name]) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>{name}</button>)}</div>
        <div key={tab} className="switch-content">{tab === 'descricao' && <p>{product.descricao}</p>}
        {tab === 'detalhes' && <dl className="spec-list">{Object.entries(product.caracteristicas ?? {}).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : value}</dd></div>)}</dl>}
        {tab === 'ajuste' && <Adjustment />}
        {tab === 'similares' && <div className="product-grid">{others.map(item => <ProductCard key={item.id} item={item} />)}</div>}</div>
      </div>
      <aside className="config-panel">
        <div className="section-head"><div><p className="eyebrow">ADAPT X 2050</p><h2>Monte o seu</h2></div><SlidersHorizontal size={22} /></div>
        <details open><summary><b>1</b> Escolha a numeração <Plus size={16} /></summary><div className="size-grid">{product.estoque.toSorted((a, b) => a.numeracao - b.numeracao).map(item => <button key={item.id} disabled={!item.quantidade} aria-pressed={stock?.id === item.id && item.quantidade > 0} onClick={() => setSize(item.numeracao)}>{item.numeracao}</button>)}</div><button className="text-button" onClick={() => openDialog('guia')}>Guia de tamanhos</button></details>
        <details open><summary><b>2</b> Escolha a cor <Plus size={16} /></summary><div className="swatches">{Object.entries(colors).map(([key, item]) => <button key={key} aria-pressed={key === color} onClick={() => setColor(key)}><i style={{ background: item.hex }} />{item.name}</button>)}</div></details>
        <details open><summary><b>3</b> Recebimento <Plus size={16} /></summary><div className="choice-row">{[['entrega', 'Entrega'], ['retirada', 'Retirada']].map(([key, label]) => <button key={key} aria-pressed={method === key} onClick={() => setMethod(key)}>{label} · {shipping(key) ? money(shipping(key)) : 'Grátis'}</button>)}</div><small>Valores simulados</small></details>
        <div className="config-total"><span>Total estimado <strong>{money(Number(product.preco) + shipping(method))}</strong></span><button className="button primary" disabled={!stock?.quantidade || busy} onClick={submit}>{busy ? 'Adicionando…' : 'Continuar para a sacola'}</button>{message && <p role="alert" className="error">{message}</p>}</div>
      </aside>
    </div>
    <dialog className="product-dialog" ref={dialog} aria-labelledby="product-dialog-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close() }}>
      <div className="product-dialog-content">
        <div className="dialog-header">
          <h2 id="product-dialog-title">{dialogMode === 'guia' ? 'Guia de tamanhos' : displayProductName(product) + ' · ' + colors[color].name}</h2>
          <button autoFocus type="button" className="icon-button" aria-label="Fechar" onClick={() => dialog.current?.close()}><X size={22} /></button>
        </div>
        {dialogMode === 'guia'
          ? <p>Escolha a numeração BR que você normalmente usa. A tecnologia Adapt X 2050 explora novas possibilidades de ajuste ao pé.</p>
          : <button type="button" className="lightbox-image" aria-label={magnified ? 'Reduzir imagem' : 'Ampliar detalhe'} aria-pressed={magnified} onClick={() => setMagnified(!magnified)}><img src={image} alt={displayProductName(product) + ' ampliado'} loading="lazy" /></button>}
      </div>
    </dialog>
  </main>
}
