import React, { useEffect, useState } from 'react'
import api from '../services/api'
import RatingStars from '../components/RatingStars'

function OwnerDashboard() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/api/owner/dashboard')
      .then((res) => {
        setStores(res.data.stores)
        setLoading(false)
      })
      .catch(() => {
        setStores([])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          No stores found or not authenticated as owner.
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: '20px' }}>My Stores</h2>
      
      {stores.map(store => (
        <div key={store.store_id} className="card">
          {/* Store Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>{store.store_name}</h3>
              <div className="text-muted">{store.email}</div>
              {store.address && <div className="text-muted">{store.address}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#4f46e5' }}>
                {Number(store.avg_rating).toFixed(1)}
              </div>
              <div>
                <RatingStars value={Number(store.avg_rating)} interactive={false} />
              </div>
              <div className="text-muted">
                {store.ratings_count} {store.ratings_count === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="card" style={{ background: '#f8fafc', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Rating Stats</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <div className="text-muted">Average Rating</div>
                <div style={{ fontSize: '24px', fontWeight: '600' }}>
                  {Number(store.avg_rating).toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-muted">Total Ratings</div>
                <div style={{ fontSize: '24px', fontWeight: '600' }}>
                  {store.ratings_count}
                </div>
              </div>
              <div>
                <div className="text-muted">Recent Rating</div>
                <div style={{ fontSize: '24px', fontWeight: '600' }}>
                  {store.raters[0]?.rating || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Ratings Table */}
          <div>
            <h4>Recent Ratings</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {store.raters.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        No ratings yet
                      </td>
                    </tr>
                  ) : (
                    store.raters.map(rater => (
                      <tr key={rater.id}>
                        <td>{rater.name}</td>
                        <td><RatingStars value={rater.rating} interactive={false} /></td>
                        <td>{new Date(rater.created_at).toLocaleDateString()}</td>
                        <td>{rater.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OwnerDashboard
