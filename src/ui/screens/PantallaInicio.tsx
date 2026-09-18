import React from 'react'
import { AppState, AppAction } from '../state/AppState'
import { calcularAdherenciaSemanal } from '../../core/adherencia'
import styles from './screens.module.css'

interface PantallaInicioProps {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const PantallaInicio: React.FC<PantallaInicioProps> = ({
  state,
  dispatch,
}) => {
  if (!state.programa || !state.estado) {
    return <div className={styles.screen}>Cargando...</div>
  }

  const adherencia = calcularAdherenciaSemanal(
    state.estado,
    state.programa,
    state.faseActual,
    new Date().toISOString().split('T')[0],
  )

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1>Programa Pélvico</h1>
        <p>Semana {adherencia.numero_semana} — Fase {state.faseActual}</p>
      </div>

      <div className={styles.card}>
        <h2>Adherencia Semanal</h2>
        <div className={styles.adherenceBar}>
          <div
            className={styles.adherenceProgress}
            style={{
              width: `${adherencia.porcentaje_general}%`,
            }}
          />
        </div>
        <p className={styles.adherenceText}>
          {Math.round(adherencia.porcentaje_general)}% • Dosis mínima:{' '}
          {adherencia.dosis_minima_cumplida ? '✓' : '✗'}
        </p>
      </div>

      <div className={styles.card}>
        <h2>De hoy</h2>
        <p className={styles.dateText}>
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      <button
        className={styles.buttonPrimary}
        onClick={() => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'rutina' })}
      >
        Comenzar Rutina
      </button>

      <button
        className={styles.buttonSecondary}
        onClick={() => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'bitacora' })}
      >
        Ver Bitácora
      </button>

      {state.persistido && (
        <p className={styles.hint}>
          ✓ Datos persistidos en el dispositivo
        </p>
      )}
    </div>
  )
}
