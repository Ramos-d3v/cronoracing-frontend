import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api/client'
import { upcomingRaces } from './data'
import { AboutSection } from './components/AboutSection'
import { EventsGrid } from './components/EventsGrid'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'

export function LandingPage({ onAuth, onEvent }) {
  const [events, setEvents] = useState(upcomingRaces)
  const [requestNumber, setRequestNumber] = useState(0)
  const [status, setStatus] = useState({ loading: true, error: '' })

  useEffect(() => {
    let active = true
    publicApi.showcase().then((data) => {
      if (active) {
        const apiEvents = data?.upcoming_events || []
        setEvents(apiEvents.length ? apiEvents : upcomingRaces)
        setStatus({ loading: false, error: apiEvents.length ? '' : 'Exibindo eventos de demonstração enquanto não há eventos ao vivo disponíveis.' })
      }
    }).catch(() => {
      if (active) {
        setEvents(upcomingRaces)
        setStatus({ loading: false, error: 'Exibindo eventos de demonstração enquanto a vitrine ao vivo está indisponível.' })
      }
    })
    return () => { active = false }
  }, [requestNumber])

  function retry() {
    setStatus({ loading: true, error: '' })
    setRequestNumber((number) => number + 1)
  }

  return (
    <>
      <Header onAuth={onAuth} />
      <main>
        <HeroSection onAuth={onAuth} />
        <EventsGrid events={events} loading={status.loading} error={status.error} onRetry={retry} onEvent={onEvent} />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}
