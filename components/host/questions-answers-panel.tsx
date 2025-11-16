'use client'

import { useState } from 'react'

interface Question {
  id: string
  text: string
  level: 'easy' | 'medium' | 'hard'
  order_index?: number
  answers?: Array<{ studentId: string; text: string; rating?: number }>
}

// Export for use in other components
export type { Question }

interface Student {
  id: string
  name: string
  team: string
  status: string
  response: string
}

interface QuestionsAnswersPanelProps {
  questions: Question[]
  students: Student[]
  showAnswers: boolean
  selectedTeam: string | null
}

export default function QuestionsAnswersPanel({
  questions,
  students,
  showAnswers,
  selectedTeam,
}: QuestionsAnswersPanelProps) {
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [newQuestionText, setNewQuestionText] = useState('')

  const filteredStudents = selectedTeam
    ? students.filter(s => s.team === selectedTeam && s.response)
    : students.filter(s => s.response)

  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-burgundy">Questions & Answers</h2>
        <button className="text-xs px-3 py-1 bg-gold text-ink rounded font-serif hover:bg-gold/90">
          + New Question
        </button>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto">
        {questions.map((question) => (
          <div key={question.id} className="p-3 bg-background rounded-md border border-muted">
            <p className="font-serif text-sm text-foreground mb-2">{question.text}</p>
            <div className="text-xs text-muted-foreground">
              Level: <span className="font-semibold text-sepia">{question.level}</span>
            </div>

            {showAnswers && (
              <div className="mt-3 space-y-2 pt-3 border-t border-muted">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="text-xs p-2 bg-parchment rounded">
                    <p className="font-serif font-semibold text-burgundy mb-1">{student.name}</p>
                    <p className="text-foreground italic">{student.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!showAnswers && (
        <div className="mt-4 text-center text-xs text-muted-foreground italic">
          Answers are hidden (Press A to show)
        </div>
      )}
    </div>
  )
}
