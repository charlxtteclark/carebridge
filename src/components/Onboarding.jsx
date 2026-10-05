import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Onboarding({ onComplete }) {
  const [patientName, setPatientName] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get the user's family_member row to find their patient_id
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

    // Update the patient row with the real name and diagnosis
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
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>Welcome to CareBridge</p>
      <h1 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 8px', color: '#1a1a1a' }}>
        Set up your care profile
      </h1>
      <p style={{ fontSize: 14, color: '#666', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
        Tell us about the person you're caring for.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
            Patient name *
          </label>
          <input
            type="text"
            placeholder="e.g. Margaret Clark"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
            Diagnosis (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Stage 3 ovarian cancer"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: '#b3261e', fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 14 }}
        >
          {submitting ? 'Saving...' : 'Get started'}
        </button>
      </form>
    </div>
  )
}