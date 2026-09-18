import React, { useReducer, useEffect } from 'react'
import { appReducer, initialState } from './ui/state/AppState'
import { PantallaInicio } from './ui/screens/PantallaInicio'
import { PantallaRutina } from './ui/screens/PantallaRutina'
import { PantallaDetalle } from './ui/screens/PantallaDetalle'
import { PantallaGuia } from './ui/screens/PantallaGuia'
import { PantallabitÁcora } from './ui/screens/PantallabitÁcora'
import { validarPrograma } from '@config/esquema'
import { reducirEventos } from './core/eventos'
import { IdbRepo } from './adapters/idb/IdbRepo'
import yaml from 'js-yaml'
import './index.css'

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const init = async () => {
      try {
        // Cargar programa desde config
        const yamlUrl = '/config/programa.yaml'
        const response = await fetch(yamlUrl)
        const yamlText = await response.text()
        const data = yaml.load(yamlText)

        const validacion = validarPrograma(data)
        if (!validacion.exito) {
          throw new Error('Programa inválido')
        }

        dispatch({
          type: 'SET_PROGRAMA',
          payload: validacion.datos!,
        })

        // Cargar eventos desde IndexedDB
        const repo = new IdbRepo()

        // Solicitar persistencia
        const persistido = await repo.solicitarPersistencia()
        dispatch({ type: 'SET_PERSISTIDO', payload: persistido })

        // Leer eventos
        const eventos = await repo.leerTodo()
        const estado = reducirEventos(eventos)

        dispatch({ type: 'SET_ESTADO', payload: estado })
        dispatch({ type: 'SET_CARGANDO', payload: false })
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: `Error al cargar: ${(error as Error).message}`,
        })
        dispatch({ type: 'SET_CARGANDO', payload: false })
      }
    }

    init()
  }, [])

  if (state.cargando) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
  }

  if (state.error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h2>Error</h2>
        <p>{state.error}</p>
      </div>
    )
  }

  return (
    <div>
      {state.pantallaActual === 'inicio' && (
        <PantallaInicio state={state} dispatch={dispatch} />
      )}
      {state.pantallaActual === 'rutina' && (
        <PantallaRutina state={state} dispatch={dispatch} />
      )}
      {state.pantallaActual === 'detalle' && (
        <PantallaDetalle state={state} dispatch={dispatch} />
      )}
      {state.pantallaActual === 'guia' && (
        <PantallaGuia state={state} dispatch={dispatch} />
      )}
      {state.pantallaActual === 'bitacora' && (
        <PantallabitÁcora state={state} dispatch={dispatch} />
      )}
    </div>
  )
}
