import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { calcularAdherenciaSemanal } from '../../core/adherencia';
import styles from './screens.module.css';
export const PantallaInicio = ({ state, dispatch, }) => {
    if (!state.programa || !state.estado) {
        return _jsx("div", { className: styles.screen, children: "Cargando..." });
    }
    const adherencia = calcularAdherenciaSemanal(state.estado, state.programa, state.faseActual, new Date().toISOString().split('T')[0]);
    return (_jsxs("div", { className: styles.screen, children: [_jsxs("div", { className: styles.header, children: [_jsx("h1", { children: "Programa P\u00E9lvico" }), _jsxs("p", { children: ["Semana ", adherencia.numero_semana, " \u2014 Fase ", state.faseActual] })] }), _jsxs("div", { className: styles.card, children: [_jsx("h2", { children: "Adherencia Semanal" }), _jsx("div", { className: styles.adherenceBar, children: _jsx("div", { className: styles.adherenceProgress, style: {
                                width: `${adherencia.porcentaje_general}%`,
                            } }) }), _jsxs("p", { className: styles.adherenceText, children: [Math.round(adherencia.porcentaje_general), "% \u2022 Dosis m\u00EDnima:", ' ', adherencia.dosis_minima_cumplida ? '✓' : '✗'] })] }), _jsxs("div", { className: styles.card, children: [_jsx("h2", { children: "De hoy" }), _jsx("p", { className: styles.dateText, children: new Date().toLocaleDateString('es-AR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        }) })] }), _jsx("button", { className: styles.buttonPrimary, onClick: () => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'rutina' }), children: "Comenzar Rutina" }), _jsx("button", { className: styles.buttonSecondary, onClick: () => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'bitacora' }), children: "Ver Bit\u00E1cora" }), state.persistido && (_jsx("p", { className: styles.hint, children: "\u2713 Datos persistidos en el dispositivo" }))] }));
};
