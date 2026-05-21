"""
seed_data.py
Genera datos ficticios realistas de cobranza e inserta en Supabase.

Especificaciones:
- 12 meses de datos (periodos 2024-01 a 2024-12)
- ~180 facturas por mes
- Distribución Pareto en clientes: top 20% concentra ~80% del saldo
- en_legal: 6-8% de facturas por mes
- dias_vencidos: enteros no negativos (0 = corriente)
- total_mxn: con IVA (1.16)
- Distribución realista de antigüedad: mayoría corriente o <30 días,
  cola larga hacia buckets mayores
"""

import os
import random
import math
from datetime import date, timedelta
from dotenv import load_dotenv
from supabase import create_client

# ── Configuración ──────────────────────────────────────────────────────────────

load_dotenv(".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan variables de entorno. Revisa .env.local")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

random.seed(42)  # Semilla fija para reproducibilidad

# ── Catálogos ficticios ────────────────────────────────────────────────────────

# 30 clientes ficticios con pesos Pareto: los primeros concentran más saldo
CLIENTES = [
    ("C001", "Transportes Del Norte SA"),
    ("C002", "Flota Express MX"),
    ("C003", "Logística Central SC"),
    ("C004", "Arrendadora Vial SA"),
    ("C005", "Movimiento Rápido SRL"),
    ("C006", "Distribuidora Omega"),
    ("C007", "Carga y Rutas SA"),
    ("C008", "Fletes Modernos SC"),
    ("C009", "Vehículos Industriales MX"),
    ("C010", "Transportadora Alianza"),
    ("C011", "Rutas del Pacífico SA"),
    ("C012", "Servicios Viales Norte"),
    ("C013", "Movilidad Empresarial SC"),
    ("C014", "Flotilla Integral MX"),
    ("C015", "Carga Pesada del Bajío"),
    ("C016", "Transportes Frontera SA"),
    ("C017", "Logística del Centro"),
    ("C018", "Rutas y Servicios SC"),
    ("C019", "Flota Nacional MX"),
    ("C020", "Distribución Express SA"),
    ("C021", "Transportes Olmeca"),
    ("C022", "Servicios Logísticos DF"),
    ("C023", "Carga Sur SA"),
    ("C024", "Flotilla Peninsular SC"),
    ("C025", "Movilidad del Golfo"),
    ("C026", "Transportes Tolteca SA"),
    ("C027", "Rutas Industriales MX"),
    ("C028", "Fletes del Noreste SC"),
    ("C029", "Logística Bajacaliforniana"),
    ("C030", "Servicios de Flota SA"),
]

# Pesos Pareto: cliente 1 tiene peso 30, cliente 30 tiene peso ~1
# Esto concentra el volumen en los primeros clientes
PESOS_CLIENTES = [max(1, int(30 * math.exp(-0.15 * i))) for i in range(30)]

EJECUTIVOS = ["García López", "Martínez Torres", "Hernández Ruiz",
              "López Sánchez", "González Flores"]

ORGANIZACION = "Arrendadora Flota MX SA de CV"

PERIODOS = [f"2024-{m:02d}" for m in range(1, 13)]

# ── Generación de dias_vencidos con distribución realista ─────────────────────

def generar_dias_vencidos():
    """
    Distribución aproximada de una cartera real:
    ~55% corriente (0 días)
    ~20% 1-29 días
    ~10% 30-59 días
    ~7%  60-89 días
    ~4%  90-179 días
    ~4%  180+ días
    """
    r = random.random()
    if r < 0.55:
        return 0
    elif r < 0.75:
        return random.randint(1, 29)
    elif r < 0.85:
        return random.randint(30, 59)
    elif r < 0.92:
        return random.randint(60, 89)
    elif r < 0.96:
        return random.randint(90, 179)
    else:
        return random.randint(180, 450)

# ── Generación de montos con distribución log-normal ─────────────────────────

def generar_monto_mxn(no_cliente_idx: int) -> float:
    """
    Montos en MXN con IVA. Log-normal para evitar negativos y tener cola larga.
    Clientes con índice menor (más grandes) tienen montos base más altos.
    """
    # Top 5 clientes tienen facturas más grandes en promedio
    if no_cliente_idx < 5:
        media_log = 13.5   # ~$730k MXN promedio
    elif no_cliente_idx < 15:
        media_log = 12.5   # ~$270k MXN promedio
    else:
        media_log = 11.5   # ~$100k MXN promedio

    monto = random.lognormvariate(media_log, 0.6)
    # Redondear a centavos y aplicar IVA
    monto_sin_iva = round(monto, 2)
    return round(monto_sin_iva * 1.16, 2)

# ── Generador principal ───────────────────────────────────────────────────────

def generar_facturas(periodo: str, n: int = 180) -> list[dict]:
    """Genera n facturas ficticias para un período dado."""
    año, mes = int(periodo[:4]), int(periodo[5:])
    registros = []

    for i in range(n):
        # Seleccionar cliente con distribución Pareto
        cliente_idx = random.choices(range(30), weights=PESOS_CLIENTES, k=1)[0]
        no_cliente, cliente = CLIENTES[cliente_idx]

        dias_vencidos = generar_dias_vencidos()
        total_mxn = generar_monto_mxn(cliente_idx)

        # fecha_documento: dentro del mes del período
        dia = random.randint(1, 28)
        fecha_documento = date(año, mes, dia)

        # en_legal: solo facturas con >90 días pueden estar en legal, ~25% de ellas
        en_legal = "NO"
        if dias_vencidos > 90 and random.random() < 0.25:
            en_legal = "SI"

        registros.append({
            "periodo":         periodo,
            "en_legal":        en_legal,
            "organizacion":    ORGANIZACION,
            "no_cliente":      no_cliente,
            "cliente":         cliente,
            "documento":       f"FAC-{periodo}-{i+1:04d}",
            "fecha_documento": fecha_documento.isoformat(),
            "dias_vencidos":   dias_vencidos,
            "ejecutivo":       random.choice(EJECUTIVOS),
            "total_mxn":       total_mxn,
        })

    return registros

# ── Inserción en Supabase ─────────────────────────────────────────────────────

def insertar_periodo(periodo: str):
    facturas = generar_facturas(periodo)

    # Insertar en lotes de 100 para no saturar la API
    lote = 100
    for inicio in range(0, len(facturas), lote):
        fragmento = facturas[inicio:inicio + lote]
        resultado = supabase.table("cobranza").insert(fragmento).execute()
        print(f"  {periodo} | lote {inicio//lote + 1}: {len(fragmento)} filas insertadas")

    return len(facturas)

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Iniciando carga de datos ficticios en Supabase...\n")

    total = 0
    for periodo in PERIODOS:
        print(f"Período {periodo}:")
        n = insertar_periodo(periodo)
        total += n

    print(f"\nListo. {total} filas insertadas en {len(PERIODOS)} períodos.")
    print("Verifica en Supabase → Table Editor → cobranza.")