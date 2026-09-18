import { describe, it, expect } from 'vitest'
import { reducirEventos } from './eventos'
import {
  calcularPromedioMovil,
  calcularTendencia,
  calcularTendenciasSemanal,
} from './tendencias'
import { randomUUID } from 'crypto'

describe('tendencias', () => {
  describe('promedio móvil', () => {
    it('calcula promedio 7 días correctamente', () => {
      const eventos: any[] = []

      // 7 días con valores: 5, 6, 7, 8, 9, 10, 5
      const valores = [5, 6, 7, 8, 9, 10, 5]
      for (let i = 0; i < 7; i++) {
        const date = new Date('2026-09-18')
        date.setDate(date.getDate() - (6 - i))
        const fecha = date.toISOString().split('T')[0]

        eventos.push({
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'REGISTRO_DIARIO',
          fecha,
          valores: { tension_basal: valores[i] },
        })
      }

      const estado = reducirEventos(eventos)
      const promedio = calcularPromedioMovil(
        estado,
        'tension_basal',
        '2026-09-18',
        7,
      )

      // (5+6+7+8+9+10+5) / 7 = 50/7 ≈ 7.14
      expect(promedio).toBeCloseTo(7.14, 1)
    })

    it('promedio 28 días requiere 50% de datos', () => {
      const eventos: any[] = []

      // Solo 10 días con datos en 28
      for (let i = 0; i < 10; i++) {
        const date = new Date('2026-09-18')
        date.setDate(date.getDate() - i * 2) // Cada dos días
        const fecha = date.toISOString().split('T')[0]

        eventos.push({
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'REGISTRO_DIARIO',
          fecha,
          valores: { tension_basal: 5 + i },
        })
      }

      const estado = reducirEventos(eventos)
      const promedio = calcularPromedioMovil(
        estado,
        'tension_basal',
        '2026-09-18',
        28,
      )

      // 10 datos es 36% de 28, menos del 50%, debe ser null
      expect(promedio).toBeNull()
    })

    it('sin datos retorna null', () => {
      const eventos: any[] = []
      const estado = reducirEventos(eventos)
      const promedio = calcularPromedioMovil(
        estado,
        'tension_basal',
        '2026-09-18',
        7,
      )
      expect(promedio).toBeNull()
    })

    it('tolera huecos en los datos', () => {
      const eventos: any[] = []

      // Datos: día 1, día 2, (hueco), día 4, día 5
      const diasConDatos = [18, 17, 15, 14]
      for (const dia of diasConDatos) {
        eventos.push({
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'REGISTRO_DIARIO',
          fecha: `2026-09-${dia}`,
          valores: { tension_basal: 5 },
        })
      }

      const estado = reducirEventos(eventos)
      const promedio = calcularPromedioMovil(
        estado,
        'tension_basal',
        '2026-09-18',
        7,
      )

      // 4 datos en 7 días (57%), debe funcionar
      expect(promedio).toBe(5)
    })
  })

  describe('cálculo de tendencia', () => {
    it('subiendo: promedio 7 > promedio 28', () => {
      const tendencia = calcularTendencia(8, 6)
      expect(tendencia).toBe('subiendo')
    })

    it('bajando: promedio 7 < promedio 28', () => {
      const tendencia = calcularTendencia(4, 6)
      expect(tendencia).toBe('bajando')
    })

    it('estable: diferencia < 1', () => {
      const tendencia = calcularTendencia(6.3, 6.0)
      expect(tendencia).toBe('estable')
    })

    it('sin datos cuando ambos null', () => {
      const tendencia = calcularTendencia(null, null)
      expect(tendencia).toBe('sin_datos')
    })

    it('sin datos cuando uno null', () => {
      const tendencia = calcularTendencia(8, null)
      expect(tendencia).toBe('sin_datos')
    })
  })

  describe('tendencias semanales', () => {
    it('calcula tendencias para una variable', () => {
      const eventos: any[] = []

      for (let i = 0; i < 7; i++) {
        const date = new Date('2026-09-18')
        date.setDate(date.getDate() - (6 - i))
        const fecha = date.toISOString().split('T')[0]

        eventos.push({
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'REGISTRO_DIARIO',
          fecha,
          valores: { tension_basal: 5 + i },
        })
      }

      const estado = reducirEventos(eventos)
      const tendencias = calcularTendenciasSemanal(
        estado,
        'tension_basal',
        '2026-09-18',
      )

      expect(tendencias.variable).toBe('tension_basal')
      expect(tendencias.promedio_7_dias).toBeDefined()
      expect(tendencias.datos_disponibles).toBe(7)
    })

    it('datos_disponibles cuenta correctamente', () => {
      const eventos: any[] = []

      for (let i = 0; i < 15; i++) {
        const date = new Date('2026-09-18')
        date.setDate(date.getDate() - i)
        const fecha = date.toISOString().split('T')[0]

        eventos.push({
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'REGISTRO_DIARIO',
          fecha,
          valores: { tension_basal: 5 },
        })
      }

      const estado = reducirEventos(eventos)
      const tendencias = calcularTendenciasSemanal(
        estado,
        'tension_basal',
        '2026-09-18',
      )

      expect(tendencias.datos_disponibles).toBe(15)
    })
  })

  describe('casos borde', () => {
    it('semana incompleta funciona', () => {
      const eventos: any[] = []

      for (let i = 0; i < 3; i++) {
        eventos.push({
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'REGISTRO_DIARIO',
          fecha: `2026-09-${18 - i}`,
          valores: { tension_basal: 5 },
        })
      }

      const estado = reducirEventos(eventos)
      const tendencias = calcularTendenciasSemanal(
        estado,
        'tension_basal',
        '2026-09-18',
      )

      expect(tendencias.tendencia).toBeDefined()
    })
  })
})
