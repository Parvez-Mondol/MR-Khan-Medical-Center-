import React, { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/login')
  window.addEventListener('hashchange', () => setRoute(window.location.hash))

  return (
    <div className="container">
      <nav>
        <a href="#/login">Login</a> | <a href="#/register">Register</a>
      </nav>
      <hr />
      {route === '#/register' ? <Register /> : <Login />}
    </div>
  )
}
