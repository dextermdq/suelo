import { EstadoDerivado } from '../../core/eventos'
import { Programa } from '@config/esquema'

export interface AppState {
  // Datos
  programa: Programa | null
  estado: EstadoDerivado | null
  faseActual: number

  // UI
  pantallaActual: 'inicio' | 'rutina' | 'detalle' | 'guia' | 'bitacora'
  ejercicioSeleccionado: string | null

  // Persistencia
  cargando: boolean
  error: string | null
  persistido: boolean
}

export type AppAction =
  | { type: 'SET_PROGRAMA'; payload: Programa }
  | { type: 'SET_ESTADO'; payload: EstadoDerivado }
  | { type: 'CAMBIAR_PANTALLA'; payload: 'inicio' | 'rutina' | 'detalle' | 'guia' | 'bitacora' }
  | { type: 'SELECCIONAR_EJERCICIO'; payload: string }
  | { type: 'SET_CARGANDO'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PERSISTIDO'; payload: boolean }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROGRAMA':
      return { ...state, programa: action.payload }
    case 'SET_ESTADO':
      return { ...state, estado: action.payload, faseActual: action.payload.fase_actual }
    case 'CAMBIAR_PANTALLA':
      return { ...state, pantallaActual: action.payload }
    case 'SELECCIONAR_EJERCICIO':
      return { ...state, ejercicioSeleccionado: action.payload }
    case 'SET_CARGANDO':
      return { ...state, cargando: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_PERSISTIDO':
      return { ...state, persistido: action.payload }
    default:
      return state
  }
}

export const initialState: AppState = {
  programa: null,
  estado: null,
  faseActual: 1,
  pantallaActual: 'inicio',
  ejercicioSeleccionado: null,
  cargando: true,
  error: null,
  persistido: false,
}
