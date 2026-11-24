import { useEffect, useState } from 'react'
import { ArrowIcon } from '../../components/icons/ArrowIcon'
import { publicApi } from '../../services/api/client'

export function LandingPage({ onAuth, onEvent }) {
  const [showcase, setShowcase] = useState({ featured_events: [], upcoming_events: [] })
  const [filters, setFilters] = useState({ city: '', state_uf: '', search: '' })
  const [status, setStatus] = useState({ loading: true, error: '' })

  useEffect(() => {
    let active = true
    publicApi.showcase(filters).then((data) => {
      if (active) {
        setShowcase({ featured_events: data?.featured_events || [], upcoming_events: data?.upcoming_events || [] })
        setStatus({ loading: false, error: '' })
      }
    }).catch((error) => active && setStatus({ loading: false, error: error.message }))
    return () => { active = false }
  }, [filters])

  const races = showcase.upcoming_events
  const featured = showcase.featured_events[0]
  const title = (race) => race.name || race.title || 'Evento CronoRacing'
  const location = (race) => [race.city, race.state_uf || race.state].filter(Boolean).join(', ')

  return (
    <main>
      <section className="hero-section"><div className="hero-copy"><p className="eyebrow reveal">A CIDADE É SUA PISTA</p><h1 className="reveal delay-1">Corra no seu<br /><em>tempo.</em></h1><p className="hero-description reveal delay-2">Encontre a sua próxima linha de chegada. Inscreva-se em provas que fazem seu coração acelerar.</p><div className="hero-actions reveal delay-3"><a className="button button-dark" href="#race-list">Encontrar uma corrida <ArrowIcon /></a><button className="button button-outline" onClick={() => onAuth('register')}>Quero organizar</button></div></div><div className="hero-visual"><div className="route-line"></div><div className="hero-stamp">RUN<br /><span>YOUR</span><br />WAY</div><div className="runner-card"><span className="runner-kicker">PRÓXIMA LARGADA</span><strong>{featured?.event_date ? new Date(featured.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'}</strong><span>{featured ? title(featured) : 'próxima prova'}</span></div><div className="location-pin">◎<span>{featured ? location(featured) : 'CRONORACING'}</span></div></div></section>
      <section className="ticker"><span>CRONORACING</span><span>●</span><span>MOVE WITH PURPOSE</span><span>●</span><span>CRONORACING</span><span>●</span><span>MOVE WITH PURPOSE</span></section>
      <section className="race-section" id="race-list"><div className="section-heading"><div><p className="eyebrow">ESCOLHA SEU DESAFIO</p><h2>Próximas <em>corridas.</em></h2></div><div className="event-filters"><input aria-label="Buscar corrida" placeholder="Buscar" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /><input aria-label="Filtrar por cidade" placeholder="Cidade" value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })} /><input aria-label="Filtrar por estado" placeholder="UF" maxLength="2" value={filters.state_uf} onChange={(event) => setFilters({ ...filters, state_uf: event.target.value.toUpperCase() })} /></div></div>{status.loading && <p className="loading-state" role="status">Carregando eventos...</p>}{status.error && <div className="api-state" role="alert"><p>{status.error}</p><button className="button button-outline" onClick={() => setFilters({ ...filters })}>Tentar novamente</button></div>}{!status.loading && !status.error && races.length === 0 && <p className="empty-state">Nenhum evento encontrado para esses filtros.</p>}<div className="race-grid">{races.map((race, index) => <article className={`race-card ${['lime', 'orange', 'blue'][index % 3]}`} key={race.id || race.slug || title(race)}><div className="race-date">{race.event_date ? new Date(race.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase() : 'DATA A DEFINIR'}</div><div className="race-card-body"><p>{location(race)}</p><h3>{title(race)}</h3><span>{race.distances?.map((distance) => distance.name || distance.label || distance.distance_km).filter(Boolean).join(' · ') || 'Confira as modalidades'}</span><button onClick={() => onEvent(race)} aria-label={`Ver ${title(race)}`}><ArrowIcon /></button></div></article>)}</div></section>
      <section className="manifesto-section" id="how-it-works"><div className="manifesto-number">02</div><div><p className="eyebrow">MENOS DESCULPAS. MAIS PASSOS.</p><h2>Não é sobre<br /><em>chegar primeiro.</em></h2></div><p className="manifesto-copy">É sobre cruzar a linha que você desenhou para si. A CronoRacing conecta pessoas, cidades e histórias em movimento.</p></section>
      <section className="organizer-section" id="organizer"><div><p className="eyebrow">PARA QUEM FAZ ACONTECER</p><h2>Sua prova.<br /><em>Seu legado.</em></h2><p>Da primeira inscrição ao último cronômetro: organize experiências que as pessoas vão lembrar.</p><button className="button button-light" onClick={() => onAuth('register')}>Começar como organizador <ArrowIcon /></button></div><div className="organizer-mark">RUN<br /><span>THE</span><br />CITY</div></section>
    </main>
  )
}
