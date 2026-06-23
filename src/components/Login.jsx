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

  return (
    <div style={{ maxWidth: 320, margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 16, color: '#1a1a1a' }}>
        {isSignUp ? 'Create an account' : 'Sign in to CareBridge'}
      </h1>
      <form onSubmit={isSignUp ? handleSignUp : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: '#b3261e', fontSize: 13, margin: 0 }}>{error}</p>}
        <button
            type="submit"
            style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>
            {isSignUp ? 'Sign up' : 'Sign in'}
        </button>
      </form>
      <p style={{ fontSize: 13, textAlign: 'center', marginTop: 8 }}>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#1a1a1a', textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}>
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </p>
    </div>
  )
}