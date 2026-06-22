import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function average(arr) {
  if (!arr.length) return 0
  return arr.reduce((sum, n) => sum + n, 0) / arr.length
}

export default function BurnoutDashboard() {
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)

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