import { Link } from 'react-router-dom'
import { Logo } from '../../../components/brand/Logo'

export function AuthLayout({ eyebrow, title, description, children, compact = false }) {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Logo href="/" className="!text-zinc-950" secondaryClassName="!text-red-700" />
          <Link className="text-sm font-bold text-zinc-600 transition hover:text-red-700" to="/">Voltar à página inicial</Link>
        </div>
      </header>
      <main className={`mx-auto px-5 py-10 sm:px-8 sm:py-14 ${compact ? 'max-w-2xl' : 'max-w-6xl'}`}>
        <div className={compact ? 'mx-auto mb-8 max-w-lg text-center' : 'mb-9 max-w-3xl'}>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-red-700">{eyebrow}</p>
          <h1 className="!m-0 !font-[family-name:Space_Grotesk] !text-4xl !leading-tight !tracking-normal text-zinc-950 sm:!text-5xl">{title}</h1>
          <p className="mb-0 mt-4 text-sm leading-6 text-zinc-600 sm:text-base">{description}</p>
        </div>
        {children}
      </main>
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-zinc-500 sm:px-8 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} CronoRacing</span>
          <span>Seus dados são usados para gerenciar sua conta e inscrições.</span>
        </div>
      </footer>
    </div>
  )
}

export function PasswordVisibilityIcon({ visible }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {visible ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.6 4.5 9.5 6-.4.7-1.5 2.2-3.2 3.5M6.2 6.2C3.9 7.6 2.7 10 2.5 11c.5.8 3.8 7 9.5 7 1.1 0 2.1-.2 3-.6" /></> : <><path d="M2.5 12s3.2-7 9.5-7 9.5 7 9.5 7-3.2 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="2.5" /></>}
    </svg>
  )
}
