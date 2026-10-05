import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function average(arr) {
  if (!arr.length) return 0
  return arr.reduce((sum, n) => sum + n, 0) / arr.length
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #E2DDD8',
  background: '#fff',
  color: '#2C2C2C',
  fontSize: 13,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export default function BurnoutDashboard() {
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [sleepHours, setSleepHours] = useState('')
  const [stressLevel, setStressLevel] = useState('')
  const [tasksCompleted, setTasksCompleted] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [caregiverId, setCaregiverId] = useState(null)

  async function loadCheckins() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary_caregiver', true)
      .single()

    if (!member) { setLoading(false); return }

    setCaregiverId(member.id)

    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('caregiver_id', member.id)
      .order('checkin_date', { ascending: true })

    if (error) console.error(error)
    else setCheckins(data)
    setLoading(false)
  }

  useEffect(() => { loadCheckins() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('checkins').insert({
      caregiver_id: caregiverId,
      checkin_date: new Date().toISOString().slice(0, 10),
      sleep_hours: parseFloat(sleepHours),
      stress_level: parseInt(stressLevel),
      tasks_completed: parseInt(tasksCompleted),
      notes: notes || null,
    })
    if (error) { console.error(error) } else {
      setSleepHours(''); setStressLevel('')
      setTasksCompleted(''); setNotes('')
      await loadCheckins()
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#7A7A72' }}>Loading...</div>
  )

  if (!caregiverId) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#7A7A72' }}>
      No caregiver profile found.
    </div>
  )

  const checkInForm = (
    <div style={{ background: '#fff', border: '1px solid #E2DDD8', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#2C2C2C', margin: '0 0 12px' }}>Log today's check-in</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#7A7A72', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sleep (hrs)</label>
          <input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} required
            style={{ ...inputStyle, width: 80 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#7A7A72', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stress (1-10)</label>
          <input type="number" min="1" max="10" value={stressLevel} onChange={(e) => setStressLevel(e.target.value)} required
            style={{ ...inputStyle, width: 80 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#7A7A72', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tasks done</label>
          <input type="number" min="0" value={tasksCompleted} onChange={(e) => setTasksCompleted(e.target.value)} required
            style={{ ...inputStyle, width: 80 }} />
        </div>
        <div style={{ flex: '1 1 140px', maxWidth: 200, minWidth: 120 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#7A7A72', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            style={inputStyle} />
        </div>
        <button type="submit" disabled={submitting}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#4A7C8E', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
          {submitting ? 'Saving...' : 'Log check-in'}
        </button>
      </form>
    </div>
  )

  if (checkins.length === 0) return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <p style={{ fontSize: 12, color: '#7A7A72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Caregiver wellbeing</p>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2C2C2C', marginBottom: '1.5rem' }}>This week</h1>
      {checkInForm}
      <div style={{ textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: 12, border: '1px solid #E2DDD8' }}>
        <p style={{ color: '#7A7A72', fontSize: 15, margin: 0 }}>No check-ins yet.</p>
        <p style={{ color: '#7A7A72', fontSize: 13, marginTop: 8 }}>Log your first check-in above to start tracking your wellbeing.</p>
      </div>
    </div>
  )

  const last7 = checkins.slice(-7)
  const avgSleep = average(last7.map((c) => c.sleep_hours)).toFixed(1)
  const avgStress = average(last7.map((c) => c.stress_level)).toFixed(1)
  const tasksThisWeek = last7.reduce((sum, c) => sum + (c.tasks_completed || 0), 0)
  const highStressDays = checkins.filter((c) => c.stress_level >= 7).length
  const chartWidth = 600
  const chartHeight = 180
  const padding = 40
  const innerWidth = chartWidth - padding - 20
  const stepX = checkins.length > 1 ? innerWidth / (checkins.length - 1) : innerWidth

  function yFor(value) {
    return 160 - (value / 10) * 130
  }

  const sleepPoints = checkins.map((c, i) => `${padding + i * stepX},${yFor(c.sleep_hours)}`).join(' ')
  const stressPoints = checkins.map((c, i) => `${padding + i * stepX},${yFor(c.stress_level)}`).join(' ')

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <p style={{ fontSize: 12, color: '#7A7A72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Caregiver wellbeing</p>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2C2C2C', marginBottom: '1.5rem' }}>This week</h1>

      {checkInForm}

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Avg sleep', value: avgSleep, unit: 'hrs' },
          { label: 'Avg stress', value: avgStress, unit: '/10' },
          { label: 'Tasks done', value: tasksThisWeek, unit: '' },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E2DDD8', borderRadius: 12, padding: '1rem' }}>
            <p style={{ fontSize: 11, color: '#7A7A72', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 600, margin: 0, color: '#2C2C2C' }}>
              {value}<span style={{ fontSize: 13, color: '#7A7A72', fontWeight: 400 }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#fff', border: '1px solid #E2DDD8', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#2C2C2C', margin: '0 0 1rem' }}>
          Sleep & stress — last {checkins.length} days
        </p>
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <line x1={padding} y1={10} x2={padding} y2={160} stroke="#E2DDD8" strokeWidth="1" />
          <line x1={padding} y1={160} x2={chartWidth - 20} y2={160} stroke="#E2DDD8" strokeWidth="1" />
          <polyline fill="none" stroke="#4A7C8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={sleepPoints} />
          <polyline fill="none" stroke="#C4956A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={stressPoints} />
        </svg>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: '#7A7A72', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 10, height: 3, borderRadius: 2, background: '#4A7C8E' }}></span>Sleep
          </span>
          <span style={{ fontSize: 12, color: '#7A7A72', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 10, height: 3, borderRadius: 2, background: '#C4956A' }}></span>Stress
          </span>
        </div>
      </div>

      {/* Warning banner */}
      {highStressDays >= checkins.length * 0.6 && (
        <div style={{ background: '#F5EDE0', border: '1px solid #E8D5C0', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: 13, color: '#6B4423', margin: 0, lineHeight: 1.6 }}>
            Stress has been at 7 or higher for {highStressDays} of the last {checkins.length} days. Consider reaching out to your support network.
          </p>
        </div>
      )}
    </div>
  )
}