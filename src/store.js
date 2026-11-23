export const assets = {
  marinho: '/kinetra-forma/forma-marinho.png',
  areia: '/kinetra-forma/forma-areia.png',
  ajuste: '/kinetra-forma/forma-ajuste.png',
  campanha: '/kinetra-forma/forma-campanha.png',
}

export const colors = {
  marinho: { name: 'Marinho', hex: '#1E223D' },
  areia: { name: 'Areia', hex: '#E6D5B7' },
}

export const sizes = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
export const demoProducts = [{
  id: 'forma',
  nome: 'Kinetra Forma',
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
  if (product?.slug !== 'kinetra-forma' && images.length) return images[0].url
  return images[color === 'areia' ? 1 : 0]?.url || assets[color] || assets.marinho
}

export function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(`kinetra:${key}`)) ?? fallback } catch { return fallback }
}

export function writeLocal(key, value) {
  localStorage.setItem(`kinetra:${key}`, JSON.stringify(value))
}
