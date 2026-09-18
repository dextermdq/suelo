/**
 * Implementación fake de Clock para tests.
 * Permite fijar la hora en lugar de usar Date.now().
 */
export class FakeClock {
    constructor(inicial) {
        Object.defineProperty(this, "horaFija", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.horaFija = inicial ?? null;
    }
    fijar(timestamp) {
        this.horaFija = timestamp;
    }
    liberar() {
        this.horaFija = null;
    }
    ahora() {
        if (this.horaFija !== null) {
            return this.horaFija;
        }
        return Date.now();
    }
    hoy() {
        const date = new Date(this.ahora());
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
/**
 * Implementación real de Clock.
 */
export class RealClock {
    ahora() {
        return Date.now();
    }
    hoy() {
        const date = new Date();
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
