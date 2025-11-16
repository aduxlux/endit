'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function IntroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    // Get role from query parameter
    const role = searchParams.get('role') || 'host'
    const redirectPath = role === 'student' ? '/student' : '/host'

    // Allow skip after 1.5 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 1500)

    // Auto-redirect after 4 seconds
    const redirectTimer = setTimeout(() => {
      router.push(redirectPath)
    }, 4000)

    return () => {
      clearTimeout(skipTimer)
      clearTimeout(redirectTimer)
    }
  }, [router, searchParams])

  const handleSkip = () => {
    const role = searchParams.get('role') || 'host'
    const redirectPath = role === 'student' ? '/student' : '/host'
    router.push(redirectPath)
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden relative">
      {/* Parchment texture overlay */}
      <div className="absolute inset-0 opacity-5 mix-blend-screen pointer-events-none" 
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" /%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" /%3E%3C/svg%3E')",
        }}
      />

      {/* Candle flicker corners - warm golden glow */}
      <div className="absolute top-8 left-8 w-8 h-12 rounded-full opacity-50 animate-candle-flicker blur-md" 
        style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 20px rgba(201, 163, 74, 0.8)' }} 
      />
      <div className="absolute top-8 right-8 w-8 h-12 rounded-full opacity-50 animate-candle-flicker blur-md"
        style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 20px rgba(201, 163, 74, 0.8)' }}
      />
      <div className="absolute bottom-8 left-8 w-8 h-12 rounded-full opacity-50 animate-candle-flicker blur-md"
        style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 20px rgba(201, 163, 74, 0.8)' }}
      />
      <div className="absolute bottom-8 right-8 w-8 h-12 rounded-full opacity-50 animate-candle-flicker blur-md"
        style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 20px rgba(201, 163, 74, 0.8)' }}
      />

      {/* Main logo container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        <div className="relative w-32 h-32 mb-4">
          <Image
            src="/lqisr-logo.png"
            alt="LQISR Academy Logo"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* Animated logo with quill effect */}
        <svg
          className="w-40 h-40 animate-quill-stroke"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Quill pen drawing */}
          <path
            d="M 100 30 Q 110 40 100 80 Q 90 120 100 160"
            fill="none"
            stroke="#9d1f35"
            strokeWidth="3"
            strokeDasharray="1000"
          />
          <circle cx="100" cy="170" r="8" fill="#c9a34a" />
          
          {/* Decorative flourishes */}
          <path
            d="M 70 100 Q 80 90 100 95 Q 120 90 130 100"
            fill="none"
            stroke="#9d7a60"
            strokeWidth="2"
            strokeDasharray="1000"
            opacity="0.7"
          />
        </svg>

        {/* Wax seal animation */}
        <div className="relative w-24 h-24">
          <svg
            className="absolute inset-0 w-full h-full animate-wax-seal-drop"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wax seal circle */}
            <circle cx="50" cy="50" r="45" fill="#9d1f35" />
            {/* Seal pattern */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#d4b574" strokeWidth="1.5" opacity="0.7" />
            <text x="50" y="57" textAnchor="middle" fontSize="24" fontFamily="serif" fill="#d4b574">
              ✦
            </text>
          </svg>
        </div>

        {/* Philosophical quote fades in */}
        <p className="text-center text-accent font-serif text-xl max-w-xs opacity-0 animate-fade-in-delay italic">
          "The unexamined life is not worth living."
        </p>

        {/* Animated ink drops */}
        <div className="flex gap-8">
          <div className="w-2 h-2 rounded-full bg-accent opacity-0 animate-ink-drop" style={{ animationDelay: '0.5s' }} />
          <div className="w-2 h-2 rounded-full bg-accent opacity-0 animate-ink-drop" style={{ animationDelay: '1s' }} />
          <div className="w-2 h-2 rounded-full bg-accent opacity-0 animate-ink-drop" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      {/* Skip button for desktop */}
      {canSkip && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 px-4 py-2 text-sm font-serif text-muted-foreground hover:text-accent border border-muted hover:border-accent rounded transition-all duration-300"
        >
          Skip ↵
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in-delay {
          0%, 40% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}

export default function IntroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sepia font-serif">Loading...</p>
        </div>
      </div>
    }>
      <IntroContent />
    </Suspense>
  )
}
