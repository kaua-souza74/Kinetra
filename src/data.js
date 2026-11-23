import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { demoProducts, readLocal, shipping, writeLocal } from './store'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null
const catalogFields = '*, estoque(*), produto_imagens(*)'
const orderFields = '*, pedido_itens(*)'

export function result(response) {
  if (response.error) throw new Error(response.error.message)
  return response.data
}

export function useStore() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(!supabase)
  const [profile, setProfile] = useState(null)
  const [demo, setDemo] = useState(() => readLocal('demo', null))
  const [recovery, setRecovery] = useState(() => new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery')
  const [catalog, setCatalog] = useState(() => readLocal('products', demoProducts))
  const [connected, setConnected] = useState(false)
  const [cart, setCart] = useState(() => readLocal('cart', []))
  const [orders, setOrders] = useState(() => readLocal('orders', []))
  const [addresses, setAddresses] = useState(() => readLocal('addresses', []))
  const [issue, setIssue] = useState('')
  const [loadedUser, setLoadedUser] = useState(null)
  const userId = session?.user?.id
  const role = userId ? profile?.papel : demo?.papel
  const user = userId ? { id: userId, nome: profile?.nome ?? session.user.user_metadata?.nome ?? 'Cliente', email: session.user.email, ...profile } : demo
  const products = catalog.filter(item => item.ativo)
  const visibleOrders = userId ? orders : orders.filter(order => order.usuario_id === demo?.id || role === 'admin')
  const visibleAddresses = userId ? addresses : addresses.filter(address => address.usuario_id === demo?.id)

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (next) {
        setDemo(null)
        writeLocal('demo', null)
      }
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !ready || demo) return
    let active = true
    supabase.from('produtos').select(catalogFields).then(response => {
      if (!active) return
      if (response.error) {
        setConnected(false)
        setCatalog(readLocal('products', demoProducts))
      } else {
        setCatalog(response.data)
        setConnected(true)
        if (!userId) setCart(readLocal('guest-cart', []))
      }
    })
    return () => { active = false }
  }, [ready, userId, demo])

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
          const merged = [...saved]
          for (const entry of guest) {
            const index = merged.findIndex(item => item.key === entry.key)
            if (index < 0) merged.push(entry)
            else merged[index] = { ...entry, quantidade: Math.max(merged[index].quantidade, entry.quantidade) }
          }
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
    } else writeLocal(!demo && connected ? 'guest-cart' : 'cart', next)
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

  function startDemo(papel) {
    const saved = readLocal('demo-perfis', {})
    const info = saved[papel] ?? { id: 'demo-' + papel, nome: papel === 'admin' ? 'Admin Kinetra' : 'Cliente Kinetra', email: papel + '@demo.local', papel }
    setDemo(info)
    writeLocal('demo', info)
    setCart(readLocal('cart', []))
    setAddresses(readLocal('addresses', []))
    setOrders(readLocal('orders', []))
    setCatalog(readLocal('products', demoProducts))
    setConnected(false)
    setIssue('')
  }

  async function logout() {
    if (session) result(await supabase.auth.signOut())
    setDemo(null)
    writeLocal('demo', null)
    setProfile(null)
    setLoadedUser(null)
    setOrders([])
    setAddresses([])
    setIssue('')
    setCart(readLocal('cart', []))
    if (supabase) {
      const data = await supabase.from('produtos').select(catalogFields)
      if (!data.error) { setConnected(true); setCatalog(data.data); setCart(readLocal('guest-cart', [])) }
    }
  }

  async function saveProfile(fields) {
    if (userId) {
      setProfile(result(await supabase.from('perfis').update(fields).eq('id', userId).select().single()))
    } else {
      const next = { ...demo, ...fields }
      setDemo(next)
      writeLocal('demo', next)
      writeLocal('demo-perfis', { ...readLocal('demo-perfis', {}), [demo.papel]: next })
    }
  }

  async function saveAddress(fields, id) {
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

  return { ready, accountReady: !userId || loadedUser === userId, session, recovery, setRecovery, user, role, demo, connected, issue, catalog, products, cart, orders: visibleOrders, addresses: visibleAddresses,
    add, saveCart, logout, startDemo, saveProfile, saveAddress, checkout, manageProduct, removeProduct, manageStock, manageOrder }
}
