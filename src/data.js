import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { defaultProducts, readLocal, validateAddress, writeLocal } from './store'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null
const catalogFields = '*, estoque(*), produto_imagens(*)'
const orderFields = '*, pedido_itens(*)'

function mergeCart(saved, incoming) {
  const merged = [...saved]
  for (const entry of incoming) {
    const index = merged.findIndex(item => item.key === entry.key)
    if (index < 0) merged.push(entry)
    else merged[index] = { ...entry, quantidade: Math.max(merged[index].quantidade, entry.quantidade) }
  }
  return merged
}

export function result(response) {
  if (response.error) throw new Error(response.error.message)
  return response.data
}

export function useStore() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(!supabase)
  const [profile, setProfile] = useState(null)
  const [recovery, setRecovery] = useState(() => new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery')
  const [catalog, setCatalog] = useState(() => readLocal('products', defaultProducts))
  const [connected, setConnected] = useState(false)
  const [cart, setCart] = useState(() => readLocal(supabase ? 'guest-cart' : 'cart', []))
  const [orders, setOrders] = useState(() => readLocal('orders', []))
  const [addresses, setAddresses] = useState(() => readLocal('addresses', []))
  const [issue, setIssue] = useState('')
  const [loadedUser, setLoadedUser] = useState(null)
  const userId = session?.user?.id
  const role = userId ? profile?.papel : null
  const user = userId ? { id: userId, nome: profile?.nome ?? session.user.user_metadata?.nome ?? 'Cliente', email: session.user.email, ...profile } : null
  const products = catalog.filter(item => item.ativo)
  const visibleOrders = userId ? orders : []
  const visibleAddresses = userId ? addresses : []

  useEffect(() => {
    localStorage.removeItem('kinetra:demo')
    localStorage.removeItem('kinetra:demo-perfis')
  }, [])

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !ready) return
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
  }, [ready, userId])

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
    } else writeLocal(connected ? 'guest-cart' : 'cart', next)
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
    if (session && supabase) result(await supabase.auth.signOut())
    setProfile(null)
    setLoadedUser(null)
    setOrders([])
    setAddresses([])
    setIssue('')
    setCart(readLocal(supabase ? 'guest-cart' : 'cart', []))
    if (supabase) {
      const data = await supabase.from('produtos').select(catalogFields)
      if (!data.error) { setConnected(true); setCatalog(data.data); setCart(readLocal('guest-cart', [])) }
    } else { setConnected(false); setCatalog(readLocal('products', defaultProducts)) }
  }

  async function saveProfile(fields) {
    if (!supabase || !userId) throw new Error('Entre na sua conta para atualizar o perfil.')
    setProfile(result(await supabase.from('perfis').update(fields).eq('id', userId).select().single()))
  }

  async function saveAddress(fields, id) {
    if (!supabase || !userId || !user) throw new Error('Entre na sua conta para salvar um endereço.')
    validateAddress(fields)
    const address = { ...fields, usuario_id: user.id }
    const row = result(await (id ? supabase.from('enderecos').update(address).eq('id', id) : supabase.from('enderecos').insert(address)).select().single())
    setAddresses(result(await supabase.from('enderecos').select('*')))
    return row
  }

  async function checkout(address, shippingMethod, paymentMethod, requestId) {
    if (!supabase || !userId) throw new Error('Entre na sua conta para registrar o pedido.')
    if (!['entrega', 'retirada'].includes(shippingMethod)) throw new Error('Selecione uma forma de recebimento válida.')
    if (shippingMethod === 'entrega') validateAddress(address)
    if (!['pix', 'cartao'].includes(paymentMethod)) throw new Error('Selecione um método de pagamento válido.')
    if (!cart.length) throw new Error('Sua sacola está vazia.')
    const id = result(await supabase.rpc('kinetra_checkout', { endereco_id: address?.id ?? null, entrega: shippingMethod, metodo_pagamento: paymentMethod, resultado: 'aprovado', pedido_chave: requestId }))
    const nextOrders = result(await supabase.from('pedidos').select(orderFields).order('criado_em', { ascending: false }))
    setOrders(nextOrders)
    setCart([])
    await refreshCatalog()
    return id
  }

  async function manageProduct(fields, id, images) {
    if (!supabase || !userId) throw new Error('A gestão exige uma sessão administrativa no Supabase.')
    result(await supabase.rpc('kinetra_salvar_produto', { produto_id: id ?? null, campos: fields, imagens: images }))
    return refreshCatalog()
  }

  async function manageStock(product, numeracao, quantidade) {
    if (!supabase || !userId) throw new Error('A gestão exige uma sessão administrativa no Supabase.')
    result(await supabase.from('estoque').upsert({ produto_id: product.id, numeracao, quantidade }, { onConflict: 'produto_id,numeracao' }))
    return refreshCatalog()
  }

  async function removeProduct(id) {
    if (!supabase || !userId) throw new Error('A gestão exige uma sessão administrativa no Supabase.')
    result(await supabase.from('produtos').delete().eq('id', id).select('id').single())
    return refreshCatalog()
  }

  async function manageOrder(id, fields) {
    if (!supabase || !userId) throw new Error('A gestão exige uma sessão administrativa no Supabase.')
    result(await supabase.rpc('kinetra_atualizar_pedido', { alvo: id, novo_status: fields.status, novo_pagamento: fields.status_pagamento }))
    setOrders(result(await supabase.from('pedidos').select(orderFields).order('criado_em', { ascending: false })))
  }

  return { ready, accountReady: !userId || loadedUser === userId, session, recovery, setRecovery, user, role, connected, issue, catalog, products, cart, orders: visibleOrders, addresses: visibleAddresses,
    add, saveCart, logout, saveProfile, saveAddress, checkout, manageProduct, removeProduct, manageStock, manageOrder }
}
