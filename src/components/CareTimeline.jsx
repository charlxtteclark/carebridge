import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const typeStyles = {
  appointment: { bg: '#E6F1FB', text: '#042C53', label: 'Appointment' },
  treatment: { bg: '#E1F5EE', text: '#04342C', label: 'Treatment' },
  lab: { bg: '#EEEDFE', text: '#26215C', label: 'Lab' },
  medication: { bg: '#FAEEDA', text: '#412402', label: 'Medication' },
  hospitalization: { bg: '#FAECE7', text: '#4A1B0C', label: 'Hospitalization' },
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function CareTimeline() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('care_events')
      .select('*, family_members(name)')
      .order('event_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setEvents(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading timeline...</p>

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
      <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>Care timeline</p>
      <h1 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 1.5rem', color: '#1a1a1a' }}>Margaret Clark</h1>

      <div style={{ position: 'relative', paddingLeft: 24 }}>
        <div
          style={{
            position: 'absolute',
            left: 5,
            top: 6,
            bottom: 6,
            width: 1,
            background: '#ddd',
          }}
        />

        {events.map((event) => {
          const style = typeStyles[event.event_type] || typeStyles.appointment
          return (
            <div key={event.id} style={{ position: 'relative', marginBottom: 24 }}>
              <div
                style={{
                  position: 'absolute',
                  left: -24,
                  top: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: style.text,
                }}
              />
              <p style={{ fontSize: 12, color: '#999', margin: '0 0 6px' }}>
                {formatDate(event.event_date)}
              </p>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 12,
                  padding: '1rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: style.bg,
                      color: style.text,
                    }}
                  >
                    {style.label}
                  </span>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    logged by {event.family_members?.name || 'Unknown'}
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px', color: '#1a1a1a' }}>{event.title}</p>
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
                  {event.notes}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}