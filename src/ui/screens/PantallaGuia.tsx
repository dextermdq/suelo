import React, { useState, useEffect } from 'react'
import { AppState, AppAction } from '../state/AppState'
import styles from './screens.module.css'

interface PantallaGuiaProps {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const PantallaGuia: React.FC<PantallaGuiaProps> = ({
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

  const [tiempoRestante, setTiempoRestante] = useState(
    ejercicio.minutos_estimados * 60,
  )
  const [activo, setActivo] = useState(false)

  useEffect(() => {
    if (!activo) return

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          setActivo(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activo])

  const minutos = Math.floor(tiempoRestante / 60)
  const segundos = tiempoRestante % 60

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
          Evidencia: {ejercicio.nivel_evidencia}
        </p>
      </div>

      <div className={styles.timerBox}>
        <div className={styles.timer}>
          {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
        </div>
        <button
          className={activo ? styles.buttonDanger : styles.buttonPrimary}
          onClick={() => setActivo(!activo)}
        >
          {activo ? 'Pausar' : 'Iniciar'}
        </button>
      </div>

      <div className={styles.card}>
        <h3>Instrucciones</h3>
        <p>
          {ejercicio.dosis?.series ?? 0} series •
          {' '}{ejercicio.dosis?.ciclos ?? ejercicio.dosis?.repeticiones ?? 0} reps
        </p>
      </div>

      <button
        className={styles.buttonSuccess}
        onClick={() => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'rutina' })}
      >
        ✓ Completado
      </button>
    </div>
  )
}
