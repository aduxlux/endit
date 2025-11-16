'use client'

import { useState, useEffect } from 'react'
import AnswersLayout from '@/components/answers/answers-layout'
import AnswersGrid from '@/components/answers/answers-grid'
import PresenterControls from '@/components/answers/presenter-controls'

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
  level?: string
}

export default function AnswersPage() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [filteredAnswers, setFilteredAnswers] = useState<Answer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAllAnswers, setShowAllAnswers] = useState(false)
  const [highlightedAnswerId, setHighlightedAnswerId] = useState<string | null>(null)
  const [filterTeam, setFilterTeam] = useState<string | null>(null)
  const [filterStudent, setFilterStudent] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  // Load answers from API and localStorage (using session ID)
  useEffect(() => {
    const loadAnswers = async () => {
      try {
        // Get session ID from URL
        const urlParams = new URLSearchParams(window.location.search)
        const sid = urlParams.get('session') || localStorage.getItem('host-session-id')
        setSessionId(sid || '')
        
        // Try to load from API first
        let studentAnswers: any[] = []
        if (sid) {
          try {
            const apiResponse = await fetch(`/api/answers/${sid}`)
            if (apiResponse.ok) {
              const apiData = await apiResponse.json()
              if (Array.isArray(apiData.answers) && apiData.answers.length > 0) {
                studentAnswers = apiData.answers
              }
            }
          } catch (apiError) {
            console.warn('Failed to load from API:', apiError)
          }
        }
        
        // Fallback to localStorage
        if (studentAnswers.length === 0) {
          if (sid) {
            const sessionAnswers = localStorage.getItem(`answers-${sid}`)
            if (sessionAnswers) {
              studentAnswers = JSON.parse(sessionAnswers)
            }
          }
          if (studentAnswers.length === 0) {
            studentAnswers = JSON.parse(localStorage.getItem('student-answers') || '[]')
          }
        }
        
        // Get teams (try session-specific first)
        let teams = []
        if (sid) {
          try {
            const teamsResponse = await fetch(`/api/teams/${sid}`)
            if (teamsResponse.ok) {
              const teamsData = await teamsResponse.json()
              if (Array.isArray(teamsData.teams)) {
                teams = teamsData.teams
              }
            }
          } catch (teamsError) {
            console.warn('Failed to load teams from API:', teamsError)
          }
        }
        
        if (teams.length === 0) {
          if (sid) {
            const sessionTeams = localStorage.getItem(`teams-${sid}`)
            if (sessionTeams) {
              teams = JSON.parse(sessionTeams)
            }
          }
          if (teams.length === 0) {
            teams = JSON.parse(localStorage.getItem('host-teams') || '[]')
          }
        }
        
        // Get questions to determine level
        let questions: any[] = []
        if (sid) {
          try {
            const questionsResponse = await fetch(`/api/questions/${sid}`)
            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json()
              if (Array.isArray(questionsData.questions)) {
                questions = questionsData.questions
              }
            }
          } catch (qError) {
            console.warn('Failed to load questions from API:', qError)
          }
        }
        
        const formattedAnswers: Answer[] = studentAnswers.map((answer: any) => {
          const team = teams.find((t: any) => t.id === answer.teamId)
          const question = questions.find((q: any) => q.id === answer.questionId)
          return {
            id: answer.id,
            studentId: answer.studentId,
            studentName: answer.studentName,
            teamId: answer.teamId,
            teamName: team?.name || 'Unknown Team',
            text: answer.text,
            rating: answer.rating,
            highlighted: answer.highlighted || false,
            timestamp: new Date(answer.timestamp || Date.now()),
            level: question?.level || 'unknown'
          }
        })
        
        setAnswers(formattedAnswers)
        if (formattedAnswers.length > 0 && currentIndex >= formattedAnswers.length) {
          setCurrentIndex(0)
        }
      } catch (error) {
        console.error('Error loading answers:', error)
      }
    }
    
    loadAnswers()
    // Poll for new answers
    const interval = setInterval(loadAnswers, 2000)
    return () => clearInterval(interval)
  }, [currentIndex, sessionId])

  // Apply filters
  useEffect(() => {
    let filtered = [...answers]
    
    if (filterTeam) {
      filtered = filtered.filter(a => a.teamId === filterTeam)
    }
    if (filterStudent) {
      filtered = filtered.filter(a => a.studentId === filterStudent)
    }
    if (filterLevel) {
      filtered = filtered.filter(a => (a as any).level === filterLevel)
    }
    
    setFilteredAnswers(filtered)
    if (filtered.length > 0 && currentIndex >= filtered.length) {
      setCurrentIndex(0)
    }
  }, [answers, filterTeam, filterStudent, filterLevel, currentIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (showAllAnswers) {
          setShowAllAnswers(false)
        } else {
          setCurrentIndex((prev) => (prev + 1) % answers.length)
        }
      }
      if (e.key === 'Enter') {
        setShowAllAnswers(!showAllAnswers)
      }
      if (e.key === 'h' || e.key === 'H') {
        if (currentIndex < answers.length) {
          const answer = answers[currentIndex]
          setHighlightedAnswerId(highlightedAnswerId === answer.id ? null : answer.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, showAllAnswers, answers, highlightedAnswerId])

  const displayAnswers = filteredAnswers.length > 0 ? filteredAnswers : answers
  const teams = answers.reduce((acc, a) => {
    if (!acc.find(t => t.id === a.teamId)) {
      acc.push({ id: a.teamId, name: a.teamName })
    }
    return acc
  }, [] as { id: string; name: string }[])
  const students = answers.reduce((acc, a) => {
    if (!acc.find(s => s.id === a.studentId)) {
      acc.push({ id: a.studentId, name: a.studentName })
    }
    return acc
  }, [] as { id: string; name: string }[])

  return (
    <AnswersLayout>
      <div className="w-full h-screen flex flex-col">
        {/* Filters */}
        <div className="bg-card border-b-2 border-sepia p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-serif text-sepia">Équipe:</label>
            <select
              value={filterTeam || ''}
              onChange={(e) => setFilterTeam(e.target.value || null)}
              className="px-3 py-1 border border-sepia rounded bg-background text-foreground font-serif text-sm"
            >
              <option value="">Toutes</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-serif text-sepia">Étudiant:</label>
            <select
              value={filterStudent || ''}
              onChange={(e) => setFilterStudent(e.target.value || null)}
              className="px-3 py-1 border border-sepia rounded bg-background text-foreground font-serif text-sm"
            >
              <option value="">Tous</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-serif text-sepia">Niveau:</label>
            <select
              value={filterLevel || ''}
              onChange={(e) => setFilterLevel(e.target.value || null)}
              className="px-3 py-1 border border-sepia rounded bg-background text-foreground font-serif text-sm"
            >
              <option value="">Tous</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>
          {(filterTeam || filterStudent || filterLevel) && (
            <button
              onClick={() => {
                setFilterTeam(null)
                setFilterStudent(null)
                setFilterLevel(null)
              }}
              className="px-3 py-1 bg-sepia text-parchment rounded font-serif text-sm hover:bg-sepia/90"
            >
              Réinitialiser
            </button>
          )}
          <div className="ml-auto text-sm font-serif text-sepia">
            {displayAnswers.length} réponse{displayAnswers.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Main answers display */}
        <div className="flex-1 overflow-auto">
          {displayAnswers.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground font-serif">
                <p className="text-2xl mb-2">Aucune réponse</p>
                <p className="text-sm">Aucune réponse ne correspond aux filtres sélectionnés</p>
              </div>
            </div>
          ) : showAllAnswers ? (
            <AnswersGrid answers={displayAnswers} highlightedAnswerId={highlightedAnswerId} />
          ) : (
            <SingleAnswerView
              answer={displayAnswers[currentIndex]}
              isHighlighted={highlightedAnswerId === displayAnswers[currentIndex]?.id}
              index={currentIndex}
              total={displayAnswers.length}
            />
          )}
        </div>

        {/* Presenter controls */}
        <PresenterControls
          currentIndex={currentIndex}
          total={displayAnswers.length}
          showAllAnswers={showAllAnswers}
          onShowAllToggle={setShowAllAnswers}
          onNext={() => setCurrentIndex((prev) => (prev + 1) % displayAnswers.length)}
          onPrev={() => setCurrentIndex((prev) => (prev - 1 + displayAnswers.length) % displayAnswers.length)}
        />
      </div>
    </AnswersLayout>
  )
}

