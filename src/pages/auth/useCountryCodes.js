import { useEffect, useState } from 'react'

// SESUAIKAN port ini kalau backend lo jalan di port yang beda
const API_URL = 'http://localhost:5174/api/countries'

export function useCountryCodes() {
  const [countries, setCountries] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Gagal mengambil daftar negara dari backend')
        }
        return response.json()
      })
      .then((data) => setCountries(data))
      .catch((err) => setError(err.message))
  }, [])

  return { countries, error }
}