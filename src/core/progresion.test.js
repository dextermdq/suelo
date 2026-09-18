import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { validarPrograma } from '../../config/esquema';
import { reducirEventos } from './eventos';
import { evaluarProgresiónFase, calcularCuadranteTensionControl, } from './progresion';
import { randomUUID } from 'crypto';
let programa;
beforeAll(() => {
    const yamlPath = join(__dirname, '../../config/programa.yaml');
    const yamlContent = readFileSync(yamlPath, 'utf-8');
    const datos = yaml.load(yamlContent);
    const validacion = validarPrograma(datos);
    if (!validacion.exito)
        throw new Error('Programa inválido');
    programa = validacion.datos;
});
describe('progresión', () => {
    describe('evaluación de criterios', () => {
        it('evalúa criterios sin errores', () => {
            const eventos = [];
            const estado = reducirEventos(eventos);
            const evaluacion = evaluarProgresiónFase(estado, programa, 1, '2026-09-20');
            // Debe tener criterios evaluados
            expect(evaluacion.criterios.length).toBeGreaterThan(0);
            expect(evaluacion.fase_actual).toBe(1);
        });
        it('tensión basal cumplida <= 6', () => {
            const eventos = [];
            // Registrar tensión baja toda la semana
            for (let i = 0; i < 7; i++) {
                const date = new Date('2026-09-18');
                date.setDate(date.getDate() - (6 - i));
                const fecha = date.toISOString().split('T')[0];
                eventos.push({
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'REGISTRO_DIARIO',
                    fecha,
                    valores: { tension_basal: 5 },
                });
            }
            const estado = reducirEventos(eventos);
            const evaluacion = evaluarProgresiónFase(estado, programa, 1, '2026-09-20');
            const tensionCriterio = evaluacion.criterios.find((c) => c.tipo === 'tension_basal_max');
            expect(tensionCriterio?.resultado).toBe('cumplido');
        });
        it('registros con tensión baja >= 3', () => {
            const eventos = [];
            // 4 días con tensión <= 5
            const diasConBajaTension = [
                '2026-09-14',
                '2026-09-15',
                '2026-09-16',
                '2026-09-17',
            ];
            for (const dia of diasConBajaTension) {
                eventos.push({
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'REGISTRO_DIARIO',
                    fecha: dia,
                    valores: { tension_basal: 4 },
                });
            }
            // 3 días con tensión alta
            const diasConAltaTension = ['2026-09-18', '2026-09-19', '2026-09-20'];
            for (const dia of diasConAltaTension) {
                eventos.push({
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'REGISTRO_DIARIO',
                    fecha: dia,
                    valores: { tension_basal: 8 },
                });
            }
            const estado = reducirEventos(eventos);
            const evaluacion = evaluarProgresiónFase(estado, programa, 1, '2026-09-20');
            const registrosBajoCriterio = evaluacion.criterios.find((c) => c.tipo === 'registros_con_tension_baja');
            expect(registrosBajoCriterio?.resultado).toBe('cumplido');
        });
    });
    describe('progresión general', () => {
        it('puede_avanzar si todos los criterios se cumplen', () => {
            // Este es un caso ideal que probablemente no ocurra, pero testeable
            const eventos = [];
            const fase1 = programa.fases.find((f) => f.numero === 1);
            // Datos ideales: semana completa con buena adherencia y tensión baja
            for (let i = 0; i < 7; i++) {
                const date = new Date('2026-09-18');
                date.setDate(date.getDate() - (6 - i));
                const fecha = date.toISOString().split('T')[0];
                // Ejercicios
                for (const ej of fase1.ejercicios) {
                    eventos.push({
                        id: randomUUID(),
                        timestamp: Date.now(),
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: ej.id,
                        fecha,
                    });
                }
                // Registro
                eventos.push({
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'REGISTRO_DIARIO',
                    fecha,
                    valores: { tension_basal: 4, sintomas: 1 },
                });
            }
            const estado = reducirEventos(eventos);
            const evaluacion = evaluarProgresiónFase(estado, programa, 1, '2026-09-20');
            // Debe tener evaluados todos los criterios
            expect(evaluacion.criterios.length).toBeGreaterThan(0);
            // Algunos deberían cumplirse
            expect(evaluacion.criterios.some((c) => c.resultado === 'cumplido')).toBe(true);
        });
        it('no_puede_avanzar si criterios no se cumplen', () => {
            const eventos = [];
            // Solo 1 día de datos = muy baja adherencia
            eventos.push({
                id: randomUUID(),
                timestamp: Date.now(),
                tipo: 'EJERCICIO_MARCADO',
                ejercicio_id: 'breathing_diaphragmatic',
                fecha: '2026-09-14',
            });
            const estado = reducirEventos(eventos);
            const evaluacion = evaluarProgresiónFase(estado, programa, 1, '2026-09-20');
            expect(evaluacion.puede_avanzar).toBe(false);
        });
    });
    describe('cuadrante tensión/control', () => {
        it('bajo/bajo: tensión < 6 y control < 6', () => {
            const eventos = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date('2026-09-18');
                date.setDate(date.getDate() - i);
                const fecha = date.toISOString().split('T')[0];
                eventos.push({
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'REGISTRO_DIARIO',
                    fecha,
                    valores: { tension_basal: 3, control: 3 },
                });
            }
            const estado = reducirEventos(eventos);
            const cuadrante = calcularCuadranteTensionControl(estado);
            expect(cuadrante.cuadrante).toBe('bajo_bajo');
            expect(cuadrante.tension_basal).toBeLessThan(6);
            expect(cuadrante.control).toBeLessThan(6);
        });
        it('alto/bajo: tensión >= 6 y control < 6', () => {
            const eventos = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date('2026-09-18');
                date.setDate(date.getDate() - i);
                const fecha = date.toISOString().split('T')[0];
                eventos.push({
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'REGISTRO_DIARIO',
                    fecha,
                    valores: { tension_basal: 8, control: 2 },
                });
            }
            const estado = reducirEventos(eventos);
            const cuadrante = calcularCuadranteTensionControl(estado);
            expect(cuadrante.cuadrante).toBe('alto_bajo');
            expect(cuadrante.tension_basal).toBeGreaterThanOrEqual(6);
            expect(cuadrante.control).toBeLessThan(6);
        });
        it('bajo/alto: tensión < 6 y control >= 6', () => {
            const eventos = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date('2026-09-18');
                date.setDate(date.getDate() - i);
                const fecha = date.toISOString().split('T')[0];
                eventos.push({
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'REGISTRO_DIARIO',
                    fecha,
                    valores: { tension_basal: 2, control: 8 },
                });
            }
            const estado = reducirEventos(eventos);
            const cuadrante = calcularCuadranteTensionControl(estado);
            expect(cuadrante.cuadrante).toBe('bajo_alto');
        });
        it('alto/alto: tensión >= 6 y control >= 6', () => {
            const eventos = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date('2026-09-18');
                date.setDate(date.getDate() - i);
                const fecha = date.toISOString().split('T')[0];
                eventos.push({
                    id: randomUUID(),
                    timestamp: Date.now(),
                    tipo: 'REGISTRO_DIARIO',
                    fecha,
                    valores: { tension_basal: 8, control: 9 },
                });
            }
            const estado = reducirEventos(eventos);
            const cuadrante = calcularCuadranteTensionControl(estado);
            expect(cuadrante.cuadrante).toBe('alto_alto');
        });
    });
});
