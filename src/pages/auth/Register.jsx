// Halaman Create Account / daftar akun baru.

// Halaman Create Account / daftar akun baru.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './../../../src/Register.css'

export default function Register() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleCreateAccount() {
    // TODO: nanti di sini data dikirim ke backend buat disimpan
    console.log('Daftar dengan:', { fullName, email, phone, password })
  }

  return (
    <div className="register-page">
      <div className="register-screen">
        <button className="register-close">✕</button>

        <div className="register-card">
          <h1 className="register-title">Create an account</h1>
          <p className="register-subtitle">Securely login to your account</p>

          <div className="register-field">
            <span className="register-icon">👤</span>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="register-field">
            <span className="register-icon">✉️</span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Kode negara ditulis manual dulu (+234 di Figma).
              Nanti kalau perlu ganti-ganti negara, ini bisa dijadikan dropdown. */}
          <div className="register-field">
            <span className="register-code">+234</span>
            <input
              type="tel"
              placeholder="Enter number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="register-field">
            <span className="register-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="register-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁️
            </button>
          </div>

          <button className="register-button" onClick={handleCreateAccount}>
            Create Account
          </button>

          <p className="register-login">
            I Already Have an Account{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigate('/login')
              }}
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}