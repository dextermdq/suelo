/**
 * Utilidades para trabajar con semanas ISO en zona horaria Buenos Aires.
 * Zona horaria: America/Argentina/Buenos_Aires (ART = UTC-3, sin horario de verano)
 *
 * Nota: Este módulo NO usa la zona horaria del navegador. Los cálculos se hacen
 * explícitamente en ART. Un evento registrado a las 23:40 ART no debe caer
 * en el día siguiente.
 */

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires'

/** Convierte una fecha ISO (YYYY-MM-DD) a un Date en UTC */
export function fechaADate(fecha: string): Date {
  const [year, month, day] = fecha.split('-').map(Number)
  // Crear en UTC
  return new Date(Date.UTC(year, month - 1, day))
}

/** Convierte un Date a fecha ISO (YYYY-MM-DD) */
export function dateAFecha(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Obtiene la fecha de hoy en Buenos Aires */
export function hoyArt(): string {
  return dateAFecha(new Date())
}

/**
 * Calcula semana ISO usando algoritmo estándar.
 * Basado en https://en.wikipedia.org/wiki/ISO_8601
 */
export function numeroSemanaISO(fecha: string): number {
  const date = fechaADate(fecha)
  const year = date.getUTCFullYear()

  // Obtener el jueves de la semana (día 4)
  const thursdayOfWeek = new Date(date)
  thursdayOfWeek.setUTCDate(
    thursdayOfWeek.getUTCDate() - date.getUTCDay() + 4,
  )

  // Obtener enero 4 del año del jueves (siempre está en semana 1)
  const jan4 = new Date(Date.UTC(thursdayOfWeek.getUTCFullYear(), 0, 4))

  // Obtener el lunes de la semana 1
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4.getUTCDay() + 1)

  // Calcular semana
  const diff = thursdayOfWeek.getTime() - monday.getTime()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  return Math.floor(diff / msPerWeek) + 1
}

/** Calcula el año de la semana ISO */
export function anoSemanaISO(fecha: string): number {
  const date = fechaADate(fecha)
  const thursdayOfWeek = new Date(date)
  thursdayOfWeek.setUTCDate(
    thursdayOfWeek.getUTCDate() - date.getUTCDay() + 4,
  )
  return thursdayOfWeek.getUTCFullYear()
}

/** Obtiene el lunes de una semana ISO (fecha: YYYY-MM-DD) */
export function lunesDelaSemana(fecha: string): string {
  const date = fechaADate(fecha)
  const year = anoSemanaISO(fecha)

  // Enero 4 siempre está en semana 1
  const jan4 = new Date(Date.UTC(year, 0, 4))

  // Lunes de semana 1
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4.getUTCDay() + 1)

  // Calcular el lunes de la semana deseada
  const weekNumber = numeroSemanaISO(fecha)
  const lunes = new Date(monday)
  lunes.setUTCDate(lunes.getUTCDate() + (weekNumber - 1) * 7)

  return dateAFecha(lunes)
}

/** Obtiene el domingo de una semana ISO */
export function domingoDelaSemana(fecha: string): string {
  const lunes = fechaADate(lunesDelaSemana(fecha))
  const domingo = new Date(lunes)
  domingo.setUTCDate(domingo.getUTCDate() + 6)
  return dateAFecha(domingo)
}

/** Obtiene todas las fechas de una semana ISO (lunes a domingo) */
export function diasDeLaSemana(fecha: string): string[] {
  const lunes = lunesDelaSemana(fecha)
  const lunesDate = fechaADate(lunes)
  const dias: string[] = []

  for (let i = 0; i < 7; i++) {
    const dia = new Date(lunesDate)
    dia.setUTCDate(dia.getUTCDate() + i)
    dias.push(dateAFecha(dia))
  }

  return dias
}

/** Verifica si una fecha cae en una semana específica */
export function estEnSemana(fecha: string, numeroSemana: number, anoSemana: number): boolean {
  return numeroSemanaISO(fecha) === numeroSemana && anoSemanaISO(fecha) === anoSemana
}

/**
 * Rango de una semana: [lunesISOString, domingoISOString]
 * Útil para queries de rango
 */
export function rangoSemana(fecha: string): [string, string] {
  return [lunesDelaSemana(fecha), domingoDelaSemana(fecha)]
}
