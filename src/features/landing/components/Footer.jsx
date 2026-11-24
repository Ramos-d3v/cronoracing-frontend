import { Logo } from '../../../components/brand/Logo'
import { LandingIcon } from './LandingIcon'

const quickLinks = [
  ['Eventos', '#eventos'],
  ['Sobre a CronoRacing', '#sobre'],
  ['Contato', '#contato'],
]

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram' },
  { label: 'Facebook', href: 'https://www.facebook.com/', icon: 'facebook' },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: 'youtube' },
]

export function Footer() {
  return (
    <footer id="contato" className="scroll-mt-20 bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1.2fr_0.8fr] lg:gap-8">
        <div className="max-w-xs">
          <Logo className="!text-white" imageClassName="h-16 w-16" secondaryClassName="!text-white/70" />
          <p className="mb-0 mt-5 text-sm leading-6 text-white/65">Tecnologia e precisão para eventos que colocam todo mundo em movimento.</p>
        </div>
        <div>
          <h2 className="!m-0 !font-sans !text-xs !font-extrabold !leading-5 !tracking-[0.14em] !text-white">NAVEGAÇÃO</h2>
          <ul className="mb-0 mt-5 grid list-none gap-3 p-0">
            {quickLinks.map(([label, href]) => <li key={href}><a className="text-sm text-white/65 transition hover:text-white" href={href}>{label}</a></li>)}
            <li><a className="text-sm text-white/65 transition hover:text-white" href="#contato">Termos de uso</a></li>
            <li><a className="text-sm text-white/65 transition hover:text-white" href="#contato">Política de privacidade</a></li>
          </ul>
        </div>
        <div>
          <h2 className="!m-0 !font-sans !text-xs !font-extrabold !leading-5 !tracking-[0.14em] !text-white">FALE COM A GENTE</h2>
          <ul className="mb-0 mt-5 grid list-none gap-3 p-0 text-sm text-white/65">
            <li><a className="inline-flex items-center gap-2 transition hover:text-white" href="mailto:contato@cronoracing.com.br"><LandingIcon name="mail" className="h-4 w-4 text-red-500" /> contato@cronoracing.com.br</a></li>
            <li><a className="inline-flex items-center gap-2 transition hover:text-white" href="https://wa.me/?text=Olá%2C%20CronoRacing" target="_blank" rel="noreferrer"><LandingIcon name="phone" className="h-4 w-4 text-red-500" /> Atendimento via WhatsApp</a></li>
            <li className="inline-flex items-center gap-2"><LandingIcon name="clock" className="h-4 w-4 text-red-500" /> Dias úteis, das 9h às 18h</li>
          </ul>
        </div>
        <div>
          <h2 className="!m-0 !font-sans !text-xs !font-extrabold !leading-5 !tracking-[0.14em] !text-white">ACOMPANHE</h2>
          <div className="mt-5 flex gap-3">
            {socialLinks.map((social) => <a className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/20 text-white/75 transition hover:border-red-500 hover:bg-red-600 hover:text-white" href={social.href} key={social.label} aria-label={social.label} target="_blank" rel="noreferrer"><LandingIcon name={social.icon} className="h-4 w-4" /></a>)}
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/50 sm:px-8 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} CronoRacing. Todos os direitos reservados.</span>
          <span>Feito para quem não para.</span>
        </div>
      </div>
    </footer>
  )
}
