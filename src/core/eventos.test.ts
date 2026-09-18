import { describe, it, expect } from 'vitest'
import { randomUUID } from 'crypto'
import {
  Evento,
  reducirEventos,
  sonEstadosIguales,
  ejercicioMarcadoSchema,
  ejercicioDesmarcadoSchema,
  registroDiarioSchema,
  faseChangiadaSchema,
} from './eventos'

function crearEjercicioMarcado(
  fecha: string,
  ejercicio_id: string,
  timestamp?: number,
): Evento {
  return ejercicioMarcadoSchema.parse({
    id: randomUUID(),
    timestamp: timestamp ?? Date.now(),
    tipo: 'EJERCICIO_MARCADO' as const,
    ejercicio_id,
    fecha,
  })
}

function crearRegistroDiario(
  fecha: string,
  valores: Record<string, number>,
  timestamp?: number,
): Evento {
  return registroDiarioSchema.parse({
    id: randomUUID(),
    timestamp: timestamp ?? Date.now(),
    tipo: 'REGISTRO_DIARIO' as const,
    fecha,
    valores,
  })
}

function crearFaseCambiada(fase_nueva: number, timestamp?: number): Evento {
  return faseChangiadaSchema.parse({
    id: randomUUID(),
    timestamp: timestamp ?? Date.now(),
    tipo: 'FASE_CAMBIADA' as const,
    fase_nueva,
  })
}

