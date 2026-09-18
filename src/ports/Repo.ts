import { Evento } from '../core/eventos'

/**
 * Interfaz de persistencia. Append-only log de eventos.
 * Implementaciones: fake (en memoria), idb (IndexedDB)
 */
export interface Repo {
  /**
   * Añade un evento al log. Nunca falla.
   * Los eventos son idempotentes por ID.
   */
  append(evento: Evento): Promise<void>

  /**
   * Lee eventos en un rango de fechas (inclusive).
   * Retorna en orden de timestamp ascendente.
   */
  leerRango(desde: string, hasta: string): Promise<Evento[]>

  /**
   * Lee todos los eventos del log.
   * Puede ser costoso en bases grandes.
   */
  leerTodo(): Promise<Evento[]>

  /**
   * Exporta el log completo a JSON.
   * Incluye metadatos de exportación.
   */
  exportar(): Promise<{
    timestamp: string
    eventos: Evento[]
    version: string
  }>

  /**
   * Importa eventos desde JSON exportado.
   * Es idempotente: importar dos veces da el mismo resultado.
   * Valida con Zod antes de escribir.
   */
  importar(json: unknown): Promise<{ eventos_importados: number }>

  /**
   * Limpia todo (solo para testing).
   */
  limpiar(): Promise<void>
}
