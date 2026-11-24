import { useCallback, useEffect, useMemo, useState } from 'react'
import { publicApi } from '../../services/api/client'

export function ResultsPage({ eventId, onBack }) {
  const [data, setData] = useState({ records: [], available_category_buttons: [] })
  const [category, setCategory] = useState('ALL_RANKING_GENERAL')
  const [status, setStatus] = useState({ loading: true, error: '' })
  const load = useCallback(() => {
    setStatus({ loading: true, error: '' })
    publicApi.results(eventId, { category }).then((result) => { setData(result || {}); setStatus({ loading: false, error: '' }) }).catch((error) => setStatus({ loading: false, error: error.message }))
  }, [eventId, category])
  useEffect(() => {
    const request = setTimeout(load, 0)
    return () => clearTimeout(request)
  }, [load])
  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) load() }, 30000)
    return () => clearInterval(timer)
  }, [load])
  const records = useMemo(() => [...(data.records || data.results || [])].filter((record) => category === 'CATEGORY_GENERAL' ? record.rank_category === null : true).sort((a, b) => {
    const left = category === 'ALL_RANKING_GENERAL' || category === 'CATEGORY_GENERAL' ? a.rank_general : a.rank_category
    const right = category === 'ALL_RANKING_GENERAL' || category === 'CATEGORY_GENERAL' ? b.rank_general : b.rank_category
    return (left ?? Number.MAX_SAFE_INTEGER) - (right ?? Number.MAX_SAFE_INTEGER)
  }), [data, category])
  return <main className="public-page results-page"><button className="button button-outline" onClick={onBack}>← Voltar</button><p className="eyebrow">RESULTADOS AO VIVO</p><h1>Quem cruzou a <em>linha.</em></h1><div className="category-buttons" role="group" aria-label="Categorias">{(data.available_category_buttons || []).map((item) => { const value = item.code || item.value || item; return <button key={value} className={category === value ? 'active' : ''} onClick={() => setCategory(value)}>{item.label || item.name || value}</button> })}</div>{status.error && <p className="api-state" role="alert">{status.error}</p>}{status.loading ? <p className="loading-state">Atualizando resultados...</p> : <table className="results-table"><thead><tr><th>Posição</th><th>Atleta</th><th>Categoria</th><th>Tempo</th></tr></thead><tbody>{records.map((record, index) => <tr key={record.id || `${record.name}-${index}`}><td>{category === 'ALL_RANKING_GENERAL' || category === 'CATEGORY_GENERAL' ? record.rank_general ?? '—' : record.rank_category ?? '—'}</td><td>{record.name || record.participant_name || '—'}</td><td>{record.category_name || '—'}</td><td>{record.finish_time || record.time || '—'}</td></tr>)}</tbody></table>}<p className="last-updated">Última atualização: {data.last_updated_at ? new Date(data.last_updated_at).toLocaleString('pt-BR') : 'indisponível'}</p></main>
}
