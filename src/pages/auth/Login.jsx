import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './../../../src/Login.css'
import splashImage from '../../assets/firstIcon.png'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  function handleLogin() {
    console.log('Login dengan:', email, password)
  }

  return (
    <div className="login-page"> 
      <div className="login-visual">
        <img src={splashImage} alt="" className="login-visual-image" />
        <h2>Hydration Tracker</h2>
        <p>Stay hydrated, stay healthy.</p>
      </div>

      <div className="login-screen">
        <button className="login-close">✕</button>

        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Securely login to your account</p>

          {/* Input email */}
          <div className="login-field">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
            </button>
          </div>

          <label className="login-remember">
            <input type="checkbox" />
            Remember me
          </label>

          <button className="login-button" onClick={handleLogin}>
            LOG IN
          </button>

          <a
            href="#"
            className="login-forgot"
            onClick={(e) => {
              e.preventDefault()
              navigate('/forgot-password')
            }}
          >
            Forgot Password
          </a>

          <p className="login-divider">- OR Continue with -</p>

          <div className="login-social">
            <button className="login-social-button">
              <span className="login-social-icon google">G</span>
              Google
            </button>
            <button className="login-social-button">
              <span className="login-social-icon facebook">f</span>
              Facebook
            </button>
          </div>

          <p className="login-signup">
            Create An Account{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault() 
                navigate('/register')
              }}
            >
              Sign Up
            </a>
          </p>

          <p className="login-terms">
            By clicking Continue, you agree to our <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}