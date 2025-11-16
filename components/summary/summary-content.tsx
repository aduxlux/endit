'use client'

interface Philosopher {
  name: string
  description: string
}

interface SummaryData {
  title: string
  introduction: string
  principles: string[]
  philosophers: Philosopher[]
  quotes: string[]
  keyTakeaways: string[]
}

interface SummaryContentProps {
  summary: SummaryData
}

export default function SummaryContent({ summary }: SummaryContentProps) {
  return (
    <div className="space-y-12">
      {/* Title */}
      <div className="text-center animate-page-turn">
        <h2 className="text-4xl font-serif text-burgundy mb-4 text-balance">{summary.title}</h2>
        <div className="w-12 h-1 bg-gold mx-auto rounded-full" />
      </div>

      {/* Introduction */}
      <section className="bg-card border-2 border-sepia rounded-lg p-8 animate-page-turn">
        <h3 className="text-2xl font-serif text-burgundy mb-4">Opening Discourse</h3>
        <p className="text-lg font-serif text-foreground leading-relaxed text-balance">
          {summary.introduction}
        </p>
      </section>

      {/* Principles */}
      <section className="animate-page-turn">
        <h3 className="text-2xl font-serif text-burgundy mb-6">Guiding Principles</h3>
        <div className="grid gap-4">
          {summary.principles.map((principle, idx) => (
            <div
              key={idx}
              className="bg-card border-l-4 border-gold p-6 rounded-r-lg hover:shadow-lg transition-shadow"
            >
              <p className="text-foreground font-serif leading-relaxed">{principle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophers */}
      <section className="animate-page-turn">
        <h3 className="text-2xl font-serif text-burgundy mb-6">Philosophical Traditions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.philosophers.map((philosopher, idx) => (
            <div
              key={idx}
              className="bg-card border-2 border-sepia rounded-lg p-6 hover:border-burgundy transition-colors"
            >
              <h4 className="text-xl font-serif text-burgundy mb-3">{philosopher.name}</h4>
              <p className="text-foreground font-serif leading-relaxed">{philosopher.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quotes */}
      <section className="animate-page-turn">
        <h3 className="text-2xl font-serif text-burgundy mb-6">Memorable Insights</h3>
        <div className="space-y-4">
          {summary.quotes.map((quote, idx) => (
            <div
              key={idx}
              className="relative bg-yellow-50/20 border-l-4 border-gold p-6 rounded-r-lg"
            >
              <p className="text-foreground font-serif italic text-lg leading-relaxed">
                "{quote}"
              </p>
              <div className="absolute top-4 right-6 text-3xl text-gold opacity-20">✦</div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="bg-card border-2 border-sepia rounded-lg p-8 animate-page-turn">
        <h3 className="text-2xl font-serif text-burgundy mb-6">Key Takeaways</h3>
        <ol className="space-y-3">
          {summary.keyTakeaways.map((takeaway, idx) => (
            <li key={idx} className="flex gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-burgundy text-parchment font-serif text-sm flex-shrink-0">
                {idx + 1}
              </span>
              <p className="text-foreground font-serif leading-relaxed pt-1">{takeaway}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Wax seal footer */}
      <div className="text-center py-8 animate-wax-seal-drop">
        <svg
          className="w-16 h-16 mx-auto mb-4"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="45" fill="currentColor" className="text-burgundy" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" className="text-gold" />
          <text x="50" y="55" textAnchor="middle" fontSize="24" fontFamily="serif" fill="currentColor" className="text-gold">
            ✦
          </text>
        </svg>
        <p className="text-xs text-sepia font-serif uppercase tracking-wide">Philosophical Discourse Complete</p>
      </div>
    </div>
  )
}
