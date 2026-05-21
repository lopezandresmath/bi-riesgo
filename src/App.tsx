import type { FC } from 'react'
import CobranzaMensual from './features/cobranza/CobranzaMensual'

const App: FC = () => (
  <div className="bg-bg min-h-screen">
    <header className="border-b border-rule bg-paper px-6 py-4">
      <h1 className="font-display text-2xl font-semibold text-ink">BI-Riesgo</h1>
    </header>
    <main className="max-w-app mx-auto px-6 py-8">
      <CobranzaMensual />
    </main>
  </div>
)

export default App
