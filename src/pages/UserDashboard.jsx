import React, { useEffect, useState } from 'react'
import api from '../services/api'
import RatingStars from '../components/RatingStars'

function UserDashboard() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(null) // Stores ID being rated
  const [rawError, setRawError] = useState(null)

  async function fetchStores() {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/api/user/stores')
      setStores(res.data.stores)
    } catch (err) {
      const resp = err.response
      const srv = resp?.data
      setRawError(srv || { message: err.message })

      if (resp && resp.status === 401) {
        setError('You are not authenticated. Please log in to see stores.')
      } else if (resp && resp.status === 403) {
        setError('You do not have permission to view stores.')
      } else if (srv && srv.error) {
        setError(typeof srv.error === 'string' ? srv.error : 'Failed to load stores. Please fix any issues and try again.')
      } else {
        setError('Failed to load stores. Please try again later.')
      }
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStores() }, [])

  async function submitRating(store_id, rating) {
    try {
      setSubmitting(store_id)
      setError(null)
      await api.post('/api/user/ratings', { store_id, rating })
      await fetchStores()
    } catch (err) {
      setError('Failed to submit rating. Please try again.')
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          Loading stores...
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Rate Stores</h2>
        <div className="text-muted">
          {stores.length} {stores.length === 1 ? 'store' : 'stores'} available
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
          {error?.toLowerCase().includes('log in') && (
            <div style={{ marginTop: 8 }}>
              <a href="/login">Go to Login</a>
            </div>
          )}
        </div>
      )}

      {stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          No stores found or you are not authenticated.
        </div>
      ) : (
        <div className="store-grid">
          {stores.map(store => (
            <div key={store.id} className="card store-card">
              <div className="store-card-header">
                <h3>{store.name}</h3>
                <div className="text-muted">{store.email}</div>
                {store.address && (
                  <div className="text-muted">{store.address}</div>
                )}
              </div>
              
              <div className="store-card-stats">
                <div>
                  <div className="text-muted">Average Rating</div>
                  <div className="rating-value">{Number(store.avg_rating).toFixed(1)}</div>
                  <div style={{ marginTop: '4px' }}>
                    <RatingStars value={Number(store.avg_rating)} interactive={false} size="small" />
                  </div>
                </div>
                <div>
                  <div className="text-muted">Total Ratings</div>
                  <div className="rating-count">
                    {store.ratings_count || 0}
                  </div>
                </div>
              </div>

              <div className="store-card-rating">
                <div className="text-muted" style={{ marginBottom: '8px' }}>Your Rating</div>
                <RatingStars 
                  value={store.user_rating || 0} 
                  onChange={(r) => submitRating(store.id, r)}
                  disabled={submitting === store.id}
                  size="large"
                />
                {submitting === store.id && (
                  <div className="text-muted" style={{ marginTop: '8px', fontSize: '14px' }}>
                    Saving...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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

export default UserDashboard
