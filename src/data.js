import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { defaultProducts, readLocal, shipping, writeLocal } from './store'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null
const catalogFields = '*, estoque(*), produto_imagens(*)'
const orderFields = '*, pedido_itens(*)'
const localCartKey = accountId => 'cart-' + accountId

function mergeCart(saved, incoming) {
  const merged = [...saved]
  for (const entry of incoming) {
    const index = merged.findIndex(item => item.key === entry.key)
    if (index < 0) merged.push(entry)
    else merged[index] = { ...entry, quantidade: Math.max(merged[index].quantidade, entry.quantidade) }
  }
  return merged
}

function base64(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('Este navegador não oferece suporte à proteção de senha necessária.')
  const material = await globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await globalThis.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, material, 256)
  return base64(new Uint8Array(bits))
}

function passwordSalt() {
  return base64(globalThis.crypto.getRandomValues(new Uint8Array(16)))
}

function publicAccount(account) {
  return Object.fromEntries(Object.entries(account).filter(([key]) => key !== 'passwordSalt' && key !== 'passwordHash'))
}

export function result(response) {
  if (response.error) throw new Error(response.error.message)
  return response.data
}

export function useStore() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(!supabase)
  const [profile, setProfile] = useState(null)
  const [localAccounts, setLocalAccounts] = useState(() => readLocal('accounts', []))
  const [localSession, setLocalSession] = useState(() => readLocal('local-session', null))
  const [localRecovery, setLocalRecovery] = useState(() => readLocal('local-recovery', null))
  const [recovery, setRecovery] = useState(() => new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery')
  const [catalog, setCatalog] = useState(() => readLocal('products', defaultProducts))
  const [connected, setConnected] = useState(false)
  const [cart, setCart] = useState(() => {
    const savedSession = readLocal('local-session', null)
    return savedSession?.accountId ? readLocal(localCartKey(savedSession.accountId), []) : readLocal('cart', [])
  })
  const [orders, setOrders] = useState(() => readLocal('orders', []))
  const [addresses, setAddresses] = useState(() => readLocal('addresses', []))
  const [issue, setIssue] = useState('')
  const [loadedUser, setLoadedUser] = useState(null)
  const userId = session?.user?.id
  const adminPreview = Boolean(!supabase && localSession?.adminPreview)
  const localAccount = !supabase && localSession?.accountId ? localAccounts.find(account => account.id === localSession.accountId) : null
  const role = userId ? profile?.papel : localAccount?.papel ?? (adminPreview ? 'admin' : null)
  const user = userId ? { id: userId, nome: profile?.nome ?? session.user.user_metadata?.nome ?? 'Cliente', email: session.user.email, ...profile } :
    localAccount ? publicAccount(localAccount) : adminPreview ? { id: 'admin-preview', nome: 'Admin' } : null
  const products = catalog.filter(item => item.ativo)
  const visibleOrders = userId || adminPreview ? orders : localAccount ? orders.filter(order => order.usuario_id === localAccount.id) : []
  const visibleAddresses = userId || adminPreview ? addresses : localAccount ? addresses.filter(address => address.usuario_id === localAccount.id) : []
  const hasLocalRecovery = Boolean(localRecovery && localAccounts.some(account => account.id === localRecovery.accountId))

  useEffect(() => {
    localStorage.removeItem('kinetra:demo')
    localStorage.removeItem('kinetra:demo-perfis')
  }, [])

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (next) {
        setLocalSession(null)
        writeLocal('local-session', null)
      }
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !ready || adminPreview || localAccount) return
    let active = true
    supabase.from('produtos').select(catalogFields).then(response => {
      if (!active) return
      if (response.error) {
        setConnected(false)
        setCatalog(readLocal('products', defaultProducts))
      } else {
        setCatalog(response.data)
        setConnected(true)
        if (!userId) setCart(readLocal('guest-cart', []))
      }
    })
    return () => { active = false }
  }, [ready, userId, adminPreview, localAccount])

  useEffect(() => {
    if (!userId) return
    let active = true
    async function load() {
      try {
        const responses = await Promise.all([
          supabase.from('perfis').select('*').eq('id', userId).single(),
          supabase.from('enderecos').select('*'),
          supabase.from('pedidos').select(orderFields).order('criado_em', { ascending: false }),
          supabase.rpc('kinetra_ler_sacola'),
        ])
        if (!active) return
        const [nextProfile, nextAddresses, nextOrders, saved] = responses.map(result)
        setProfile(nextProfile)
        setAddresses(nextAddresses)
        setOrders(nextOrders)
        const guest = readLocal('guest-cart', [])
        if (guest.length) {
          const merged = mergeCart(saved, guest)
          result(await supabase.rpc('kinetra_salvar_sacola', { itens: merged }))
          if (!active) return
          writeLocal('guest-cart', [])
          setCart(merged)
        } else setCart(saved)
        setIssue('')
      } catch {
        if (active) setIssue('O acesso aos dados da conta ainda não está disponível.')
      } finally {
        if (active) setLoadedUser(userId)
      }
    }
    load()
    return () => { active = false }
  }, [userId])

  async function refreshCatalog() {
    setCatalog(result(await supabase.from('produtos').select(catalogFields)))
  }

  async function saveCart(next) {
    if (userId) {
      if (loadedUser !== userId) throw new Error('Aguarde o carregamento da sacola.')
      result(await supabase.rpc('kinetra_salvar_sacola', { itens: next }))
    } else writeLocal(localAccount ? localCartKey(localAccount.id) : connected ? 'guest-cart' : 'cart', next)
    setCart(next)
  }

  async function add(product, stock, color, method) {
    const key = stock.id + ':' + color
    const entry = cart.find(item => item.key === key)
    const total = cart.filter(item => item.estoque_id === stock.id).reduce((sum, item) => sum + item.quantidade, 0)
    if (total >= stock.quantidade) throw new Error('Estoque insuficiente para essa numeração.')
    const next = entry ? cart.map(item => item.key === key ? { ...item, quantidade: item.quantidade + 1, metodo: method } : item) :
      [...cart, { key, produto_id: product.id, estoque_id: stock.id, numeracao: stock.numeracao, cor: color, metodo: method, quantidade: 1 }]
    await saveCart(next)
  }

  async function logout() {
    if (session) result(await supabase.auth.signOut())
    const wasAdminPreview = adminPreview
    setLocalSession(null)
    writeLocal('local-session', null)
    setProfile(null)
    setLoadedUser(null)
    setOrders([])
    setAddresses([])
    setIssue('')
    setCart(readLocal('cart', []))
    if (supabase && !wasAdminPreview) {
      const data = await supabase.from('produtos').select(catalogFields)
      if (!data.error) { setConnected(true); setCatalog(data.data); setCart(readLocal('guest-cart', [])) }
    } else { setConnected(false); setCatalog(readLocal('products', defaultProducts)) }
  }

  function startLocalSession(account) {
    const nextSession = { accountId: account.id }
    setLocalSession(nextSession)
    writeLocal('local-session', nextSession)
    const guest = readLocal(supabase ? 'guest-cart' : 'cart', [])
    const merged = mergeCart(readLocal(localCartKey(account.id), []), guest)
    writeLocal(localCartKey(account.id), merged)
    if (guest.length) writeLocal(supabase ? 'guest-cart' : 'cart', [])
    setCart(merged)
    setOrders(readLocal('orders', []))
    setAddresses(readLocal('addresses', []))
    setIssue('')
  }

  async function registerLocal(fields) {
    if (supabase) throw new Error('A autenticação remota está configurada.')
    const email = fields.email.trim().toLowerCase()
    if (localAccounts.some(account => account.email.toLowerCase() === email)) throw new Error('Já existe uma conta com esse e-mail neste navegador.')
    const salt = passwordSalt()
    const account = { id: globalThis.crypto.randomUUID(), nome: fields.nome.trim(), email, papel: 'cliente', numeracao_preferida: Number(fields.numeracao) || null, passwordSalt: salt, passwordHash: await hashPassword(fields.password, Uint8Array.from(atob(salt), character => character.charCodeAt(0))) }
    const next = [...localAccounts, account]
    setLocalAccounts(next)
    writeLocal('accounts', next)
    startLocalSession(account)
  }

  async function loginLocal(email, password) {
    if (supabase) throw new Error('A autenticação remota está configurada.')
    const account = localAccounts.find(entry => entry.email.toLowerCase() === email.trim().toLowerCase())
    if (!account) throw new Error('E-mail ou senha inválidos.')
    const salt = Uint8Array.from(atob(account.passwordSalt), character => character.charCodeAt(0))
    if (await hashPassword(password, salt) !== account.passwordHash) throw new Error('E-mail ou senha inválidos.')
    startLocalSession(account)
  }

  async function beginLocalRecovery(email) {
    if (supabase) throw new Error('A recuperação por e-mail está configurada no serviço de autenticação.')
    const account = localAccounts.find(entry => entry.email.toLowerCase() === email.trim().toLowerCase())
    if (!account) throw new Error('Não encontramos uma conta com esse e-mail neste navegador.')
    const request = { accountId: account.id, requestedAt: Date.now() }
    setLocalRecovery(request)
    writeLocal('local-recovery', request)
    setRecovery(true)
  }

  async function resetLocalPassword(password) {
    if (supabase) throw new Error('A redefinição remota está configurada no serviço de autenticação.')
    const account = localAccounts.find(entry => entry.id === localRecovery?.accountId)
    if (!account) throw new Error('Peça uma redefinição de senha para continuar.')
    const salt = passwordSalt()
    const passwordHash = await hashPassword(password, Uint8Array.from(atob(salt), character => character.charCodeAt(0)))
    const updated = { ...account, passwordSalt: salt, passwordHash }
    const next = localAccounts.map(entry => entry.id === account.id ? updated : entry)
    setLocalAccounts(next)
    writeLocal('accounts', next)
    setLocalRecovery(null)
    writeLocal('local-recovery', null)
    setRecovery(false)
    startLocalSession(updated)
  }

  function startAdminPreview() {
    if (supabase) return
    const nextSession = { adminPreview: true }
    setLocalSession(nextSession)
    writeLocal('local-session', nextSession)
    setCart(readLocal('cart', []))
    setAddresses(readLocal('addresses', []))
    setOrders(readLocal('orders', []))
    setCatalog(readLocal('products', defaultProducts))
    setConnected(false)
    setIssue('')
  }

  async function saveProfile(fields) {
    if (userId) {
      setProfile(result(await supabase.from('perfis').update(fields).eq('id', userId).select().single()))
      return
    }
    if (!localAccount) throw new Error('Entre na sua conta para atualizar o perfil.')
    const updated = { ...localAccount, ...fields }
    const next = localAccounts.map(account => account.id === localAccount.id ? updated : account)
    setLocalAccounts(next)
    writeLocal('accounts', next)
  }

  async function saveAddress(fields, id) {
    if (!user) throw new Error('Entre na sua conta para salvar um endereço.')
    const address = { ...fields, usuario_id: user.id }
    if (userId) {
      const row = result(await (id ? supabase.from('enderecos').update(address).eq('id', id) : supabase.from('enderecos').insert(address)).select().single())
      setAddresses(result(await supabase.from('enderecos').select('*')))
      return row
    }
    const nextAddress = { ...address, id: id ?? crypto.randomUUID() }
    const next = [...addresses.filter(item => item.id !== nextAddress.id).map(item => fields.principal && item.usuario_id === user.id ? { ...item, principal: false } : item), nextAddress]
    writeLocal('addresses', next)
    setAddresses(next)
    return nextAddress
  }

  async function checkout(address, shippingMethod, paymentMethod, paymentStatus, requestId) {
    if (userId) {
      const id = result(await supabase.rpc('kinetra_checkout', { endereco_id: address?.id ?? null, entrega: shippingMethod, metodo_pagamento: paymentMethod, resultado: paymentStatus, pedido_chave: requestId }))
      const nextOrders = result(await supabase.from('pedidos').select(orderFields).order('criado_em', { ascending: false }))
      setOrders(nextOrders)
      if (paymentStatus === 'aprovado') setCart([])
      await refreshCatalog()
      return id
    }
    const required = new Map()
    const items = cart.map(entry => {
      const product = products.find(item => item.id === entry.produto_id)
      const stock = product?.estoque.find(item => item.id === entry.estoque_id)
      const quantity = (required.get(entry.estoque_id) ?? 0) + entry.quantidade
      if (!stock || quantity > stock.quantidade) throw new Error('Uma numeração ficou sem estoque. Confira a sacola.')
      required.set(entry.estoque_id, quantity)
      return { produto_id: product.id, nome_produto: product.nome, numeracao: entry.numeracao, quantidade: entry.quantidade, preco_unitario: product.preco, cor: entry.cor }
    })
    const subtotal = items.reduce((sum, item) => sum + item.preco_unitario * item.quantidade, 0)
    const fee = shipping(shippingMethod)
    const order = { id: requestId, usuario_id: user.id, status: paymentStatus === 'aprovado' ? 'recebido' : 'cancelado', status_pagamento: paymentStatus,
      subtotal, frete: fee, total: subtotal + fee, endereco_entrega: address ?? { retirada: true }, pedido_itens: items, criado_em: new Date().toISOString() }
    const next = [order, ...orders.filter(item => item.id !== order.id)]
    setOrders(next)
    writeLocal('orders', next)
    if (paymentStatus === 'aprovado') {
      const newCatalog = catalog.map(product => ({ ...product, estoque: product.estoque.map(stock => ({ ...stock, quantidade: stock.quantidade - (required.get(stock.id) ?? 0) })) }))
      writeLocal('products', newCatalog)
      setCatalog(newCatalog)
      await saveCart([])
    }
    return order.id
  }

  async function manageProduct(fields, id, images) {
    if (userId) {
      result(await supabase.rpc('kinetra_salvar_produto', { produto_id: id ?? null, campos: fields, imagens: images }))
      return refreshCatalog()
    }
    const existing = catalog.find(item => item.id === id)
    const slugInUse = catalog.some(item => item.slug === fields.slug && item.id !== id)
    if (slugInUse) throw new Error('Esse slug já está em uso.')
    const row = { ...existing, ...fields, id: id ?? crypto.randomUUID(), estoque: existing?.estoque ?? [], produto_imagens: images.map((url, ordem) => ({ url, ordem })) }
    const next = [...catalog.filter(item => item.id !== row.id), row]
    setCatalog(next)
    writeLocal('products', next)
  }

  async function manageStock(product, numeracao, quantidade) {
    if (userId) {
      result(await supabase.from('estoque').upsert({ produto_id: product.id, numeracao, quantidade }, { onConflict: 'produto_id,numeracao' }))
      return refreshCatalog()
    }
    const old = product.estoque.find(item => item.numeracao === numeracao)
    const estoque = [...product.estoque.filter(item => item.numeracao !== numeracao), { id: old?.id ?? crypto.randomUUID(), numeracao, quantidade }]
    const next = catalog.map(item => item.id === product.id ? { ...item, estoque } : item)
    setCatalog(next)
    writeLocal('products', next)
  }

  async function removeProduct(id) {
    if (userId) {
      result(await supabase.from('produtos').delete().eq('id', id).select('id').single())
      return refreshCatalog()
    }
    if (cart.some(item => item.produto_id === id)) throw new Error('Remova o item da sacola ou desative o produto.')
    const next = catalog.filter(item => item.id !== id)
    setCatalog(next)
    writeLocal('products', next)
  }

  async function manageOrder(id, fields) {
    if (userId) {
      result(await supabase.rpc('kinetra_atualizar_pedido', { alvo: id, novo_status: fields.status, novo_pagamento: fields.status_pagamento }))
      setOrders(result(await supabase.from('pedidos').select(orderFields).order('criado_em', { ascending: false })))
    } else {
      const next = orders.map(order => order.id === id ? { ...order, ...fields } : order)
      setOrders(next)
      writeLocal('orders', next)
    }
  }

  return { ready, accountReady: !userId || loadedUser === userId, session, recovery, setRecovery, localMode: !supabase, localRecovery: hasLocalRecovery, localAdminPreview: adminPreview, user, role, connected, issue, catalog, products, cart, orders: visibleOrders, addresses: visibleAddresses,
    add, saveCart, logout, registerLocal, loginLocal, beginLocalRecovery, resetLocalPassword, startAdminPreview, saveProfile, saveAddress, checkout, manageProduct, removeProduct, manageStock, manageOrder }
}
