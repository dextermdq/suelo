import { EstadoDerivado } from './eventos'
import { diasDeLaSemana } from './semana'

export interface Tendencia {
  fecha: string
  valor: number | null // null si no hay dato
}

export interface TendenciasSemanal {
  variable: string
  promedio_7_dias: number | null
  promedio_28_dias: number | null
  tendencia: 'subiendo' | 'bajando' | 'estable' | 'sin_datos'
  datos_disponibles: number
}

/**
 * Calcula promedios móviles tolerantes a huecos.
 * No interpola ni cuenta huecos como cero.
 * Retorna null si no hay datos suficientes.
 */
export function calcularPromedioMovil(
  estado: EstadoDerivado,
  variable: string,
  fecha: string,
  dias: number,
): number | null {
  const fechaTarget = new Date(fecha)
  const valores: number[] = []

  for (let i = 0; i < dias; i++) {
    const d = new Date(fechaTarget)
    d.setDate(d.getDate() - i)
    const fechaStr = d.toISOString().split('T')[0]

    const estadoDia = estado.dias.get(fechaStr)
    if (estadoDia?.registro_diario?.[variable] !== undefined) {
      valores.push(estadoDia.registro_diario[variable])
    }
  }

  // Necesitar al menos el 50% de datos disponibles
  if (valores.length < Math.ceil(dias / 2)) {
    return null
  }

  const suma = valores.reduce((a, b) => a + b, 0)
  return suma / valores.length
}

/** Calcula tendencia comparando promedios */
export function calcularTendencia(
  promedio7: number | null,
  promedio28: number | null,
): 'subiendo' | 'bajando' | 'estable' | 'sin_datos' {
  if (!promedio7 && !promedio28) return 'sin_datos'
  if (!promedio7 || !promedio28) return 'sin_datos'

  const diff = promedio7 - promedio28
  const umbral = 1 // Tolerancia de ±1 punto

  if (Math.abs(diff) < umbral) return 'estable'
  if (diff > 0) return 'subiendo'
  return 'bajando'
}

/** Calcula tendencias semanales para una variable */
export function calcularTendenciasSemanal(
  estado: EstadoDerivado,
  variable: string,
  fecha: string,
): TendenciasSemanal {
  const promedio7 = calcularPromedioMovil(estado, variable, fecha, 7)
  const promedio28 = calcularPromedioMovil(estado, variable, fecha, 28)

  // Contar datos disponibles en 28 días
  const fechaTarget = new Date(fecha)
  let datosDisponibles = 0
  for (let i = 0; i < 28; i++) {
    const d = new Date(fechaTarget)
    d.setDate(d.getDate() - i)
    const fechaStr = d.toISOString().split('T')[0]
    const estadoDia = estado.dias.get(fechaStr)
    if (estadoDia?.registro_diario?.[variable] !== undefined) {
      datosDisponibles++
    }
  }

  return {
    variable,
    promedio_7_dias: promedio7,
    promedio_28_dias: promedio28,
    tendencia: calcularTendencia(promedio7, promedio28),
    datos_disponibles: datosDisponibles,
  }
}

/** Calcula tendencias para múltiples variables */
export function calcularTendenciasSemanales(
  estado: EstadoDerivado,
  variables: string[],
  fecha: string,
): Map<string, TendenciasSemanal> {
  const resultados = new Map<string, TendenciasSemanal>()

  for (const variable of variables) {
    const tendencia = calcularTendenciasSemanal(estado, variable, fecha)
    resultados.set(variable, tendencia)
  }

  return resultados
}
