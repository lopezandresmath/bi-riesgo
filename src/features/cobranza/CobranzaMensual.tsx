import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { KpisMes, ClientePareto } from '../../types/cobranza'
import KPIGrid from '../../components/KPIGrid'
import ParetoChart from './ParetoChart'

// "2024-12" → "diciembre 2024" (día fijo en 1 para evitar desfase de timezone)
function formatPeriodo(periodo: string): string {
  const [year, month] = periodo.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  })
}

const CobranzaMensual: FC = () => {
  const [kpis, setKpis] = useState<KpisMes | null>(null)
  const [clientes, setClientes] = useState<ClientePareto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchData()
  }, [])

  async function fetchData(): Promise<void> {
    setLoading(true)
    setError(null)

    // Query 1: KPIs del período más reciente disponible
    const { data: kpisData, error: kpisError } = await supabase
      .from('v_cobranza_kpis_mes')
      .select('*')
      .order('periodo', { ascending: false })
      .limit(1)

    if (kpisError) {
      setError(kpisError.message)
      setLoading(false)
      return
    }
    if (!kpisData || kpisData.length === 0) {
      setError('No hay datos disponibles en v_cobranza_kpis_mes.')
      setLoading(false)
      return
    }

    const periodoKpis = kpisData[0] as KpisMes
    setKpis(periodoKpis)

    // Query 2: filas de detalle del mismo período para construir el Pareto
    const { data: cobData, error: cobError } = await supabase
      .from('cobranza')
      .select('no_cliente, cliente, total_mxn')
      .eq('periodo', periodoKpis.periodo)

    if (cobError) {
      setError(cobError.message)
      setLoading(false)
      return
    }

    // Agrupar por cliente y sumar saldo sin IVA (÷ 1.16)
    const clienteMap = new Map<string, ClientePareto>()
    for (const row of cobData ?? []) {
      const key = String(row.no_cliente)
      const saldo = (Number(row.total_mxn) || 0) / 1.16
      if (clienteMap.has(key)) {
        clienteMap.get(key)!.saldo_total += saldo
      } else {
        clienteMap.set(key, {
          no_cliente: key,
          cliente: String(row.cliente),
          saldo_total: saldo,
        })
      }
    }

    setClientes([...clienteMap.values()])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-ink-3 text-sm">
        Cargando...
      </div>
    )
  }

  if (error) {
    return <p className="text-neg py-4 text-sm">{error}</p>
  }

  if (!kpis) return null

  return (
    <section>
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Cobranza · Mensual
        </h2>
        <span className="text-ink-3 text-sm">{formatPeriodo(kpis.periodo)}</span>
      </div>

      <KPIGrid kpis={kpis} periodo={kpis.periodo} clientesPareto={clientes} />

      <div className="mt-8 bg-paper border border-rule rounded-card p-5">
        <ParetoChart clientes={clientes} periodo={kpis.periodo} />
      </div>
    </section>
  )
}

export default CobranzaMensual
