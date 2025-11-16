'use client'

import { useRouter } from 'next/navigation'

export default function AnswersLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment via-card to-muted relative">
      {/* Candle flicker corners for ambiance */}
      <div className="absolute top-4 left-4 w-6 h-10 bg-amber-100 rounded-full opacity-30 animate-candle-flicker blur-sm pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-10 bg-amber-100 rounded-full opacity-30 animate-candle-flicker blur-sm pointer-events-none" />

      {children}

      {/* Header with exit button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-card border border-sepia text-sepia rounded-md font-serif text-sm hover:bg-sepia hover:text-parchment transition-colors"
        >
          ← Back to Host
        </button>
      </div>

      {/* Keyboard help */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-serif bg-card/50 backdrop-blur p-3 rounded-md">
        <p><span className="font-semibold">Space</span> - Next answer | <span className="font-semibold">Enter</span> - Show all | <span className="font-semibold">H</span> - Highlight</p>
      </div>
    </div>
  )
}
