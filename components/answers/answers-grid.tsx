'use client'

interface Answer {
  id: string
  studentId: string
  studentName: string
  teamId: string
  teamName: string
  text: string
  rating?: number
  highlighted?: boolean
  timestamp: Date
}

interface AnswersGridProps {
  answers: Answer[]
  highlightedAnswerId: string | null
}

export default function AnswersGrid({ answers, highlightedAnswerId }: AnswersGridProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-serif text-burgundy mb-2 text-center">All Responses</h1>
      <p className="text-center text-sepia italic mb-8">Philosophical contributions from all societies</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {answers.map((answer) => (
          <div
            key={answer.id}
            className={`p-6 rounded-lg border-2 transition-all animate-page-turn ${
              highlightedAnswerId === answer.id
                ? 'border-gold bg-yellow-50/30 shadow-lg'
                : 'border-sepia bg-card'
            }`}
          >
            {/* Team emblem */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-background border-2 border-sepia flex items-center justify-center text-xl">
                {answer.teamId === 'plato' && '⬢'}
                {answer.teamId === 'aristotle' && '◆'}
                {answer.teamId === 'stoic' && '◇'}
                {answer.teamId === 'epicurean' && '●'}
              </div>
              <div>
                <p className="text-xs text-sepia font-serif">Scholar</p>
                <p className="text-sm font-serif text-burgundy font-semibold">{answer.studentName}</p>
              </div>
            </div>

            {/* Answer text */}
            <p className="text-sm font-serif text-foreground leading-relaxed mb-4 line-clamp-4">
              {answer.text}
            </p>

            {/* Rating */}
            {answer.rating && (
              <div className="flex gap-1">
                {[...Array(answer.rating)].map((_, i) => (
                  <span key={i} className="text-gold text-xs">✦</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