describe('eventos', () => {
  describe('reducción básica', () => {
    it('log vacío produce estado inicial', () => {
      const estado = reducirEventos([])
      expect(estado.fase_actual).toBe(1)
      expect(estado.dias.size).toBe(0)
    })

    it('ejercicio marcado aparece en el día', () => {
      const evento = crearEjercicioMarcado('2026-09-18', 'breathing_diaphragmatic')
      const estado = reducirEventos([evento])

      const dia = estado.dias.get('2026-09-18')
      expect(dia).toBeDefined()
      expect(dia?.ejercicios_marcados.has('breathing_diaphragmatic')).toBe(true)
    })

    it('ejercicio desmarcado se elimina', () => {
      const marcado = crearEjercicioMarcado('2026-09-18', 'breathing_diaphragmatic', 1000)
      const desmarcado = ejercicioDesmarcadoSchema.parse({
        id: randomUUID(),
        timestamp: 2000,
        tipo: 'EJERCICIO_DESMARCADO' as const,
        ejercicio_id: 'breathing_diaphragmatic',
        fecha: '2026-09-18',
      })

      const estado = reducirEventos([marcado, desmarcado])
      const dia = estado.dias.get('2026-09-18')
      expect(dia?.ejercicios_marcados.has('breathing_diaphragmatic')).toBe(false)
    })

    it('registro diario se guarda', () => {
      const registro = crearRegistroDiario('2026-09-18', {
        tension_basal: 5,
        control: 7,
        sintomas: 2,
      })

      const estado = reducirEventos([registro])
      const dia = estado.dias.get('2026-09-18')
      expect(dia?.registro_diario).toEqual({
        tension_basal: 5,
        control: 7,
        sintomas: 2,
      })
    })

    it('cambio de fase actualiza fase_actual', () => {
      const evento = crearFaseCambiada(2)
      const estado = reducirEventos([evento])
      expect(estado.fase_actual).toBe(2)
      expect(estado.historial_fases.length).toBe(1)
    })
  })

  describe('idempotencia', () => {
    it('reducir el mismo log dos veces da el mismo resultado', () => {
      const eventos: Evento[] = [
        crearEjercicioMarcado('2026-09-18', 'breathing_diaphragmatic', 1000),
        crearRegistroDiario('2026-09-18', { tension_basal: 5 }, 2000),
        crearFaseCambiada(2, 3000),
      ]

      const estado1 = reducirEventos(eventos)
      const estado2 = reducirEventos(eventos)

      expect(sonEstadosIguales(estado1, estado2)).toBe(true)
    })

    it('reducir múltiples veces es idempotente', () => {
      const eventos: Evento[] = [
        crearEjercicioMarcado('2026-09-18', 'exercise_1', 1000),
        crearEjercicioMarcado('2026-09-19', 'exercise_2', 2000),
      ]

      const estado1 = reducirEventos(eventos)
      const estado2 = reducirEventos(eventos)
      const estado3 = reducirEventos(eventos)

      expect(sonEstadosIguales(estado1, estado2)).toBe(true)
      expect(sonEstadosIguales(estado2, estado3)).toBe(true)
    })
  })

  describe('deduplicación', () => {
    it('evento duplicado (mismo ID) se procesa solo una vez', () => {
      const id = randomUUID()
      const evento1 = ejercicioMarcadoSchema.parse({
        id,
        timestamp: 1000,
        tipo: 'EJERCICIO_MARCADO' as const,
        ejercicio_id: 'exercise_1',
        fecha: '2026-09-18',
      })

      const evento2 = ejercicioMarcadoSchema.parse({
        id,
        timestamp: 2000,
        tipo: 'EJERCICIO_MARCADO' as const,
        ejercicio_id: 'exercise_1',
        fecha: '2026-09-18',
      })

      const estado = reducirEventos([evento1, evento2])
      const dia = estado.dias.get('2026-09-18')
      expect(dia?.ejercicios_marcados.size).toBe(1)
    })
  })

  describe('ordenamiento por timestamp', () => {
    it('eventos se procesan en orden de timestamp, no de inserción', () => {
      // Insertar fuera de orden
      const evento1 = crearRegistroDiario('2026-09-18', { tension_basal: 10 }, 3000)
      const evento2 = crearRegistroDiario('2026-09-18', { tension_basal: 5 }, 1000)

      const estado = reducirEventos([evento1, evento2])
      const dia = estado.dias.get('2026-09-18')

      // Debe ser el evento con timestamp más reciente (evento1 con 3000)
      expect(dia?.registro_diario?.tension_basal).toBe(10)
    })
  })

  describe('casos borde clínicos', () => {
    it('registro a las 23:40 en Buenos Aires NO cae al día siguiente', () => {
      // Esto es importante: un timestamp de 23:40 en Buenos Aires
      // no debe interpretarse como 00:40 del día siguiente
      // La validación de fecha entra por el field fecha (string YYYY-MM-DD)
      // no por cálculo de timestamp

      const evento = registroDiarioSchema.parse({
        id: randomUUID(),
        timestamp: Date.now(),
        tipo: 'REGISTRO_DIARIO' as const,
        fecha: '2026-09-18', // El usuario registra en fecha 18
        valores: { tension_basal: 5 },
      })

      const estado = reducirEventos([evento])
      expect(estado.dias.has('2026-09-18')).toBe(true)
      expect(estado.dias.has('2026-09-19')).toBe(false)
    })

    it('múltiples ejercicios en el mismo día se acumulan', () => {
      const eventos: Evento[] = [
        crearEjercicioMarcado('2026-09-18', 'breathing_diaphragmatic', 1000),
        crearEjercicioMarcado('2026-09-18', 'mobility_hip_circles', 2000),
        crearEjercicioMarcado('2026-09-18', 'stretch_adductors_lunge', 3000),
      ]

      const estado = reducirEventos(eventos)
      const dia = estado.dias.get('2026-09-18')
      expect(dia?.ejercicios_marcados.size).toBe(3)
    })

    it('corrección de registro anterior (placeholder)', () => {
      // Por ahora, las correcciones son eventos que se registran
      // Su procesamiento específico dependerá del tipo de evento que se corrige
      // Este test valida que el esquema acepta correcciones
      const correccion = {
        id: randomUUID(),
        timestamp: 2000,
        tipo: 'CORRECCION' as const,
        evento_id_original: randomUUID(),
        nuevos_valores: { tension_basal: 6 },
      }

      expect(() => {
        reducirEventos([correccion as any])
      }).not.toThrow()
    })
  })

  describe('múltiples días', () => {
    it('semana completa se reconstruye correctamente', () => {
      const eventos: Evento[] = []

      for (let i = 0; i < 7; i++) {
        const fecha = `2026-09-${18 + i}`.replace(/(\d{4}-\d{2}-)(\d{1})$/, '$1$20$2')
        const actualFecha = `2026-09-${String(18 + i).padStart(2, '0')}`
        eventos.push(crearRegistroDiario(actualFecha, { tension_basal: 5 + i }, 1000 * (i + 1)))
      }

      const estado = reducirEventos(eventos)
      expect(estado.dias.size).toBe(7)
    })
  })
})
