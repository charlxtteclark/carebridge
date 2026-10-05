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
    // Check if user has a patient with a real name (not 'New Patient')
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

  if (loading) return <p>Loading...</p>
  if (!session) return <Login />
  if (needsOnboarding) return <Onboarding onComplete={() => setNeedsOnboarding(false)} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '1.5rem 0 0' }}>
        <button
          onClick={() => setActiveTab('timeline')}
          style={{ fontSize: 14, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e5e5', background: activeTab === 'timeline' ? '#1a1a1a' : '#fff', color: activeTab === 'timeline' ? '#fff' : '#1a1a1a', cursor: 'pointer' }}
        >
          Care timeline
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{ fontSize: 14, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e5e5', background: activeTab === 'dashboard' ? '#1a1a1a' : '#fff', color: activeTab === 'dashboard' ? '#fff' : '#1a1a1a', cursor: 'pointer' }}
        >
          Wellbeing
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ fontSize: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', color: '#666', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>
      {activeTab === 'timeline' ? <CareTimeline /> : <BurnoutDashboard />}
    </div>
  )
}

export default App