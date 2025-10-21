import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)
  const [role, setRole] = useState('user')
  
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rawError, setRawError] = useState(null)
  const nav = useNavigate()

  function validateForm() {
    const errors = {}
    const nm = (name || '').trim()
    const em = (email || '').trim()
    const pw = password || ''

    if (!nm || nm.length < 3 || nm.length > 60) errors.name = 'Name must be between 3 and 60 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errors.email = 'Please enter a valid email address'
    if (!pw || pw.length < 8 || pw.length > 16) errors.password = 'Password must be between 8 and 16 characters'

    // no admin key required anymore; allow role selection from client

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const config = {}
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        address: address.trim(),
        role
      }

      // Debug: log outbound payload and headers
      console.debug('Signup request', { payload, config })

      const res = await api.post('/api/auth/signup', payload, config)

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      
      // Navigate based on role
      const assignedRole = res.data.user.role
      if (assignedRole === 'admin') nav('/admin')
      else if (assignedRole === 'owner') nav('/owner')
      else nav('/user')
    } catch (err) {
      const srvErr = err.response?.data

      // Debug: log server error
      console.debug('Signup error response', { status: err.response?.status, data: srvErr, error: err })
      setRawError(srvErr || { message: err.message })

      if (srvErr) {
        if (srvErr.error && typeof srvErr.error === 'object') {
          // Backend validation errors by field
          setValidationErrors(srvErr.error)
          setError('Please fix the highlighted fields')
        } else if (Array.isArray(srvErr.errors)) {

          const fieldErrors = {}
          srvErr.errors.forEach(e => {
            if (e.param) fieldErrors[e.param] = e.msg
          })
          setValidationErrors(fieldErrors)
          setError('Please fix the highlighted fields')
        } else if (typeof srvErr.error === 'string') {
          setError(srvErr.error)
        } else if (srvErr.details) {
          setError(String(srvErr.details))
        } else {
          setError('Signup failed')
        }
      } else {
        setError('Signup failed. Please try again later.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '20px auto' }} className="card">
      <h3>Signup</h3>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Name <span className="required">*</span></label>
          <div className="input-wrapper">
            <input
            type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={validationErrors.name ? 'input-error' : ''}
              disabled={isSubmitting}
            />
          </div>
          {validationErrors.name && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
              </svg>
              {validationErrors.name}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Email <span className="required">*</span></label>
          <div className="input-wrapper">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={validationErrors.email ? 'input-error' : ''}
              disabled={isSubmitting}
            />
          </div>
          {validationErrors.email && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
              </svg>
              {validationErrors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Password <span className="required">*</span></label>
          <div className="input-wrapper">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={validationErrors.password ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            <div className="input-info">8-16 characters</div>
          </div>
          {validationErrors.password && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
              </svg>
              {validationErrors.password}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Address</label>
          <div className="input-wrapper">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Role</label>
          <div className="input-wrapper">
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="role-select"
              disabled={isSubmitting}
            >
              <option value="user">👤 User</option>
              <option value="owner">🏪 Owner</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <div style={{ fontSize: 13, color: '#6b7280' }}>Selecting Owner or Admin is allowed without an admin key.</div>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading-spinner" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>
      {rawError && (
        <div style={{ marginTop: 12 }}>
          <h4 style={{ margin: '8px 0' }}>Debug: server response</h4>
          <pre style={{ maxHeight: 220, overflow: 'auto', background: '#f6f8fa', padding: 12, borderRadius: 6 }}>
            {JSON.stringify(rawError, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default Signup
