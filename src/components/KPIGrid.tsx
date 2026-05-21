import type { FC } from 'react'
import KPICard from './KPICard'
import type { KpisMes, ClientePareto } from '../types/cobranza'
import { formatMDP, formatPct, formatInt, formatDias } from '../lib/formatters'

interface Props {
  kpis: KpisMes
  periodo: string
  clientesPareto: ClientePareto[]
}

function calcConcentracion80(clientes: ClientePareto[], total: number | null): number {
  if (!total || clientes.length === 0) return 0
  const sorted = [...clientes].sort((a, b) => b.saldo_total - a.saldo_total)
  const umbral = total * 0.8
  let acum = 0
  let count = 0
  for (const c of sorted) {
    acum += c.saldo_total
    count++
    if (acum >= umbral) break
  }
  return count
}

const KPIGrid: FC<Props> = ({ kpis, clientesPareto }) => {
  const conc80 = calcConcentracion80(clientesPareto, kpis.cartera_total)

  const diasVariante: 'default' | 'negativo' | 'warning' =
    kpis.dias_prom_ponderado !== null && kpis.dias_prom_ponderado > 60
      ? 'negativo'
      : kpis.dias_prom_ponderado !== null && kpis.dias_prom_ponderado > 30
        ? 'warning'
        : 'default'

  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard
        titulo="Cartera total"
        valor={formatMDP(kpis.cartera_total)}
        subtitulo={`${formatInt(kpis.n_facturas)} facturas · ${formatInt(kpis.n_clientes)} clientes`}
      />
      <KPICard
        titulo="Cartera corriente"
        valor={formatMDP(kpis.cartera_corriente)}
        subtitulo={`${formatPct(kpis.cartera_corriente, kpis.cartera_total)} del total`}
        variante="positivo"
      />
      <KPICard
        titulo="Cartera vencida"
        valor={formatMDP(kpis.cartera_vencida)}
        subtitulo={`Índice morosidad ${formatPct(kpis.cartera_vencida, kpis.cartera_total)}`}
        variante="negativo"
      />
      <KPICard
        titulo="Cartera crítica >60d"
        valor={formatMDP(kpis.cartera_critica)}
        subtitulo={`${formatPct(kpis.cartera_critica, kpis.cartera_total)} del total`}
        variante="negativo"
      />
      <KPICard
        titulo="Días promedio ponderado"
        valor={formatDias(kpis.dias_prom_ponderado)}
        subtitulo="Promedio ponderado por saldo"
        variante={diasVariante}
      />
      <KPICard
        titulo="En legal"
        valor={formatMDP(kpis.cartera_legal)}
        subtitulo={`${formatPct(kpis.cartera_legal, kpis.cartera_total)} del total`}
        variante="negativo"
      />
      <KPICard
        titulo="Cartera >90d"
        valor={formatMDP(kpis.cartera_mayor_90)}
        subtitulo={`${formatPct(kpis.cartera_mayor_90, kpis.cartera_total)} del total`}
        variante="negativo"
      />
      <KPICard
        titulo="Concentración 80%"
        valor={`${conc80} clientes`}
        subtitulo={`concentran el 80% · de ${formatInt(kpis.n_clientes)} totales`}
        variante="warning"
      />
    </div>
  )
}

export default KPIGrid
