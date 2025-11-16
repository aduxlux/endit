'use client'

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
}

export default function StudentListPanel({
  students,
  teams,
  onStudentUpdate,
}: StudentListPanelProps) {
  const getTeamEmblem = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.emblem || '○'
  }

  const statusColor = {
    pending: 'text-muted-foreground',
    answered: 'text-gold',
    submitted: 'text-burgundy',
  }

  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <h2 className="text-2xl font-serif text-burgundy mb-4">Connected Students</h2>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {students.map((student) => (
          <div
            key={student.id}
            className="p-3 bg-background rounded-md border border-muted hover:border-sepia transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-lg">{getTeamEmblem(student.team)}</span>
              <div>
                <p className="font-serif text-sm text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">
                  {teams.find(t => t.id === student.team)?.name}
                </p>
              </div>
            </div>
            <div className={`text-xs font-serif font-semibold ${statusColor[student.status]}`}>
              {student.status === 'pending' && '○ Waiting'}
              {student.status === 'answered' && '✓ Answered'}
              {student.status === 'submitted' && '✦ Submitted'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-background rounded-md text-xs text-muted-foreground text-center font-serif">
        {students.length} students connected
      </div>
    </div>
  )
}
