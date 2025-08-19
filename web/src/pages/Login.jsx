import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuth } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login({ email, password })
      setAuth(data)
      navigate(data.role === 'admin' ? '/admin' : '/patient')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{maxWidth:360, display:'grid', gap:8}}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      {error && <div style={{color:'red'}}>{error}</div>}
      <button disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      <div style={{fontSize:12, color:'#666'}}>Test:
        admin@example.com / Passw0rd! or patient@example.com / Passw0rd!
      </div>
    </form>
  )
}
