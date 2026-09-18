import { Programa } from '../../config/esquema'
import { EstadoDerivado } from './eventos'
import { diasDeLaSemana, numeroSemanaISO, anoSemanaISO } from './semana'

export interface AdherenciaEjercicio {
  ejercicio_id: string
  completados: number
  necesarios: number
  porcentaje: number
}

export interface AdherenciaDia {
  fecha: string
  ejercicios_totales: number
  ejercicios_completados: number
  porcentaje: number
  tiene_registro: boolean
}

export interface AdherenciaSemanal {
  numero_semana: number
  ano: number
  lunes: string
  domingo: string
  porcentaje_general: number
  por_ejercicio: Map<string, AdherenciaEjercicio>
  por_dia: Map<string, AdherenciaDia>
  dosis_minima_cumplida: boolean
}

/** Calcula adherencia semanal */
export function calcularAdherenciaSemanal(
  estado: EstadoDerivado,
  programa: Programa,
  numeroFase: number,
  fecha: string,
): AdherenciaSemanal {
  const numeroSemana = numeroSemanaISO(fecha)
  const ano = anoSemanaISO(fecha)
  const dias = diasDeLaSemana(fecha)

  const fase = programa.fases.find((f) => f.numero === numeroFase)
  if (!fase) throw new Error(`Fase ${numeroFase} no existe`)

  const idsEjerciciosEnFase = new Set(fase.ejercicios.map((e) => e.id))
  const ejercicios = programa.ejercicios.filter((e) => idsEjerciciosEnFase.has(e.id))

  // Contadores
  let totalEjerciciosDias = 0
  let totalCompletados = 0
  const porEjercicio = new Map<string, AdherenciaEjercicio>()
  const porDia = new Map<string, AdherenciaDia>()

  // Inicializar por ejercicio
  for (const ejercicio of ejercicios) {
    porEjercicio.set(ejercicio.id, {
      ejercicio_id: ejercicio.id,
      completados: 0,
      necesarios: 0,
      porcentaje: 0,
    })
  }

  // Calcular por día
  for (const dia of dias) {
    const estadoDia = estado.dias.get(dia)
    const tieneRegistro = estadoDia?.registro_diario !== null

    let completadosEseDia = 0
    let necesariosEseDia = 0

    // Para cada ejercicio en la fase
    for (const ejercicio of ejercicios) {
      // Verificar si el ejercicio está vigente en esa fecha
      const vigente =
        ejercicio.vigencia_desde <= dia &&
        (!ejercicio.vigencia_hasta || ejercicio.vigencia_hasta > dia)

      if (!vigente) continue

      necesariosEseDia++
      totalEjerciciosDias++

      if (estadoDia?.ejercicios_marcados.has(ejercicio.id)) {
        completadosEseDia++
        totalCompletados++

        const stats = porEjercicio.get(ejercicio.id)!
        stats.completados++
      }

      const stats = porEjercicio.get(ejercicio.id)!
      stats.necesarios++
    }

    // Calcular adherencia del día
    const porcentajeDia =
      necesariosEseDia > 0 ? (completadosEseDia / necesariosEseDia) * 100 : 0

    porDia.set(dia, {
      fecha: dia,
      ejercicios_totales: necesariosEseDia,
      ejercicios_completados: completadosEseDia,
      porcentaje: porcentajeDia,
      tiene_registro: tieneRegistro,
    })
  }

  // Calcular porcentaje por ejercicio
  for (const [_id, stats] of porEjercicio) {
    stats.porcentaje =
      stats.necesarios > 0 ? (stats.completados / stats.necesarios) * 100 : 0
  }

  // Calcular adherencia general semanal
  const porcentajeGeneral =
    totalEjerciciosDias > 0 ? (totalCompletados / totalEjerciciosDias) * 100 : 0

  // Verificar dosis mínima cumplida
  const dosisMini = fase.ejercicios
    .filter((e) => e.dosis_minima)
    .map((e) => e.id)

  let dosisMiniCumplida = true
  for (const ejId of dosisMini) {
    const stats = porEjercicio.get(ejId)
    if (!stats || stats.porcentaje < 75) {
      dosisMiniCumplida = false
      break
    }
  }

  return {
    numero_semana: numeroSemana,
    ano,
    lunes: dias[0]!,
    domingo: dias[6]!,
    porcentaje_general: porcentajeGeneral,
    por_ejercicio: porEjercicio,
    por_dia: porDia,
    dosis_minima_cumplida: dosisMiniCumplida,
  }
}
