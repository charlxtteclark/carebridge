import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Onboarding({ onComplete }) {
  const [patientName, setPatientName] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #E2DDD8',
    background: '#fff',
    color: '#2C2C2C',
    fontSize: 14,
    boxSizing: 'border-box',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('family_members')
      .select('patient_id')
      .eq('user_id', user.id)
      .eq('is_primary_caregiver', true)
      .single()

    if (!member) {
      setError('Could not find your profile. Please try again.')
      setSubmitting(false)
      return
    }

    const { error: updateError } = await supabase
      .from('patients')
      .update({ name: patientName, diagnosis: diagnosis || null })
      .eq('id', member.patient_id)

    if (updateError) {
      setError('Something went wrong. Please try again.')
      console.error(updateError)
    } else {
      onComplete()
    }

    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2DDD8', padding: '2rem', width: '100%', maxWidth: 400 }}>
        <p style={{ fontSize: 13, color: '#4A7C8E', fontWeight: 500, marginBottom: 6 }}>Welcome to CareBridge</p>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#2C2C2C', marginBottom: 4 }}>Set up your care profile</h1>
        <p style={{ fontSize: 14, color: '#7A7A72', marginBottom: 24, lineHeight: 1.6 }}>
          Tell us about the person you're caring for.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#7A7A72', marginBottom: 4, fontWeight: 500 }}>Patient name *</label>
            <input type="text" placeholder="e.g. Margaret Clark" value={patientName} onChange={(e) => setPatientName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#7A7A72', marginBottom: 4, fontWeight: 500 }}>Diagnosis (optional)</label>
            <input type="text" placeholder="e.g. Stage 3 ovarian cancer" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} style={inputStyle} />
          </div>
          {error && <p style={{ color: '#b3261e', fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#4A7C8E', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 14, marginTop: 4 }}
          >
            {submitting ? 'Saving...' : 'Get started'}
          </button>
        </form>
      </div>
    </div>
  )
}