import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../../services/api/client'
import { AuthLayout, PasswordVisibilityIcon } from '../components/AuthLayout'
import { lookupCep } from '../services/viaCep'
import { getPasswordRules, maskCep, maskCpf, maskPhone, onlyDigits, validateRegistration } from '../utils/validation'

const initialForm = {
  nome: '',
  data_nascimento: '',
  is_estrangeiro: false,
  cpf: '',
  documento_estrangeiro: '',
  genero: '',
  tipo_sanguineo: '',
  equipe: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  nome_contato_emergencia: '',
  numero_emergencia: '',
  email: '',
  senha: '',
}

const inputClass = 'min-h-12 w-full rounded-sm border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
const selectClass = `${inputClass} pr-9`

function Field({ label, name, error, optional = false, hint, children }) {
  return (
    <label className="grid min-w-0 content-start gap-2 text-sm font-bold text-zinc-800" htmlFor={name}>
      <span>{label}{optional && <span className="ml-1 font-normal text-zinc-500">(opcional)</span>}</span>
      {children}
      {hint && <span className="text-xs font-normal leading-5 text-zinc-500">{hint}</span>}
      {error && <span className="text-xs font-semibold leading-5 text-red-700" id={`${name}-error`}>{error}</span>}
    </label>
  )
}

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-zinc-200 pb-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-red-50 text-xs font-extrabold text-red-700">{number}</span>
      <div>
        <h2 className="!m-0 !font-[family-name:Space_Grotesk] !text-xl !leading-6 !tracking-normal text-zinc-950">{title}</h2>
        <p className="mb-0 mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
    </div>
  )
}

function PasswordField({ id, label, value, onChange, visible, onToggle, error, autocomplete }) {
  return (
    <Field name={id} label={label} error={error}>
      <span className="relative block">
        <input className={`${inputClass} pr-12`} id={id} name={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autocomplete} />
        <button className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-zinc-500 transition hover:text-red-700" type="button" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} onClick={onToggle}>
          <PasswordVisibilityIcon visible={visible} />
        </button>
      </span>
    </Field>
  )
}

