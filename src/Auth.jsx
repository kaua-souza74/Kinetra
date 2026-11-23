import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { result, supabase } from './data'
import { assets } from './store'
import { Brand } from './Brand'

const names = { entrar: 'Bem-vindo de volta à Kinetra', cadastro: 'Crie sua conta', recuperar: 'Recupere sua senha', redefinir: 'Defina sua nova senha' }
const subtitles = { entrar: 'Entre para acessar sua conta e acompanhar seus pedidos.', cadastro: 'Crie seu perfil para salvar seus endereços e pedidos.', recuperar: 'Informe seu e-mail para receber o link de redefinição.', redefinir: 'Escolha uma senha com pelo menos oito caracteres.' }

export function Auth({ mode, data, motion, toggleMotion }) {
  return <main className="auth-wall" style={{ '--campaign': 'url(' + assets.campanha + ')' }}>
    <div className="auth-card" data-mode={mode}>
      <aside className="campaign">
        <img src={assets.campanha} alt="Corredor usando o Kinetra Forma Marinho" width="1122" height="1402" fetchPriority="high" />
        <div><strong>KINETRA<span>.</span></strong><span>Forma</span></div>
      </aside>
      <AuthForm key={mode} mode={mode} data={data} motion={motion} toggleMotion={toggleMotion} />
    </div>
  </main>
}

function AuthForm({ mode, data, motion, toggleMotion }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const next = location.state?.next ?? '/conta'
  const fromCart = next === '/finalizar'

  if (data.recovery && mode !== 'redefinir') return <Navigate to="/redefinir-senha" replace />
  if (data.user && mode === 'entrar') {
    const destination = !data.session && data.demo?.papel === 'admin' ? '/admin' : next
    return <Navigate to={destination} replace />
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      if (!supabase) throw new Error('A conexão de autenticação ainda não foi configurada.')
      const f = new FormData(e.currentTarget)
      const email = f.get('email')?.trim()
      const password = f.get('senha')
      if (mode === 'entrar') {
        result(await supabase.auth.signInWithPassword({ email, password }))
        navigate(next, { replace: true })
      } else if (mode === 'cadastro') {
        const response = result(await supabase.auth.signUp({ email, password, options: { emailRedirectTo: locationOrigin() + '/entrar', data: { nome: f.get('nome').trim(), numeracao: Number(f.get('numeracao')) || null } } }))
        if (response.session) navigate(next, { replace: true })
        else setMessage({ text: 'Confira seu e-mail para confirmar o cadastro.' })
      } else if (mode === 'recuperar') {
        result(await supabase.auth.resetPasswordForEmail(email, { redirectTo: locationOrigin() + '/redefinir-senha' }))
        setMessage({ text: 'Se houver uma conta para esse e-mail, você receberá um link de redefinição.' })
      } else {
        if (password !== f.get('confirmar')) throw new Error('As senhas precisam ser iguais.')
        result(await supabase.auth.updateUser({ password }))
        data.setRecovery(false)
        navigate('/conta', { replace: true })
      }
    } catch (error) {
      const translations = { 'Invalid login credentials': 'E-mail ou senha inválidos.', 'Email not confirmed': 'Confirme seu e-mail antes de entrar.', 'Failed to fetch': 'Não foi possível conectar à autenticação. Tente novamente.' }
      setMessage({ error: true, text: translations[error.message] ?? error.message })
    } finally { setBusy(false) }
  }

  const canReset = mode !== 'redefinir' || (data.recovery && data.session)
  return <section className="auth-panel" aria-labelledby="auth-title">
    {mode === 'entrar' && <Link className="auth-back" to={fromCart ? '/carrinho' : '/'}><ArrowLeft size={18} aria-hidden="true" /> {fromCart ? 'Voltar à sacola' : 'Voltar ao início'}</Link>}
    <Brand />
    <h1 id="auth-title">{names[mode]}</h1><p>{subtitles[mode]}</p>
    {message && <p className={message.error ? 'error' : 'notice'} role={message.error ? 'alert' : 'status'}>{message.text}</p>}
    {canReset ? <form onSubmit={submit}>
      {mode === 'cadastro' && <label>Nome<input name="nome" autoComplete="name" required maxLength="120" /></label>}
      {mode !== 'redefinir' && <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>}
      {mode !== 'recuperar' && <label><span className="label-row">Senha {mode === 'entrar' && <Link to="/recuperar-senha" state={{ next }}>Esqueci minha senha</Link>}</span><span className="password"><input name="senha" type={show ? 'text' : 'password'} autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'} required minLength={mode === 'entrar' ? undefined : 8} /><button type="button" className="icon-button" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>}
      {mode === 'redefinir' && <label>Confirmar nova senha<input name="confirmar" required type={show ? 'text' : 'password'} minLength={8} autoComplete="new-password" /></label>}
      {mode === 'cadastro' && <><label>Numeração preferida <small>(opcional)</small><input name="numeracao" type="number" min="20" max="55" /></label><details className="auth-terms"><summary>Termos e privacidade</summary><p>Loja acadêmica com pedidos e pagamentos simulados. Use somente informações que queira guardar na sua conta de demonstração.</p></details><label className="check"><input type="checkbox" required /> Li e aceito os termos e a privacidade.</label></>}
      <button className="button primary" disabled={busy}>{busy ? 'Aguarde…' : { entrar: 'Entrar', cadastro: 'Criar conta', recuperar: 'Enviar instruções', redefinir: 'Salvar nova senha' }[mode]}</button>
    </form> : <p role="status" className="notice">{data.ready ? 'Abra um link válido de recuperação para continuar.' : 'Validando o link…'}</p>}
    {mode === 'entrar' ? <><p>Ainda não tem conta? <Link to="/cadastro" state={{ next }}>Cadastre-se</Link></p><details className="demo-options"><summary>Demonstração local</summary><div className="choice-row"><button onClick={() => data.startDemo('cliente')}>Entrar como cliente</button><button onClick={() => data.startDemo('admin')}>Abrir admin</button></div></details></> : <Link to="/entrar" state={{ next }} className="back-link"><ArrowLeft size={16} /> Voltar para entrar</Link>}
    <button className="motion-toggle" type="button" aria-pressed={motion} onClick={toggleMotion}>Animações: {motion ? 'ligadas' : 'desligadas'}</button>
    </section>
}
function locationOrigin() { return window.location.origin }
