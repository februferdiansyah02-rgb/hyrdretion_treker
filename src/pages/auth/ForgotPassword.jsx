// Halaman Forgot Password: user masukin email, nanti (setelah backend jadi)
// akan dikirimin link/kode buat reset password ke email itu.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './../../../src/ForgotPassword.css'
import splashImage from '../../assets/fiveIcon.png'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  function handleSendReset() {
    // TODO: nanti di sini kita minta backend kirim email reset password
    console.log('Kirim reset password ke:', email)
  }

  return (
    <div className="forgot-page">
      {/* Panel ini cuma muncul di desktop */}
      <div className="forgot-visual">
        <img src={splashImage} alt="" className="forgot-visual-image" />
        <h2>Hydration Tracker</h2>
        <p>Stay hydrated, stay healthy.</p>
      </div>

      <div className="forgot-screen">
        <button className="forgot-back" onClick={() => navigate('/login')}>
          ←
        </button>

        <div className="forgot-card">
          <img src={splashImage} alt="" className="forgot-mascot" />

          <h1 className="forgot-title">Forgot Password</h1>
          <p className="forgot-subtitle">
            Enter your registered email address to reset your password
          </p>

          <div className="forgot-field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="forgot-button" onClick={handleSendReset}>
            SEND RESET PASSWORD
          </button>

          <p className="forgot-login">
            Back to{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigate('/login')
              }}
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}