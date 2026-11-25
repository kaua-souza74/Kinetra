import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowDown, ArrowRight, Check, CheckCircle2, Footprints, Layers3, MoveDiagonal, Plus, RotateCcw, Ruler, ScanLine, ShieldCheck, Sparkles, Wind, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { productImage } from './store'
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
  ['Posso ajustar o comprimento e a largura separadamente?', 'Sim. A conexão permite definir as duas medidas do pé e acompanhar o encaixe ilustrativo em cada etapa.'],
  ['O ajuste acontece em um tênis físico?', 'Não. A página encena a conexão e o reconhecimento do pé, mas não conecta nem controla um calçado físico.'],
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
        <p>Do espaço para calçar à firmeza para se movimentar. Entenda como o Forma foi pensado para mudar de dimensão e conheça o painel de conexão.</p>
        <div className="tech-actions">
          <Link className="button primary" to="/simulador">Abrir conexão</Link>
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
      <div><h2>Controle o ajuste.</h2><p>Veja a conexão reconhecer o pé, liberar espaço e comprimir a malha até o encaixe.</p></div>
      <Link className="button primary" to="/simulador">Abrir conexão</Link>
    </section>
  </main>
}

const defaultFoot = { length: 27.4, width: 10.3, volume: 68 }
const fitStages = [
  ['Conexão ativa', 'Tênis pareado com o painel'],
  ['Pé reconhecido', 'Sensores identificaram o calce'],
  ['Leitura do contorno', 'Medidas e pontos de pressão'],
  ['Compressão e alívio', 'Câmaras liberam e firmam o encaixe'],
  ['Encaixe confirmado', 'Forma estabilizada para se movimentar'],
]
const formatMeasure = value => Number(value).toFixed(1).replace('.', ',')

