import { useMemo, useState } from 'react'
import { ArrowIcon } from '../../components/icons/ArrowIcon'
import { championshipsApi, racesApi } from '../../services/api/client'

const menu = [
  { id: 'overview', label: 'Visão geral', eyebrow: 'INÍCIO', icon: '◈' },
  { id: 'events', label: 'Meus eventos', eyebrow: 'GESTÃO', icon: '▦' },
  { id: 'registrations', label: 'Inscrições', eyebrow: 'OPERAÇÃO', icon: '◎' },
  { id: 'finance', label: 'Financeiro', eyebrow: 'OPERAÇÃO', icon: '↗' },
  { id: 'results', label: 'Resultados', eyebrow: 'OPERAÇÃO', icon: '⌁' },
]

function Feedback({ message, type = 'success' }) {
  return message ? <p className={`admin-feedback ${type}`} role={type === 'error' ? 'alert' : 'status'}>{message}</p> : null
}

function EmptyPanel({ icon, eyebrow, title, copy, action, onAction }) {
  return (
    <div className="admin-empty-state operation-empty">
      <span className="empty-glyph">{icon}</span>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
      {action && <button className="button button-dark" onClick={onAction}>{action} <ArrowIcon /></button>}
    </div>
  )
}

function Overview({ user, onNavigate }) {
  const firstName = user.name?.split(' ')[0] || 'organizador'
  return (
    <section className="admin-page dashboard-page">
      <div className="admin-page-heading dashboard-heading">
        <div>
          <p className="eyebrow">PAINEL DO ORGANIZADOR · {user.role}</p>
          <h1>Olá, <em>{firstName}.</em></h1>
          <p className="admin-lead">Sua operação de corrida, em um só pulso.</p>
        </div>
        <div className="dashboard-date"><span className="live-dot" /> sistema online <strong>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}</strong></div>
      </div>

      <div className="pulse-strip">
        <div><span className="eyebrow">EVENTOS ATIVOS</span><strong>00</strong><small>nenhuma prova publicada</small></div>
        <div><span className="eyebrow">INSCRIÇÕES</span><strong>—</strong><small>aguardando seu primeiro evento</small></div>
        <div><span className="eyebrow">RECEITA BRUTA</span><strong>R$ 0</strong><small>sem transações registradas</small></div>
        <div className="pulse-cta"><span className="eyebrow">PRÓXIMO PASSO</span><strong>Coloque a prova na rua.</strong><button onClick={() => onNavigate('new-race')}>Criar evento <ArrowIcon /></button></div>
      </div>

      <div className="admin-overview-grid">
        <button className="admin-action-card lime" onClick={() => onNavigate('new-race')}>
          <span className="admin-card-number">01</span>
          <strong>Planejar uma<br /><em>nova corrida.</em></strong>
          <span>Comece pelo básico <ArrowIcon /></span>
        </button>
        <button className="admin-action-card orange" onClick={() => onNavigate('events')}>
          <span className="admin-card-number">02</span>
          <strong>Ver seus<br /><em>eventos.</em></strong>
          <span>Gerencie sua operação <ArrowIcon /></span>
        </button>
        <div className="admin-status-card">
          <p className="eyebrow">CHECKPOINTS</p>
          <strong>Pronto para começar</strong>
          <span><i /> API conectada</span>
          <span><i /> Autenticação ativa</span>
          <span className="status-muted"><i /> Pagamentos aguardando configuração</span>
        </div>
      </div>

      <div className="dashboard-lower-grid">
        <div className="activity-card">
          <div className="card-heading"><div><p className="eyebrow">LINHA DO TEMPO</p><h2>O que acontece <em>agora.</em></h2></div><span className="activity-count">03 etapas</span></div>
          <div className="activity-list">
            <div className="activity-item active"><span className="activity-index">01</span><div><strong>Crie o evento</strong><p>Nome, data, cidade e identidade da prova.</p></div><span className="activity-state">próximo</span></div>
            <div className="activity-item"><span className="activity-index">02</span><div><strong>Configure a largada</strong><p>Modalidades, categorias, kits e estoque.</p></div><span className="activity-state">depois</span></div>
            <div className="activity-item"><span className="activity-index">03</span><div><strong>Abra as inscrições</strong><p>Publique quando tudo estiver validado.</p></div><span className="activity-state">depois</span></div>
          </div>
        </div>
        <div className="manifesto-card">
          <span className="manifesto-mark">02</span>
          <p className="eyebrow">CRONORACING / ORGANIZER OS</p>
          <h2>Menos planilha.<br /><em>Mais pista.</em></h2>
          <p>Uma operação feita para você tomar decisões rápidas quando o relógio começa a correr.</p>
        </div>
      </div>
    </section>
  )
}

