'use client'

import { useState } from 'react'
import { Edit2, Trash2, X, Check, Users } from 'lucide-react'

interface Student {
  id: string
  name: string
  team: string
  status: 'pending' | 'answered' | 'submitted'
  response: string
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
}

export default function StudentListPanel({
  students,
  teams,
  onStudentUpdate,
  onTeamsUpdate,
}: StudentListPanelProps) {
  const [editingStudent, setEditingStudent] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTeam, setEditTeam] = useState('')

  const getTeamEmblem = (teamId: string) => {
    if (!teamId) return '○'
    return teams.find(t => t.id === teamId)?.emblem || '○'
  }

  const getTeamName = (teamId: string) => {
    if (!teamId) return 'Unassigned'
    return teams.find(t => t.id === teamId)?.name || 'Unassigned'
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
      onStudentUpdate(students.map(s => 
        s.id === editingStudent 
          ? { ...s, name: editName.trim(), team: editTeam }
          : s
      ))
      setEditingStudent(null)
      setEditName('')
      setEditTeam('')
    }
  }

  const handleDelete = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      onStudentUpdate(students.filter(s => s.id !== studentId))
    }
  }

  const handleChangeTeam = (studentId: string, newTeamId: string) => {
    onStudentUpdate(students.map(s => 
      s.id === studentId ? { ...s, team: newTeamId } : s
    ))
  }

  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <h2 className="text-2xl font-serif text-burgundy mb-4">Connected Students</h2>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {students.map((student) => {
          const isEditing = editingStudent === student.id

          return (
            <div
              key={student.id}
              className="p-3 bg-background rounded-md border border-muted hover:border-sepia transition-colors"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
                    placeholder="Student name"
                    autoFocus
                  />
                  <select
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
                  >
                    <option value="">Unassigned</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Check className="w-3 h-3 inline mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudent(null)
                        setEditName('')
                        setEditTeam('')
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80"
                    >
                      <X className="w-3 h-3 inline mr-1" />
                      Cancel
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
                        {getTeamName(student.team)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs font-serif font-semibold ${statusColor[student.status]}`}>
                      {student.status === 'pending' && '○ Waiting'}
                      {student.status === 'answered' && '✓ Answered'}
                      {student.status === 'submitted' && '✦ Submitted'}
                    </div>
                    {teams.length > 0 && (
                      <select
                        value={student.team || ''}
                        onChange={(e) => handleChangeTeam(student.id, e.target.value)}
                        className="text-xs border border-muted rounded px-1 py-0.5 bg-card"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Move to...</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-1 hover:bg-muted rounded"
                      title="Edit student"
                    >
                      <Edit2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-1 hover:bg-muted rounded text-red-600"
                      title="Delete student"
                    >
                      <Trash2 className="w-3 h-3" />
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
          No students connected yet
        </div>
      )}

      {students.length > 0 && (
        <div className="mt-4 p-3 bg-background rounded-md text-xs text-muted-foreground text-center font-serif">
          {students.length} student{students.length !== 1 ? 's' : ''} connected
        </div>
      )}
    </div>
  )
}
