/**
 * Contract test: ambos adaptadores (fake e idb) pasan los mismos tests.
 * Asegura que el contrato Repo se cumple identicamente.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { FakeRepo } from './fake/FakeRepo';
import { randomUUID } from 'crypto';
// Importar IdbRepo solo en ambiente con IndexedDB
let IdbRepo = null;
try {
    // @ts-ignore
    global.indexedDB = require('fake-indexeddb');
    // @ts-ignore
    global.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
    IdbRepo = require('./idb/IdbRepo').IdbRepo;
}
catch {
    // IndexedDB no disponible, solo tests fake
}
function describeRepo(nombre, RepoClass) {
    describe(`Repo contract: ${nombre}`, () => {
        let repo;
        beforeEach(async () => {
            repo = new RepoClass();
            await repo.limpiar();
        });
        describe('append e idempotencia', () => {
            it('append agrega evento', async () => {
                const evento = {
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'EJERCICIO_MARCADO',
                    ejercicio_id: 'test',
                    fecha: '2026-09-18',
                };
                await repo.append(evento);
                const todos = await repo.leerTodo();
                expect(todos.length).toBe(1);
                expect(todos[0].id).toBe(evento.id);
            });
            it('append es idempotente', async () => {
                const id = randomUUID();
                const evento = {
                    id,
                    timestamp: Date.now(),
                    tipo: 'EJERCICIO_MARCADO',
                    ejercicio_id: 'test',
                    fecha: '2026-09-18',
                };
                await repo.append(evento);
                await repo.append(evento);
                const todos = await repo.leerTodo();
                expect(todos.length).toBe(1);
            });
        });
        describe('leerRango', () => {
            it('lee eventos en rango de fechas', async () => {
                const eventos = [
                    {
                        id: randomUUID(),
                        timestamp: 1000,
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: 'test',
                        fecha: '2026-09-16',
                    },
                    {
                        id: randomUUID(),
                        timestamp: 2000,
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: 'test',
                        fecha: '2026-09-18',
                    },
                    {
                        id: randomUUID(),
                        timestamp: 3000,
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: 'test',
                        fecha: '2026-09-20',
                    },
                ];
                for (const e of eventos)
                    await repo.append(e);
                const rango = await repo.leerRango('2026-09-17', '2026-09-19');
                expect(rango.length).toBe(1);
                expect(rango[0].fecha).toBe('2026-09-18');
            });
            it('retorna en orden de timestamp ascendente', async () => {
                const eventos = [
                    {
                        id: randomUUID(),
                        timestamp: 3000,
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: 'test',
                        fecha: '2026-09-18',
                    },
                    {
                        id: randomUUID(),
                        timestamp: 1000,
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: 'test',
                        fecha: '2026-09-18',
                    },
                ];
                for (const e of eventos)
                    await repo.append(e);
                const todos = await repo.leerTodo();
                expect(todos[0].timestamp).toBe(1000);
                expect(todos[1].timestamp).toBe(3000);
            });
        });
        describe('exportar e importar', () => {
            it('exporta e importa mantiene datos', async () => {
                const evento = {
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'EJERCICIO_MARCADO',
                    ejercicio_id: 'test',
                    fecha: '2026-09-18',
                };
                await repo.append(evento);
                const exportado = await repo.exportar();
                const repo2 = new RepoClass();
                await repo2.limpiar();
                const resultado = await repo2.importar(exportado);
                expect(resultado.eventos_importados).toBe(1);
                const eventos = await repo2.leerTodo();
                expect(eventos.length).toBe(1);
                expect(eventos[0].id).toBe(evento.id);
            });
            it('importar es idempotente', async () => {
                const evento = {
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'EJERCICIO_MARCADO',
                    ejercicio_id: 'test',
                    fecha: '2026-09-18',
                };
                const repo2 = new RepoClass();
                await repo2.limpiar();
                await repo2.append(evento);
                const exportado = await repo2.exportar();
                const repo3 = new RepoClass();
                await repo3.limpiar();
                const r1 = await repo3.importar(exportado);
                const r2 = await repo3.importar(exportado);
                expect(r1.eventos_importados).toBe(1);
                expect(r2.eventos_importados).toBe(0);
            });
        });
        describe('errores', () => {
            it('rechaza JSON inválido', async () => {
                await expect(repo.importar({ eventos: 'no-es-array' })).rejects.toThrow();
            });
        });
    });
}
// Ejecutar contract tests para ambos adaptadores
describeRepo('FakeRepo', FakeRepo);
if (IdbRepo) {
    describeRepo('IdbRepo', IdbRepo);
}
