import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import '../../ForgotPassword.css'
import logo from '../../assets/fiveIcon.png'
import splashImage from '../../assets/logo.png'
import { supabase } from '../../lib/supabase'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleSendReset() {
    if (isSending) return

    if (!email.trim()) {
      Swal.fire({
        title: 'Email Kosong',
        text: 'Masukkan email terdaftar kamu dulu.',
        icon: 'warning',
        confirmButtonColor: '#38bdf8',
        confirmButtonText: 'OK',
      })
      return
    }

    setIsSending(true)

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )

    setIsSending(false)

    if (error) {
      Swal.fire({
        imageUrl: logo,
        imageWidth: 100,
        imageHeight: 100,
        title:
          '<h2 style="font-size: 22px; font-weight: 800; color: #1e293b;">Gagal Mengirim</h2>',
        html: `<p style="font-size: 14px; color: #64748b; margin-top: 4px;">${error.message}</p>`,
        confirmButtonText: 'COBA LAGI',
        confirmButtonColor: '#38bdf8',
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-3xl p-6',
          confirmButton:
            'w-full h-12 bg-sky-400 hover:bg-sky-500 text-white font-extrabold rounded-xl mt-4 transition',
        },
      })
      return
    }

    Swal.fire({
      imageUrl: logo,
      imageWidth: 100,
      imageHeight: 100,
      title:
        '<h2 style="font-size: 22px; font-weight: 800; color: #1e293b;">Email Terkirim!</h2>',
      html:
        '<p style="font-size: 14px; color: #64748b; margin-top: 4px;">Kami sudah mengirim link reset password ke email kamu. Cek inbox atau spam.</p>',
      showConfirmButton: false,
      timer: 2500,
      customClass: {
        popup: 'rounded-3xl p-6',
      },
    })
  }

  return (
    <div className="forgot-page">
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
          <img src={logo} alt="" className="forgot-mascot" />

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

          <button
            className="forgot-button"
            onClick={handleSendReset}
            disabled={isSending}
          >
            {isSending ? 'SENDING...' : 'SEND RESET PASSWORD'}
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