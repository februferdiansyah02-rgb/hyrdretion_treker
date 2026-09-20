// Halaman ini muncul pertama kali pas app dibuka.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Splash.css'
import splashImage from '../assets/firstIcon.png'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding')
    }, 4000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash-screen">
      <img src={splashImage} alt="Water drop" className="splash-icon" />

      <h1 className="splash-title">Hello..</h1>

      <div className="splash-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/*gelombang atas */}
      <svg className="splash-wave" viewBox="0 0 500 150" preserveAspectRatio="none">
        
        <path
          d="M0,10 C150,120 350,50 800,150 L500,150 L0,150 Z"
          fill="#FFFFFF" opacity="0.3"
        />

        {/* gelombang bawah */}
        <path
          d="M0,60 C150,100 150,0 500 50 L500,550 L0,150 Z"
            fill="#FFFFFF" opacity="0.3"
        />
      </svg>

    </div>
  )
}