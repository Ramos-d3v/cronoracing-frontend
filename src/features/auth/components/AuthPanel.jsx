import { useState } from 'react'
import { ArrowIcon } from '../../../components/icons/ArrowIcon'
import { authApi } from '../../../services/api/client'

export function AuthPanel({ mode, onClose, onSuccess, onSwitch }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'PILOT' })
  const [status, setStatus] = useState({ loading: false, error: '' })
  const isRegister = mode === 'register'

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function submit(event) {
    event.preventDefault()
    setStatus({ loading: true, error: '' })
    try {
      const payload = isRegister ? form : { email: form.email, password: form.password }
      const data = isRegister ? await authApi.register(payload) : await authApi.login(payload)
      onSuccess(data)
    } catch (error) {
      setStatus({ loading: false, error: error.message })
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="close-button" onClick={onClose} aria-label="Fechar">×</button>
        <p className="eyebrow">{isRegister ? 'ENTRE PARA O PELOTÃO' : 'BEM-VINDO DE VOLTA'}</p>
        <h2 id="auth-title">{isRegister ? <>Sua próxima linha<br /><em>de chegada.</em></> : <>A pista é<br /><em>sua.</em></>}</h2>
        <p className="panel-copy">{isRegister ? 'Crie seu perfil e descubra corridas que combinam com o seu ritmo.' : 'Acesse suas inscrições, corridas e o painel de organização.'}</p>
        <form onSubmit={submit}>
          {isRegister && <label>Nome completo<input name="name" required minLength="2" value={form.name} onChange={updateField} placeholder="Como podemos te chamar?" /></label>}
          <label>E-mail<input name="email" type="email" required value={form.email} onChange={updateField} placeholder="voce@email.com" /></label>
          <label>Senha<input name="password" type="password" required minLength={isRegister ? 8 : undefined} value={form.password} onChange={updateField} placeholder={isRegister ? 'Mínimo de 8 caracteres' : 'Sua senha'} /></label>
          {isRegister && <label>Quero participar como<select name="role" value={form.role} onChange={updateField}><option value="PILOT">Piloto</option><option value="ORGANIZER">Organizador</option></select></label>}
          {status.error && <p className="form-error" role="alert">{status.error}</p>}
          <button className="button button-dark button-wide" disabled={status.loading}>{status.loading ? 'Conectando...' : isRegister ? 'Criar minha conta' : 'Entrar na plataforma'} <ArrowIcon /></button>
        </form>
        <p className="switch-auth">{isRegister ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button onClick={onSwitch}>{isRegister ? 'Entrar' : 'Cadastrar'}</button></p>
      </section>
    </div>
  )
}
