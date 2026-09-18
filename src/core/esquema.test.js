import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { validarPrograma } from '../../config/esquema';
describe('esquema del programa', () => {
    let programa;
    beforeAll(() => {
        const yamlPath = join(__dirname, '../../config/programa.yaml');
        const yamlContent = readFileSync(yamlPath, 'utf-8');
        programa = yaml.load(yamlContent);
    });
    it('carga el programa.yaml correctamente', () => {
        expect(programa).toBeDefined();
        expect(typeof programa).toBe('object');
    });
    it('programa.yaml pasa validación Zod', () => {
        const resultado = validarPrograma(programa);
        if (!resultado.exito) {
            console.error('Errores de validación:', resultado.errores);
        }
        expect(resultado.exito).toBe(true);
        expect(resultado.datos).toBeDefined();
    });
    describe('estructura', () => {
        it('tiene version', () => {
            const resultado = validarPrograma(programa);
            expect(resultado.datos?.version).toBeDefined();
        });
        it('tiene al menos una fase', () => {
            const resultado = validarPrograma(programa);
            expect(resultado.datos?.fases.length).toBeGreaterThan(0);
        });
        it('tiene al menos un ejercicio', () => {
            const resultado = validarPrograma(programa);
            expect(resultado.datos?.ejercicios.length).toBeGreaterThan(0);
        });
        it('tiene definición de registro diario', () => {
            const resultado = validarPrograma(programa);
            expect(resultado.datos?.registro_diario.length).toBeGreaterThan(0);
        });
    });
    describe('fases', () => {
        it('fases están en orden creciente', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            for (let i = 0; i < datos.fases.length - 1; i++) {
                expect(datos.fases[i].numero).toBeLessThan(datos.fases[i + 1].numero);
            }
        });
        it('cada fase tiene criterios de pasaje', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            for (const fase of datos.fases) {
                expect(fase.criterios_pasaje.length).toBeGreaterThan(0);
            }
        });
        it('cada fase referencia ejercicios que existen', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            const idsEjercicios = new Set(datos.ejercicios.map((e) => e.id));
            for (const fase of datos.fases) {
                for (const ej of fase.ejercicios) {
                    expect(idsEjercicios.has(ej.id)).toBe(true);
                }
            }
        });
    });
    describe('ejercicios', () => {
        it('no hay ejercicios duplicados por ID', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            const ids = datos.ejercicios.map((e) => e.id);
            const idsUnicos = new Set(ids);
            expect(idsUnicos.size).toBe(ids.length);
        });
        it('ejercicios con dosis_minima: true están en fases válidas', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            for (const ejercicio of datos.ejercicios.filter((e) => e.dosis_minima)) {
                let encontrado = false;
                for (const fase of datos.fases) {
                    if (fase.ejercicios.some((e) => e.id === ejercicio.id)) {
                        encontrado = true;
                        break;
                    }
                }
                expect(encontrado).toBe(true);
            }
        });
        it('ejercicios Kegel no están en Fase 1 ni 2 si son de fuerza', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            const kegelsFuerza = datos.ejercicios.filter((e) => e.id.includes('kegel') && e.pilar === 'up-training');
            for (const kegel of kegelsFuerza) {
                for (const fase of datos.fases.filter((f) => f.numero <= 2)) {
                    const estáEnFase = fase.ejercicios.some((e) => e.id === kegel.id);
                    expect(estáEnFase).toBe(false);
                }
            }
        });
        it('dosis tienen campos requeridos según pilar', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            for (const ejercicio of datos.ejercicios) {
                expect(ejercicio.dosis.series).toBeGreaterThan(0);
            }
        });
    });
    describe('bloques de Kegel hipertónico', () => {
        it('ejercicios Kegel tienen condición de habilitación', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            const kegels = datos.ejercicios.filter((e) => e.id.includes('kegel'));
            for (const kegel of kegels) {
                expect(kegel.habilitacion_condicion).toBeDefined();
                expect(kegel.habilitacion_condicion?.valor_excluido).toBe('hipertonico');
            }
        });
    });
    describe('registro diario', () => {
        it('todas las variables tienen escala válida', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            for (const variable of datos.registro_diario) {
                expect(variable.escala_minima).toBeLessThan(variable.escala_maxima);
            }
        });
        it('variable tension_basal es obligatoria', () => {
            const resultado = validarPrograma(programa);
            const datos = resultado.datos;
            const tension = datos.registro_diario.find((v) => v.variable === 'tension_basal');
            expect(tension?.obligatorio).toBe(true);
        });
    });
});
