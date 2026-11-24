import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api/client'

export function EventDetails({ event, eventId, onBack, onAuth }) {
  const [data, setData] = useState(event)
  const [error, setError] = useState('')
  const id = event?.slug || event?.id || eventId

  useEffect(() => {
    if (!id) return
    publicApi.event(id).then(setData).catch((requestError) => setError(requestError.message))
  }, [id])

  if (error) return <main className="public-page"><button className="button button-outline" onClick={onBack}>Voltar</button><div className="api-state" role="alert"><p>{error}</p></div></main>
  if (!data) return <main className="public-page"><p className="loading-state">Carregando evento...</p></main>
  const title = data.name || data.title || 'Evento CronoRacing'
  return <main className="public-page event-details"><button className="button button-outline" onClick={onBack}>← Voltar aos eventos</button><p className="eyebrow">DETALHE DO EVENTO</p><h1>{title}</h1><p className="event-meta">{[data.city, data.state_uf || data.state].filter(Boolean).join(', ')} · {data.event_date ? new Date(data.event_date).toLocaleDateString('pt-BR') : 'data a definir'}</p><div className="event-detail-grid"><section><h2>Escolha seu desafio</h2><div className="option-list">{(data.distances || []).map((distance) => <div className="option-card" key={distance.id}><strong>{distance.name || distance.label}</strong><span>{distance.distance_km ? `${distance.distance_km} km` : ''}</span></div>)}</div></section><aside><h2>Regulamento</h2><p>{data.rules_text || 'O regulamento será disponibilizado pela organização.'}</p>{data.liability_waiver_text && <><h2>Termo de responsabilidade</h2><p>{data.liability_waiver_text}</p></>}<button className="button button-dark button-wide" onClick={() => onAuth('register')}>Inscrever-se</button></aside></div></main>
}