function Events({ token, onNavigate }) {
  const [championships, setChampionships] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', season_year: new Date().getFullYear(), scoring_rules: '' })
  const [feedback, setFeedback] = useState({ message: '', type: 'success' })

  async function load() {
    setLoading(true); setError('')
    try {
      const data = await championshipsApi.list(token)
      setChampionships(Array.isArray(data) ? data : data.championships || [])
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  async function create(event) {
    event.preventDefault(); setFeedback({ message: '', type: 'success' })
    try {
      const payload = { name: form.name, season_year: Number(form.season_year) }
      if (form.scoring_rules.trim()) payload.scoring_rules = JSON.parse(form.scoring_rules)
      await championshipsApi.create(token, payload)
      setFeedback({ message: 'Campeonato criado com sucesso.', type: 'success' })
      setForm({ name: '', season_year: new Date().getFullYear(), scoring_rules: '' })
      setShowForm(false); load()
    } catch (requestError) { setFeedback({ message: requestError.message, type: 'error' }) }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading split"><div><p className="eyebrow">GESTÃO DE EVENTOS</p><h1>Seus <em>eventos.</em></h1><p className="admin-lead">Temporadas, provas e tudo que acontece antes da largada.</p></div><div className="admin-heading-actions"><button className="button button-outline" onClick={load}>{loading ? 'Atualizando...' : 'Atualizar'}</button><button className="button button-dark" onClick={() => setShowForm(!showForm)}>+ Novo campeonato</button></div></div>
      <Feedback message={feedback.message} type={feedback.type} />
      {showForm && <form className="admin-form-card" onSubmit={create}><div><p className="eyebrow">NOVA TEMPORADA</p><h2>Defina o <em>ritmo.</em></h2></div><label>Nome do campeonato<input required maxLength="160" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Circuito Paulista" /></label><label>Ano da temporada<input required type="number" min="2000" max="2200" value={form.season_year} onChange={(event) => setForm({ ...form, season_year: event.target.value })} /></label><label>Regras de pontuação <span className="label-hint">opcional · JSON</span><textarea value={form.scoring_rules} onChange={(event) => setForm({ ...form, scoring_rules: event.target.value })} placeholder='{"1": 100, "2": 80}' /></label><div className="form-actions"><button type="button" className="button button-outline" onClick={() => setShowForm(false)}>Cancelar</button><button className="button button-dark">Criar campeonato <ArrowIcon /></button></div></form>}
      {error && <div className="admin-error-state"><Feedback message={error} type="error" /><button className="button button-outline" onClick={load}>Tentar novamente</button></div>}
      {!loading && !error && championships.length === 0 && <EmptyPanel icon="▦" eyebrow="PRIMEIRO MOVIMENTO" title="Nenhum evento ainda." copy="Crie uma temporada para reunir suas provas e começar a configurar a operação." action="Criar primeiro evento" onAction={() => setShowForm(true)} />}
      {championships.length > 0 && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Nome</th><th>Temporada</th><th>Identificador</th><th /></tr></thead><tbody>{championships.map((championship) => <tr key={championship.id}><td><strong>{championship.name}</strong></td><td>{championship.season_year}</td><td><code>{championship.id}</code></td><td><button className="table-link" onClick={() => onNavigate('new-race')}>Configurar <ArrowIcon /></button></td></tr>)}</tbody></table></div>}
    </section>
  )
}

function NewRace({ token, onCreated }) {
  const [form, setForm] = useState({ name: '', event_date: '', city: '', state: '', championship_id: '' })
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })
  async function submit(event) {
    event.preventDefault(); setStatus({ loading: true, error: '', success: '' })
    try {
      const payload = { ...form, championship_id: form.championship_id || null }
      const data = await racesApi.create(token, payload)
      setStatus({ loading: false, error: '', success: 'Corrida criada. Agora você pode configurar modalidades, categorias e kits.' })
      onCreated(data)
    } catch (error) { setStatus({ loading: false, error: error.message, success: '' }) }
  }
  return <section className="admin-page"><div className="admin-page-heading"><p className="eyebrow">OPERAÇÃO · NOVA CORRIDA</p><h1>Coloque a prova<br /><em>na rua.</em></h1><p className="admin-lead">Comece com as informações essenciais do evento.</p></div><Feedback message={status.success} /><Feedback message={status.error} type="error" /><form className="admin-form-card race-form" onSubmit={submit}><div className="form-section-title"><span>01</span><div><h2>Identidade do evento</h2><p>Como os corredores vão encontrar sua prova.</p></div></div><label>Nome da corrida<input required maxLength="160" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Circuito Aurora 10K" /></label><div className="form-two-columns"><label>Data do evento<input required type="date" value={form.event_date} onChange={(event) => setForm({ ...form, event_date: event.target.value })} /></label><label>Estado (UF)<input required minLength="2" maxLength="2" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value.toUpperCase() })} placeholder="SP" /></label></div><label>Cidade<input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="São Paulo" /></label><label>Campeonato <span className="label-hint">opcional · ID</span><input value={form.championship_id} onChange={(event) => setForm({ ...form, championship_id: event.target.value })} placeholder="Cole o identificador quando necessário" /></label><div className="form-actions"><button type="button" className="button button-outline" onClick={() => setForm({ name: '', event_date: '', city: '', state: '', championship_id: '' })}>Limpar</button><button className="button button-dark" disabled={status.loading}>{status.loading ? 'Criando...' : 'Criar corrida'} <ArrowIcon /></button></div></form></section>
}

function Operations({ type, onNavigate }) {
  const content = {
    registrations: { icon: '◎', eyebrow: 'OPERAÇÃO · INSCRIÇÕES', title: 'As pessoas ainda estão chegando.', copy: 'Assim que você publicar uma prova, inscrições, lotes e participantes aparecem aqui em tempo real.', action: 'Criar uma corrida', target: 'new-race' },
    finance: { icon: '↗', eyebrow: 'OPERAÇÃO · FINANCEIRO', title: 'O caixa começa na largada.', copy: 'Pedidos, pagamentos e repasses ficam centralizados nesta visão. A conexão com o gateway será ativada quando as credenciais estiverem prontas.', action: 'Ver eventos', target: 'events' },
    results: { icon: '⌁', eyebrow: 'OPERAÇÃO · RESULTADOS', title: 'O pódio está esperando.', copy: 'Resultados ao vivo, categorias e tempos serão exibidos aqui quando a fonte de cronometragem estiver conectada.', action: 'Configurar evento', target: 'events' },
  }[type]
  return <section className="admin-page"><div className="admin-page-heading"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="admin-lead">Uma visão limpa para decisões rápidas, sem ruído.</p></div><EmptyPanel icon={content.icon} eyebrow="STATUS DA INTEGRAÇÃO" title="Nada para operar ainda." copy={content.copy} action={content.action} onAction={() => onNavigate(content.target)} /></section>
}

export function AdminShell({ user, token, onLogout }) {
  const [active, setActive] = useState('overview')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [createdRace, setCreatedRace] = useState(null)
  const activeItem = useMemo(() => menu.find((item) => item.id === active), [active])
  function navigate(id) { setActive(id); setMobileMenu(false) }
  return <div className="admin-shell"><aside className={`admin-sidebar ${mobileMenu ? 'open' : ''}`}><div className="admin-brand"><span className="logo-mark">CR</span><span>CRONO<span>RACING</span></span></div><p className="sidebar-label">MENU PRINCIPAL</p><nav>{menu.map((item) => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><span>{item.icon}</span>{item.label}{item.id === 'registrations' && <b>0</b>}</button>)}<p className="sidebar-label sidebar-section-label">AÇÃO RÁPIDA</p><button className={active === 'new-race' ? 'active' : ''} onClick={() => navigate('new-race')}><span>+</span>Nova corrida</button></nav><div className="sidebar-bottom"><div className="sidebar-user"><span>{user.name?.charAt(0) || 'C'}</span><div><strong>{user.name}</strong><small>{user.role}</small></div></div><button onClick={onLogout} className="sidebar-logout">Sair da conta ↗</button></div></aside><div className="admin-content"><header className="admin-mobile-header"><button onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menu">☰</button><span>{activeItem?.label || 'CRONORACING'}</span><span className="mobile-live"><i /> online</span></header>{active === 'overview' && <Overview user={user} onNavigate={navigate} />}{active === 'events' && <Events token={token} onNavigate={navigate} />}{active === 'new-race' && <NewRace token={token} onCreated={setCreatedRace} />}{['registrations', 'finance', 'results'].includes(active) && <Operations type={active} onNavigate={navigate} />}{createdRace && <div className="admin-toast">Recurso criado com ID <code>{createdRace.id || createdRace.race?.id || 'disponível na API'}</code></div>}</div></div>
}