function SingleAnswerView({
  answer,
  isHighlighted,
  index,
  total,
}: {
  answer: Answer
  isHighlighted: boolean
  index: number
  total: number
}) {
  return (
    <div className="h-full w-full flex items-center justify-center p-8 bg-gradient-to-br from-parchment via-card to-muted">
      <div className="max-w-3xl w-full animate-page-turn">
        {/* Team indicator with emblem */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-card border-2 border-sepia flex items-center justify-center text-3xl">
            {(() => {
              const teams = JSON.parse(localStorage.getItem('host-teams') || '[]')
              const team = teams.find((t: any) => t.id === answer.teamId)
              return team?.emblem || '○'
            })()}
          </div>
          <div>
            <p className="text-xs font-serif text-sepia uppercase tracking-wide">Team</p>
            <p className="text-3xl font-serif text-burgundy">{answer.teamName}</p>
          </div>
        </div>

        {/* Student name */}
        <p className="text-sm font-serif text-sepia mb-4 uppercase tracking-wide">Scholar: {answer.studentName}</p>

        {/* Main answer text with gold highlight */}
        <div
          className={`p-8 rounded-lg border-2 transition-all ${
            isHighlighted
              ? 'border-gold bg-yellow-50/30 shadow-lg'
              : 'border-sepia bg-background'
          }`}
        >
          <p className={`text-2xl font-serif leading-relaxed ${
            isHighlighted ? 'text-burgundy' : 'text-foreground'
          }`}>
            {answer.text}
          </p>
        </div>

        {/* Rating with wax seals */}
        {answer.rating && (
          <div className="flex items-center gap-2 mt-8">
            <p className="text-sm font-serif text-sepia mr-2">Host Rating:</p>
            {[...Array(answer.rating)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-gold text-xs font-serif animate-wax-seal-drop"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                ✦
              </div>
            ))}
          </div>
        )}

        {/* Page indicator */}
        <div className="mt-12 text-center text-muted-foreground text-sm font-serif">
          Response {index + 1} of {total}
        </div>
      </div>
    </div>
  )
}
