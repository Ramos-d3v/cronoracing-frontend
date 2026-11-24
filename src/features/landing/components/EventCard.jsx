import { LandingIcon } from './LandingIcon'

const statusStyles = {
  open: { label: 'Inscrições abertas', className: 'bg-emerald-100 text-emerald-800' },
  upcoming: { label: 'Em breve', className: 'bg-amber-100 text-amber-900' },
  closed: { label: 'Encerrado', className: 'bg-zinc-200 text-zinc-700' },
}

function formatDate(value) {
  if (!value) return 'Data a definir'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data a definir'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

function getDistanceLabels(distances = []) {
  return distances.map((distance) => {
    if (typeof distance === 'string') return distance
    if (distance.name || distance.label) return distance.name || distance.label
    return distance.distance_km ? `${distance.distance_km} km` : null
  }).filter(Boolean)
}

export function EventCard({ event, onEvent, status = 'open' }) {
  const title = event.name || event.title || 'Evento CronoRacing'
  const city = [event.city, event.state_uf || event.state].filter(Boolean).join(', ') || 'Local a definir'
  const location = event.location_address || event.start_location || city
  const distances = getDistanceLabels(event.distances || event.modalities || [])
  const badge = statusStyles[status] || statusStyles.open
  const image = event.banner_url || event.image_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1100&q=80'

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-zinc-200">
        <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={image} alt={`Banner do evento ${title}`} loading="lazy" />
        <span className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs font-extrabold ${badge.className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> {badge.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="grid gap-2 text-xs font-semibold text-zinc-600">
          <span className="inline-flex items-center gap-2"><LandingIcon name="calendar" className="h-4 w-4 shrink-0 text-red-600" /> {formatDate(event.event_date || event.date)}</span>
          <span className="inline-flex items-center gap-2"><LandingIcon name="mapPin" className="h-4 w-4 shrink-0 text-red-600" /> <span className="truncate">{location}</span></span>
        </div>
        <h3 className="!mb-0 !mt-4 !font-[family-name:Space_Grotesk] !text-2xl !leading-tight !tracking-normal text-zinc-950">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{city}</p>
        <div className="mt-4 flex min-h-7 flex-wrap gap-2">
          {distances.length ? distances.map((distance) => <span className="rounded-sm bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700" key={`${event.id || title}-${distance}`}>{distance}</span>) : <span className="text-xs font-medium text-zinc-500">Modalidades em breve</span>}
        </div>
        <button className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700" onClick={() => onEvent(event)}>
          Detalhes e inscrição <LandingIcon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
