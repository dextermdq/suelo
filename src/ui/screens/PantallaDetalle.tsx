import React from 'react'
import { AppState, AppAction } from '../state/AppState'
import styles from './screens.module.css'

interface PantallaDetalleProps {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const PantallaDetalle: React.FC<PantallaDetalleProps> = ({
  state,
  dispatch,
}) => {
  if (!state.programa || !state.ejercicioSeleccionado) {
    return <div>Ejercicio no seleccionado</div>
  }

  const ejercicio = state.programa.ejercicios.find(
    (e: any) => e.id === state.ejercicioSeleccionado,
  )

  if (!ejercicio) {
    return <div>Ejercicio no encontrado</div>
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1>{ejercicio.nombre}</h1>
        <button
          className={styles.buttonSmall}
          onClick={() => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'rutina' })}
        >
          ← Volver
        </button>
      </div>

      <div className={styles.card}>
        <p className={styles.metadata}>
          {ejercicio.minutos_estimados} min • {ejercicio.pilar}
        </p>
        <p className={styles.evidencia}>
          Nivel: {ejercicio.nivel_evidencia}
        </p>
      </div>

      {/* SVG PLACEHOLDER */}
      <div className={styles.svgBox}>
        <svg viewBox="0 0 200 200" className={styles.exerciseSvg}>
          {/* Placeholder: diagrama simple */}
          <circle cx="100" cy="60" r="20" fill="#3b82f6" opacity="0.3" />
          <rect x="85" y="85" width="30" height="60" fill="#3b82f6" opacity="0.3" />
          <line x1="100" y1="145" x2="70" y2="180" stroke="#3b82f6" strokeWidth="4" opacity="0.3" />
          <line x1="100" y1="145" x2="130" y2="180" stroke="#3b82f6" strokeWidth="4" opacity="0.3" />
          <text x="100" y="195" textAnchor="middle" fontSize="12" fill="#6b7280">
            {ejercicio.nombre}
          </text>
        </svg>
      </div>

      {/* INSTRUCCIONES */}
      <div className={styles.card}>
        <h2>📝 Instrucciones</h2>
        <p className={styles.instructionText}>{ejercicio.instrucciones}</p>
      </div>

      {/* SEÑALES CORRECTAS */}
      {ejercicio.senales_correctas && (
        <div className={styles.card}>
          <h3 className={styles.signalCorrect}>✓ Señales de ejecución correcta</h3>
          <ul className={styles.signalList}>
            {ejercicio.senales_correctas.map((señal: string, i: number) => (
              <li key={i}>{señal}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SEÑALES DE ERROR */}
      {ejercicio.senales_error && (
        <div className={styles.card}>
          <h3 className={styles.signalError}>⚠ Señales de error</h3>
          <ul className={styles.signalList}>
            {ejercicio.senales_error.map((señal: string, i: number) => (
              <li key={i}>{señal}</li>
            ))}
          </ul>
        </div>
      )}

      {/* BOTONES */}
      <button
        className={styles.buttonPrimary}
        onClick={() => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'guia' })}
      >
        Realizar ejercicio →
      </button>
    </div>
  )
}
