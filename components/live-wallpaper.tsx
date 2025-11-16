'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  color: string
}

export default function LiveWallpaper() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    
    setIsMobile(checkMobile())
    
    // Create floating particles (fewer on mobile for performance)
    const createParticles = () => {
      const newParticles: Particle[] = []
      const colors = [
        'rgba(201, 163, 74, 0.15)', // gold
        'rgba(157, 31, 53, 0.1)', // burgundy
        'rgba(123, 90, 64, 0.12)', // sepia
        'rgba(212, 181, 116, 0.1)', // light gold
      ]

      const particleCount = isMobile ? 5 : 15 // Fewer particles on mobile
      const wispCount = isMobile ? 3 : 8 // Fewer wisps on mobile

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: 100 + Math.random() * 20,
          size: 2 + Math.random() * 4,
          duration: 20 + Math.random() * 30,
          delay: Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
      setParticles(newParticles)
    }

    createParticles()

    // Regenerate particles periodically
    const interval = setInterval(() => {
      createParticles()
    }, 50000)

    return () => clearInterval(interval)
  }, [isMobile])

  // Reduce animations on mobile
  if (isMobile) {
    return (
      <div className="live-wallpaper">
        {/* Minimal particles on mobile */}
        {particles.slice(0, 3).map((particle) => (
          <div
            key={particle.id}
            className="wallpaper-particle"
            style={{
              left: `${particle.x}%`,
              bottom: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="live-wallpaper">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="wallpaper-particle"
          style={{
            left: `${particle.x}%`,
            bottom: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      
      {/* Ink wisps */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`wisp-${i}`}
          className="wallpaper-ink-wisp"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            width: `${30 + (i % 2) * 20}px`,
            height: `${30 + (i % 2) * 20}px`,
            backgroundColor: i % 2 === 0 
              ? 'rgba(157, 31, 53, 0.08)' 
              : 'rgba(123, 90, 64, 0.06)',
            animationDuration: `${25 + i * 3}s`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

