import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeftRight, ArrowUpDown, Bluetooth, Check, Footprints, Layers3, Minus, MoveDiagonal, Plus, RotateCcw, ScanLine, ShieldCheck, Wind, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { assets, productImage } from './store'
import { Adjustment } from './Storefront'
import './Technology.css'

const stages = [
  [Footprints, 'Calce', 'O pé entra pela abertura da malha. A estrutura fica expandida para facilitar o calce.'],
  [ScanLine, 'Meça', 'No conceito, sensores na palmilha leem o contato e a distribuição da pressão para orientar o ajuste.'],
  [MoveDiagonal, 'Ajuste', 'Microatuadores moveriam partes da estrutura enquanto a pessoa está parada. Câmaras de ar ajudariam a preencher folgas internas.'],
  [ShieldCheck, 'Confira e trave', 'O sistema verificaria os limites do ajuste e travaria a estrutura antes de a pessoa caminhar ou correr.'],
]

const layers = [
  [Wind, 'Malha e revestimento', 'A camada externa flexível e respirável envolve o pé. O forro protege a pele do contato com os componentes.'],
  [ScanLine, 'Palmilha inteligente', 'Sensores propostos na palmilha mediriam a pressão e ajudariam a identificar quando o pé está parado.'],
  [Zap, 'Mecanismo de ajuste', 'Os componentes nas laterais e no calcanhar moveriam a estrutura. Câmaras de ar preencheriam espaços internos.'],
  [Layers3, 'Base segmentada', 'O solado acomoda a mudança de forma. A proposta inclui uma camada de amortecimento e uma base com aderência.'],
]

const questions = [
  ['O tênis muda de tamanho enquanto corro?', 'A proposta prevê ajuste de comprimento com a pessoa parada. Durante a atividade, a estrutura permaneceria travada.'],
  ['O mesmo par serve para qualquer pé?', 'O ajuste teria uma faixa limitada. A numeração inicial, a forma do pé e os limites do mecanismo ainda precisariam ser avaliados no protótipo.'],
  ['Posso ajustar o comprimento e a largura separadamente?', 'No simulador da Kinetra, sim. Você escolhe um eixo e pode expandir ou reduzir em níveis ilustrativos.'],
  ['O simulador se conecta a um tênis real?', 'A conexão é virtual. A página pode ser usada sem Bluetooth, sem instalar aplicativo e sem parear um dispositivo.'],
  ['Qual é a autonomia prevista?', 'O projeto Adapt X 2100 propõe uma bateria Li-S de 6 Wh e autonomia alvo de até três dias. Essa meta depende de pesquisa e testes.'],
]

export function Technology({ products, motion }) {
  const steps = useRef(null)
  const forma = products.find(item => item.slug === 'kinetra-forma')
  return <main className="technology-page">
    <section className="tech-hero page-pad" aria-labelledby="tech-title">
      <div className="tech-hero-copy">
        <p className="eyebrow">TECNOLOGIA KINETRA</p>
        <h1 id="tech-title">A forma segue <em>o seu pé.</em></h1>
        <p>Do espaço para calçar à firmeza para se movimentar. Entenda como o Forma foi pensado para mudar de dimensão e experimente o ajuste manual.</p>
        <div className="tech-actions">
          <Link className="button primary" to="/simulador">Experimentar simulador</Link>
          <button className="button outline" type="button" onClick={() => {
            steps.current?.focus({ preventScroll: true })
            steps.current?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' })
          }}>Ver passo a passo <ArrowDown size={17} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="tech-hero-art" aria-hidden="true">
        <div className="tech-orbits" />
        <span>FORMA</span>
        <img src={productImage(forma, 'marinho')} alt="" width="1536" height="1024" fetchPriority="high" />
      </div>
    </section>

    <section ref={steps} tabIndex={-1} className="tech-process page-pad" aria-labelledby="tech-process-title" data-reveal>
      <div className="tech-section-heading">
        <p className="eyebrow">PASSO A PASSO</p>
        <h2 id="tech-process-title">Do calce ao ajuste.</h2>
        <p>As etapas mostram como o conceito passaria de expandido para moldado ao pé.</p>
      </div>
      <div className="tech-process-grid">
        <div className="tech-process-visual"><Adjustment eager /></div>
        <ol className="tech-steps">{stages.map(([Icon, title, text], index) => <li key={title} data-reveal>
          <span className="tech-step-index" aria-hidden="true">0{index + 1}</span>
          <div><Icon size={24} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></div>
        </li>)}</ol>
      </div>
    </section>

    <section className="tech-construction page-pad" aria-labelledby="tech-construction-title" data-reveal>
      <div className="tech-section-heading"><p className="eyebrow">CONSTRUÇÃO</p><h2 id="tech-construction-title">O que vai dentro.</h2><p>Quatro partes da estrutura proposta e o papel de cada uma no ajuste.</p></div>
      <div className="tech-layers">{layers.map(([Icon, title, text]) => <article key={title} data-reveal>
        <Icon size={26} aria-hidden="true" /><h3>{title}</h3><p>{text}</p>
      </article>)}</div>
    </section>

    <section className="tech-faq page-pad" aria-labelledby="tech-faq-title" data-reveal>
      <div className="tech-section-heading"><p className="eyebrow">DÚVIDAS</p><h2 id="tech-faq-title">Como seria na prática?</h2></div>
      <div className="tech-questions">{questions.map(([question, answer]) => <details key={question}>
        <summary>{question}<Plus size={18} aria-hidden="true" /></summary><p>{answer}</p>
      </details>)}</div>
    </section>

    <section className="tech-cta page-pad" data-reveal>
      <div><h2>Controle o ajuste.</h2><p>Conecte o tênis virtual e veja como a expansão e a redução aparecem no modelo.</p></div>
      <Link className="button primary" to="/simulador">Abrir simulador</Link>
    </section>
  </main>
}

