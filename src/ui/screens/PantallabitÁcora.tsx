import React, { useState } from 'react'
import { AppState, AppAction } from '../state/AppState'
import { calcularTendenciasSemanal } from '../../core/tendencias'
import styles from './screens.module.css'

interface PantallabitÁcoraProps {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const PantallabitÁcora: React.FC<PantallabitÁcoraProps> = ({
  state,
  dispatch,
}) => {
  const [tension, setTension] = useState(5)
  const [control, setControl] = useState(5)
  const [sintomas, setSintomas] = useState(0)

  if (!state.programa || !state.estado) {
    return <div>Cargando...</div>
  }

  const hoy = new Date().toISOString().split('T')[0]!
  const tendencias = calcularTendenciasSemanal(state.estado, 'tension_basal', hoy)

  const handleRegistrar = async () => {
    // Aquí iría la lógica para guardar en IndexedDB
    // Por ahora solo mostramos confirmación
    alert(`Registrado: Tensión ${tension}, Control ${control}, Síntomas ${sintomas}`)
    dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'inicio' })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1>Bitácora</h1>
        <button
          className={styles.buttonSmall}
          onClick={() => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'inicio' })}
        >
          ← Atrás
        </button>
      </div>

      <div className={styles.card}>
        <h2>Registro de Hoy</h2>
        <div className={styles.inputGroup}>
          <label>Tensión Basal (0-10)</label>
          <input
            type="range"
            min="0"
            max="10"
            value={tension}
            onChange={(e) => setTension(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderValue}>{tension}</div>
        </div>

        <div className={styles.inputGroup}>
          <label>Control (0-10)</label>
          <input
            type="range"
            min="0"
            max="10"
            value={control}
            onChange={(e) => setControl(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderValue}>{control}</div>
        </div>

        <div className={styles.inputGroup}>
          <label>Síntomas (0-10)</label>
          <input
            type="range"
            min="0"
            max="10"
            value={sintomas}
            onChange={(e) => setSintomas(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderValue}>{sintomas}</div>
        </div>
      </div>

      {tendencias.promedio_7_dias !== null && (
        <div className={styles.card}>
          <h2>Tendencias (7 días)</h2>
          <p className={styles.trendValue}>
            Promedio: {tendencias.promedio_7_dias.toFixed(1)}
          </p>
          <p className={styles.trendDirection}>
            Tendencia: {tendencias.tendencia}
          </p>
          <p className={styles.dataCount}>
            Datos: {tendencias.datos_disponibles}/7 días
          </p>
        </div>
      )}

      <button className={styles.buttonPrimary} onClick={handleRegistrar}>
        Guardar Registro
      </button>

      <button
        className={styles.buttonSecondary}
        onClick={() => alert('Exportar JSON de histórico')}
      >
        Exportar Datos
      </button>
    </div>
  )
}
