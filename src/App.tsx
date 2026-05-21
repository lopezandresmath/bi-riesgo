import type { FC } from 'react'

const App: FC = () => (
  <div className="bg-bg min-h-screen p-8">
    <header className="mb-8">
      <h1 className="font-display text-4xl font-semibold text-ink">
        BI-Riesgo
      </h1>
      <p className="text-ink-3 text-sm mt-1">Design system smoke test</p>
    </header>

    <main className="max-w-app mx-auto space-y-6">
      <div className="bg-paper border border-rule rounded-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-medium text-ink mb-3">
          Tipografías
        </h2>

        <p className="font-sans text-ink mb-2">
          <span className="font-medium">Inter (sans)</span> — texto de cuerpo,
          labels y UI general. Peso 400 / 500 / 600.
        </p>

        <p className="font-display text-ink-2 mb-2">
          <span className="font-medium">Fraunces (display)</span> — títulos y
          encabezados con personalidad tipográfica.{' '}
          <em>Cursiva disponible.</em>
        </p>

        <p className="font-mono text-3xl font-semibold text-ink tabular-nums">
          1,234.56
        </p>
        <p className="font-sans text-xs text-ink-3 mt-1">
          JetBrains Mono — cifras tabulares para datos financieros
        </p>
      </div>

      <div className="bg-paper border border-rule rounded-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-medium text-ink mb-4">
          Paleta de colores
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Chip label="accent" className="bg-accent text-paper" />
          <Chip label="accent-soft" className="bg-accent-soft text-ink" />
          <Chip label="accent-bg" className="bg-accent-bg text-ink border border-rule" />
          <Chip label="neg" className="bg-neg text-paper" />
          <Chip label="neg-soft" className="bg-neg-soft text-ink" />
          <Chip label="neg-bg" className="bg-neg-bg text-ink border border-rule" />
          <Chip label="pos" className="bg-pos text-paper" />
          <Chip label="pos-bg" className="bg-pos-bg text-ink border border-rule" />
          <Chip label="warn" className="bg-warn text-paper" />
          <Chip label="warn-bg" className="bg-warn-bg text-ink border border-rule" />
          <Chip label="chip-bg" className="bg-chip-bg text-ink border border-rule" />
          <Chip label="ink-3" className="bg-ink-3 text-paper" />
        </div>
      </div>
    </main>
  </div>
)

const Chip: FC<{ label: string; className?: string }> = ({ label, className }) => (
  <div className={`rounded-pill px-3 py-2 text-xs font-mono text-center ${className ?? ''}`}>
    {label}
  </div>
)

export default App
