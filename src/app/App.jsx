import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AuthPanel } from '../features/auth/components/AuthPanel'
import { AdminShell } from '../features/admin/AdminShell'
import { EventDetails } from '../features/public/EventDetails'
import { ResultsPage } from '../features/public/ResultsPage'
import { LandingPage } from '../features/landing/LandingPage'
import { Logo } from '../components/brand/Logo'
import { authApi } from '../services/api/client'

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const [storedAuth] = useState(() => {
    const storedSession = window.localStorage.getItem('cronoracing.session')
    const storedUser = window.localStorage.getItem('cronoracing.user')
    if (storedSession && storedUser) {
      try {
        return { session: storedSession, user: JSON.parse(storedUser) }
      } catch {
        window.localStorage.removeItem('cronoracing.session')
        window.localStorage.removeItem('cronoracing.user')
      }
    }
    return { session: null, user: null }
  })
  const [user, setUser] = useState(storedAuth.user)
  const [session, setSession] = useState(storedAuth.session)
  const navigate = useNavigate()
  const location = useLocation()
  const auth = location.pathname === '/login' ? 'login' : location.pathname === '/register' ? 'register' : null

  useEffect(() => {
    if (!session) return
    authApi.me(session).then((data) => setUser(data.user || data)).catch((error) => {
      if (error.status === 401) signOut()
    })
  }, [session])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  function signIn(data) {
    setSession(data.access_token)
    setUser(data.user)
    window.localStorage.setItem('cronoracing.session', data.access_token)
    window.localStorage.setItem('cronoracing.user', JSON.stringify(data.user))
    navigate('/', { replace: true })
  }

  function signOut() {
    setUser(null)
    setSession(null)
    window.localStorage.removeItem('cronoracing.session')
    window.localStorage.removeItem('cronoracing.user')
  }

  function openAuth(mode) {
    navigate(mode === 'login' ? '/login' : '/register')
  }

  return (
    <div id="top" className="app-shell">
      <Routes>
        <Route path="/" element={<LandingPage onAuth={openAuth} onEvent={(event) => navigate(`/eventos/${event.slug || event.id}`, { state: { event } })} />} />
        <Route path="/login" element={<LandingPage onAuth={openAuth} onEvent={(event) => navigate(`/eventos/${event.slug || event.id}`, { state: { event } })} />} />
        <Route path="/register" element={<LandingPage onAuth={openAuth} onEvent={(event) => navigate(`/eventos/${event.slug || event.id}`, { state: { event } })} />} />
        <Route element={<LegacyLayout user={user} onLogout={signOut} />}>
          <Route path="/eventos/:eventId" element={<EventDetailsRoute onAuth={openAuth} />} />
          <Route path="/resultados/:eventId" element={<ResultsRoute />} />
          <Route path="/organizador/*" element={user ? <AdminShell user={user} token={session} onLogout={signOut} /> : <Navigate to="/login" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {auth && <AuthPanel mode={auth} onClose={() => navigate('/')} onSuccess={signIn} onSwitch={() => openAuth(auth === 'login' ? 'register' : 'login')} />}
    </div>
  )
}

function LegacyLayout({ user, onLogout }) {
  return (
    <>
      <header className="site-header">
        <Logo />
        <nav className="desktop-nav">
          <Link to="/#eventos">Corridas</Link>
          <Link to="/#sobre">Como funciona</Link>
          <Link to="/#contato">Contato</Link>
        </nav>
        {user ? (
          <div className="user-chip">
            <span>{user.name?.charAt(0) || 'C'}</span>
            {user.name?.split(' ')[0]}
            <button onClick={onLogout} aria-label="Sair">↗</button>
          </div>
        ) : (
          <div className="header-actions">
            <Link className="text-button" to="/login">Entrar</Link>
            <Link className="button button-dark" to="/register">Criar conta</Link>
          </div>
        )}
      </header>
      <Outlet />
      <footer className="site-footer"><Logo /><span>© {new Date().getFullYear()} CRONORACING</span><span>FEITO PARA QUEM NÃO PARA</span></footer>
    </>
  )
}

function EventDetailsRoute({ onAuth }) {
  const { eventId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  return <EventDetails event={location.state?.event} eventId={eventId} onBack={() => navigate('/')} onAuth={onAuth} />
}

function ResultsRoute() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  return <ResultsPage eventId={eventId} onBack={() => navigate('/')} />
}
