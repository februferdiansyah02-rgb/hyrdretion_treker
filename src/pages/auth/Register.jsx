<<<<<<< HEAD
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './../../../src/Register.css'
import splashImage from '../../assets/secondIcon.png'
import { COUNTRY_CODES } from './countryCodes'
import { useCountryCodes } from './useCountryCodes'
=======

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './../../Register.css'
>>>>>>> 04a80d8 (perbaiki halaman dasbor)

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

  function handleCreateAccount() {
<<<<<<< HEAD
    console.log('Daftar dengan:', { fullName, email, countryCode, phone, password })
=======
  
    localStorage.setItem('userName',fullName);
    console.log('Daftar dengan :',{fullName,email,phone,password});
    

    navigate('/dashboard')
>>>>>>> 04a80d8 (perbaiki halaman dasbor)
  }

  return (
    <div className="register-page">
      <div className="register-visual">
        <img src={splashImage} alt="" className="register-visual-image" />
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

<<<<<<< HEAD
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
=======
          <div className="register-field">
            <span className="register-code">+234</span>
>>>>>>> 04a80d8 (perbaiki halaman dasbor)
            <input
              type="tel"
              placeholder="Enter number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {error && (
            <p className="register-hint">
              Gagal ambil daftar negara dari backend, pakai daftar terbatas dulu.
            </p>
          )}

          <div className="register-field">
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