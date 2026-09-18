import Dexie from 'dexie';
import { eventoSchema } from '../../core/eventos';
import { z } from 'zod';
/**
 * Base de datos Dexie para el log de eventos.
 * Esquema versionado, migraciones idempotentes.
 */
class ProgramaPelvicoDB extends Dexie {
    constructor() {
        super('programa-pelvico');
        Object.defineProperty(this, "eventos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.version(1).stores({
            eventos: 'id, timestamp, fecha',
        });
    }
}
/**
 * Adaptador Repo sobre IndexedDB.
 * Validación Zod, persistencia defendida, export/import.
 */
export class IdbRepo {
    constructor() {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.db = new ProgramaPelvicoDB();
    }
    async append(evento) {
        try {
            // Validar antes de escribir
            eventoSchema.parse(evento);
            // Deduplicar por ID
            const existente = await this.db.eventos.get(evento.id);
            if (!existente) {
                await this.db.eventos.add(evento);
            }
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Evento inválido: ${error.errors[0]?.message || 'Error desconocido'}`);
            }
            if (error.name === 'QuotaExceededError') {
                throw new Error('No hay espacio disponible. Exportá y liberá almacenamiento.');
            }
            throw error;
        }
    }
    async leerRango(desde, hasta) {
        try {
            const eventos = await this.db.eventos
                .where('fecha')
                .between(desde, hasta)
                .toArray();
            return eventos.sort((a, b) => a.timestamp - b.timestamp);
        }
        catch (error) {
            throw new Error(`Error al leer rango: ${error.message}`);
        }
    }
    async leerTodo() {
        try {
            const eventos = await this.db.eventos.toArray();
            return eventos.sort((a, b) => a.timestamp - b.timestamp);
        }
        catch (error) {
            throw new Error(`Error al leer eventos: ${error.message}`);
        }
    }
    async exportar() {
        try {
            const eventos = await this.leerTodo();
            return {
                timestamp: new Date().toISOString(),
                eventos,
                version: '1.0',
            };
        }
        catch (error) {
            throw new Error(`Error al exportar: ${error.message}`);
        }
    }
    async importar(json) {
        try {
            const schema = z.object({
                eventos: z.array(eventoSchema),
            });
            const validacion = schema.safeParse(json);
            if (!validacion.success) {
                throw new Error(`Importación inválida: ${validacion.error.errors[0]?.message || 'Error desconocido'}`);
            }
            const { eventos } = validacion.data;
            let importados = 0;
            for (const evento of eventos) {
                try {
                    await this.append(evento);
                    importados++;
                }
                catch {
                    // Si un evento ya existe, es idempotente
                }
            }
            return { eventos_importados: importados };
        }
        catch (error) {
            throw new Error(`Error al importar: ${error.message}`);
        }
    }
    async limpiar() {
        try {
            await this.db.eventos.clear();
        }
        catch (error) {
            throw new Error(`Error al limpiar: ${error.message}`);
        }
    }
    /**
     * Solicita permiso para persistencia defendida.
     * Devuelve true si se otorgó, false si no.
     */
    async solicitarPersistencia() {
        if (!navigator.storage?.persist) {
            return false;
        }
        try {
            const persistido = await navigator.storage.persist();
            return persistido;
        }
        catch {
            return false;
        }
    }
    /**
     * Verifica si el almacenamiento está persistido.
     */
    async estaPersistido() {
        if (!navigator.storage?.persisted) {
            return false;
        }
        try {
            return await navigator.storage.persisted();
        }
        catch {
            return false;
        }
    }
}
