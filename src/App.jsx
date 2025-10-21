import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import UserDashboard from './pages/UserDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Header from './components/Header'

function App() {
  return (
    <div className="app">
      <Header />
      <div className="container">
        <div className="hero">
          <h1>Roxiler — Store Ratings</h1>
          <p>Submit and manage ratings for stores. Role-based dashboards for users, owners, and admins.</p>
        </div>

        <Routes>
          <Route path="/" element={<div />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
