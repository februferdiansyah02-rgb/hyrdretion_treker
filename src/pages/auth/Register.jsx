import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './../../Register.css'
import splashImage from '../../assets/secondIcon.png'
import { COUNTRY_CODES } from './countryCodes'
import { useCountryCodes } from './useCountryCodes'

export default function Register() {
  const navigate = useNavigate()
  const { countries, error } = useCountryCodes()

  const countryOptions = countries.length > 0 ? countries : COUNTRY_CODES

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+62')  
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleCreateAccount(e) {
    e.preventDefault()
    

    localStorage.setItem('userName', fullName)
    
    console.log('Daftar dengan:', { fullName, email, countryCode, phone, password })

    navigate('/dashboard')
  }

  return (
    <div className="register-page">
      <div className="register-visual">
        <img src={splashImage} alt="Hydration Tracker" className="register-visual-image" />
        <h2>Hydration Tracker</h2>
        <p>Stay hydrated, stay healthy.</p>
      </div>


      <div className="register-screen">
        <button className="register-close" onClick={() => navigate('/')}>✕</button>

        <div className="register-card">
          <h1 className="register-title">Create an account</h1>
          <p className="register-subtitle">Securely login to your account</p>

   
          <div className="register-field">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>


          <div className="register-field">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>


          <div className="register-field register-field-phone">
            <select
              className="register-country-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              aria-label="Kode negara"
            >
              {countryOptions.map((country) => (
                <option key={country.name} value={country.dialCode}>
                  {country.flag} {country.dialCode}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Enter number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && (
            <p className="register-hint text-red-500 text-xs">
              Gagal ambil daftar negara dari backend, pakai daftar terbatas dulu.
            </p>
          )}


          <div className="register-field relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="register-eye absolute right-3 top-3 text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
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