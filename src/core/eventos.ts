import { z } from 'zod'

// ─── Tipos de eventos ────────────────────────────────────────────

export const tipoEventoSchema = z.enum([
  'EJERCICIO_MARCADO',
  'EJERCICIO_DESMARCADO',
  'REGISTRO_DIARIO',
  'CORRECCION',
  'FASE_CAMBIADA',
])

export type TipoEvento = z.infer<typeof tipoEventoSchema>

const eventoBaseSchema = z.object({
  id: z.string().min(1).uuid(),
  timestamp: z.number(), // milisegundos desde epoch en zona horaria local (América/Argentina/Buenos Aires)
  tipo: tipoEventoSchema,
})

export const ejercicioMarcadoSchema = eventoBaseSchema.extend({
  tipo: z.literal('EJERCICIO_MARCADO'),
  ejercicio_id: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
})

export const ejercicioDesmarcadoSchema = eventoBaseSchema.extend({
  tipo: z.literal('EJERCICIO_DESMARCADO'),
  ejercicio_id: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const registroDiarioSchema = eventoBaseSchema.extend({
  tipo: z.literal('REGISTRO_DIARIO'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valores: z.record(z.string(), z.number()), // { tension_basal: 5, control: 7, sintomas: 2 }
})

export const correccionSchema = eventoBaseSchema.extend({
  tipo: z.literal('CORRECCION'),
  evento_id_original: z.string().min(1).uuid(),
  nuevos_valores: z.record(z.string(), z.unknown()).optional(),
})

export const faseChangiadaSchema = eventoBaseSchema.extend({
  tipo: z.literal('FASE_CAMBIADA'),
  fase_anterior: z.number().int().positive().optional(),
  fase_nueva: z.number().int().positive(),
  razon: z.string().optional(),
})

export const eventoSchema = z.discriminatedUnion('tipo', [
  ejercicioMarcadoSchema,
  ejercicioDesmarcadoSchema,
  registroDiarioSchema,
  correccionSchema,
  faseChangiadaSchema,
])

export type Evento =
  | z.infer<typeof ejercicioMarcadoSchema>
  | z.infer<typeof ejercicioDesmarcadoSchema>
  | z.infer<typeof registroDiarioSchema>
  | z.infer<typeof correccionSchema>
  | z.infer<typeof faseChangiadaSchema>

// ─── Estado derivado ─────────────────────────────────────────────

export interface EstadoDiario {
  fecha: string // YYYY-MM-DD
  ejercicios_marcados: Set<string> // IDs de ejercicios completados
  registro_diario: Record<string, number> | null // valores del registro
}

export interface EstadoDerivado {
  fase_actual: number
  dias: Map<string, EstadoDiario> // fecha -> estado del día
  historial_fases: Array<{ fecha: string; fase: number; razon?: string }>
}

// ─── Reducción (log → estado derivado) ──────────────────────────

export function reducirEventos(eventos: Evento[]): EstadoDerivado {
  const estado: EstadoDerivado = {
    fase_actual: 1,
    dias: new Map(),
    historial_fases: [],
  }

  // Deduplicar por ID de evento: si hay dos con el mismo ID, usar solo el primero
  const seenIds = new Set<string>()
  const eventosUnicos = eventos.filter((e) => {
    if (seenIds.has(e.id)) return false
    seenIds.add(e.id)
    return true
  })

  // Ordenar por timestamp
  const eventosOrdenados = [...eventosUnicos].sort((a, b) => a.timestamp - b.timestamp)

  for (const evento of eventosOrdenados) {
    if (evento.tipo === 'EJERCICIO_MARCADO') {
      const dia = obtenerOInicializarDia(estado, evento.fecha)
      dia.ejercicios_marcados.add(evento.ejercicio_id)
    } else if (evento.tipo === 'EJERCICIO_DESMARCADO') {
      const dia = obtenerOInicializarDia(estado, evento.fecha)
      dia.ejercicios_marcados.delete(evento.ejercicio_id)
    } else if (evento.tipo === 'REGISTRO_DIARIO') {
      const dia = obtenerOInicializarDia(estado, evento.fecha)
      dia.registro_diario = evento.valores
    } else if (evento.tipo === 'CORRECCION') {
      // Las correcciones se aplican sobre eventos anteriores
      // Por ahora: son eventos nuevos que reemplazan (via nuevos_valores)
      // La lógica específica dependerá del tipo de evento que se corrige
    } else if (evento.tipo === 'FASE_CAMBIADA') {
      estado.fase_actual = evento.fase_nueva
      estado.historial_fases.push({
        fecha: new Date(evento.timestamp).toISOString().split('T')[0],
        fase: evento.fase_nueva,
        razon: evento.razon,
      })
    }
  }

  return estado
}

function obtenerOInicializarDia(estado: EstadoDerivado, fecha: string): EstadoDiario {
  if (!estado.dias.has(fecha)) {
    estado.dias.set(fecha, {
      fecha,
      ejercicios_marcados: new Set(),
      registro_diario: null,
    })
  }
  return estado.dias.get(fecha)!
}

// ─── Idempotencia ────────────────────────────────────────────────

export function sonEstadosIguales(a: EstadoDerivado, b: EstadoDerivado): boolean {
  if (a.fase_actual !== b.fase_actual) return false
  if (a.dias.size !== b.dias.size) return false

  for (const [fecha, diaA] of a.dias) {
    const diaB = b.dias.get(fecha)
    if (!diaB) return false
    if (diaA.ejercicios_marcados.size !== diaB.ejercicios_marcados.size) return false
    for (const id of diaA.ejercicios_marcados) {
      if (!diaB.ejercicios_marcados.has(id)) return false
    }
    if (JSON.stringify(diaA.registro_diario) !== JSON.stringify(diaB.registro_diario)) {
      return false
    }
  }

  return true
}
