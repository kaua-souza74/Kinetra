import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, LayoutDashboard, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { Collection, Home, Product, Shop } from './Storefront'
import { Simulator, Technology } from './Technology'
import { Account, Cart, Checkout, Order } from './Checkout'
import { Auth } from './Auth'
import { Brand } from './Brand'
import { useStore } from './data'
import { assets, readLocal, writeLocal } from './store'
import { useScrollReveals } from './useScrollReveals'
import { useWheelMomentum } from './useWheelMomentum'
import './App.css'
import './Experience.css'

const Admin = lazy(() => import('./Admin').then(module => ({ default: module.Admin })))
const authModes = {
  '/entrar': 'entrar',
  '/cadastro': 'cadastro',
  '/recuperar-senha': 'recuperar',
  '/redefinir-senha': 'redefinir',
}

function Header({ data }) {
  const [active, setActive] = useState('')
  const nav = useRef(null)
  const indicator = useRef(null)
  const searchInput = useRef(null)
  const searchButton = useRef(null)
  const menuButton = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const searchOpen = active === 'search'
  const count = data.cart.reduce((sum, item) => sum + item.quantidade, 0)
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus()
  }, [searchOpen])

  useLayoutEffect(() => {
    const menu = nav.current
    const marker = indicator.current
    function alignIndicator() {
      const link = menu.querySelector('[aria-current="page"]')
      if (!link) {
        marker.dataset.visible = 'false'
        return
      }
      marker.style.setProperty('--nav-x', link.offsetLeft + 'px')
      marker.style.setProperty('--nav-y', link.offsetTop + 'px')
      marker.style.setProperty('--nav-width', link.offsetWidth + 'px')
      marker.style.setProperty('--nav-height', link.offsetHeight + 'px')
      marker.dataset.visible = 'true'
    }
    alignIndicator()
    const observer = new ResizeObserver(alignIndicator)
    observer.observe(menu)
    for (const link of menu.querySelectorAll('a')) observer.observe(link)
    return () => observer.disconnect()
  }, [pathname])

  function closeWithEscape(event) {
    if (event.key !== 'Escape' || !active) return
    const trigger = searchOpen ? searchButton : menuButton
    setActive('')
    trigger.current?.focus()
  }

  return <header className="site-header" onKeyDown={closeWithEscape} onClick={event => { if (event.target.closest('a')) setActive('') }}><Brand cream />
    <nav ref={nav} id="nav-principal" className={active === 'menu' ? 'main-nav expanded' : 'main-nav'} aria-label="Principal">
      <span ref={indicator} className="nav-indicator" aria-hidden="true" />
      <NavLink to="/" end>Início</NavLink><NavLink to="/loja">Loja</NavLink><NavLink to="/colecao">Coleção</NavLink><NavLink to="/como-funciona">Como funciona</NavLink><NavLink to="/simulador">Conexão</NavLink>
    </nav>
    <div className="header-actions"><button ref={searchButton} className="icon-button" aria-label={searchOpen ? 'Fechar pesquisa' : 'Pesquisar'} aria-controls="pesquisa-loja" aria-expanded={searchOpen} onClick={() => setActive(searchOpen ? '' : 'search')}>{searchOpen ? <X size={20} /> : <Search size={20} />}</button>
      {data.role === 'admin' && <Link className="icon-button admin-shortcut" to="/admin" aria-label="Administração"><LayoutDashboard size={19} /></Link>}
      <Link className="icon-button account-icon" to={data.user ? '/conta' : '/entrar'} aria-label="Minha conta"><User size={20} /></Link><Link className="icon-button bag-link" to="/carrinho" aria-label={'Sacola, ' + count + ' itens'}><ShoppingBag size={20} /><b>{count}</b></Link>
      <button ref={menuButton} className="icon-button menu-toggle" aria-label={active === 'menu' ? 'Fechar menu' : 'Abrir menu'} aria-controls="nav-principal" aria-expanded={active === 'menu'} onClick={() => setActive(active === 'menu' ? '' : 'menu')}>{active === 'menu' ? <X size={21} /> : <Menu size={23} />}</button>
    </div>
    <form id="pesquisa-loja" className="search-panel" data-open={searchOpen} inert={!searchOpen} onSubmit={e => { e.preventDefault(); const q = new FormData(e.currentTarget).get('q').trim(); setActive(''); searchButton.current?.focus(); navigate('/loja' + (q ? '?q=' + encodeURIComponent(q) : '')) }}><input ref={searchInput} name="q" placeholder="Buscar na loja" aria-label="Buscar na loja" /><button className="button primary">Buscar</button></form>
  </header>
}

