import { useEffect, useState } from 'react'

function getTimeLeft(targetDate) {
  const now = new Date().getTime()
  const distance = targetDate - now
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

export default function Countdown({ date, renderer }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(date))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(date))
    }, 1000)
    return () => clearInterval(interval)
  }, [date])

  return renderer(timeLeft)
} 