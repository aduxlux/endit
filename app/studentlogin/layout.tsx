'use client'

export default function StudentLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment via-card to-muted">
      {children}
    </div>
  )
}

