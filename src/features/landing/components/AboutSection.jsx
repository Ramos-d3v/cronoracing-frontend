import { LandingIcon } from './LandingIcon'

const pillars = [
  {
    number: '01',
    icon: 'timer',
    title: 'Cronometragem de precisão',
    description: 'Tecnologia de cronometragem eletrônica para registrar cada passagem com confiança e precisão.',
  },
  {
    number: '02',
    icon: 'ticket',
    title: 'Inscrição sem complicação',
    description: 'Uma jornada direta para escolher a prova, garantir sua vaga e acompanhar os detalhes.',
  },
  {
    number: '03',
    icon: 'chart',
    title: 'Resultados que acompanham você',
    description: 'Consulte classificações online e tenha suas conquistas reunidas após cruzar a linha.',
  },
]

export function AboutSection() {
  return (
    <section id="sobre" className="scroll-mt-24 bg-zinc-100 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-red-700">Feita para quem corre</p>
          <h2 className="!m-0 !font-[family-name:Space_Grotesk] !text-4xl !leading-tight !tracking-normal text-zinc-950 sm:!text-5xl">Tecnologia a favor de cada <span className="text-red-700">conquista.</span></h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">Do planejamento da prova à consulta do resultado, conectamos atletas e organizadores em uma experiência mais simples.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {pillars.map((pillar) => <article className="border-t-2 border-red-600 pt-6" key={pillar.number}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-widest text-red-700">{pillar.number}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-white text-red-700"><LandingIcon name={pillar.icon} className="h-5 w-5" /></span>
            </div>
            <h3 className="!mb-0 !mt-7 !font-[family-name:Space_Grotesk] !text-2xl !leading-tight !tracking-normal text-zinc-950">{pillar.title}</h3>
            <p className="mb-0 mt-3 max-w-sm text-sm leading-6 text-zinc-600">{pillar.description}</p>
          </article>)}
        </div>
      </div>
    </section>
  )
}
