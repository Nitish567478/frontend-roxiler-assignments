import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      // redirect based on role
      const role = res.data.user.role
      if (role === 'admin') nav('/admin')
      else if (role === 'owner') nav('/owner')
      else nav('/user')
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed')
    }
  }
 
  return (
    <div style={{ maxWidth: 480, margin: '20px auto' }} className="card">
      <h3>Login</h3>
      <form onSubmit={submit}>
        <div> 
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login
