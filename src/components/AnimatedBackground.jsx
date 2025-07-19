// src/components/AnimatedBackground.jsx
import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create lightweight CSS-based particles
    const createParticles = () => {
      const particleCount = 50 // Reduced from 100
      container.innerHTML = ''
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = 'absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float'
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        particle.style.animationDelay = `${Math.random() * 3}s`
        particle.style.animationDuration = `${3 + Math.random() * 2}s`
        container.appendChild(particle)
      }
    }

    createParticles()

    // Only recreate particles on resize, not continuously
    const handleResize = () => {
      createParticles()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)'
      }}
    />
  )
}