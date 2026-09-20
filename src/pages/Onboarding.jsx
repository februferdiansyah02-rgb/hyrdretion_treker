import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Onboarding.css'
import onboardingImage1 from '../assets/secondIcon.png'
import onboardingImage2 from '../assets/thirdIcon.png'
import onboardingImage3 from '../assets/fourIcon.png'

const SLIDES = [
  {
    image: onboardingImage1,
    title: 'Track your daily water intake with Us.',
    description: 'Achieve your hydration goals with a simple tap!',
  },
  {
    image: onboardingImage2,
    title: 'Hydration, Your Way: Smart Reminders.',
    description: 'Set your goal, track your progress, stay hydrated.',
  },
  {
    image: onboardingImage3,
    title: 'Easy to Use – Drink, Tap, Repeat',
    description: 'Effortless Hydration Tracking at Your Fingertips.',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const slide = SLIDES[current]
  const isLastSlide = current === SLIDES.length - 1

  function handleNext() {
    if (isLastSlide) {
      navigate('/login')
    } else {
      setCurrent(current + 1)
    }
  }

  return (
    <div className="onboarding-screen">
      {current > 0 && (
        <button className="onboarding-back" onClick={() => setCurrent(current - 1)}>
          ←
        </button>
      )}

      <img src={slide.image} alt="" className="onboarding-image" />

      <h1 className="onboarding-title">{slide.title}</h1>
      <p className="onboarding-description">{slide.description}</p>

      <div className="onboarding-dots">
        {SLIDES.map((_, index) => (
          <span
            key={index}
            className={index === current ? 'onboarding-dot active' : 'onboarding-dot'}
          ></span>
        ))}
      </div>

      <button className="onboarding-button" onClick={handleNext}>
        {isLastSlide ? 'GET STARTED' : 'NEXT'}
      </button>
    </div>
  )
}