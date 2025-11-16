'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SummaryData {
  title: string
  introduction: string
  principles: string[]
  philosophers: Array<{ name: string; description: string }>
  quotes: string[]
  keyTakeaways: string[]
}

interface SummaryEditorProps {
  summary: SummaryData
  onUpdate: (field: keyof SummaryData, value: any) => void
  onSave: () => void
}

export default function SummaryEditor({
  summary,
  onUpdate,
  onSave,
}: SummaryEditorProps) {
  const [editTitle, setEditTitle] = useState(summary.title)
  const [editIntro, setEditIntro] = useState(summary.introduction)

  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-8">
        <Button
          onClick={onSave}
          className="bg-burgundy hover:bg-burgundy/90 text-parchment font-serif"
        >
          Save Changes
        </Button>
        <Button
          onClick={() => {
            setEditTitle(summary.title)
            setEditIntro(summary.introduction)
          }}
          className="bg-muted text-sepia hover:bg-muted/80 font-serif"
        >
          Discard
        </Button>
      </div>

      {/* Title editor */}
      <div className="bg-card border-2 border-sepia rounded-lg p-6">
        <label className="block text-sm font-serif text-sepia uppercase tracking-wide mb-3">
          Session Title
        </label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => {
            setEditTitle(e.target.value)
            onUpdate('title', e.target.value)
          }}
          className="w-full px-4 py-3 text-xl font-serif border border-muted rounded-md bg-background focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-gold"
        />
      </div>

      {/* Introduction editor */}
      <div className="bg-card border-2 border-sepia rounded-lg p-6">
        <label className="block text-sm font-serif text-sepia uppercase tracking-wide mb-3">
          Opening Discourse
        </label>
        <textarea
          value={editIntro}
          onChange={(e) => {
            setEditIntro(e.target.value)
            onUpdate('introduction', e.target.value)
          }}
          className="w-full px-4 py-3 font-serif border border-muted rounded-md bg-background focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-gold min-h-32"
        />
      </div>

      {/* Principles editor */}
      <div className="bg-card border-2 border-sepia rounded-lg p-6">
        <label className="block text-sm font-serif text-sepia uppercase tracking-wide mb-3">
          Guiding Principles
        </label>
        <div className="space-y-3">
          {summary.principles.map((principle, idx) => (
            <textarea
              key={idx}
              value={principle}
              onChange={(e) => {
                const updated = [...summary.principles]
                updated[idx] = e.target.value
                onUpdate('principles', updated)
              }}
              className="w-full px-4 py-2 font-serif text-sm border border-muted rounded-md bg-background focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-gold"
            />
          ))}
        </div>
      </div>

      {/* Quotes editor */}
      <div className="bg-card border-2 border-sepia rounded-lg p-6">
        <label className="block text-sm font-serif text-sepia uppercase tracking-wide mb-3">
          Memorable Insights
        </label>
        <div className="space-y-3">
          {summary.quotes.map((quote, idx) => (
            <textarea
              key={idx}
              value={quote}
              onChange={(e) => {
                const updated = [...summary.quotes]
                updated[idx] = e.target.value
                onUpdate('quotes', updated)
              }}
              className="w-full px-4 py-2 font-serif text-sm border border-muted rounded-md bg-background focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-gold"
            />
          ))}
        </div>
      </div>

      {/* Key Takeaways editor */}
      <div className="bg-card border-2 border-sepia rounded-lg p-6">
        <label className="block text-sm font-serif text-sepia uppercase tracking-wide mb-3">
          Key Takeaways
        </label>
        <div className="space-y-3">
          {summary.keyTakeaways.map((takeaway, idx) => (
            <textarea
              key={idx}
              value={takeaway}
              onChange={(e) => {
                const updated = [...summary.keyTakeaways]
                updated[idx] = e.target.value
                onUpdate('keyTakeaways', updated)
              }}
              className="w-full px-4 py-2 font-serif text-sm border border-muted rounded-md bg-background focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-gold"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onSave}
          className="bg-burgundy hover:bg-burgundy/90 text-parchment font-serif"
        >
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
