export interface KpisMes {
  periodo: string
  cartera_total: number | null
  cartera_corriente: number | null
  cartera_vencida: number | null
  cartera_critica: number | null
  cartera_mayor_90: number | null
  cartera_legal: number | null
  n_clientes: number | null
  n_facturas: number | null
  dias_prom_ponderado: number | null
}

export interface ClientePareto {
  no_cliente: string
  cliente: string
  saldo_total: number
}
