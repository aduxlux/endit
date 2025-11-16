'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  sessionId: string
}

const LEVEL_LABELS = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile'
}

const LEVEL_COLORS = {
  easy: 'text-green-700 bg-green-50 border-green-300',
  medium: 'text-yellow-700 bg-yellow-50 border-yellow-300',
  hard: 'text-red-700 bg-red-50 border-red-300'
}

export default function QuestionsAnswersPanel({
  questions,
  students,
  showAnswers,
  selectedTeam,
  sessionId,
}: QuestionsAnswersPanelProps) {
  const scrollToQuestions = () => {
    // Scroll to questions management panel
    const questionsPanel = document.querySelector('[data-questions-panel]')
    if (questionsPanel) {
      questionsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Highlight it briefly
      questionsPanel.classList.add('ring-4', 'ring-gold')
      setTimeout(() => {
        questionsPanel.classList.remove('ring-4', 'ring-gold')
      }, 2000)
    }
  }

  const filteredStudents = selectedTeam
    ? students.filter(s => s.team === selectedTeam && s.response)
    : students.filter(s => s.response)

  // Group questions by level
  const questionsByLevel = {
    easy: questions.filter(q => q.level === 'easy'),
    medium: questions.filter(q => q.level === 'medium'),
    hard: questions.filter(q => q.level === 'hard')
  }

  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-burgundy">Questions & Réponses</h2>
        <button 
          onClick={scrollToQuestions}
          className="text-xs px-3 py-1 bg-gold text-ink rounded font-serif hover:bg-gold/90 transition-all"
          title="Aller à la gestion des questions"
        >
          + Nouvelle Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="font-serif text-sm italic mb-4">Aucune question créée</p>
          <button
            onClick={scrollToQuestions}
            className="px-4 py-2 bg-burgundy text-parchment rounded font-serif hover:bg-burgundy/90"
          >
            Créer des questions
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(['easy', 'medium', 'hard'] as const).map((level) => {
            const levelQuestions = questionsByLevel[level]
            if (levelQuestions.length === 0) return null

            return (
              <div key={level} className="border-2 border-muted rounded-lg p-3">
                <div className={`inline-block px-2 py-1 rounded text-xs font-serif font-semibold mb-2 ${LEVEL_COLORS[level]}`}>
                  {LEVEL_LABELS[level]} ({levelQuestions.length})
                </div>
                <div className="space-y-3 mt-2">
                  {levelQuestions.map((question) => (
                    <div key={question.id} className="p-3 bg-background rounded-md border border-muted">
                      <p className="font-serif text-sm text-foreground mb-2 leading-relaxed">{question.text}</p>

                      {showAnswers && (
                        <div className="mt-3 space-y-2 pt-3 border-t border-muted">
                          {filteredStudents.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic text-center py-2">
                              {selectedTeam ? 'Aucune réponse pour cette équipe' : 'Aucune réponse pour le moment'}
                            </p>
                          ) : (
                            filteredStudents
                              .filter(s => {
                                // Match answers to this question (simplified - would need questionId in answers)
                                return s.response && s.response.trim().length > 0
                              })
                              .map((student) => (
                                <div key={student.id} className="text-xs p-2 bg-parchment rounded border border-muted">
                                  <p className="font-serif font-semibold text-burgundy mb-1">{student.name}</p>
                                  <p className="text-foreground italic leading-relaxed">{student.response}</p>
                                </div>
                              ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!showAnswers && questions.length > 0 && (
        <div className="mt-4 text-center text-xs text-muted-foreground italic">
          Les réponses sont masquées (Appuyez sur A pour afficher)
        </div>
      )}
    </div>
  )
}
