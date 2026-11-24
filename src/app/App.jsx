import { useEffect, useState } from 'react'
import { AuthPanel } from '../features/auth/components/AuthPanel'
import { AdminShell } from '../features/admin/AdminShell'
import { EventDetails } from '../features/public/EventDetails'
import { ResultsPage } from '../features/public/ResultsPage'
import { LandingPage } from '../features/landing/LandingPage'
import { Logo } from '../components/brand/Logo'
import { authApi } from '../services/api/client'

export function App() {
  const [auth, setAuth] = useState(null)
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
  const [route, setRoute] = useState(() => window.location.pathname)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    if (!session) return
    authApi.me(session).then((data) => setUser(data.user || data)).catch((error) => {
      if (error.status === 401) signOut()
    })
  }, [session])

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(path, event = null) {
    window.history.pushState({}, '', path)
    setRoute(path)
    if (event) setSelectedEvent(event)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function signIn(data) {
    setSession(data.access_token)
    setUser(data.user)
    window.localStorage.setItem('cronoracing.session', data.access_token)
    window.localStorage.setItem('cronoracing.user', JSON.stringify(data.user))
    setAuth(null)
    navigate('/')
  }

  function signOut() {
    setUser(null)
    setSession(null)
    window.localStorage.removeItem('cronoracing.session')
    window.localStorage.removeItem('cronoracing.user')
  }

  return (
    <div id="top" className="app-shell">
      <header className="site-header">
        <Logo />
        <nav className="desktop-nav">
          <a href="#race-list">Corridas</a>
          <a href="#how-it-works">Como funciona</a>
          <a href="#organizer">Para organizadores</a>
        </nav>
        {user ? (
          <div className="user-chip">
            <span>{user.name?.charAt(0) || 'C'}</span>
            {user.name?.split(' ')[0]}
            <button onClick={signOut} aria-label="Sair">↗</button>
          </div>
        ) : (
          <div className="header-actions">
            <button className="text-button" onClick={() => setAuth('login')}>Entrar</button>
            <button className="button button-dark" onClick={() => setAuth('register')}>Criar conta</button>
          </div>
        )}
      </header>

      {user && route.startsWith('/organizador') ? <AdminShell user={user} token={session} onLogout={signOut} /> : route.startsWith('/resultados/') ? <ResultsPage eventId={route.split('/')[2]} onBack={() => navigate('/')} /> : route.startsWith('/eventos/') ? <EventDetails event={selectedEvent} eventId={route.split('/')[2]} onBack={() => navigate('/')} onAuth={setAuth} /> : <LandingPage onAuth={setAuth} onEvent={(event) => navigate(`/eventos/${event.slug || event.id}`, event)} />}
      <footer className="site-footer"><Logo /><span>© 2026 CRONORACING</span><span>FEITO PARA QUEM NÃO PARA</span></footer>
      {auth && <AuthPanel mode={auth} onClose={() => setAuth(null)} onSuccess={signIn} onSwitch={() => setAuth(auth === 'login' ? 'register' : 'login')} />}
    </div>
  )
}
