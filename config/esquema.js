import { z } from 'zod';
// ─── Esquemas Zod ────────────────────────────────────────────────
const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const dosisSchema = z.object({
    series: z.number().int().positive(),
    ciclos: z.number().int().positive().optional(),
    repeticiones: z.number().int().positive().optional(),
    seg_inhalacion: z.number().positive().optional(),
    seg_exhalacion: z.number().positive().optional(),
    seg_contraccion: z.number().positive().optional(),
    seg_relajacion: z.number().positive().optional(),
    descanso_entre_series: z.number().nonnegative().optional(),
});
const condicionHabilitacionSchema = z.object({
    tipo: z.literal('escenario_funcional'),
    valor_excluido: z.enum(['hipertonico', 'hipotonico', 'mixto_indeterminado']),
});
const ejercicioSchema = z.object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    pilar: z.enum(['down-training', 'movilidad', 'up-training']),
    dosis: dosisSchema,
    minutos_estimados: z.number().positive(),
    dosis_minima: z.boolean(),
    nivel_evidencia: z.enum(['alto', 'moderado', 'bajo', 'consenso_clinico']),
    habilitacion_condicion: condicionHabilitacionSchema.optional(),
    vigencia_desde: isoDateString,
    vigencia_hasta: isoDateString.nullable(),
    activo: z.boolean(),
});
const criterioSchema = z.object({
    tipo: z.enum([
        'adherencia_minima',
        'tension_basal_max',
        'tension_basal_min',
        'registros_con_tension_baja',
        'sin_empeoramiento_sintomas',
        'cambio_escenario',
    ]),
    valor: z.number().nullable(),
});
const faseSchema = z.object({
    numero: z.number().int().positive(),
    nombre: z.string().min(1),
    semanas: z.number().int().positive(),
    objetivo: z.string().min(1),
    ejercicios: z.array(z.object({
        id: z.string().min(1),
        dosis_minima: z.boolean(),
    })),
    criterios_pasaje: z.array(criterioSchema),
});
const registroDiarioVariableSchema = z.object({
    variable: z.string().min(1),
    escala_minima: z.number().int().nonnegative(),
    escala_maxima: z.number().int().positive(),
    obligatorio: z.boolean(),
    descripcion: z.string().min(1),
});
export const programaSchema = z.object({
    version: z.string(),
    fases: z.array(faseSchema).min(1),
    ejercicios: z.array(ejercicioSchema).min(1),
    registro_diario: z.array(registroDiarioVariableSchema).min(1),
});
// ─── Funciones de validación ─────────────────────────────────────
export function validarPrograma(data) {
    try {
        const programa = programaSchema.parse(data);
        return { exito: true, datos: programa };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const errores = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
            return { exito: false, errores };
        }
        return { exito: false, errores: ['Error desconocido al validar'] };
    }
}
// ─── Utilidades ──────────────────────────────────────────────────
/** Obtiene todos los ejercicios vigentes en una fecha */
export function ejerciciosVigentesFecha(programa, fecha) {
    return programa.ejercicios.filter((e) => {
        const inicioOk = e.vigencia_desde <= fecha;
        const finOk = !e.vigencia_hasta || e.vigencia_hasta > fecha;
        return e.activo && inicioOk && finOk;
    });
}
/** Obtiene los ejercicios habilitados para una fase y escenario funcional */
export function ejerciciosHabilitados(programa, numeroFase, escenarioFuncional, fecha) {
    const fase = programa.fases.find((f) => f.numero === numeroFase);
    if (!fase)
        return [];
    const vigentes = ejerciciosVigentesFecha(programa, fecha);
    const idsEnFase = new Set(fase.ejercicios.map((e) => e.id));
    return vigentes.filter((e) => {
        if (!idsEnFase.has(e.id))
            return false;
        if (!e.habilitacion_condicion)
            return true;
        // Verificar condición de habilitación
        if (e.habilitacion_condicion.tipo === 'escenario_funcional') {
            return escenarioFuncional !== e.habilitacion_condicion.valor_excluido;
        }
        return true;
    });
}
/** Obtiene la fase actual basada en número */
export function obtenerFase(programa, numeroFase) {
    return programa.fases.find((f) => f.numero === numeroFase);
}
