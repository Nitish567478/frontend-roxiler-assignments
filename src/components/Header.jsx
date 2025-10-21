import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  return (
    <header className="site-header">
        <div className="container">
            <div className="brand"><Link to="/">Roxiler</Link>
                <nav className="main-nav">
                {!user && <><Link to="/login">Login</Link><Link to="/signup">Signup</Link></>}
                {user && <>
                    {user.role === 'admin' && <Link to="/admin">Admin</Link>}
                    {user.role === 'owner' && <Link to="/owner">Owner</Link>}
                    {user.role === 'user' && <Link to="/user">Stores</Link>}
                    <button className="link-button" onClick={logout}>Logout</button>
                </>}
                </nav>
            </div>
        </div>
    </header>
  )
}

export default Header