const axes = {
  comprimento: { label: 'Comprimento', Icon: ArrowLeftRight },
  largura: { label: 'Largura', Icon: ArrowUpDown },
}
const base = { comprimento: 0, largura: 0 }
const minFit = -3
const maxFit = 3
const displayFit = value => value > 0 ? '+' + value : String(value)

export function Simulator({ products }) {
  const [connection, setConnection] = useState('disconnected')
  const [axis, setAxis] = useState('comprimento')
  const [fit, setFit] = useState(base)
  const timer = useRef(null)
  const ready = connection === 'connected'
  const connecting = connection === 'connecting'
  const forma = products.find(item => item.slug === 'kinetra-forma')
  const level = fit[axis]
  const status = ready ? 'Conectado virtualmente' : connecting ? 'Conectando ao tênis virtual…' : 'Desconectado'

  useEffect(() => () => clearTimeout(timer.current), [])

  function toggleConnection() {
    if (connection !== 'disconnected') {
      clearTimeout(timer.current)
      setConnection('disconnected')
      return
    }
    setConnection('connecting')
    timer.current = setTimeout(() => setConnection('connected'), 720)
  }

  function adjust(value) {
    if (!ready) return
    setFit(previous => ({ ...previous, [axis]: Math.max(minFit, Math.min(maxFit, value)) }))
  }

  return <main className="simulator-page page-pad inner-page">
    <header className="sim-heading">
      <p className="eyebrow">DEMONSTRAÇÃO INTERATIVA</p>
      <h1>Simulador de ajuste</h1>
      <p>Conecte um Kinetra virtual e ajuste o comprimento e a largura para ver a mudança na tela.</p>
    </header>
    <div className="sim-grid">
      <figure className="sim-preview" data-connection={connection} data-axis={axis}>
        <div className="sim-preview-top"><span>KINETRA FORMA</span><span><i />{ready ? 'ONLINE' : connecting ? 'CONECTANDO' : 'OFFLINE'}</span></div>
        <div className="sim-art">
          <div className="sim-grid-overlay" aria-hidden="true" />
          <img src={productImage(forma, 'marinho')} alt="Prévia ilustrativa do Kinetra Forma" width="1536" height="1024"
            style={{ '--fit-length': 1 + fit.comprimento * .045, '--fit-width': 1 + fit.largura * .045 }} />
        </div>
        <figcaption className="sim-readouts">{Object.entries(axes).map(([key, { label, Icon }]) => <div key={key} data-active={axis === key}><Icon size={18} aria-hidden="true" /><span>{label}</span><strong>{displayFit(fit[key])}</strong></div>)}</figcaption>
      </figure>
      <div className="sim-controls">
        <section className="sim-panel" aria-labelledby="sim-connection">
          <div className="sim-panel-header"><Bluetooth size={25} aria-hidden="true" /><div><h2 id="sim-connection">Conexão</h2><p role="status">{status}</p></div>{ready && <Check size={20} aria-hidden="true" />}</div>
          <button className={'button ' + (ready || connecting ? 'outline' : 'primary')} type="button" onClick={toggleConnection}>
            {ready ? 'Desconectar' : connecting ? 'Cancelar conexão' : 'Conectar tênis virtual'}
          </button>
        </section>
        <section className="sim-panel" aria-labelledby="sim-adjust-title">
          <h2 id="sim-adjust-title">Ajuste manual</h2>
          <fieldset disabled={!ready}>
            <legend>Eixo de ajuste</legend>
            <div className="sim-axis">{Object.entries(axes).map(([key, { label, Icon }]) => <button key={key} type="button" className="button outline" aria-pressed={axis === key} onClick={() => setAxis(key)}>
              <Icon size={16} aria-hidden="true" />{label}
            </button>)}</div>
            <div className="sim-level"><label htmlFor="fit-level">Nível de {axes[axis].label.toLowerCase()}</label><output htmlFor="fit-level">{displayFit(level)}</output></div>
            <input id="fit-level" type="range" min={minFit} max={maxFit} step="1" value={level} aria-valuetext={level === 0 ? 'Neutro' : displayFit(level) + ' níveis'} onChange={e => adjust(Number(e.target.value))} />
            <div className="sim-adjust-actions"><button type="button" className="button outline" disabled={level === minFit} onClick={() => adjust(level - 1)}><Minus size={17} aria-hidden="true" /> Diminuir</button><button type="button" className="button primary" disabled={level === maxFit} onClick={() => adjust(level + 1)}><Plus size={17} aria-hidden="true" /> Expandir</button></div>
            <button type="button" className="text-button sim-reset" disabled={fit.comprimento === 0 && fit.largura === 0} onClick={() => setFit(base)}><RotateCcw size={15} aria-hidden="true" /> Restaurar padrão</button>
          </fieldset>
          <p className="sim-note">{ready ? 'Os níveis são ilustrativos e representam o ajuste virtual.' : 'Conecte o tênis virtual para liberar os controles.'}</p>
        </section>
      </div>
    </div>
  </main>
}
