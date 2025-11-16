'use client'

import { useState, useEffect } from 'react'

interface Student {
  id: string
  name: string
  team: string
  status: 'pending' | 'answered' | 'submitted'
  response: string
  lastSeen?: number
  isOnline?: boolean
}

interface Team {
  id: string
  name: string
  emblem: string
  color: string
}

interface StudentListPanelProps {
  students: Student[]
  teams: Team[]
  onStudentUpdate: (students: Student[]) => void
  onTeamsUpdate: (teams: Team[]) => void
  sessionId: string
}

export default function StudentListPanel({
  students,
  teams,
  onStudentUpdate,
  onTeamsUpdate,
  sessionId,
}: StudentListPanelProps) {
  const [editingStudent, setEditingStudent] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTeam, setEditTeam] = useState('')

  // Update online status based on last seen
  useEffect(() => {
    const updateOnlineStatus = () => {
      const now = Date.now()
      const updated = students.map(s => ({
        ...s,
        isOnline: s.lastSeen ? (now - s.lastSeen) < 30000 : false // Online if seen in last 30 seconds
      }))
      if (JSON.stringify(updated) !== JSON.stringify(students)) {
        onStudentUpdate(updated)
      }
    }

    updateOnlineStatus()
    const interval = setInterval(updateOnlineStatus, 5000)
    return () => clearInterval(interval)
  }, [students, onStudentUpdate])

  const getTeamEmblem = (teamId: string) => {
    if (!teamId) return '○'
    return teams.find(t => t.id === teamId)?.emblem || '○'
  }

  const getTeamName = (teamId: string) => {
    if (!teamId) return 'Non assigné'
    return teams.find(t => t.id === teamId)?.name || 'Non assigné'
  }

  const statusColor = {
    pending: 'text-muted-foreground',
    answered: 'text-gold',
    submitted: 'text-burgundy',
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student.id)
    setEditName(student.name)
    setEditTeam(student.team || '')
  }

  const handleSaveEdit = () => {
    if (editingStudent && editName.trim()) {
      const updated = students.map(s => 
        s.id === editingStudent 
          ? { ...s, name: editName.trim(), team: editTeam }
          : s
      )
      onStudentUpdate(updated)
      
      // Save to API
      if (sessionId) {
        fetch(`/api/students/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: updated }),
        }).catch(err => console.warn('Failed to save students:', err))
      }
      
      setEditingStudent(null)
      setEditName('')
      setEditTeam('')
    }
  }

  const handleDelete = (studentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) {
      const updated = students.filter(s => s.id !== studentId)
      onStudentUpdate(updated)
      
      // Save to API
      if (sessionId) {
        fetch(`/api/students/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: updated }),
        }).catch(err => console.warn('Failed to save students:', err))
      }
    }
  }

  const handleChangeTeam = (studentId: string, newTeamId: string) => {
    const updated = students.map(s => 
      s.id === studentId ? { ...s, team: newTeamId } : s
    )
    onStudentUpdate(updated)
    
    // Save to API
    if (sessionId) {
      fetch(`/api/students/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updated }),
      }).catch(err => console.warn('Failed to save students:', err))
    }
  }

  const onlineStudents = students.filter(s => s.isOnline)
  const offlineStudents = students.filter(s => !s.isOnline)

  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-burgundy">Étudiants Connectés</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${onlineStudents.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="font-serif">{onlineStudents.length} en ligne</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {/* Online students first */}
        {onlineStudents.map((student) => {
          const isEditing = editingStudent === student.id

          return (
            <div
              key={student.id}
              className="p-3 bg-background rounded-md border-2 border-green-500/30 hover:border-green-500/50 transition-colors"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
                    placeholder="Nom de l'étudiant"
                    autoFocus
                  />
                  <select
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
                  >
                    <option value="">Non assigné</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ✓ Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudent(null)
                        setEditName('')
                        setEditTeam('')
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80"
                    >
                      ✕ Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <span className="text-lg">{getTeamEmblem(student.team)}</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                    </div>
                    <div>
                      <p className="font-serif text-sm text-foreground font-semibold">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTeamName(student.team)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs font-serif font-semibold ${statusColor[student.status]}`}>
                      {student.status === 'pending' && '○ En attente'}
                      {student.status === 'answered' && '✓ Répondu'}
                      {student.status === 'submitted' && '✦ Soumis'}
                    </div>
                    {teams.length > 0 && (
                      <select
                        value={student.team || ''}
                        onChange={(e) => handleChangeTeam(student.id, e.target.value)}
                        className="text-xs border border-muted rounded px-1 py-0.5 bg-card"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Déplacer vers...</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                      title="Modifier l'étudiant"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-1 hover:bg-muted rounded text-red-600"
                      title="Supprimer l'étudiant"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Offline students */}
        {offlineStudents.map((student) => {
          const isEditing = editingStudent === student.id

          return (
            <div
              key={student.id}
              className="p-3 bg-background rounded-md border border-muted opacity-60 hover:opacity-100 hover:border-sepia transition-all"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
                    placeholder="Nom de l'étudiant"
                    autoFocus
                  />
                  <select
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
                  >
                    <option value="">Non assigné</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ✓ Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudent(null)
                        setEditName('')
                        setEditTeam('')
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80"
                    >
                      ✕ Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{getTeamEmblem(student.team)}</span>
                    <div>
                      <p className="font-serif text-sm text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTeamName(student.team)} • Hors ligne
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs font-serif font-semibold ${statusColor[student.status]}`}>
                      {student.status === 'pending' && '○ En attente'}
                      {student.status === 'answered' && '✓ Répondu'}
                      {student.status === 'submitted' && '✦ Soumis'}
                    </div>
                    {teams.length > 0 && (
                      <select
                        value={student.team || ''}
                        onChange={(e) => handleChangeTeam(student.id, e.target.value)}
                        className="text-xs border border-muted rounded px-1 py-0.5 bg-card"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Déplacer vers...</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                      title="Modifier l'étudiant"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-1 hover:bg-muted rounded text-red-600"
                      title="Supprimer l'étudiant"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {students.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm font-serif italic">
          Aucun étudiant connecté pour le moment
        </div>
      )}

      {students.length > 0 && (
        <div className="mt-4 p-3 bg-background rounded-md text-xs text-muted-foreground text-center font-serif">
          {onlineStudents.length} en ligne • {students.length} total
        </div>
      )}
    </div>
  )
}
