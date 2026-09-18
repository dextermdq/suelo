import Dexie, { Table } from 'dexie'
import { Repo } from '../../ports/Repo'
import { Evento, eventoSchema } from '../../core/eventos'
import { z } from 'zod'

/**
 * Base de datos Dexie para el log de eventos.
 * Esquema versionado, migraciones idempotentes.
 */
class ProgramaPelvicoDB extends Dexie {
  eventos!: Table<Evento>

  constructor() {
    super('programa-pelvico')
    this.version(1).stores({
      eventos: 'id, timestamp, fecha',
    })
  }
}

/**
 * Adaptador Repo sobre IndexedDB.
 * Validación Zod, persistencia defendida, export/import.
 */
export class IdbRepo implements Repo {
  private db: ProgramaPelvicoDB

  constructor() {
    this.db = new ProgramaPelvicoDB()
  }

  async append(evento: Evento): Promise<void> {
    try {
      // Validar antes de escribir
      eventoSchema.parse(evento)

      // Deduplicar por ID
      const existente = await this.db.eventos.get(evento.id)
      if (!existente) {
        await this.db.eventos.add(evento)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Evento inválido: ${error.errors[0]?.message || 'Error desconocido'}`)
      }
      if ((error as any).name === 'QuotaExceededError') {
        throw new Error(
          'No hay espacio disponible. Exportá y liberá almacenamiento.',
        )
      }
      throw error
    }
  }

  async leerRango(desde: string, hasta: string): Promise<Evento[]> {
    try {
      const eventos = await this.db.eventos
        .where('fecha')
        .between(desde, hasta)
        .toArray()

      return eventos.sort((a, b) => a.timestamp - b.timestamp)
    } catch (error) {
      throw new Error(`Error al leer rango: ${(error as Error).message}`)
    }
  }

  async leerTodo(): Promise<Evento[]> {
    try {
      const eventos = await this.db.eventos.toArray()
      return eventos.sort((a, b) => a.timestamp - b.timestamp)
    } catch (error) {
      throw new Error(`Error al leer eventos: ${(error as Error).message}`)
    }
  }

  async exportar(): Promise<{
    timestamp: string
    eventos: Evento[]
    version: string
  }> {
    try {
      const eventos = await this.leerTodo()

      return {
        timestamp: new Date().toISOString(),
        eventos,
        version: '1.0',
      }
    } catch (error) {
      throw new Error(`Error al exportar: ${(error as Error).message}`)
    }
  }

  async importar(json: unknown): Promise<{ eventos_importados: number }> {
    try {
      const schema = z.object({
        eventos: z.array(eventoSchema),
      })

      const validacion = schema.safeParse(json)
      if (!validacion.success) {
        throw new Error(
          `Importación inválida: ${validacion.error.errors[0]?.message || 'Error desconocido'}`,
        )
      }

      const { eventos } = validacion.data
      let importados = 0

      for (const evento of eventos) {
        try {
          await this.append(evento)
          importados++
        } catch {
          // Si un evento ya existe, es idempotente
        }
      }

      return { eventos_importados: importados }
    } catch (error) {
      throw new Error(`Error al importar: ${(error as Error).message}`)
    }
  }

  async limpiar(): Promise<void> {
    try {
      await this.db.eventos.clear()
    } catch (error) {
      throw new Error(`Error al limpiar: ${(error as Error).message}`)
    }
  }

  /**
   * Solicita permiso para persistencia defendida.
   * Devuelve true si se otorgó, false si no.
   */
  async solicitarPersistencia(): Promise<boolean> {
    if (!navigator.storage?.persist) {
      return false
    }

    try {
      const persistido = await navigator.storage.persist()
      return persistido
    } catch {
      return false
    }
  }

  /**
   * Verifica si el almacenamiento está persistido.
   */
  async estaPersistido(): Promise<boolean> {
    if (!navigator.storage?.persisted) {
      return false
    }

    try {
      return await navigator.storage.persisted()
    } catch {
      return false
    }
  }
}
