'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, Users, X, Check } from 'lucide-react'

interface Team {
  id: string
  name: string
  emblem: string
  color: string
}

interface Student {
  id: string
  name: string
  team: string
  status: string
  response: string
}

interface TeamsPanelProps {
  teams: Team[]
  selectedTeam: string | null
  onSelectTeam: (teamId: string | null) => void
  onTeamsUpdate: (teams: Team[]) => void
  students: Student[]
  onStudentsUpdate: (students: Student[]) => void
}

const EMBLEMS = ['⬢', '◆', '◇', '●', '▲', '■', '★', '✦', '⚡', '⚔', '🛡', '⚖']
const COLORS = ['#9d1f35', '#7b5a40', '#c9a34a', '#a67c52', '#8b6f47', '#6b5344', '#d4a574', '#9d7a60']

export default function TeamsPanel({ 
  teams, 
  selectedTeam, 
  onSelectTeam,
  onTeamsUpdate,
  students,
  onStudentsUpdate
}: TeamsPanelProps) {
  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamEmblem, setNewTeamEmblem] = useState(EMBLEMS[0])
  const [newTeamColor, setNewTeamColor] = useState(COLORS[0])
  const [showTeamMembers, setShowTeamMembers] = useState<string | null>(null)

  const getTeamMemberCount = (teamId: string) => {
    return students.filter(s => s.team === teamId).length
  }

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: newTeamName.trim(),
        emblem: newTeamEmblem,
        color: newTeamColor
      }
      onTeamsUpdate([...teams, newTeam])
      setNewTeamName('')
      setNewTeamEmblem(EMBLEMS[0])
      setNewTeamColor(COLORS[0])
      setIsAddingTeam(false)
    }
  }

  const handleEditTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      setEditingTeam(teamId)
      setNewTeamName(team.name)
      setNewTeamEmblem(team.emblem)
      setNewTeamColor(team.color)
    }
  }

  const handleSaveEdit = () => {
    if (editingTeam && newTeamName.trim()) {
      onTeamsUpdate(teams.map(t => 
        t.id === editingTeam 
          ? { ...t, name: newTeamName.trim(), emblem: newTeamEmblem, color: newTeamColor }
          : t
      ))
      setEditingTeam(null)
      setNewTeamName('')
    }
  }

  const handleDeleteTeam = (teamId: string) => {
    if (confirm('Are you sure you want to delete this team? Students in this team will be unassigned.')) {
      // Remove team
      onTeamsUpdate(teams.filter(t => t.id !== teamId))
      // Unassign students from this team
      onStudentsUpdate(students.map(s => 
        s.team === teamId ? { ...s, team: '' } : s
      ))
      if (selectedTeam === teamId) {
        onSelectTeam(null)
      }
    }
  }

  const handleRemoveMember = (studentId: string, teamId: string) => {
    onStudentsUpdate(students.map(s => 
      s.id === studentId ? { ...s, team: '' } : s
    ))
  }

  const handleAddMemberToTeam = (studentId: string, teamId: string) => {
    onStudentsUpdate(students.map(s => 
      s.id === studentId ? { ...s, team: teamId } : s
    ))
  }

  const teamMembers = (teamId: string) => students.filter(s => s.team === teamId)
  const unassignedStudents = students.filter(s => !s.team || s.team === '')

  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-burgundy">Teams & Groups</h2>
        <Button
          onClick={() => {
            setIsAddingTeam(!isAddingTeam)
            setEditingTeam(null)
            setNewTeamName('')
          }}
          className="text-xs bg-gold text-ink hover:bg-gold/90 font-serif"
        >
          {isAddingTeam ? 'Cancel' : '+ Add Team'}
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {teams.map((team) => {
          const isEditing = editingTeam === team.id
          const memberCount = getTeamMemberCount(team.id)
          const isExpanded = showTeamMembers === team.id

          return (
            <div key={team.id} className="border-2 rounded-md transition-all"
              style={{
                borderColor: selectedTeam === team.id ? team.color : 'var(--muted)',
                backgroundColor: selectedTeam === team.id ? `${team.color}10` : 'transparent'
              }}
            >
              <div className="p-3 flex items-center gap-3">
                <button
                  onClick={() => onSelectTeam(selectedTeam === team.id ? null : team.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span className="text-2xl">{team.emblem}</span>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <select
                            value={newTeamEmblem}
                            onChange={(e) => setNewTeamEmblem(e.target.value)}
                            className="text-sm border border-muted rounded bg-card px-2 py-1"
                          >
                            {EMBLEMS.map(em => (
                              <option key={em} value={em}>{em}</option>
                            ))}
                          </select>
                          <select
                            value={newTeamColor}
                            onChange={(e) => setNewTeamColor(e.target.value)}
                            className="text-sm border border-muted rounded bg-card px-2 py-1"
                          >
                            {COLORS.map(color => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-serif text-sm font-semibold" style={{ color: team.color }}>
                          {team.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
                      </>
                    )}
                  </div>
                </button>
                
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 hover:bg-muted rounded"
                        title="Save"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTeam(null)
                          setNewTeamName('')
                        }}
                        className="p-1 hover:bg-muted rounded"
                        title="Cancel"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowTeamMembers(isExpanded ? null : team.id)}
                        className="p-1 hover:bg-muted rounded"
                        title="Manage members"
                      >
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleEditTeam(team.id)}
                        className="p-1 hover:bg-muted rounded"
                        title="Edit team"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1 hover:bg-muted rounded text-red-600"
                        title="Delete team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-muted pt-2 space-y-2">
                  <p className="text-xs font-serif text-sepia mb-2">Team Members:</p>
                  {teamMembers(team.id).map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 bg-background rounded text-xs">
                      <span className="font-serif">{student.name}</span>
                      <button
                        onClick={() => handleRemoveMember(student.id, team.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove from team"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {unassignedStudents.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-muted">
                      <p className="text-xs font-serif text-sepia mb-2">Add Member:</p>
                      {unassignedStudents.map(student => (
                        <button
                          key={student.id}
                          onClick={() => handleAddMemberToTeam(student.id, team.id)}
                          className="w-full text-left p-2 bg-background rounded text-xs hover:bg-muted font-serif"
                        >
                          + {student.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isAddingTeam && (
        <div className="mt-4 p-3 bg-background rounded-md border border-muted space-y-2">
          <input
            type="text"
            placeholder="Team name..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTeam()
              if (e.key === 'Escape') {
                setIsAddingTeam(false)
                setNewTeamName('')
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <select
              value={newTeamEmblem}
              onChange={(e) => setNewTeamEmblem(e.target.value)}
              className="text-sm border border-muted rounded bg-card px-2 py-1"
            >
              {EMBLEMS.map(em => (
                <option key={em} value={em}>{em}</option>
              ))}
            </select>
            <select
              value={newTeamColor}
              onChange={(e) => setNewTeamColor(e.target.value)}
              className="text-sm border border-muted rounded bg-card px-2 py-1"
            >
              {COLORS.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            <Button
              onClick={handleAddTeam}
              className="text-xs bg-burgundy text-parchment hover:bg-burgundy/90"
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {teams.length === 0 && !isAddingTeam && (
        <div className="text-center py-8 text-muted-foreground text-sm font-serif italic">
          No teams yet. Click "+ Add Team" to create one.
        </div>
      )}
    </div>
  )
}
