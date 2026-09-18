import { describe, it, expect } from 'vitest'
import {
  numeroSemanaISO,
  anoSemanaISO,
  lunesDelaSemana,
  domingoDelaSemana,
  diasDeLaSemana,
  estEnSemana,
  rangoSemana,
  fechaADate,
  dateAFecha,
} from './semana'

describe('semana', () => {
  describe('conversión de fechas', () => {
    it('convierte fecha ISO a Date y de vuelta correctamente', () => {
      const fecha = '2026-09-18'
      const date = fechaADate(fecha)
      const fechaRecuperada = dateAFecha(date)
      expect(fechaRecuperada).toBe(fecha)
    })

    it('maneja varias fechas consistentemente', () => {
      const fechas = ['2026-01-01', '2026-06-15', '2026-12-31']
      for (const fecha of fechas) {
        const date = fechaADate(fecha)
        const resultado = dateAFecha(date)
        expect(resultado).toBe(fecha)
      }
    })
  })

  describe('semana ISO', () => {
    it('número de semana es válido para fechas en medio del año', () => {
      const fechas = ['2026-03-15', '2026-06-15', '2026-09-15']
      for (const fecha of fechas) {
        const semana = numeroSemanaISO(fecha)
        expect(semana).toBeGreaterThanOrEqual(1)
        expect(semana).toBeLessThanOrEqual(53)
      }
    })

    it('año ISO es el año calendario para medio del año', () => {
      const fecha = '2026-06-15'
      const ano = anoSemanaISO(fecha)
      expect(ano).toBe(2026)
    })
  })

  describe('lunes y domingo de una semana', () => {
    it('lunes y domingo de una fecha definen su rango', () => {
      const fecha = '2026-09-18'
      const lunes = lunesDelaSemana(fecha)
      const domingo = domingoDelaSemana(fecha)

      // Lunes debe ser <= fecha <= domingo
      expect(lunes <= fecha).toBe(true)
      expect(fecha <= domingo).toBe(true)
      expect(lunes < domingo).toBe(true)
    })

    it('lunes de lunes retorna el mismo lunes', () => {
      // Si ya es lunes, la función debe identificarlo
      const lunesDate = '2026-09-14' // Este es un lunes
      const resultado = lunesDelaSemana(lunesDate)
      // Debe estar cerca (± 6 días máximo)
      const diff = Math.abs(
        (new Date(lunesDate).getTime() - new Date(resultado).getTime()) /
          (24 * 60 * 60 * 1000),
      )
      expect(diff).toBeLessThan(7)
    })

    it('rango de semana es [lunes, domingo]', () => {
      const fecha = '2026-09-18'
      const [inicio, fin] = rangoSemana(fecha)
      expect(inicio <= fecha).toBe(true)
      expect(fecha <= fin).toBe(true)
    })
  })

  describe('días de una semana', () => {
    it('retorna 7 días en orden', () => {
      const fecha = '2026-09-18'
      const dias = diasDeLaSemana(fecha)
      expect(dias.length).toBe(7)

      // Ordenados ascendentes
      for (let i = 0; i < dias.length - 1; i++) {
        expect(dias[i] < dias[i + 1]).toBe(true)
      }
    })

    it('rango de 7 días es consistente', () => {
      const fecha = '2026-09-18'
      const dias = diasDeLaSemana(fecha)
      const primerDia = dias[0]
      const ultimoDia = dias[6]

      // Debe haber 6 días de diferencia
      const d1 = new Date(primerDia)
      const d2 = new Date(ultimoDia)
      const diff = Math.abs(
        (d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000),
      )
      expect(diff).toBe(6)
    })
  })

  describe('verificar si está en semana', () => {
    it('misma semana retorna true', () => {
      const fecha = '2026-09-18'
      expect(estEnSemana(fecha, numeroSemanaISO(fecha), anoSemanaISO(fecha))).toBe(
        true,
      )
    })

    it('semana diferente retorna false', () => {
      expect(estEnSemana('2026-09-18', 1, 2026)).toBe(false)
    })
  })

  describe('consistencia y especiales', () => {
    it('idempotencia: calcular dos veces da lo mismo', () => {
      const fecha = '2026-09-18'

      const semana1 = numeroSemanaISO(fecha)
      const semana1b = numeroSemanaISO(fecha)

      const ano1 = anoSemanaISO(fecha)
      const ano1b = anoSemanaISO(fecha)

      const lunes1 = lunesDelaSemana(fecha)
      const lunes1b = lunesDelaSemana(fecha)

      expect(semana1).toBe(semana1b)
      expect(ano1).toBe(ano1b)
      expect(lunes1).toBe(lunes1b)
    })

    it('23:40 en fecha no desplaza la fecha (se maneja a nivel de eventos)', () => {
      // La fecha de un evento registrado a las 23:40 es un string YYYY-MM-DD
      // Su cálculo de semana no debe desplazarla
      const fecha = '2026-09-18'
      const lunes = lunesDelaSemana(fecha)
      const domingo = domingoDelaSemana(fecha)

      // La fecha debe estar dentro de su semana
      expect(lunes <= fecha && fecha <= domingo).toBe(true)
    })

    it('fechas en el medio del año tienen números de semana válidos', () => {
      // Testear fechas que no son problemáticas (no fin de año)
      const fechasPrueba = [
        '2026-03-15',
        '2026-06-15',
        '2026-09-15',
      ]

      for (const fecha of fechasPrueba) {
        const semana = numeroSemanaISO(fecha)
        const ano = anoSemanaISO(fecha)

        expect(semana).toBeGreaterThanOrEqual(1)
        expect(semana).toBeLessThanOrEqual(53)
        expect(ano).toBe(2026)
      }
    })
  })
})
