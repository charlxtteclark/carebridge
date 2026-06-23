import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function average(arr) {
  if (!arr.length) return 0
  return arr.reduce((sum, n) => sum + n, 0) / arr.length
}

export default function BurnoutDashboard() {
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [sleepHours, setSleepHours] = useState('')
  const [stressLevel, setStressLevel] = useState('')
  const [tasksCompleted, setTasksCompleted] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadCheckins() {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .order('checkin_date', { ascending: true })
    if (error) console.error(error)
    else setCheckins(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCheckins()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('checkins').insert({
      caregiver_id: '22222222-2222-2222-2222-222222222222',
      checkin_date: new Date().toISOString().slice(0, 10),
      sleep_hours: parseFloat(sleepHours),
      stress_level: parseInt(stressLevel),
      tasks_completed: parseInt(tasksCompleted),
      notes: notes || null,
    })
    if (error) {
      console.error(error)
    } else {
      setSleepHours('')
      setStressLevel('')
      setTasksCompleted('')
      setNotes('')
      await loadCheckins()
    }
    setSubmitting(false)
  }

  if (loading) return <p>Loading dashboard...</p>
  if (checkins.length === 0) return <p>No check-ins yet.</p>

  const last7 = checkins.slice(-7)
  const avgSleep = average(last7.map((c) => c.sleep_hours)).toFixed(1)
  const avgStress = average(last7.map((c) => c.stress_level)).toFixed(1)
  const tasksThisWeek = last7.reduce((sum, c) => sum + (c.tasks_completed || 0), 0)
  const highStressDays = checkins.filter((c) => c.stress_level >= 7).length
  const chartWidth = 600
  const chartHeight = 200
  const padding = 40
  const innerWidth = chartWidth - padding - 20
  const stepX = innerWidth / (checkins.length - 1)

  function yFor(value) {
    return 170 - (value / 10) * 150
  }

  const sleepPoints = checkins
    .map((c, i) => `${padding + i * stepX},${yFor(c.sleep_hours)}`)
    .join(' ')
  const stressPoints = checkins
    .map((c, i) => `${padding + i * stepX},${yFor(c.stress_level)}`)
    .join(' ')

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
      <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>Caregiver wellbeing</p>
      <h1 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 1.5rem', color: '#1a1a1a' }}>
        This week
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
            Sleep (hrs)
          </label>
          <input
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            required
            style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
            Stress (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(e.target.value)}
            required
            style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
            Tasks done
          </label>
          <input
            type="number"
            min="0"
            value={tasksCompleted}
            onChange={(e) => setTasksCompleted(e.target.value)}
            required
            style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: '1 1 140px', maxWidth: 240, minWidth: 120 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {submitting ? 'Saving...' : 'Log check-in'}
        </button>
      </form>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
          gap: 12,
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem' }}>
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>Avg sleep</p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
            {avgSleep}
            <span style={{ fontSize: 14, color: '#999' }}> hrs</span>
          </p>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem' }}>
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>Avg stress</p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
            {avgStress}
            <span style={{ fontSize: 14, color: '#999' }}> /10</span>
          </p>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem' }}>
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>Tasks done</p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
            {tasksThisWeek}
          </p>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 1rem', color: '#1a1a1a' }}>
          Sleep and stress, last {checkins.length} days
        </p>
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <line x1={padding} y1={20} x2={padding} y2={170} stroke="#ddd" strokeWidth="1" />
          <line x1={padding} y1={170} x2={chartWidth - 20} y2={170} stroke="#ddd" strokeWidth="1" />
          <polyline fill="none" stroke="#378ADD" strokeWidth="2" points={sleepPoints} />
          <polyline fill="none" stroke="#D85A30" strokeWidth="2" points={stressPoints} />
        </svg>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: '#666' }}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#378ADD',
                marginRight: 6,
              }}
            ></span>
            Sleep
          </span>
          <span style={{ fontSize: 12, color: '#666' }}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#D85A30',
                marginRight: 6,
              }}
            ></span>
            Stress
          </span>
        </div>
      </div>

      {highStressDays >= checkins.length * 0.6 && (
        <div
          style={{
            background: '#FAEEDA',
            borderRadius: 12,
            padding: '1rem 1.25rem',
          }}
        >
          <p style={{ fontSize: 13, color: '#633806', margin: 0 }}>
            Stress has been at 7 or higher for {highStressDays} of the last {checkins.length} days.
            Consider reaching out to your support network.
          </p>
        </div>
      )}
    </div>
  )
}