function Footer({ data, home, motion, toggleMotion }) {
  const account = data.user ? '/conta' : '/entrar'
  return <footer className="site-footer page-pad">
    {home && <section className="footer-campaign" data-reveal aria-labelledby="footer-campaign-title">
      <img src={assets.campanha} alt="" loading="lazy" />
      <div>
        <p className="eyebrow">KINETRA ADAPT X 2050</p>
        <h2 id="footer-campaign-title">Encontre o seu ajuste.</h2>
        <Link className="button primary" to="/colecao">Explore a coleção <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </section>}
    <div className="footer-main">
      <div className="footer-intro"><Brand cream /><p>Tecnologia, conforto e movimento em uma nova forma de calçar.</p></div>
      <nav className="footer-links" aria-label="Explore a Kinetra">
        <h2>Explore</h2>
        <Link to="/loja">Loja</Link><Link to="/colecao">Coleção</Link><Link to="/como-funciona">Como funciona</Link><Link to="/simulador">Conexão</Link>
      </nav>
      <nav className="footer-links" aria-label="Conta e sacola">
        <h2>Sua conta</h2>
        <Link to={account}>Minha conta</Link><Link to="/carrinho">Sacola</Link>
        {data.user ? <Link to="/conta?aba=pedidos">Meus pedidos</Link> : <Link to="/cadastro">Criar conta</Link>}
      </nav>
    </div>
    <div className="footer-wordmark" aria-hidden="true">KINETRA<span>.</span></div>
    <div className="footer-base"><span>© {new Date().getFullYear()} Kinetra</span><button className="motion-toggle" type="button" aria-pressed={motion} onClick={toggleMotion}>Animações: {motion ? 'ligadas' : 'desligadas'}</button><span>Calçados adaptativos para acompanhar você.</span></div>
  </footer>
}

function PageScroll() {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    if (hash && document.getElementById(hash.slice(1))) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      document.getElementById(hash.slice(1)).scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
    }
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Protect({ data, admin, children }) {
  const location = useLocation()
  if (!data.ready) return <main className="page-pad inner-page"><p role="status">Carregando sua conta…</p></main>
  if (!data.user) return <Navigate to="/entrar" state={{ next: location.pathname }} replace />
  if (!data.accountReady) return <main className="page-pad inner-page"><p role="status">Carregando os dados da conta…</p></main>
  if (admin && data.role !== 'admin') return <main className="page-pad inner-page"><h1>Acesso restrito</h1><p>{data.issue || 'Esta área está disponível para administradores.'}</p><Link to="/conta">Voltar à conta</Link></main>
  return children
}

function OrderRoute({ data }) {
  const { id } = useParams()
  return <Order products={data.catalog} order={data.orders.find(order => String(order.id) === id)} admin={data.role === 'admin'} />
}

function Site() {
  const data = useStore()
  const [motion, setMotion] = useState(() => readLocal('motion', true))
  const shell = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const authPath = pathname.replace(/\/$/, '')
  const authMode = Object.hasOwn(authModes, authPath) ? authModes[authPath] : null
  const authPage = Boolean(authMode)
  const adminRoute = pathname.startsWith('/admin')
  const adminPage = adminRoute && data.role === 'admin'
  useWheelMomentum((pathname === '/' || pathname === '/como-funciona') && motion)
  useScrollReveals(shell, pathname, motion)
  function toggleMotion() {
    writeLocal('motion', !motion)
    setMotion(!motion)
  }
  if (data.recovery && authMode !== 'redefinir') return <Navigate to="/redefinir-senha" replace />
  return <><PageScroll /><a className="skip" href="#conteudo">Ir para o conteúdo</a>
  <div ref={shell} className={authPage ? 'auth-shell' : adminPage ? 'admin-shell' : 'site-shell'} id="conteudo" data-motion={motion ? 'on' : 'off'}>
    {!authPage && !adminPage && <Header data={data} />}
    {authMode ? <Auth mode={authMode} data={data} motion={motion} toggleMotion={toggleMotion} /> : <div className="page-transition" key={pathname}><Routes>
      <Route path="/" element={<Home products={data.products} motion={motion} />} />
      <Route path="/loja" element={<Shop products={data.products} />} />
      <Route path="/colecao" element={<Collection products={data.products} />} />
      <Route path="/como-funciona" element={<Technology products={data.products} motion={motion} />} />
      <Route path="/simulador" element={<Simulator products={data.products} />} />
      <Route path="/produto/:slug" element={<Product products={data.products} preferred={data.user?.numeracao_preferida} add={async (...args) => { await data.add(...args); navigate('/carrinho') }} />} />
      <Route path="/carrinho" element={<Cart data={data} />} />
      <Route path="/finalizar" element={<Protect data={data}><Checkout data={data} /></Protect>} />
      <Route path="/pedido/:id" element={<Protect data={data}><OrderRoute data={data} /></Protect>} />
      <Route path="/conta" element={<Protect data={data}><Account data={data} /></Protect>} />
      <Route path="/admin/*" element={<Protect data={data} admin><Suspense fallback={<p role="status">Carregando administração…</p>}><Admin data={data} /></Suspense></Protect>} />
      <Route path="*" element={<main className="page-pad inner-page"><h1>Página indisponível</h1><Link to="/">Voltar ao início</Link></main>} />
    </Routes></div>}
    {!authPage && !adminPage && <Footer data={data} home={pathname === '/'} motion={motion} toggleMotion={toggleMotion} />}
  </div></>
}

export default function App() {
  return <BrowserRouter><Site /></BrowserRouter>
}
