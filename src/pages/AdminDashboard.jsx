import React, { useEffect, useState } from 'react'
import api from '../services/api'
import RatingStars from '../components/RatingStars'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [showAddStore, setShowAddStore] = useState(false)
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', owner_id: '' })
  const [error, setError] = useState(null)
  const [updatingUser, setUpdatingUser] = useState(null) // Track which user is being updated
  const [showPromote, setShowPromote] = useState(false)
  const [promoteUserId, setPromoteUserId] = useState('')
  const [promoteLoading, setPromoteLoading] = useState(false)
  const [promoteRole, setPromoteRole] = useState('owner')
  const [showAddUserInline, setShowAddUserInline] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)
  const [newUserErrors, setNewUserErrors] = useState({})

  async function fetchAll() {
    // Ensure only admins fetch admin data
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
    if (!currentUser || currentUser.role !== 'admin') {
      setForbidden(true)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const statsRes = await api.get('/api/admin/dashboard')
      setStats(statsRes.data)

      const usersRes = await api.get('/api/admin/users')
      setUsers(Array.isArray(usersRes.data?.users) ? usersRes.data.users : [])

      const storesRes = await api.get('/api/admin/stores')
      setStores(Array.isArray(storesRes.data?.stores) ? storesRes.data.stores : [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin dashboard')
      setStats(null)
      setUsers([])
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Check at mount whether user is admin and show forbidden if not
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
    if (!currentUser || currentUser.role !== 'admin') setForbidden(true)
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  function validateForm() {
    const errors = {}
    const nm = (newStore.name || '').trim()
    const em = (newStore.email || '').trim()
    
    if (!nm) {
      errors.name = 'Store name is required'
    } else if (nm.length < 3) {
      errors.name = 'Store name must be at least 3 characters'
    } else if (nm.length > 60) {
      errors.name = 'Store name must be less than 60 characters'
    }

    if (!em) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!newStore.owner_id) {
      errors.owner_id = 'Please select a store owner'
    } else if (isNaN(Number(newStore.owner_id))) {
      errors.owner_id = 'Invalid owner selection'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function createStore(e) {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: (newStore.name || '').trim(),
        email: (newStore.email || '').trim(),
        address: (newStore.address || '').trim(),
        owner_id: Number(newStore.owner_id)
      }

      const resp = await api.post('/api/admin/stores', payload)
      setShowAddStore(false)
      setNewStore({ name: '', email: '', address: '', owner_id: '' })
      await fetchAll() // refresh data
      
      // Could show success message here
    } catch (err) {
      const resp = err.response
      const srvErr = resp?.data

      if (resp && (resp.status === 401 || resp.status === 403)) {
        setError(resp.status === 401 ? 'You must be logged in to create a store' : 'You do not have permission to create a store')
      } else if (srvErr) {
        if (srvErr.error && typeof srvErr.error === 'object') {
          // Backend validation errors by field
          setValidationErrors(srvErr.error)
          setError('Please fix the highlighted fields')
        } else if (Array.isArray(srvErr.errors)) {
          // express-validator errors
          const fieldErrors = {}
          srvErr.errors.forEach(e => {
            if (e.param) fieldErrors[e.param] = e.msg
          })
          setValidationErrors(fieldErrors)
          setError('Please fix the highlighted fields')
        } else {
          // General error message
          setError(srvErr.error || 'Failed to create store')
        }
      } else {
        setError('Failed to create store. Please try again later.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const owners = users.filter(u => u.role === 'owner')

  if (forbidden) {
    return (
      <div className="container">
        <div className="card">
          <h3>Forbidden</h3>
          <p>You do not have permission to view this page. Only users with the <strong>admin</strong> role can access the Admin Dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <h2>Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={fetchAll} disabled={loading} className="secondary-button">{loading ? 'Refreshing...' : 'Refresh'}</button>
          <button onClick={() => setShowAddStore(true)} disabled={loading}>Add Store</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Users</h4>
          <div className="value">{stats?.users_count || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Total Stores</h4>
          <div className="value">{stats?.stores_count || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Total Ratings</h4>
          <div className="value">{stats?.ratings_count || 0}</div>
        </div>
      </div>

      {loading && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>Loading dashboard data...</div>
      )}

      {showAddStore && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>Add New Store</h3>
              <button 
                type="button" 
                className="close-button" 
                onClick={() => {
                  if (!isSubmitting) {
                    setShowAddStore(false)
                    setNewStore({ name: '', email: '', address: '', owner_id: '' })
                    setValidationErrors({})
                    setError(null)
                  }
                }}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={createStore} className="store-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Store Name <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className={validationErrors.name ? 'input-error' : ''}
                      value={newStore.name}
                      onChange={e => setNewStore(s => ({ ...s, name: e.target.value.trimStart() }))}
                      onBlur={e => setNewStore(s => ({ ...s, name: e.target.value.trim() }))}
                      placeholder="Enter store name (3-60 characters)"
                      maxLength={60}
                      disabled={isSubmitting}
                    />
                    <div className="input-info">
                      {newStore.name.length}/60 characters
                    </div>
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
                  <label>Email Address <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      className={validationErrors.email ? 'input-error' : ''}
                      value={newStore.email}
                      onChange={e => setNewStore(s => ({ ...s, email: e.target.value.trim() }))}
                      placeholder="store@example.com"
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
                  <label>Store Owner <span className="required">*</span></label>
                  {owners.length === 0 ? (
                    <>
                      <div className="form-notice">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M13 13h-2V7h2v6zm0 4h-2v-2h2v2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                        </svg>
                        <div style={{ flex: 1 }}>
                          <div>No store owners available.</div>
                          <div style={{ fontSize: 13, color: '#7c8494' }}>You can promote an existing user to owner below.</div>
                        </div>
                        <div>
                          <button type="button" className="secondary-button" onClick={() => setShowPromote(s => !s)}>
                            {showPromote ? 'Close' : 'Promote user to owner'}
                          </button>
                        </div>
                      </div>

                      {showPromote && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <select value={promoteUserId} onChange={e => setPromoteUserId(e.target.value)} className="select-input">
                              <option value="">-- Select a user to promote --</option>
                              {users.filter(u => u.role !== 'owner').map(u => (
                                <option key={u.id} value={u.id}>{u.name} • {u.email}</option>
                              ))}
                            </select>

                            <select value={promoteRole} onChange={e => setPromoteRole(e.target.value)} className="select-input" style={{ width: 160 }}>
                              <option value="owner">Promote to Owner</option>
                              <option value="admin">Promote to Admin</option>
                            </select>

                            <button
                              type="button"
                              className="primary-button"
                              disabled={!promoteUserId || promoteLoading}
                              onClick={async () => {
                                if (!promoteUserId) return
                                if (!window.confirm(`Promote selected user to ${promoteRole}?`)) return
                                setPromoteLoading(true)
                                setError(null)
                                try {
                                  await api.put(`/api/admin/users/${promoteUserId}`, { role: promoteRole })
                                  console.log('User promoted successfully')
                                  await fetchAll()
                                  setShowPromote(false)
                                  if (promoteRole === 'owner') setNewStore(s => ({ ...s, owner_id: promoteUserId }))
                                  setPromoteUserId('')
                                } catch (err) {
                                  setError(err.response?.data?.error || 'Failed to promote user')
                                } finally {
                                  setPromoteLoading(false)
                                }
                              }}
                            >
                              {promoteLoading ? 'Promoting...' : 'Promote'}
                            </button>
                          </div>

                          <div style={{ fontSize: 13, color: '#6b7280' }}>Or create a new user and promote them:</div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                            <input placeholder="Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                            <input placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                            <input placeholder="Password" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                          </div>

                          {(newUserErrors.name || newUserErrors.email || newUserErrors.password) && (
                            <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 13 }}>
                              {newUserErrors.name && <div>Name: {newUserErrors.name}</div>}
                              {newUserErrors.email && <div>Email: {newUserErrors.email}</div>}
                              {newUserErrors.password && <div>Password: {newUserErrors.password}</div>}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 10 }}>
                            <select value={promoteRole} onChange={e => setPromoteRole(e.target.value)} className="select-input" style={{ width: 160 }}>
                              <option value="owner">Promote to Owner</option>
                              <option value="admin">Promote to Admin</option>
                            </select>

                            <button
                              type="button"
                              className="primary-button"
                              disabled={!newUserName || !newUserEmail || !newUserPassword || creatingUser}
                              onClick={async () => {
                                  const errs = {}
                                  const nm = (newUserName || '').trim()
                                  const em = (newUserEmail || '').trim()
                                  const pw = newUserPassword || ''
                                  if (!nm || nm.length < 3 || nm.length > 60) errs.name = 'Name must be 3-60 characters'
                                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errs.email = 'Please enter a valid email address'
                                  if (!pw || pw.length < 8 || pw.length > 16) errs.password = 'Password must be 8-16 characters'

                                  setNewUserErrors(errs)
                                  if (Object.keys(errs).length > 0) return

                                  setCreatingUser(true)
                                  setError(null)
                                  try {
                                      const r = await api.post('/api/auth/signup', { name: nm, email: em, password: pw, address: '', role: promoteRole })
                                      const created = r.data.user
                                      
                                      await fetchAll()
                                      if (promoteRole === 'owner') setNewStore(s => ({ ...s, owner_id: String(created.id) }))
                                    setShowPromote(false)
                                    setNewUserName('')
                                    setNewUserEmail('')
                                    setNewUserPassword('')
                                    setNewUserErrors({})
                                  } catch (err) {
                                    console.error('Signup error', err)
                                    const srv = err.response?.data
                                    if (srv) {
                                      if (Array.isArray(srv.errors)) {
                                        const map = {}
                                        srv.errors.forEach(e => { if (e.param) map[e.param] = e.msg })
                                        setNewUserErrors(map)
                                        setError('Please fix the highlighted fields')
                                      } else if (srv.error) {
                                        if (typeof srv.error === 'object') {
                                          
                                          const first = Object.values(srv.error)[0]
                                          setError(first || 'Failed to create and promote user')
                                        } else {
                                          setError(srv.error)
                                        }
                                      } else {
                                        setError('Failed to create and promote user')
                                      }
                                    } else {
                                      setError('Failed to create and promote user')
                                    }
                                  } finally {
                                    setCreatingUser(false)
                                  }
                                }}
                            >
                              {creatingUser ? 'Creating & Promoting...' : 'Create & Promote'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="input-wrapper">
                      <select
                        className={`select-input ${validationErrors.owner_id ? 'input-error' : ''}`}
                        value={newStore.owner_id}
                        onChange={e => setNewStore(s => ({ ...s, owner_id: e.target.value }))}
                        disabled={isSubmitting}
                      >
                        <option value="">-- Select a store owner --</option>
                        {owners.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.name} • {o.email}
                          </option>
                        ))}
                      </select>
                      {!validationErrors.owner_id && (
                        <div className="input-info">
                          {owners.length} {owners.length === 1 ? 'owner' : 'owners'} available
                        </div>
                      )}
                    </div>
                  )}
                  {validationErrors.owner_id && (
                    <div className="error-message">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
                      </svg>
                      {validationErrors.owner_id}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <div className="input-wrapper">
                    <textarea
                      value={newStore.address}
                      onChange={e => setNewStore(s => ({ ...s, address: e.target.value }))}
                      onBlur={e => setNewStore(s => ({ ...s, address: e.target.value.trim() }))}
                      maxLength={400}
                      placeholder="Store address (optional)"
                      rows={3}
                      disabled={isSubmitting}
                    />
                    <div className="input-info">
                      {400 - (newStore.address?.length || 0)} characters remaining
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-error" role="alert">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={isSubmitting || owners.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner" />
                      Creating Store...
                    </>
                  ) : (
                    'Create Store'
                  )}
                </button>
                <button 
                  type="button" 
                  className="secondary-button" 
                  onClick={() => {
                    if (!isSubmitting) {
                      setShowAddStore(false)
                      setNewStore({ name: '', email: '', address: '', owner_id: '' })
                      setValidationErrors({})
                      setError(null)
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Users</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select 
                      value={u.role}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                            setUpdatingUser(u.id);
                            setError(null);
                            try {
                              await api.put(`/api/admin/users/${u.id}`, {
                                role: newRole
                              });
                              await fetchAll(); 
                            } catch (err) {
                              setError(`Failed to update user role: ${err.response?.data?.error || 'Unknown error'}`);
                            } finally {
                              setUpdatingUser(null);
                            }
                      }}
                      className="role-select"
                      disabled={updatingUser === u.id}
                    >
                      <option value="user">👤 User</option>
                      <option value="owner">🏪 Owner</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                    {updatingUser === u.id && (
                      <span className="loading-spinner" style={{ marginLeft: '8px' }} />
                    )}
                  </td>
                  <td>{u.address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Stores</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td><RatingStars value={Number(s.avg_rating)} interactive={false} /></td>
                  <td>{users.find(u => u.id === s.owner_id)?.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
