import { Clock } from '../../ports/Clock'

/**
 * Implementación fake de Clock para tests.
 * Permite fijar la hora en lugar de usar Date.now().
 */
export class FakeClock implements Clock {
  private horaFija: number | null = null

  constructor(inicial?: number) {
    this.horaFija = inicial ?? null
  }

  fijar(timestamp: number): void {
    this.horaFija = timestamp
  }

  liberar(): void {
    this.horaFija = null
  }

  ahora(): number {
    if (this.horaFija !== null) {
      return this.horaFija
    }
    return Date.now()
  }

  hoy(): string {
    const date = new Date(this.ahora())
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

/**
 * Implementación real de Clock.
 */
export class RealClock implements Clock {
  ahora(): number {
    return Date.now()
  }

  hoy(): string {
    const date = new Date()
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}
