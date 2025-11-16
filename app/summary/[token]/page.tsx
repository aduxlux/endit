'use client'

import { useState, useEffect } from 'react'
import SummaryLayout from '@/components/summary/summary-layout'
import SummaryContent from '@/components/summary/summary-content'
import SummaryEditor from '@/components/summary/summary-editor'

interface SummaryData {
  title: string
  introduction: string
  principles: string[]
  philosophers: Array<{ name: string; description: string }>
  quotes: string[]
  keyTakeaways: string[]
  token: string
  isEditable: boolean
}

export default function SummaryPage({ params }: { params: { token: string } }) {
  const [isHost, setIsHost] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [summary, setSummary] = useState<SummaryData>({
    title: 'The Nature of the Good Life: A Philosophical Inquiry',
    introduction:
      'Today we gathered as members of the Academy to explore one of philosophy\'s most enduring questions: What constitutes the good life? Through rigorous discourse and thoughtful consideration, we examined the perspectives of four great philosophical traditions.',
    principles: [
      'The good life is achieved through virtue and the pursuit of wisdom',
      'Happiness (Eudaimonia) is the highest human good',
      'Understanding oneself is prerequisite to living well',
      'Community and friendship play essential roles in human flourishing',
    ],
    philosophers: [
      {
        name: 'Plato',
        description: 'Sought eternal forms and perfect ideals through reason and contemplation.',
      },
      {
        name: 'Aristotle',
        description: 'Emphasized virtue as habit and the fulfillment of human potential through excellence.',
      },
      {
        name: 'The Stoics',
        description: 'Advocated for virtue through reason and acceptance of what lies beyond our control.',
      },
      {
        name: 'Epicurus',
        description: 'Promoted modest living and friendship as paths to freedom from pain and fear.',
      },
    ],
    quotes: [
      'Know thyself. — Inscription at the Temple of Apollo',
      'The good life is a process, not a state of being. — Aristotle',
      'Virtue is sufficient for happiness. — Zeno of Citium',
      'Not what we have, but what we enjoy, constitutes our abundance. — Epicurus',
    ],
    keyTakeaways: [
      'Virtue and wisdom are central to all philosophical understandings of the good life',
      'The good life requires both personal development and community engagement',
      'Different paths to happiness reflect different values and priorities',
      'Philosophical inquiry itself is a key component of living well',
    ],
    token: params.token,
    isEditable: true, // In production, check if user is host
  })

  // Mock host check - in production would verify user
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hostMode = urlParams.get('host') === 'true'
    setIsHost(hostMode)
  }, [])

  const handleUpdate = (field: keyof SummaryData, value: any) => {
    setSummary((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <SummaryLayout token={params.token} isHost={isHost} onEditToggle={setIsEditing}>
      {isEditing && isHost ? (
        <SummaryEditor summary={summary} onUpdate={handleUpdate} onSave={() => setIsEditing(false)} />
      ) : (
        <SummaryContent summary={summary} />
      )}
    </SummaryLayout>
  )
}
