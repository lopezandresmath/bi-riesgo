import type { FC } from 'react'

interface Props {
  titulo: string
  valor: string
  subtitulo?: string
  variante?: 'default' | 'negativo' | 'positivo' | 'warning'
}

const valorColorMap: Record<NonNullable<Props['variante']>, string> = {
  default: 'text-ink',
  negativo: 'text-neg',
  positivo: 'text-pos',
  warning: 'text-warn',
}

const KPICard: FC<Props> = ({ titulo, valor, subtitulo, variante = 'default' }) => (
  <div className="bg-paper border border-rule rounded-card p-5">
    <p className="text-xs uppercase tracking-wide text-ink-3">{titulo}</p>
    <p className={`font-mono text-2xl font-semibold mt-1 ${valorColorMap[variante]}`}>
      {valor}
    </p>
    {subtitulo && <p className="text-xs text-ink-3 mt-1">{subtitulo}</p>}
  </div>
)

export default KPICard
