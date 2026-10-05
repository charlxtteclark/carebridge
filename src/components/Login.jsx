import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setError('Check your email to confirm your account, then sign in.')
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #E2DDD8',
    background: '#fff',
    color: '#2C2C2C',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2DDD8', padding: '2rem', width: '100%', maxWidth: 360 }}>
        <p style={{ fontSize: 13, color: '#4A7C8E', fontWeight: 500, marginBottom: 6 }}>CareBridge</p>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#2C2C2C', marginBottom: 4 }}>
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h1>
        <p style={{ fontSize: 14, color: '#7A7A72', marginBottom: 24 }}>
          {isSignUp ? 'Start coordinating care for your loved one.' : 'Sign in to your care dashboard.'}
        </p>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          {error && <p style={{ color: error.includes('confirm') ? '#4A7C8E' : '#b3261e', fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#4A7C8E', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 14, marginTop: 4 }}
          >
            {isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 13, textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            style={{ background: 'none', border: 'none', color: '#4A7C8E', textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </p>
      </div>
    </div>
  )
}