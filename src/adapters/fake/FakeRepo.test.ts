import { describe, it, expect, beforeEach } from 'vitest'
import { FakeRepo } from './FakeRepo'
import { randomUUID } from 'crypto'

describe('FakeRepo', () => {
  let repo: FakeRepo

  beforeEach(() => {
    repo = new FakeRepo()
  })

  describe('append', () => {
    it('añade eventos', async () => {
      const evento = {
        id: randomUUID(),
        timestamp: Date.now(),
        tipo: 'EJERCICIO_MARCADO' as const,
        ejercicio_id: 'test',
        fecha: '2026-09-18',
      }

      await repo.append(evento)
      const todos = await repo.leerTodo()

      expect(todos.length).toBe(1)
      expect(todos[0].id).toBe(evento.id)
    })

    it('es idempotente: mismo ID no duplica', async () => {
      const evento = {
        id: 'mismo-id',
        timestamp: Date.now(),
        tipo: 'EJERCICIO_MARCADO' as const,
        ejercicio_id: 'test',
        fecha: '2026-09-18',
      }

      await repo.append(evento)
      await repo.append(evento)

      const todos = await repo.leerTodo()
      expect(todos.length).toBe(1)
    })
  })

  describe('leerRango', () => {
    it('retorna eventos en rango de fechas', async () => {
      const eventos = [
        {
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'EJERCICIO_MARCADO' as const,
          ejercicio_id: 'test',
          fecha: '2026-09-16',
        },
        {
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'EJERCICIO_MARCADO' as const,
          ejercicio_id: 'test',
          fecha: '2026-09-18',
        },
        {
          id: randomUUID(),
          timestamp: Date.now(),
          tipo: 'EJERCICIO_MARCADO' as const,
          ejercicio_id: 'test',
          fecha: '2026-09-20',
        },
      ]

      for (const e of eventos) await repo.append(e)

      const rango = await repo.leerRango('2026-09-17', '2026-09-19')

      expect(rango.length).toBe(1)
      expect(rango[0].fecha).toBe('2026-09-18')
    })

    it('retorna en orden de timestamp ascendente', async () => {
      const eventos = [
        {
          id: randomUUID(),
          timestamp: 3000,
          tipo: 'EJERCICIO_MARCADO' as const,
          ejercicio_id: 'test',
          fecha: '2026-09-18',
        },
        {
          id: randomUUID(),
          timestamp: 1000,
          tipo: 'EJERCICIO_MARCADO' as const,
          ejercicio_id: 'test',
          fecha: '2026-09-18',
        },
        {
          id: randomUUID(),
          timestamp: 2000,
          tipo: 'EJERCICIO_MARCADO' as const,
          ejercicio_id: 'test',
          fecha: '2026-09-18',
        },
      ]

      for (const e of eventos) await repo.append(e)

      const todos = await repo.leerTodo()

      expect(todos[0].timestamp).toBe(1000)
      expect(todos[1].timestamp).toBe(2000)
      expect(todos[2].timestamp).toBe(3000)
    })
  })

  describe('exportar e importar', () => {
    it('exporta todos los eventos', async () => {
      const evento = {
        id: randomUUID(),
        timestamp: Date.now(),
        tipo: 'EJERCICIO_MARCADO' as const,
        ejercicio_id: 'test',
        fecha: '2026-09-18',
      }

      await repo.append(evento)
      const exportado = await repo.exportar()

      expect(exportado.eventos.length).toBe(1)
      expect(exportado.version).toBe('1.0')
      expect(exportado.timestamp).toBeDefined()
    })

    it('importa eventos sin duplicar', async () => {
      const id = randomUUID()
      const evento = {
        id,
        timestamp: Date.now(),
        tipo: 'EJERCICIO_MARCADO' as const,
        ejercicio_id: 'test',
        fecha: '2026-09-18',
      }

      await repo.append(evento)

      const exportado = await repo.exportar()
      const repo2 = new FakeRepo()

      const resultado = await repo2.importar(exportado)

      expect(resultado.eventos_importados).toBe(1)

      const eventos = await repo2.leerTodo()
      expect(eventos.length).toBe(1)
    })

    it('importar dos veces es idempotente', async () => {
      const id = randomUUID()
      const evento = {
        id,
        timestamp: Date.now(),
        tipo: 'EJERCICIO_MARCADO' as const,
        ejercicio_id: 'test',
        fecha: '2026-09-18',
      }

      const repo2 = new FakeRepo()
      await repo2.append(evento)
      const exportado = await repo2.exportar()

      const repo3 = new FakeRepo()
      const resultado1 = await repo3.importar(exportado)
      const resultado2 = await repo3.importar(exportado)

      expect(resultado1.eventos_importados).toBe(1)
      expect(resultado2.eventos_importados).toBe(0) // Ya existen

      const todos = await repo3.leerTodo()
      expect(todos.length).toBe(1)
    })

    it('rechaza JSON inválido', async () => {
      await expect(repo.importar({ eventos: 'no-es-array' })).rejects.toThrow()
    })
  })

  describe('limpiar', () => {
    it('elimina todos los eventos', async () => {
      await repo.append({
        id: randomUUID(),
        timestamp: Date.now(),
        tipo: 'EJERCICIO_MARCADO' as const,
        ejercicio_id: 'test',
        fecha: '2026-09-18',
      })

      await repo.limpiar()

      const todos = await repo.leerTodo()
      expect(todos.length).toBe(0)
    })
  })
})
