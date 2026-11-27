import { useState } from 'react'
import { EventCard } from './EventCard'
import { LandingIcon } from './LandingIcon'

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'open', label: 'Inscrições abertas' },
  { id: 'upcoming', label: 'Em breve' },
  { id: 'closed', label: 'Encerrados' },
]

function getEventStatus(event) {
  const rawStatus = String(event.registration_status || event.registrationStatus || event.inscription_status || event.status || '').toLowerCase()
  if (/closed|ended|encerr|cancel/.test(rawStatus)) return 'closed'
  if (/upcoming|soon|em breve|scheduled/.test(rawStatus)) return 'upcoming'

  const now = new Date()
  if (event.registration_end && new Date(event.registration_end) < now) return 'closed'
  if (event.registration_start && new Date(event.registration_start) > now) return 'upcoming'
  return 'open'
}

export function EventsGrid({ events, loading, error, onRetry, onEvent }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const visibleEvents = events.filter((event) => {
    const title = event.name || event.title || ''
    const location = [event.city, event.state_uf || event.state, event.location_address].filter(Boolean).join(' ')
    const matchesSearch = `${title} ${location}`.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR'))
    return matchesSearch && (activeFilter === 'all' || getEventStatus(event) === activeFilter)
  })

  return (
    <section id="eventos" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-red-700">Encontre sua próxima largada</p>
            <h2 className="!m-0 !font-[family-name:Space_Grotesk] !text-4xl !leading-tight !tracking-normal text-zinc-950 sm:!text-5xl">Próximos <span className="text-red-700">eventos.</span></h2>
            <p className="mb-0 mt-4 text-sm leading-6 text-zinc-600 sm:text-base">Novos percursos, novas metas e uma linha de chegada esperando por você.</p>
          </div>
          <label className="flex min-h-12 w-full items-center gap-3 border border-zinc-300 px-4 focus-within:border-red-600 lg:max-w-sm">
            <LandingIcon name="search" className="h-5 w-5 shrink-0 text-zinc-500" />
            <input className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-500" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por prova ou cidade" aria-label="Buscar por prova ou cidade" />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar eventos por status">
          {filters.map((filter) => <button className={`min-h-10 rounded-sm border px-4 py-2 text-xs font-bold transition ${activeFilter === filter.id ? 'border-red-600 bg-red-600 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:border-red-600 hover:text-red-700'}`} key={filter.id} type="button" aria-pressed={activeFilter === filter.id} onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}
          {loading && <span className="ml-auto text-xs font-semibold text-zinc-500" role="status">Atualizando eventos...</span>}
        </div>

        {error && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          <span>{error}</span>
          <button className="font-bold underline decoration-amber-700 underline-offset-2" type="button" onClick={onRetry}>Tentar novamente</button>
        </div>}

        {visibleEvents.length ? <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visibleEvents.map((event, index) => <EventCard key={event.id || event.slug || `${event.name || event.title}-${index}`} event={event} status={getEventStatus(event)} onEvent={onEvent} />)}
        </div> : <div className="mt-8 border border-dashed border-zinc-300 px-6 py-14 text-center">
          <p className="mb-2 text-lg font-bold text-zinc-900">Nenhum evento encontrado</p>
          <p className="mb-0 text-sm text-zinc-600">Tente outro termo ou escolha um status diferente.</p>
        </div>}
      </div>
    </section>
  )
}
