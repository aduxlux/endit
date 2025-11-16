'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function RoleSelection() {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState<'host' | 'student' | null>(null)

  const handleHostClick = () => {
    // Host goes directly to host page which has PIN entry (PIN 1975)
    router.push('/host')
  }

  const handleStudentClick = () => {
    router.push('/intro?role=student')
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden relative">
      {/* Parchment texture overlay */}
      <div
        className="absolute inset-0 opacity-5 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" /%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" /%3E%3C/svg%3E')",
        }}
      />

      {/* Candle flicker corners */}
      <div
        className="absolute top-8 left-8 w-8 h-12 rounded-full opacity-50 animate-candle-flicker blur-md"
        style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 20px rgba(201, 163, 74, 0.8)' }}
      />
      <div
        className="absolute top-8 right-8 w-8 h-12 rounded-full opacity-50 animate-candle-flicker blur-md"
        style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 20px rgba(201, 163, 74, 0.8)' }}
      />
      <div
        className="absolute bottom-8 left-8 w-8 h-12 rounded-full opacity-50 animate-candle-flicker blur-md"
        style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 20px rgba(201, 163, 74, 0.8)' }}
      />
      <div
        className="absolute bottom-8 right-8 w-8 h-12 rounded-full opacity-50 animate-candle-flicker blur-md"
        style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 20px rgba(201, 163, 74, 0.8)' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 px-4">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/lqisr-logo.png"
            alt="LQISR Logo"
            width={120}
            height={120}
            className="drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-gold mb-2">Philosopher Academy</h1>
          <p className="text-lg text-accent font-serif italic">Select your path of inquiry</p>
        </div>

        {/* Role selection buttons */}
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl">
          {/* Host Button */}
          <button
            onClick={handleHostClick}
            onMouseEnter={() => setIsHovering('host')}
            onMouseLeave={() => setIsHovering(null)}
            className={`flex-1 p-8 rounded-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              isHovering === 'host'
                ? 'border-gold bg-burgundy/30 shadow-lg shadow-gold/50'
                : 'border-muted bg-card/50 hover:border-muted-foreground'
            }`}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">👑</div>
              <h2 className="text-2xl font-serif text-gold mb-2">Host</h2>
              <p className="text-muted-foreground text-sm">Lead the inquiry and moderate discussions</p>
            </div>
          </button>

          {/* Student Button */}
          <button
            onClick={handleStudentClick}
            onMouseEnter={() => setIsHovering('student')}
            onMouseLeave={() => setIsHovering(null)}
            className={`flex-1 p-8 rounded-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              isHovering === 'student'
                ? 'border-gold bg-burgundy/30 shadow-lg shadow-gold/50'
                : 'border-muted bg-card/50 hover:border-muted-foreground'
            }`}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-2xl font-serif text-gold mb-2">Student</h2>
              <p className="text-muted-foreground text-sm">Engage with philosophical questions and share insights</p>
            </div>
          </button>
        </div>

        {/* Footer text */}
        <p className="text-center text-muted-foreground text-sm mt-8 max-w-md">
          "In philosophical inquiry, we seek truth through dialogue and contemplation of ideas."
        </p>
      </div>
    </div>
  )
}
