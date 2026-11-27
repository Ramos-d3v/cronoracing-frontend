import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AdminShell } from '../features/admin/AdminShell'
import { EventDetails } from '../features/public/EventDetails'
import { ResultsPage } from '../features/public/ResultsPage'
import { LandingPage } from '../features/landing/LandingPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
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

  useEffect(() => {
    if (!session) return
    let active = true
    authApi.getCurrentUser(session)
      .then((data) => active && setUser(data.user || data))
      .catch((error) => { if (active && error.status === 401) signOut() })
    return () => { active = false }
  }, [session])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  function signIn(data) {
    const token = data.token || data.access_token
    setSession(token)
    setUser(data.user)
    window.localStorage.setItem('cronoracing.session', token)
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
        <Route path="/" element={<LandingPage user={user} onLogout={signOut} onAuth={openAuth} onEvent={(event) => navigate(`/eventos/${event.slug || event.id}`, { state: { event } })} />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onSuccess={signIn} />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage onSuccess={signIn} />} />
        <Route element={<LegacyLayout user={user} onLogout={signOut} />}>
          <Route path="/eventos/:eventId" element={<EventDetailsRoute onAuth={openAuth} />} />
          <Route path="/resultados/:eventId" element={<ResultsRoute />} />
          <Route path="/organizador/*" element={user ? <AdminShell user={user} token={session} onLogout={signOut} /> : <Navigate to="/login" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
