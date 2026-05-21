import type { FC } from 'react'
import { Chart } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import type { ClientePareto } from '../../types/cobranza'

// Registrar solo los módulos que usamos (tree-shaking consciente)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
)

interface Props {
  clientes: ClientePareto[]
  periodo: string
}

const ParetoChart: FC<Props> = ({ clientes, periodo }) => {
  const top15 = [...clientes]
    .sort((a, b) => b.saldo_total - a.saldo_total)
    .slice(0, 15)

  // % acumulado sobre el total del período completo, no solo top 15
  const totalAll = clientes.reduce((sum, c) => sum + c.saldo_total, 0)

  let acumPct = 0
  const cumPcts: number[] = top15.map(c => {
    acumPct += totalAll > 0 ? (c.saldo_total / totalAll) * 100 : 0
    return Math.round(acumPct * 10) / 10
  })

  const labels = top15.map(c =>
    c.cliente.length > 15 ? c.cliente.slice(0, 15) + '…' : c.cliente,
  )

  // TypeScript no modela bien datasets heterogéneos en Chart.js;
  // se usa cast al pasar el prop — patrón oficial para mixed charts.
  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Saldo (MDP)',
        data: top15.map(c => parseFloat((c.saldo_total / 1_000_000).toFixed(2))),
        backgroundColor: '#3b6ea8',
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line' as const,
        label: '% Acumulado',
        data: cumPcts,
        borderColor: '#d97070',
        backgroundColor: 'transparent',
        pointBackgroundColor: '#d97070',
        pointRadius: 3,
        borderWidth: 2,
        yAxisID: 'y2',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Umbral 80%',
        data: Array<number>(top15.length).fill(80),
        borderColor: '#d4a04c',
        backgroundColor: 'transparent',
        borderDash: [6, 3],
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: 'y2',
        order: 0,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 12 },
          color: '#7a8da8',
          // Ocultar la leyenda del umbral — se entiende visualmente
          filter: item => item.text !== 'Umbral 80%',
        },
      },
      tooltip: {
        filter: item => item.dataset.label !== 'Umbral 80%',
        callbacks: {
          label: ctx => {
            if (ctx.dataset.label === 'Saldo (MDP)') {
              const cliente = top15[ctx.dataIndex]
              const pctInd =
                totalAll > 0
                  ? ((cliente?.saldo_total ?? 0) / totalAll * 100).toFixed(1)
                  : '0.0'
              const y = ctx.parsed.y ?? 0
              return `Saldo: ${y.toFixed(2)} MDP (${pctInd}% indiv.)`
            }
            if (ctx.dataset.label === '% Acumulado') {
              return `Acumulado: ${ctx.parsed.y}%`
            }
            return ''
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { family: 'Inter', size: 11 }, color: '#7a8da8', maxRotation: 35 },
        grid: { color: '#e2e8f0' },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Saldo (MDP)',
          font: { family: 'Inter', size: 11 },
          color: '#7a8da8',
        },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#7a8da8' },
        grid: { color: '#e2e8f0' },
      },
      y2: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: '% Acumulado',
          font: { family: 'Inter', size: 11 },
          color: '#7a8da8',
        },
        ticks: {
          font: { family: 'Inter', size: 11 },
          color: '#7a8da8',
          callback: value => `${value}%`,
        },
        // Sin grilla propia para no duplicar líneas horizontales
        grid: { drawOnChartArea: false },
      },
    },
  }

  return (
    <div>
      <h3 className="font-display text-base font-medium text-ink mb-4">
        Top 15 clientes por saldo{' '}
        <span className="font-sans font-normal text-sm text-ink-3">· {periodo}</span>
      </h3>
      <div className="relative h-80">
        <Chart
          type="bar"
          data={chartData as unknown as ChartData<'bar'>}
          options={options}
        />
      </div>
    </div>
  )
}

export default ParetoChart
