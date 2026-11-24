import { LandingIcon } from './LandingIcon'

const heroImage = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=2200&q=85'

export function HeroSection({ onAuth }) {
  return (
    <section id="inicio" className="relative isolate flex min-h-[580px] scroll-mt-[76px] items-center overflow-hidden bg-zinc-950 sm:min-h-[640px]">
      <img className="absolute inset-0 -z-20 h-full w-full object-cover object-center" src={heroImage} alt="Atletas correndo juntos em uma prova de rua" fetchPriority="high" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-3xl">
          <p className="mb-7 inline-flex items-center gap-2 border border-white/25 bg-black/25 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Cronometragem oficial & gestão de provas
          </p>
          <h1 className="!m-0 !max-w-3xl !font-[family-name:Space_Grotesk] !text-5xl !leading-[1.02] !tracking-normal text-white sm:!text-6xl lg:!text-7xl">
            Sua próxima linha de chegada <span className="text-red-500">começa aqui.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            Inscreva-se em provas, acompanhe cada resultado e deixe a CronoRacing cuidar da precisão, do primeiro passo ao tempo oficial.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a className="inline-flex min-h-12 items-center gap-3 rounded-sm bg-red-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-red-700" href="#eventos">
              Ver próximos eventos <LandingIcon name="arrow" className="h-4 w-4" />
            </a>
            <button className="inline-flex min-h-12 items-center gap-3 rounded-sm border border-white/60 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-zinc-950" onClick={() => onAuth('register')}>
              Criar minha conta
            </button>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/25 pt-5 text-xs font-semibold uppercase tracking-[0.12em] text-white/75 sm:mt-20">
          <span className="inline-flex items-center gap-2"><LandingIcon name="timer" className="h-4 w-4 text-red-400" /> Tempo oficial</span>
          <span className="inline-flex items-center gap-2"><LandingIcon name="ticket" className="h-4 w-4 text-red-400" /> Inscrição simplificada</span>
          <span className="inline-flex items-center gap-2"><LandingIcon name="chart" className="h-4 w-4 text-red-400" /> Resultados online</span>
        </div>
      </div>
    </section>
  )
}
