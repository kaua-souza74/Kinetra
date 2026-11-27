export const assets = {
  gelo: '/kinetra-adapt-x-2050/adapt-gelo.png',
  marinho: '/kinetra-adapt-x-2050/adapt-marinho.png',
  areia: '/kinetra-adapt-x-2050/adapt-areia.png',
  grafite: '/kinetra-adapt-x-2050/adapt-grafite.png',
  laranja: '/kinetra-adapt-x-2050/adapt-laranja.png',
  ajuste: '/kinetra-adapt-x-2050/adapt-gelo.png',
  campanha: '/kinetra-adapt-x-2050/adapt-gelo.png',
  loginCampaign: '/kinetra-forma/forma-campanha.png',
}

export const colors = {
  gelo: { name: 'Gelo / Azul', hex: '#e9e6df' },
  marinho: { name: 'Marinho / Laranja', hex: '#1E223D' },
  areia: { name: 'Areia / Laranja', hex: '#E6D5B7' },
  grafite: { name: 'Grafite / Azul', hex: '#484b50' },
  laranja: { name: 'Laranja / Azul', hex: '#f4511e' },
}

export const sizes = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
export const defaultProducts = [{
  id: 'forma',
  nome: 'Kinetra Adapt X 2050',
  slug: 'kinetra-forma',
  descricao: 'O tênis sem cadarços que se expande para calçar e se contrai para acompanhar o comprimento, a largura e o volume do seu pé.',
  preco: 599.90,
  ativo: true,
  tecnologias: ['Malha adaptativa', 'Solado segmentado', 'Estrutura sem cadarços'],
  caracteristicas: { Estrutura: 'Malha adaptativa', Solado: 'Segmentado', Ajuste: 'Comprimento, largura e volume' },
  produto_imagens: [],
  estoque: sizes.map(numeracao => ({ id: `forma-${numeracao}`, numeracao, quantidade: numeracao === 44 ? 0 : numeracao === 35 ? 2 : 12 })),
}]

export const statuses = {
  recebido: 'Recebido', em_preparacao: 'Em preparação', enviado: 'Enviado',
  concluido: 'Concluído', cancelado: 'Cancelado',
}
export const payments = { pendente: 'Pendente', aprovado: 'Aprovado', recusado: 'Recusado', estornado: 'Estornado' }
export const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
export const date = value => new Date(value).toLocaleDateString('pt-BR')
export const shipping = method => method === 'entrega' ? 24.90 : 0

export function productImage(product, color) {
  const images = product?.produto_imagens?.toSorted((a, b) => a.ordem - b.ordem) ?? []
  if (isAdaptXProduct(product)) return assets[color] || assets.gelo
  if (images.length) return images[0].url
  return assets[color] || assets.gelo
}

export function isAdaptXProduct(product) {
  return ['kinetra-forma', 'kinetra-adapt-x-2050'].includes(product?.slug) ||
    /kinetra\s+(forma|adapt\s*x)/i.test(product?.nome ?? '')
}

export function displayProductName(product) {
  return isAdaptXProduct(product) ? 'Kinetra Adapt X 2050' : product?.nome ?? 'Kinetra Adapt X 2050'
}

export function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(`kinetra:${key}`)) ?? fallback } catch { return fallback }
}

export function writeLocal(key, value) {
  localStorage.setItem(`kinetra:${key}`, JSON.stringify(value))
}
