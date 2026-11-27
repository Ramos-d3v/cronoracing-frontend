import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../../services/api/client'
import { AuthLayout, PasswordVisibilityIcon } from '../components/AuthLayout'

const inputClass = 'min-h-12 w-full rounded-sm border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'

export function LoginPage({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await authApi.loginAthlete({ email: email.trim().toLowerCase(), senha: password })
      onSuccess(response)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      compact
      eyebrow="Área do atleta"
      title="Bom ter você de volta."
      description="Entre para acompanhar suas provas, inscrições e resultados."
    >
      <form className="border border-zinc-200 bg-white p-6 sm:p-9" onSubmit={submit}>
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-bold text-zinc-800" htmlFor="login-email">
            E-mail
            <input className={inputClass} id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-800" htmlFor="login-password">
            Senha
            <span className="relative block">
              <input className={`${inputClass} pr-12`} id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-zinc-500 transition hover:text-red-700" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}>
                <PasswordVisibilityIcon visible={showPassword} />
              </button>
            </span>
          </label>
          {error && <p className="m-0 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{error}</p>}
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-red-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
        <p className="mb-0 mt-6 text-center text-sm text-zinc-600">Ainda não tem cadastro? <Link className="font-bold text-red-700 underline decoration-red-300 underline-offset-4 hover:text-red-800" to="/register">Crie sua conta de atleta</Link></p>
      </form>
    </AuthLayout>
  )
}
