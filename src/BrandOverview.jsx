import { Activity, CircleDot, Dumbbell, Footprints, ScanLine, ShieldCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const stages = [
  ['Detectar', 'A palmilha identifica o contato do pé.'],
  ['Medir', 'Sensores avaliam a pressão e o sistema consulta as medidas.'],
  ['Ajustar', 'Microatuadores movem componentes internos para ajustar comprimento, largura e firmeza.'],
  ['Conferir', 'O sistema verifica se o ajuste ficou dentro da faixa prevista.'],
  ['Travar', 'A estrutura mantém as dimensões escolhidas antes de a pessoa se movimentar.'],
]

const technologies = [
  [ScanLine, 'Sensores e IA', 'A palmilha monitora a pressão e o movimento. A IA ajudaria a interpretar os dados e orientar o ajuste.'],
  [Zap, 'Microatuadores', 'Pequenos motores moveriam os mecanismos internos nas laterais e no calcanhar, mantendo a frente flexível.'],
  [ShieldCheck, 'Estrutura flexível', 'Malha respirável, câmaras de ar e solado segmentado foram pensados para preencher folgas, dar estabilidade e amortecer impactos.'],
]

const futureModels = [
  [CircleDot, 'Adapt X', 'Basquete e esportes variados.'],
  [Activity, 'Adapt Run', 'Corrida e velocidade.'],
  [Dumbbell, 'Adapt Train', 'Academia e treinamento físico.'],
  [Footprints, 'Adapt Street', 'Conforto e estilo no dia a dia.'],
]

export function BrandOverview() {
  return <>
    <section className="home-about page-pad" aria-labelledby="about-kinetra" data-reveal>
      <div className="about-heading">
        <p className="eyebrow">SOBRE A KINETRA</p>
        <h2 id="about-kinetra">Calçados pensados <em>para o pé.</em></h2>
      </div>
      <div className="about-copy">
        <p>A Kinetra explora novas formas de unir tecnologia, conforto e movimento em calçados esportivos.</p>
        <p>O <strong>Kinetra Adapt X 2050</strong>, apresentado na loja, ilustra a ideia de um tênis que se molda ao pé. O <strong>Adapt X 2100</strong> explora como sensores, pequenos motores e materiais flexíveis poderiam levar esse ajuste mais longe.</p>
        <Link to="/como-funciona" className="button outline">Conheça a proposta</Link>
      </div>
    </section>

    <section className="adapt-overview page-pad" aria-labelledby="adapt-title" data-reveal>
      <header className="adapt-heading">
        <p className="eyebrow">CONCEITO PARA 2100</p>
        <h2 id="adapt-title">Adapt X 2100</h2>
        <p>A proposta é ajustar o comprimento, a largura e a firmeza dentro de uma faixa limitada. A mudança no comprimento aconteceria com a pessoa parada, e as dimensões seriam travadas antes da atividade.</p>
      </header>
      <div className="adapt-body">
        <section className="adapt-process" aria-labelledby="adapt-process-title">
          <h3 id="adapt-process-title">Do calce ao ajuste</h3>
          <ol>{stages.map(([title, description], index) => <li key={title}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div><strong>{title}</strong><p>{description}</p></div>
          </li>)}</ol>
        </section>
        <div className="adapt-tech">
          <section aria-labelledby="adapt-tech-title">
            <h3 id="adapt-tech-title">Tecnologia por dentro</h3>
            {technologies.map(([Icon, title, description]) => <details key={title}>
              <summary><Icon size={21} aria-hidden="true" />{title}</summary>
              <p>{description}</p>
            </details>)}
          </section>
          <div className="adapt-goals">
            <h3>Metas do conceito</h3>
            <dl><div><dt>Bateria proposta</dt><dd>Li-S · 6 Wh</dd></div><div><dt>Autonomia alvo</dt><dd>Até 3 dias</dd></div><div><dt>Peso alvo por tênis</dt><dd>310–380 g</dd></div></dl>
            <p>Autonomia, peso e faixa de ajuste ainda dependem de pesquisa e testes.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="adapt-line page-pad" aria-labelledby="adapt-line-title" data-reveal>
      <div className="adapt-heading">
        <p className="eyebrow">LINHA CONCEITUAL</p>
        <h2 id="adapt-line-title">Quatro modelos, quatro usos.</h2>
        <p>Propostas da linha Adapt para diferentes atividades.</p>
      </div>
      <div className="adapt-models">{futureModels.map(([Icon, name, description]) => <article key={name}>
        <Icon size={27} aria-hidden="true" />
        <h3>{name}</h3>
        <p>{description}</p>
      </article>)}</div>
    </section>
  </>
}
