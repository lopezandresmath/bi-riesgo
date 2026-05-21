export function formatMDP(n: number | null): string {
  if (n === null) return '—'
  return (
    (n / 1_000_000).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' MDP'
  )
}

export function formatPct(n: number | null, total: number | null): string {
  if (n === null || total === null || total === 0) return '—'
  return (
    ((n / total) * 100).toLocaleString('es-MX', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + '%'
  )
}

export function formatInt(n: number | null): string {
  if (n === null) return '—'
  return Math.round(n).toLocaleString('es-MX')
}

export function formatDias(n: number | null): string {
  if (n === null) return '—'
  return Math.round(n) + ' días'
}
