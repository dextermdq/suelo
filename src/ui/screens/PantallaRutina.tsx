import React, { useMemo } from 'react'
import { AppState, AppAction } from '../state/AppState'
import styles from './screens.module.css'

interface PantallaRutinaProps {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const PantallaRutina: React.FC<PantallaRutinaProps> = ({
  state,
  dispatch,
}) => {
  if (!state.programa || !state.estado) {
    return <div className={styles.screen}>Cargando...</div>
  }

  const fase = state.programa.fases.find((f: any) => f.numero === state.faseActual)
  if (!fase) return <div>Fase no encontrada</div>

  const hoy = new Date().toISOString().split('T')[0]!
  const estadoHoy = state.estado.dias.get(hoy)

  const ejerciciosDia = useMemo(() => {
    return fase.ejercicios
      .map((ref: any) => state.programa!.ejercicios.find((e: any) => e.id === ref.id))
      .filter(Boolean) as typeof state.programa['ejercicios']
  }, [fase, state.programa])

  const completados = estadoHoy?.ejercicios_marcados || new Set()

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1>Rutina de Hoy</h1>
        <button
          className={styles.buttonSmall}
          onClick={() => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'inicio' })}
        >
          ← Atrás
        </button>
      </div>

      <div className={styles.card}>
        <h2>{ejerciciosDia.length} ejercicios</h2>
        <p className={styles.adherenceText}>
          {completados.size} completados
        </p>
      </div>

      <div className={styles.ejerciciosList}>
        {ejerciciosDia.map((ej: any) => (
          <div
            key={ej.id}
            className={`${styles.ejercicioItem} ${
              completados.has(ej.id) ? styles.completado : ''
            }`}
            onClick={() => {
              dispatch({ type: 'SELECCIONAR_EJERCICIO', payload: ej.id })
              dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'detalle' })
            }}
          >
            <div className={styles.ejercicioTitle}>
              <span className={styles.checkbox}>
                {completados.has(ej.id) ? '✓' : '○'}
              </span>
              <h3>{ej.nombre}</h3>
            </div>
            <p className={styles.ejercicioMeta}>
              {ej.minutos_estimados} min • {ej.dosis_minima ? '⚡ Mínima' : ''}
            </p>
          </div>
        ))}
      </div>

      <button
        className={styles.buttonPrimary}
        onClick={() => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'bitacora' })}
      >
        Registrar Datos
      </button>
    </div>
  )
}
