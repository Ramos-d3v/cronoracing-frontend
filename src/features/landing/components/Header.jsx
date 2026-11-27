import { useState } from 'react'
import { Logo } from '../../../components/brand/Logo'
import { LandingIcon } from './LandingIcon'

const links = [
  ['Início', '#inicio'],
  ['Eventos', '#eventos'],
  ['Sobre', '#sobre'],
  ['Contato', '#contato'],
]

export function Header({ onAuth, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const firstName = (user?.nome || user?.name || user?.full_name || '').trim().split(/\s+/)[0]

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Logo className="!text-zinc-950" secondaryClassName="!text-red-700" />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
          {links.map(([label, href]) => <a key={href} className="text-sm font-semibold text-zinc-600 transition hover:text-red-700" href={href}>{label}</a>)}
        </nav>
        {user ? <div className="hidden items-center gap-3 md:flex">
          <span className="max-w-40 truncate text-sm font-bold text-zinc-800">Olá, {firstName}</span>
          <button className="rounded-sm border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-red-600 hover:text-red-700" type="button" onClick={onLogout}>Sair</button>
        </div> : <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-sm border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-900 transition hover:border-red-600 hover:text-red-700" onClick={() => onAuth('login')}>Entrar</button>
          <button className="rounded-sm bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700" onClick={() => onAuth('register')}>Cadastre-se</button>
        </div>}
        <button className="flex h-11 w-11 items-center justify-center rounded-sm border border-zinc-200 text-zinc-900 md:hidden" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <LandingIcon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
        </button>
      </div>
      {menuOpen && <div className="border-t border-zinc-200 bg-white px-5 pb-5 pt-3 md:hidden">
        <nav className="grid gap-1" aria-label="Navegação móvel">
          {links.map(([label, href]) => <a key={href} className="py-3 text-sm font-semibold text-zinc-700" href={href} onClick={closeMenu}>{label}</a>)}
        </nav>
        {user ? <div className="mt-3 flex items-center justify-between gap-4 border-t border-zinc-200 pt-4">
          <span className="text-sm font-bold text-zinc-800">Olá, {firstName}</span>
          <button className="rounded-sm border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-700" type="button" onClick={() => { closeMenu(); onLogout() }}>Sair</button>
        </div> : <div className="mt-3 grid grid-cols-2 gap-3">
          <button className="rounded-sm border border-zinc-300 px-3 py-3 text-sm font-bold text-zinc-900" onClick={() => { closeMenu(); onAuth('login') }}>Entrar</button>
          <button className="rounded-sm bg-red-600 px-3 py-3 text-sm font-bold text-white" onClick={() => { closeMenu(); onAuth('register') }}>Cadastre-se</button>
        </div>}
      </div>}
    </header>
  )
}