export function Simulator({ products }) {
  const [foot, setFoot] = useState(defaultFoot)
  const [stage, setStage] = useState('ready')
  const [result, setResult] = useState({ length: 1, width: 1, support: 0 })
  const timers = useRef([])
  const forma = products.find(item => item.slug === 'kinetra-forma') ?? products[0]
  const isRunning = ['scanning', 'expanding', 'compressing', 'balancing'].includes(stage)
  const stageIndex = ({ ready: 1, scanning: 2, expanding: 3, compressing: 3, balancing: 4, complete: 4 })[stage]
  const statusText = ({ ready: 'Tênis conectado · pé reconhecido', scanning: 'Lendo contorno e pressão', expanding: 'Expelindo ar', compressing: 'Comprimindo a malha', balancing: 'Firmando o encaixe ao pé', complete: 'Ajuste concluído' })[stage]
  const target = {
    length: .9 + ((foot.length - 24) / 6) * .2,
    width: .88 + ((foot.width - 8) / 4) * .24,
    support: Math.round(48 + ((foot.volume - 50) / 40) * 32),
  }
  const shoeLength = stage === 'ready' ? .96 : stage === 'scanning' ? .98 : stage === 'expanding' ? target.length + .13 : stage === 'compressing' ? target.length + .045 : result.length
  const shoeWidth = stage === 'ready' ? .96 : stage === 'scanning' ? .98 : stage === 'expanding' ? target.width + .16 : stage === 'compressing' ? target.width + .025 : result.width
  const progress = stage === 'ready' ? 30 : stage === 'scanning' ? 46 : stage === 'expanding' ? 66 : stage === 'compressing' ? 82 : stage === 'balancing' ? 94 : 100

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function startAdjustment() {
    if (isRunning) return
    timers.current.forEach(clearTimeout)
    setStage('scanning')
    setResult({ length: .91, width: .91, support: 0 })
    const fitted = { length: target.length, width: target.width, support: target.support }
    timers.current = [
      setTimeout(() => setStage('expanding'), 900),
      setTimeout(() => setStage('compressing'), 1950),
      setTimeout(() => { setResult(fitted); setStage('balancing') }, 3050),
      setTimeout(() => setStage('complete'), 4050),
    ]
  }

  function updateFoot(key, value) {
    setFoot(previous => ({ ...previous, [key]: Number(value) }))
    if (stage === 'complete') {
      setStage('ready')
      setResult({ length: 1, width: 1, support: 0 })
    }
  }

  function resetFoot() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setFoot(defaultFoot)
    setStage('ready')
    setResult({ length: 1, width: 1, support: 0 })
  }

  return <main className="simulator-page page-pad inner-page">
    <header className="fit-heading">
      <div><p className="fit-eyebrow"><span /> SISTEMA KINETRA <i>·</i> CONEXÃO</p><h1>Conectado. Ajustado <em>ao seu pé.</em></h1><p>O tênis já está conectado e reconheceu o pé. Ajuste as medidas e acompanhe a malha abrir e comprimir para firmar o encaixe.</p></div>
      <div className="fit-session"><span className="fit-session-icon"><Activity size={18} aria-hidden="true" /></span><span><small>CONEXÃO</small><strong>Tênis conectado</strong></span></div>
    </header>

    <div className="fit-workbench">
      <section className="fit-scene" data-stage={stage} aria-label="Painel de conexão e ajuste Kinetra">
        <div className="fit-scene-grid" aria-hidden="true" />
        <div className="fit-scene-glow" aria-hidden="true" />
        <div className="fit-orbit fit-orbit-one" aria-hidden="true" />
        <div className="fit-orbit fit-orbit-two" aria-hidden="true" />
        <div className="fit-scene-head"><span>FORMA <i>01</i></span><span className={'fit-state-chip ' + (stage === 'complete' ? 'is-complete' : isRunning ? 'is-running' : 'is-connected')}><i />{stage === 'complete' ? 'AJUSTE CONFIRMADO' : isRunning ? statusText : 'TÊNIS CONECTADO'}</span></div>

        <div className="fit-foot-map" aria-hidden="true">
          <svg viewBox="0 0 150 205"><path d="M67 12c-13-2-20 9-20 24 0 14 5 23-1 35-7 13-20 22-25 43-7 29 4 58 22 73 14 12 36 13 51 3 20-13 31-41 29-66-1-20-10-33-18-47-7-12-7-26-8-42-1-17-9-25-20-24-4 0-7 2-10 4z"/><circle cx="65" cy="48" r="5"/><circle cx="48" cy="88" r="4"/><circle cx="76" cy="94" r="4"/><circle cx="44" cy="126" r="5"/><circle cx="79" cy="135" r="5"/><circle cx="59" cy="161" r="4"/></svg>
          <span>{stage === 'complete' ? 'ENCAIXE ESTÁVEL' : isRunning ? 'LEITURA DO PÉ' : 'PÉ DETECTADO'}</span>
        </div>

        <div className="fit-sensors" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
        <div className="fit-scan-beam" aria-hidden="true" />
        <div className="fit-pressure-rings" aria-hidden="true"><i /><i /><i /></div>
        <div className="fit-airflow" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="fit-shoe-wrap" style={{ '--shoe-x': shoeLength, '--shoe-y': shoeWidth }}>
          {forma && <img className="fit-shoe" src={productImage(forma, 'marinho')} alt="Tênis Kinetra Forma se ajustando ao perfil do pé" width="1536" height="1024" />}
        </div>

        <div className="fit-callout fit-callout-length"><Ruler size={14} aria-hidden="true" /><span>COMPRIMENTO</span><strong>{formatMeasure(foot.length)} cm</strong></div>
        <div className="fit-callout fit-callout-width"><MoveDiagonal size={14} aria-hidden="true" /><span>LARGURA</span><strong>{formatMeasure(foot.width)} cm</strong></div>
        <div className="fit-scene-foot"><span className="fit-live-dot" />{stage === 'complete' ? 'ENCAIXE ESTABILIZADO' : isRunning ? 'AJUSTE EM PROCESSO' : 'PÉ DETECTADO · SENSORES ATIVOS'}</div>
        <div className="fit-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      </section>

      <aside className="fit-panel">
        <div className="fit-panel-top"><div><p className="fit-panel-kicker">PÉ RECONHECIDO</p><h2>Seu encaixe</h2></div><span className="fit-panel-icon"><Footprints size={20} aria-hidden="true" /></span></div>
        <p className="fit-panel-intro">A conexão reconheceu o calce. Ao ajustar, as câmaras aliviam a pressão e comprimem a malha até firmar o tênis ao seu perfil.</p>

        <div className="fit-controls" aria-busy={isRunning}>
          <label className="fit-control" htmlFor="fit-length"><span><span>Comprimento</span><output>{formatMeasure(foot.length)} <small>cm</small></output></span><input id="fit-length" type="range" min="24" max="30" step="0.1" value={foot.length} disabled={isRunning} onChange={event => updateFoot('length', event.target.value)} /><span className="fit-control-bounds"><small>24 cm</small><small>30 cm</small></span></label>
          <label className="fit-control" htmlFor="fit-width"><span><span>Largura do antepé</span><output>{formatMeasure(foot.width)} <small>cm</small></output></span><input id="fit-width" type="range" min="8" max="12" step="0.1" value={foot.width} disabled={isRunning} onChange={event => updateFoot('width', event.target.value)} /><span className="fit-control-bounds"><small>8 cm</small><small>12 cm</small></span></label>
          <label className="fit-control" htmlFor="fit-volume"><span><span>Volume do peito do pé</span><output>{foot.volume}<small>%</small></output></span><input id="fit-volume" type="range" min="50" max="90" step="1" value={foot.volume} disabled={isRunning} onChange={event => updateFoot('volume', event.target.value)} /><span className="fit-control-bounds"><small>Mais baixo</small><small>Mais alto</small></span></label>
        </div>

        <div className="fit-result" data-visible={stage === 'complete'} aria-live="polite">
          <span className="fit-result-icon"><CheckCircle2 size={19} aria-hidden="true" /></span>
          <span><strong>{stage === 'complete' ? 'Ajuste ao pé concluído' : 'Pronto para ajustar'}</strong><small>{stage === 'complete' ? `Malha estabilizada · apoio ${result.support}%` : 'Conexão ativa · pé reconhecido'}</small></span>
        </div>

        <button className="fit-start-button" type="button" onClick={startAdjustment} disabled={isRunning}>
          {isRunning ? <><span className="fit-button-spinner" aria-hidden="true" /> Ajustando o Forma…</> : <><Sparkles size={18} aria-hidden="true" /> {stage === 'complete' ? 'Reajustar ao pé' : 'Ajustar ao pé'} <ArrowRight size={17} aria-hidden="true" /></>}
        </button>
        <button className="fit-reset" type="button" onClick={resetFoot} disabled={isRunning}><RotateCcw size={14} aria-hidden="true" /> Restaurar medidas</button>
      </aside>
    </div>

    <ol className="fit-steps" aria-label="Etapas da conexão e ajuste">
      {fitStages.map(([title, detail], index) => <li key={title} data-state={index < stageIndex ? 'complete' : index === stageIndex ? 'active' : 'upcoming'} aria-current={index === stageIndex ? 'step' : undefined}>
        <span className="fit-step-mark">{index < stageIndex ? <Check size={15} aria-hidden="true" /> : <small>0{index + 1}</small>}</span><span><strong>{title}</strong><small>{index === stageIndex ? statusText : detail}</small></span>
      </li>)}
    </ol>
    <p className="fit-footnote"><ShieldCheck size={15} aria-hidden="true" /> Conexão ilustrativa: nenhum tênis físico está conectado; os sensores são representados na tela.</p>
  </main>
}