export function RegisterPage({ onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ password: false, confirmation: false })
  const [cepStatus, setCepStatus] = useState({ loading: false, message: '', error: false })
  const numberRef = useRef(null)

  function updateField(event) {
    const { name, value, checked, type } = event.target
    let nextValue = type === 'checkbox' ? checked : value
    if (name === 'cpf') nextValue = maskCpf(value)
    if (name === 'cep') nextValue = maskCep(value, form.pais)
    if (name === 'numero_emergencia') nextValue = maskPhone(value)
    setForm((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setGlobalError('')
  }

  async function searchCep() {
    if (!/^brasil$/i.test(form.pais.trim()) || onlyDigits(form.cep).length !== 8) return
    setCepStatus({ loading: true, message: 'Buscando CEP...', error: false })
    try {
      const address = await lookupCep(form.cep)
      if (!address) {
        setCepStatus({ loading: false, message: 'CEP não encontrado. Você pode preencher o endereço manualmente.', error: true })
        return
      }
      setForm((current) => ({ ...current, ...address }))
      setErrors((current) => ({ ...current, cep: undefined, logradouro: undefined, bairro: undefined, cidade: undefined, estado: undefined }))
      setCepStatus({ loading: false, message: 'Endereço encontrado e preenchido.', error: false })
      numberRef.current?.focus()
    } catch {
      setCepStatus({ loading: false, message: 'Não foi possível consultar agora. Preencha o endereço manualmente.', error: true })
    }
  }

  async function submit(event) {
    event.preventDefault()
    setGlobalError('')
    const fieldErrors = validateRegistration(form, confirmation)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      document.getElementById(Object.keys(fieldErrors)[0])?.focus()
      return
    }

    const isBrazil = /^brasil$/i.test(form.pais.trim())
    const payload = {
      nome: form.nome.trim(),
      data_nascimento: form.data_nascimento,
      is_estrangeiro: form.is_estrangeiro,
      cpf: form.is_estrangeiro ? null : onlyDigits(form.cpf),
      documento_estrangeiro: form.is_estrangeiro ? form.documento_estrangeiro.trim() : null,
      genero: form.genero,
      tipo_sanguineo: form.tipo_sanguineo,
      equipe: form.equipe.trim() || null,
      cep: isBrazil ? onlyDigits(form.cep) : form.cep.trim(),
      logradouro: form.logradouro.trim(),
      numero: form.numero.trim(),
      complemento: form.complemento.trim() || null,
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado.trim(),
      pais: form.pais.trim(),
      nome_contato_emergencia: form.nome_contato_emergencia.trim(),
      numero_emergencia: onlyDigits(form.numero_emergencia),
      email: form.email.trim().toLowerCase(),
      senha: form.senha,
    }

    setSubmitting(true)
    try {
      const data = await authApi.registerAthlete(payload)
      onSuccess(data)
    } catch (error) {
      const apiErrors = error.details?.errors || []
      if (apiErrors.length) {
        const mappedErrors = Object.fromEntries(apiErrors.map(({ field, message }) => [field, message]))
        setErrors((current) => ({ ...current, ...mappedErrors }))
        setGlobalError(error.details?.message || error.message)
      } else {
        setGlobalError(error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const passwordRules = getPasswordRules(form.senha)

  return (
    <AuthLayout
      eyebrow="Perfil do atleta"
      title="Sua próxima prova começa com você."
      description="Crie seu perfil uma vez e deixe seus dados prontos para a próxima linha de largada."
    >
      <form className="grid gap-5 lg:grid-cols-2" noValidate onSubmit={submit}>
        <section className="min-w-0 border border-zinc-200 bg-white p-5 sm:p-7">
          <SectionHeading number="01" title="Dados pessoais" description="Identificação e informações importantes para sua participação." />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field name="nome" label="Nome completo" error={errors.nome}>
                <input className={inputClass} id="nome" name="nome" autoComplete="name" value={form.nome} onChange={updateField} aria-invalid={Boolean(errors.nome)} />
              </Field>
            </div>
            <Field name="data_nascimento" label="Data de nascimento" error={errors.data_nascimento}>
              <input className={inputClass} id="data_nascimento" name="data_nascimento" type="date" autoComplete="bday" value={form.data_nascimento} onChange={updateField} aria-invalid={Boolean(errors.data_nascimento)} />
            </Field>
            <Field name="genero" label="Gênero" error={errors.genero}>
              <select className={selectClass} id="genero" name="genero" value={form.genero} onChange={updateField} aria-invalid={Boolean(errors.genero)}>
                <option value="">Selecione</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 border border-zinc-200 bg-zinc-50 p-4 text-sm font-semibold text-zinc-800" htmlFor="is_estrangeiro">
                <input className="mt-0.5 h-4 w-4 accent-red-600" id="is_estrangeiro" name="is_estrangeiro" type="checkbox" checked={form.is_estrangeiro} onChange={updateField} />
                <span>Sou atleta estrangeiro (não possuo CPF)</span>
              </label>
            </div>
            {form.is_estrangeiro ? <Field name="documento_estrangeiro" label="Passaporte / documento estrangeiro" error={errors.documento_estrangeiro}>
              <input className={inputClass} id="documento_estrangeiro" name="documento_estrangeiro" autoComplete="off" value={form.documento_estrangeiro} onChange={updateField} />
            </Field> : <Field name="cpf" label="CPF" error={errors.cpf} hint="Somente números serão enviados para a CronoRacing.">
              <input className={inputClass} id="cpf" name="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={form.cpf} onChange={updateField} aria-invalid={Boolean(errors.cpf)} />
            </Field>}
            <Field name="tipo_sanguineo" label="Tipo sanguíneo" error={errors.tipo_sanguineo}>
              <select className={selectClass} id="tipo_sanguineo" name="tipo_sanguineo" value={form.tipo_sanguineo} onChange={updateField} aria-invalid={Boolean(errors.tipo_sanguineo)}>
                <option value="">Selecione</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'NAO_SEI'].map((type) => <option key={type} value={type}>{type === 'NAO_SEI' ? 'Não sei informar' : type}</option>)}
              </select>
            </Field>
            <Field name="equipe" label="Equipe / assessoria esportiva" optional error={errors.equipe}>
              <input className={inputClass} id="equipe" name="equipe" autoComplete="organization" value={form.equipe} onChange={updateField} />
            </Field>
          </div>
        </section>

        <section className="min-w-0 border border-zinc-200 bg-white p-5 sm:p-7">
          <SectionHeading number="02" title="Endereço" description="No Brasil, buscamos o endereço pelo CEP para agilizar o preenchimento." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="pais" label="País" error={errors.pais}>
              <input className={inputClass} id="pais" name="pais" autoComplete="country-name" value={form.pais} onChange={updateField} />
            </Field>
            <Field name="cep" label="CEP / código postal" error={errors.cep} hint={cepStatus.message}>
              <span className="relative block">
                <input className={`${inputClass} pr-12`} id="cep" name="cep" autoComplete="postal-code" inputMode="text" placeholder={/^brasil$/i.test(form.pais) ? '00000-000' : 'Código postal'} value={form.cep} onChange={updateField} onBlur={searchCep} aria-invalid={Boolean(errors.cep)} />
                {cepStatus.loading && <span className="absolute right-4 top-4 h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-red-600" aria-label="Buscando CEP" />}
              </span>
            </Field>
            <div className="sm:col-span-2">
              <Field name="logradouro" label="Logradouro / rua" error={errors.logradouro}>
                <input className={inputClass} id="logradouro" name="logradouro" autoComplete="address-line1" value={form.logradouro} onChange={updateField} aria-invalid={Boolean(errors.logradouro)} />
              </Field>
            </div>
            <Field name="numero" label="Número" error={errors.numero}>
              <input className={inputClass} ref={numberRef} id="numero" name="numero" autoComplete="address-line2" value={form.numero} onChange={updateField} aria-invalid={Boolean(errors.numero)} />
            </Field>
            <Field name="complemento" label="Complemento" optional error={errors.complemento}>
              <input className={inputClass} id="complemento" name="complemento" value={form.complemento} onChange={updateField} />
            </Field>
            <Field name="bairro" label="Bairro" error={errors.bairro}>
              <input className={inputClass} id="bairro" name="bairro" autoComplete="address-level3" value={form.bairro} onChange={updateField} aria-invalid={Boolean(errors.bairro)} />
            </Field>
            <Field name="cidade" label="Cidade" error={errors.cidade}>
              <input className={inputClass} id="cidade" name="cidade" autoComplete="address-level2" value={form.cidade} onChange={updateField} aria-invalid={Boolean(errors.cidade)} />
            </Field>
            <Field name="estado" label="Estado / UF" error={errors.estado}>
              <input className={inputClass} id="estado" name="estado" autoComplete="address-level1" value={form.estado} onChange={updateField} aria-invalid={Boolean(errors.estado)} />
            </Field>
          </div>
        </section>

        <section className="min-w-0 border border-zinc-200 bg-white p-5 sm:p-7">
          <SectionHeading number="03" title="Contato de emergência" description="Para que a organização possa falar com alguém de confiança, se necessário." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="nome_contato_emergencia" label="Nome completo do contato" error={errors.nome_contato_emergencia}>
              <input className={inputClass} id="nome_contato_emergencia" name="nome_contato_emergencia" autoComplete="off" value={form.nome_contato_emergencia} onChange={updateField} aria-invalid={Boolean(errors.nome_contato_emergencia)} />
            </Field>
            <Field name="numero_emergencia" label="Telefone / WhatsApp" error={errors.numero_emergencia} hint="Informe DDD e número; enviaremos apenas os dígitos.">
              <input className={inputClass} id="numero_emergencia" name="numero_emergencia" type="tel" inputMode="tel" autoComplete="off" placeholder="(00) 00000-0000" value={form.numero_emergencia} onChange={updateField} aria-invalid={Boolean(errors.numero_emergencia)} />
            </Field>
          </div>
        </section>

        <section className="min-w-0 border border-zinc-200 bg-white p-5 sm:p-7">
          <SectionHeading number="04" title="Dados de acesso" description="Use um e-mail que você acompanha e uma senha exclusiva." />
          <div className="grid gap-5">
            <Field name="email" label="E-mail" error={errors.email}>
              <input className={inputClass} id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} />
            </Field>
            <PasswordField id="senha" label="Senha" value={form.senha} onChange={updateField} visible={showPasswords.password} onToggle={() => setShowPasswords((current) => ({ ...current, password: !current.password }))} error={errors.senha} autocomplete="new-password" />
            <ul className="-mt-2 grid list-none gap-1 p-0 text-xs sm:grid-cols-2" aria-label="Requisitos da senha">
              {passwordRules.map((rule) => <li className={`flex items-center gap-2 ${rule.valid ? 'text-emerald-700' : 'text-zinc-500'}`} key={rule.label}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${rule.valid ? 'bg-emerald-100' : 'bg-zinc-100'}`}>{rule.valid ? '✓' : '·'}</span>{rule.label}
              </li>)}
            </ul>
            <PasswordField id="confirmar_senha" label="Confirmar senha" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setErrors((current) => ({ ...current, confirmar_senha: undefined })) }} visible={showPasswords.confirmation} onToggle={() => setShowPasswords((current) => ({ ...current, confirmation: !current.confirmation }))} error={errors.confirmar_senha} autocomplete="new-password" />
          </div>
        </section>

        <div className="lg:col-span-2">
          {globalError && <p className="mb-4 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{globalError}</p>}
          <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <p className="m-0 text-sm text-zinc-600">Já tem cadastro? <Link className="font-bold text-red-700 underline decoration-red-300 underline-offset-4 hover:text-red-800" to="/login">Entrar na conta</Link></p>
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-red-600 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
              {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
              {submitting ? 'Criando sua conta...' : 'Criar conta de atleta'}
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
