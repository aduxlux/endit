'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PinEntryProps {
  onPinVerified: () => void
}

export default function PinEntry({ onPinVerified }: PinEntryProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const CORRECT_PIN = '1975'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === CORRECT_PIN) {
      setError('')
      onPinVerified()
    } else {
      setError('Invalid PIN. Please try again.')
      setPin('')
    }
  }

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num)
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2d1f1a] to-[#1a1410] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Candle flickers */}
      <style>{`
        @keyframes candle-flicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .candle-glow {
          animation: candle-flicker 3s ease-in-out infinite;
        }
      `}</style>

      {/* Corner candles */}
      <div className="absolute top-8 left-8 text-4xl candle-glow">🕯️</div>
      <div className="absolute top-8 right-8 text-4xl candle-glow">🕯️</div>
      <div className="absolute bottom-8 left-8 text-4xl candle-glow">🕯️</div>
      <div className="absolute bottom-8 right-8 text-4xl candle-glow">🕯️</div>

      {/* Main content */}
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/lqisr-logo.png"
            alt="LQISR"
            width={120}
            height={120}
            className="drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-4xl font-serif font-bold text-[#f4e8d8] mb-2">
          Host Access
        </h1>
        <p className="text-center text-[#c9a34a] font-serif text-lg mb-8">
          Enter the Academy PIN
        </p>

        {/* PIN Entry Form */}
        <div className="bg-[#2d1f1a] border-2 border-[#8b6f47] rounded-lg p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            {/* PIN Display */}
            <div className="mb-8">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-14 h-14 border-2 border-[#c9a34a] rounded-lg bg-[#1a1410] flex items-center justify-center text-2xl font-bold text-[#c9a34a] transition-all"
                  >
                    {pin[i] ? '●' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-900 bg-opacity-50 border border-red-600 rounded text-red-200 text-center text-sm font-serif">
                {error}
              </div>
            )}

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumClick(num.toString())}
                  className="bg-[#7b5a40] hover:bg-[#9d1f35] text-[#f4e8d8] font-serif font-bold py-3 rounded-lg transition-all active:scale-95 text-lg"
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Bottom buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                type="button"
                onClick={() => handleNumClick('0')}
                className="bg-[#7b5a40] hover:bg-[#9d1f35] text-[#f4e8d8] font-serif font-bold py-3 rounded-lg transition-all active:scale-95 text-lg col-span-1"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-[#8b4513] hover:bg-red-700 text-[#f4e8d8] font-serif font-bold py-3 rounded-lg transition-all active:scale-95 text-lg col-span-1"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-[#8b4513] hover:bg-red-700 text-[#f4e8d8] font-serif font-bold py-3 rounded-lg transition-all active:scale-95 text-lg col-span-1"
              >
                C
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#c9a34a] to-[#9d7e3a] hover:from-[#e0b85d] hover:to-[#b89a52] text-[#1a1410] font-serif font-bold py-3 rounded-lg transition-all active:scale-95 text-lg shadow-lg"
            >
              Access Academy
            </button>
          </form>

          {/* Instructions */}
          <p className="text-center text-[#c9a34a] font-serif text-xs mt-6 opacity-70">
            Only authorized hosts may enter
          </p>
        </div>
      </div>
    </div>
  )
}
