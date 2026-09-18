import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReducer, useEffect } from 'react';
import { appReducer, initialState } from './ui/state/AppState';
import { PantallaInicio } from './ui/screens/PantallaInicio';
import { PantallaRutina } from './ui/screens/PantallaRutina';
import { PantallaGuia } from './ui/screens/PantallaGuia';
import { PantallabitÁcora } from './ui/screens/PantallabitÁcora';
import { validarPrograma } from '@config/esquema';
import { reducirEventos } from './core/eventos';
import { IdbRepo } from './adapters/idb/IdbRepo';
import yaml from 'js-yaml';
import './index.css';
export const App = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    useEffect(() => {
        const init = async () => {
            try {
                // Cargar programa desde config
                const yamlUrl = '/config/programa.yaml';
                const response = await fetch(yamlUrl);
                const yamlText = await response.text();
                const data = yaml.load(yamlText);
                const validacion = validarPrograma(data);
                if (!validacion.exito) {
                    throw new Error('Programa inválido');
                }
                dispatch({
                    type: 'SET_PROGRAMA',
                    payload: validacion.datos,
                });
                // Cargar eventos desde IndexedDB
                const repo = new IdbRepo();
                // Solicitar persistencia
                const persistido = await repo.solicitarPersistencia();
                dispatch({ type: 'SET_PERSISTIDO', payload: persistido });
                // Leer eventos
                const eventos = await repo.leerTodo();
                const estado = reducirEventos(eventos);
                dispatch({ type: 'SET_ESTADO', payload: estado });
                dispatch({ type: 'SET_CARGANDO', payload: false });
            }
            catch (error) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: `Error al cargar: ${error.message}`,
                });
                dispatch({ type: 'SET_CARGANDO', payload: false });
            }
        };
        init();
    }, []);
    if (state.cargando) {
        return _jsx("div", { style: { padding: '2rem', textAlign: 'center' }, children: "Cargando..." });
    }
    if (state.error) {
        return (_jsxs("div", { style: { padding: '2rem', color: 'red' }, children: [_jsx("h2", { children: "Error" }), _jsx("p", { children: state.error })] }));
    }
    return (_jsxs("div", { children: [state.pantallaActual === 'inicio' && (_jsx(PantallaInicio, { state: state, dispatch: dispatch })), state.pantallaActual === 'rutina' && (_jsx(PantallaRutina, { state: state, dispatch: dispatch })), state.pantallaActual === 'guia' && (_jsx(PantallaGuia, { state: state, dispatch: dispatch })), state.pantallaActual === 'bitacora' && (_jsx(PantallabitÁcora, { state: state, dispatch: dispatch }))] }));
};
