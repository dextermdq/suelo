/**
 * Interfaz de reloj. Abstrae el acceso a la hora actual.
 * Permite testing sin mocker de Date.
 */
export interface Clock {
  /**
   * Retorna el timestamp actual en milisegundos desde epoch.
   */
  ahora(): number

  /**
   * Retorna la fecha actual en formato YYYY-MM-DD.
   * Siempre en zona horaria America/Argentina/Buenos_Aires.
   */
  hoy(): string
}
