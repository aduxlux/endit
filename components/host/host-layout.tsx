'use client'

import { useRouter } from 'next/navigation'

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment via-card to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-sepia">
          <div>
            <h1 className="text-4xl font-serif text-burgundy">Host Dashboard</h1>
            <p className="text-sepia italic text-sm mt-1">Manage your philosophical discourse</p>
          </div>
          <button
            onClick={() => router.push('/answers')}
            className="px-4 py-2 bg-burgundy text-parchment rounded-md font-serif hover:bg-burgundy/90 transition-colors"
          >
            View Answers Board
          </button>
        </div>

        {/* Main content */}
        <div className="grid auto-rows-max gap-6">
          {children}
        </div>

        {/* Hotkeys legend */}
        <div className="mt-8 p-4 bg-card border border-muted rounded-md">
          <p className="text-xs text-muted-foreground font-serif">
            <span className="font-semibold">Hotkeys:</span> N (next level) • P (prev level) • Space (toggle timer) • S (start/stop) • A (toggle answers visibility)
          </p>
        </div>
      </div>
    </div>
  )
}
