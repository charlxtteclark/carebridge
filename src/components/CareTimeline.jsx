import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const typeStyles = {
  appointment: { bg: '#E8F0F3', text: '#2A5F6F', label: 'Appointment' },
  treatment: { bg: '#E8F3EE', text: '#2A5C3F', label: 'Treatment' },
  lab: { bg: '#EEEDFE', text: '#26215C', label: 'Lab' },
  medication: { bg: '#F5EDE0', text: '#6B4423', label: 'Medication' },
  hospitalization: { bg: '#FAECE7', text: '#4A1B0C', label: 'Hospitalization' },
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
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

export default function CareTimeline() {
  const [events, setEvents] = useState([])
  const [patient, setPatient] = useState(null)
  const [caregiverId, setCaregiverId] = useState(null)
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [eventType, setEventType] = useState('appointment')
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('family_members')
      .select('id, patient_id')
      .eq('user_id', user.id)
      .eq('is_primary_caregiver', true)
      .single()

    if (!member) { setLoading(false); return }

    setCaregiverId(member.id)
    setPatientId(member.patient_id)

    const { data: patientData } = await supabase
      .from('patients').select('*').eq('id', member.patient_id).single()
    setPatient(patientData)

    const { data: eventsData, error } = await supabase
      .from('care_events')
      .select('*, family_members(name)')
      .eq('patient_id', member.patient_id)
      .order('event_date', { ascending: false })

    if (error) console.error(error)
    else setEvents(eventsData)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('care_events').insert({
      patient_id: patientId,
      logged_by: caregiverId,
      event_type: eventType,
      title,
      event_date: eventDate,
      notes: notes || null,
    })
    if (error) { console.error(error) } else {
      setTitle(''); setEventDate(''); setNotes('')
      setEventType('appointment'); setShowForm(false)
      await loadData()
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#7A7A72' }}>Loading...</div>
  )

  if (!patient) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#7A7A72' }}>
      No patient found. Set up your care profile to get started.
    </div>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: 12, color: '#7A7A72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Care timeline</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2C2C2C' }}>{patient.name}</h1>
          {patient.diagnosis && (
            <p style={{ fontSize: 13, color: '#7A7A72', marginTop: 4 }}>{patient.diagnosis}</p>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: 'none', background: showForm ? '#E2DDD8' : '#4A7C8E', color: showForm ? '#2C2C2C' : '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {showForm ? 'Cancel' : '+ Log event'}
        </button>
      </div>

      {/* Add event form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #E2DDD8', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#7A7A72', marginBottom: 4, fontWeight: 500 }}>Event type</label>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={inputStyle}>
                <option value="appointment">Appointment</option>
                <option value="treatment">Treatment</option>
                <option value="lab">Lab</option>
                <option value="medication">Medication</option>
                <option value="hospitalization">Hospitalization</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#7A7A72', marginBottom: 4, fontWeight: 500 }}>Date</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required style={{ ...inputStyle, width: 'auto' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#7A7A72', marginBottom: 4, fontWeight: 500 }}>Title *</label>
            <input type="text" placeholder="e.g. Oncology follow-up with Dr. Patel" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#7A7A72', marginBottom: 4, fontWeight: 500 }}>Notes (optional)</label>
            <textarea placeholder="What happened? Any follow-up needed?" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button type="submit" disabled={submitting}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#4A7C8E', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start' }}>
            {submitting ? 'Saving...' : 'Save event'}
          </button>
        </form>
      )}

      {/* Timeline */}
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 12, border: '1px solid #E2DDD8' }}>
          <p style={{ color: '#7A7A72', fontSize: 15, margin: 0 }}>No events logged yet.</p>
          <p style={{ color: '#7A7A72', fontSize: 13, marginTop: 8 }}>Click "+ Log event" above to add your first care event.</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 1, background: '#E2DDD8' }} />
          {events.map((event) => {
            const style = typeStyles[event.event_type] || typeStyles.appointment
            return (
              <div key={event.id} style={{ position: 'relative', marginBottom: 20 }}>
                <div style={{ position: 'absolute', left: -24, top: 5, width: 8, height: 8, borderRadius: '50%', background: style.text }} />
                <p style={{ fontSize: 11, color: '#7A7A72', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {formatDate(event.event_date)}
                </p>
                <div style={{ background: '#fff', border: '1px solid #E2DDD8', borderRadius: 12, padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: style.bg, color: style.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {style.label}
                    </span>
                    <span style={{ fontSize: 12, color: '#7A7A72' }}>
                      logged by {event.family_members?.name || 'Unknown'}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: '#2C2C2C' }}>{event.title}</p>
                  {event.notes && <p style={{ fontSize: 13, color: '#7A7A72', margin: 0, lineHeight: 1.6 }}>{event.notes}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}