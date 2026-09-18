import { Repo } from '../../ports/Repo'
import { Evento, eventoSchema } from '../../core/eventos'
import { z } from 'zod'

/**
 * Implementación fake de Repo: en memoria, para tests y dry-run.
 */
export class FakeRepo implements Repo {
  private eventos: Map<string, Evento> = new Map()

  async append(evento: Evento): Promise<void> {
    // Deduplicar por ID: si ya existe, ignorar
    if (!this.eventos.has(evento.id)) {
      this.eventos.set(evento.id, evento)
    }
  }

  async leerRango(desde: string, hasta: string): Promise<Evento[]> {
    const resultado: Evento[] = []

    for (const evento of this.eventos.values()) {
      // Los eventos están asociados a fechas en su tipo
      const fechaEvento = (evento as any).fecha
      if (fechaEvento && fechaEvento >= desde && fechaEvento <= hasta) {
        resultado.push(evento)
      }
    }

    // Ordenar por timestamp
    return resultado.sort((a, b) => a.timestamp - b.timestamp)
  }

  async leerTodo(): Promise<Evento[]> {
    const todos = Array.from(this.eventos.values())
    return todos.sort((a, b) => a.timestamp - b.timestamp)
  }

  async exportar(): Promise<{
    timestamp: string
    eventos: Evento[]
    version: string
  }> {
    const eventos = Array.from(this.eventos.values()).sort(
      (a, b) => a.timestamp - b.timestamp,
    )

    return {
      timestamp: new Date().toISOString(),
      eventos,
      version: '1.0',
    }
  }

  async importar(json: unknown): Promise<{ eventos_importados: number }> {
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
      if (!this.eventos.has(evento.id)) {
        this.eventos.set(evento.id, evento)
        importados++
      }
    }

    return { eventos_importados: importados }
  }

  async limpiar(): Promise<void> {
    this.eventos.clear()
  }
}
