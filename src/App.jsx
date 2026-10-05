import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Onboarding from './components/Onboarding'
import CareTimeline from './components/CareTimeline'
import BurnoutDashboard from './components/BurnoutDashboard'

function App() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('timeline')
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) checkOnboarding(data.session.user.id)
      else setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) checkOnboarding(session.user.id)
      else setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function checkOnboarding(userId) {
    const { data: member } = await supabase
      .from('family_members')
      .select('patient_id')
      .eq('user_id', userId)
      .eq('is_primary_caregiver', true)
      .single()

    if (!member) {
      setNeedsOnboarding(false)
      setLoading(false)
      return
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('name')
      .eq('id', member.patient_id)
      .single()

    setNeedsOnboarding(!patient || patient.name === 'New Patient')
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p style={{ color: '#7A7A72', fontSize: 14 }}>Loading...</p>
    </div>
  )

  if (!session) return <Login />
  if (needsOnboarding) return <Onboarding onComplete={() => setNeedsOnboarding(false)} />

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2DDD8', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#4A7C8E', letterSpacing: '-0.3px' }}>CareBridge</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setActiveTab('timeline')}
              style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: 'none', background: activeTab === 'timeline' ? '#E8F0F3' : 'transparent', color: activeTab === 'timeline' ? '#4A7C8E' : '#7A7A72', cursor: 'pointer' }}
            >
              Care timeline
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: 'none', background: activeTab === 'dashboard' ? '#E8F0F3' : 'transparent', color: activeTab === 'dashboard' ? '#4A7C8E' : '#7A7A72', cursor: 'pointer' }}
            >
              Wellbeing
            </button>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2DDD8', background: 'transparent', color: '#7A7A72', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem 1rem' }}>
        {activeTab === 'timeline' ? <CareTimeline /> : <BurnoutDashboard />}
      </div>
    </div>
  )
}

export default App