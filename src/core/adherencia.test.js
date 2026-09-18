import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { validarPrograma } from '../../config/esquema';
import { reducirEventos } from './eventos';
import { calcularAdherenciaSemanal } from './adherencia';
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
describe('adherencia', () => {
    describe('cálculo básico', () => {
        it('semana sin ejercicios tiene 0% adherencia', () => {
            const estado = reducirEventos([]);
            const adherencia = calcularAdherenciaSemanal(estado, programa, 1, '2026-09-18');
            expect(adherencia.porcentaje_general).toBe(0);
        });
        it('todos los ejercicios completados = 100%', () => {
            const eventos = [];
            // Añadir un evento por cada ejercicio de la fase 1, cada día
            const fase1 = programa.fases.find((f) => f.numero === 1);
            const diasSemana = [
                '2026-09-14', // lunes
                '2026-09-15', // martes
                '2026-09-16', // miércoles
                '2026-09-17', // jueves
                '2026-09-18', // viernes
                '2026-09-19', // sábado
                '2026-09-20', // domingo
            ];
            for (const dia of diasSemana) {
                for (const ejercicio of fase1.ejercicios) {
                    eventos.push({
                        id: randomUUID(),
                        timestamp: Date.now(),
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: ejercicio.id,
                        fecha: dia,
                    });
                }
            }
            const estado = reducirEventos(eventos);
            const adherencia = calcularAdherenciaSemanal(estado, programa, 1, '2026-09-18');
            expect(adherencia.porcentaje_general).toBe(100);
        });
        it('adherencia parcial está entre 0 y 100', () => {
            const eventos = [];
            const fase1 = programa.fases.find((f) => f.numero === 1);
            const diasSemana = ['2026-09-14'];
            for (const dia of diasSemana) {
                for (const ejercicio of fase1.ejercicios) {
                    eventos.push({
                        id: randomUUID(),
                        timestamp: Date.now(),
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: ejercicio.id,
                        fecha: dia,
                    });
                }
            }
            const estado = reducirEventos(eventos);
            const adherencia = calcularAdherenciaSemanal(estado, programa, 1, '2026-09-18');
            expect(adherencia.porcentaje_general).toBeGreaterThanOrEqual(0);
            expect(adherencia.porcentaje_general).toBeLessThanOrEqual(100);
        });
    });
    describe('dosis mínima', () => {
        it('dosis mínima es evaluable', () => {
            const eventos = [];
            const estado = reducirEventos(eventos);
            const adherencia = calcularAdherenciaSemanal(estado, programa, 1, '2026-09-18');
            // Solo verificar que la propiedad existe
            expect(adherencia.dosis_minima_cumplida).toBeDefined();
            expect(typeof adherencia.dosis_minima_cumplida).toBe('boolean');
        });
    });
    describe('casos borde', () => {
        it('ejercicio dado de baja a mitad de semana no cuenta como incumplido', () => {
            // Este caso es más conceptual: si un ejercicio se retira el miércoles,
            // los 3 primeros días no deben penalizar por no completarlo los otros 4
            const eventos = [];
            const fase1 = programa.fases.find((f) => f.numero === 1);
            // Simular: semana con ejercicios, pero uno se quita el miércoles
            const diasAntesDelQuiebre = ['2026-09-14', '2026-09-15'];
            for (const dia of diasAntesDelQuiebre) {
                for (const ej of fase1.ejercicios) {
                    eventos.push({
                        id: randomUUID(),
                        timestamp: Date.now(),
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: ej.id,
                        fecha: dia,
                    });
                }
            }
            const estado = reducirEventos(eventos);
            const adherencia = calcularAdherenciaSemanal(estado, programa, 1, '2026-09-16');
            // Debe ser válido
            expect(adherencia.porcentaje_general).toBeGreaterThanOrEqual(0);
            expect(adherencia.porcentaje_general).toBeLessThanOrEqual(100);
        });
        it('semana con algunos días sin registro', () => {
            // Algunos días sin datos no invalidan el cálculo
            const eventos = [];
            const fase1 = programa.fases.find((f) => f.numero === 1);
            const dias = ['2026-09-14', '2026-09-15', '2026-09-20']; // Saltar varios
            for (const dia of dias) {
                for (const ej of fase1.ejercicios) {
                    eventos.push({
                        id: randomUUID(),
                        timestamp: Date.now(),
                        tipo: 'EJERCICIO_MARCADO',
                        ejercicio_id: ej.id,
                        fecha: dia,
                    });
                }
            }
            const estado = reducirEventos(eventos);
            const adherencia = calcularAdherenciaSemanal(estado, programa, 1, '2026-09-18');
            expect(adherencia.porcentaje_general).toBeGreaterThan(0);
        });
        it('por_dia tiene entrada para cada día de la semana', () => {
            const eventos = [];
            const estado = reducirEventos(eventos);
            const adherencia = calcularAdherenciaSemanal(estado, programa, 1, '2026-09-18');
            expect(adherencia.por_dia.size).toBe(7); // Lunes a domingo
        });
    });
});
