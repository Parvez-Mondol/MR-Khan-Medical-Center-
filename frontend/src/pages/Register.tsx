import React, { useState } from 'react'
import { register } from '../api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const r = await register(name, email, password)
      setMsg(JSON.stringify(r))
    } catch (err) {
      setMsg('Error')
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      <pre>{msg}</pre>
    </div>
  )
}
