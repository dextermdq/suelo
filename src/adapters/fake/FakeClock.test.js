import { describe, it, expect } from 'vitest';
import { FakeClock, RealClock } from './FakeClock';
describe('FakeClock', () => {
    it('retorna hora fija cuando está fijada', () => {
        const clock = new FakeClock(1000);
        expect(clock.ahora()).toBe(1000);
        expect(clock.ahora()).toBe(1000);
    });
    it('permite cambiar la hora fija', () => {
        const clock = new FakeClock(1000);
        expect(clock.ahora()).toBe(1000);
        clock.fijar(2000);
        expect(clock.ahora()).toBe(2000);
    });
    it('puede liberarse para usar Date.now() real', () => {
        const clock = new FakeClock(1000);
        clock.liberar();
        // Debería estar cerca de Date.now()
        const diff = Math.abs(clock.ahora() - Date.now());
        expect(diff).toBeLessThan(100);
    });
    it('calcula hoy() correctamente', () => {
        // Timestamp para 2026-09-18 00:00:00 UTC
        const ts = new Date('2026-09-18T00:00:00Z').getTime();
        const clock = new FakeClock(ts);
        expect(clock.hoy()).toBe('2026-09-18');
    });
});
describe('RealClock', () => {
    it('retorna hora actual', () => {
        const clock = new RealClock();
        const ahora = clock.ahora();
        expect(Math.abs(ahora - Date.now())).toBeLessThan(100);
    });
    it('calcula hoy() cercano a la fecha actual', () => {
        const clock = new RealClock();
        const hoy = clock.hoy();
        // Debe ser formato YYYY-MM-DD
        expect(hoy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
