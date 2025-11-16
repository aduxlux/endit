'use client'

export default function StudentLayout({
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
