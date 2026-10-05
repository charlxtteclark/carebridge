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
  const [patient, setPatient] = useState(null)
  const [caregiverId, setCaregiverId] = useState(null)
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Form state
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

    if (!member) {
      setLoading(false)
      return
    }

    setCaregiverId(member.id)
    setPatientId(member.patient_id)

    const { data: patientData } = await supabase
      .from('patients')
      .select('*')
      .eq('id', member.patient_id)
      .single()

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

  useEffect(() => {
    loadData()
  }, [])

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

    if (error) {
      console.error(error)
    } else {
      setTitle('')
      setEventDate('')
      setNotes('')
      setEventType('appointment')
      setShowForm(false)
      await loadData()
    }

    setSubmitting(false)
  }

  if (loading) return <p>Loading timeline...</p>

  if (!patient) return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
      <p style={{ color: '#666', fontSize: 15 }}>No patient found. Set up your care profile to get started.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>Care timeline</p>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
            {patient.name}
          </h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: 13, fontWeight: 500, padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e5e5', background: showForm ? '#1a1a1a' : '#fff', color: showForm ? '#fff' : '#1a1a1a', cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : '+ Log event'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Event type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
              >
                <option value="appointment">Appointment</option>
                <option value="treatment">Treatment</option>
                <option value="lab">Lab</option>
                <option value="medication">Medication</option>
                <option value="hospitalization">Hospitalization</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Title *</label>
            <input
              type="text"
              placeholder="e.g. Oncology follow-up with Dr. Patel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Notes (optional)</label>
            <textarea
              placeholder="What happened? Any follow-up needed?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start' }}
          >
            {submitting ? 'Saving...' : 'Save event'}
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <p style={{ color: '#666', fontSize: 15 }}>No events logged yet. Add your first care event to get started.</p>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 1, background: '#ddd' }} />
          {events.map((event) => {
            const style = typeStyles[event.event_type] || typeStyles.appointment
            return (
              <div key={event.id} style={{ position: 'relative', marginBottom: 24 }}>
                <div style={{ position: 'absolute', left: -24, top: 4, width: 8, height: 8, borderRadius: '50%', background: style.text }} />
                <p style={{ fontSize: 12, color: '#999', margin: '0 0 6px' }}>
                  {formatDate(event.event_date)}
                </p>
                <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 6, background: style.bg, color: style.text }}>
                      {style.label}
                    </span>
                    <span style={{ fontSize: 12, color: '#999' }}>
                      logged by {event.family_members?.name || 'Unknown'}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px', color: '#1a1a1a' }}>{event.title}</p>
                  <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>{event.notes}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}