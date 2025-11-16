'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import type { Question } from '@/components/host/questions-answers-panel'

interface QuestionsManagementPanelProps {
  sessionId: string
  questions: Question[]
  onQuestionsUpdate: (questions: Question[]) => void
}

// Preloaded French questions about "Philosophie de l'optimisme"
const PRELOADED_QUESTIONS: Omit<Question, 'id'>[] = [
  // Easy level (3 questions)
  {
    text: "La philosophie de l'optimisme affirme que le bien est le principe fondamental de l'univers. Expliquez cette affirmation en vos propres mots.",
    level: 'easy'
  },
  {
    text: "Quels sont les principaux philosophes associés à l'optimisme philosophique? Nommez au moins deux.",
    level: 'easy'
  },
  {
    text: "Comment l'optimisme se distingue-t-il du pessimisme dans la pensée philosophique?",
    level: 'easy'
  },
  // Medium level (3 questions)
  {
    text: "Gottfried Wilhelm Leibniz a développé une théorie de l'optimisme. Expliquez sa conception du 'meilleur des mondes possibles'.",
    level: 'medium'
  },
  {
    text: "Voltaire a critiqué l'optimisme dans Candide. Quels sont les arguments principaux de cette critique?",
    level: 'medium'
  },
  {
    text: "Comment Kant a-t-il abordé la question de l'optimisme dans sa philosophie morale?",
    level: 'medium'
  },
  // Hard level (3 questions)
  {
    text: "Analysez la tension entre l'optimisme métaphysique et l'expérience du mal dans le monde. Comment les philosophes optimistes résolvent-ils ce problème?",
    level: 'hard'
  },
  {
    text: "L'optimisme philosophique peut-il être justifié face aux souffrances et injustices observables? Développez votre argumentation.",
    level: 'hard'
  },
  {
    text: "Comparez l'optimisme de Leibniz avec celui d'autres penseurs (Voltaire, Kant, ou autres). Quelles sont les différences fondamentales?",
    level: 'hard'
  }
]

const LEVEL_COLORS = {
  easy: 'bg-green-100 border-green-500 text-green-800',
  medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  hard: 'bg-red-100 border-red-500 text-red-800'
}

const LEVEL_LABELS = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile'
}

export default function QuestionsManagementPanel({
  sessionId,
  questions,
  onQuestionsUpdate
}: QuestionsManagementPanelProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newQuestionLevel, setNewQuestionLevel] = useState<'easy' | 'medium' | 'hard'>('medium')

  // Load questions from API
  useEffect(() => {
    if (!sessionId) return
    
    const loadQuestions = async () => {
      try {
        const response = await fetch(`/api/questions/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.questions) && data.questions.length > 0) {
            onQuestionsUpdate(data.questions)
          }
        }
      } catch (error) {
        console.warn('Failed to load questions from API:', error)
      }
    }
    
    loadQuestions()
  }, [sessionId, onQuestionsUpdate])

  // Save questions to API
  const saveQuestions = async (updatedQuestions: Question[]) => {
    if (!sessionId) return
    
    try {
      await fetch(`/api/questions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: updatedQuestions }),
      })
    } catch (error) {
      console.warn('Failed to save questions to API:', error)
    }
  }

  const handlePreloadQuestions = () => {
    const preloaded: Question[] = PRELOADED_QUESTIONS.map((q, index) => ({
      ...q,
      id: `preloaded-${index}-${Date.now()}`,
      order_index: index
    }))
    
    const updated = [...questions, ...preloaded]
    onQuestionsUpdate(updated)
    saveQuestions(updated)
  }

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return
    
    const newQuestion: Question = {
      id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newQuestionText,
      level: newQuestionLevel,
      order_index: questions.length
    }
    
    const updated = [...questions, newQuestion]
    onQuestionsUpdate(updated)
    saveQuestions(updated)
    
    setNewQuestionText('')
    setNewQuestionLevel('medium')
    setIsDialogOpen(false)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setNewQuestionText(question.text)
    setNewQuestionLevel(question.level)
    setIsDialogOpen(true)
  }

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !newQuestionText.trim()) return
    
    const updated = questions.map(q =>
      q.id === editingQuestion.id
        ? { ...q, text: newQuestionText, level: newQuestionLevel }
        : q
    )
    
    onQuestionsUpdate(updated)
    saveQuestions(updated)
    
    setEditingQuestion(null)
    setNewQuestionText('')
    setNewQuestionLevel('medium')
    setIsDialogOpen(false)
  }

  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question?')) return
    
    const updated = questions.filter(q => q.id !== questionId)
    onQuestionsUpdate(updated)
    saveQuestions(updated)
  }

  const questionsByLevel = {
    easy: questions.filter(q => q.level === 'easy').sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    medium: questions.filter(q => q.level === 'medium').sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    hard: questions.filter(q => q.level === 'hard').sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  }

  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-burgundy">Gestion des Questions</h2>
        <div className="flex gap-2">
          <Button
            onClick={handlePreloadQuestions}
            className="text-xs px-3 py-1 bg-gold text-ink rounded font-serif hover:bg-gold/90"
          >
            📚 Précharger
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingQuestion(null)
                  setNewQuestionText('')
                  setNewQuestionLevel('medium')
                }}
                className="text-xs px-3 py-1 bg-burgundy text-parchment rounded font-serif hover:bg-burgundy/90"
              >
                + Nouvelle Question
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-sepia">
              <DialogHeader>
                <DialogTitle className="font-serif text-burgundy">
                  {editingQuestion ? 'Modifier la Question' : 'Nouvelle Question'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Entrez le texte de la question..."
                  className="min-h-24 font-serif"
                />
                <Select value={newQuestionLevel} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewQuestionLevel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Facile (Vert)</SelectItem>
                    <SelectItem value="medium">Moyen (Jaune)</SelectItem>
                    <SelectItem value="hard">Difficile (Rouge)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                    className="flex-1 bg-burgundy hover:bg-burgundy/90 text-parchment font-serif"
                  >
                    {editingQuestion ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingQuestion(null)
                      setNewQuestionText('')
                    }}
                    variant="outline"
                    className="font-serif"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {(['easy', 'medium', 'hard'] as const).map((level) => (
          <div key={level} className="border-2 border-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-serif px-3 py-1 rounded border-2 ${LEVEL_COLORS[level]}`}>
                {LEVEL_LABELS[level]} ({questionsByLevel[level].length} questions)
              </h3>
            </div>
            <div className="space-y-2">
              {questionsByLevel[level].length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  Aucune question pour ce niveau
                </p>
              ) : (
                questionsByLevel[level].map((question) => (
                  <div
                    key={question.id}
                    className="p-3 bg-background rounded-md border border-muted hover:border-sepia transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-serif text-sm text-foreground flex-1">{question.text}</p>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEditQuestion(question)}
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2 py-1 h-auto font-serif"
                        >
                          ✏️
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuestion(question.id)}
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2 py-1 h-auto font-serif text-red-600"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

