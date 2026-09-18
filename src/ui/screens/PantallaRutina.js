import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import styles from './screens.module.css';
export const PantallaRutina = ({ state, dispatch, }) => {
    if (!state.programa || !state.estado) {
        return _jsx("div", { className: styles.screen, children: "Cargando..." });
    }
    const fase = state.programa.fases.find((f) => f.numero === state.faseActual);
    if (!fase)
        return _jsx("div", { children: "Fase no encontrada" });
    const hoy = new Date().toISOString().split('T')[0];
    const estadoHoy = state.estado.dias.get(hoy);
    const ejerciciosDia = useMemo(() => {
        return fase.ejercicios
            .map((ref) => state.programa.ejercicios.find((e) => e.id === ref.id))
            .filter(Boolean);
    }, [fase, state.programa]);
    const completados = estadoHoy?.ejercicios_marcados || new Set();
    return (_jsxs("div", { className: styles.screen, children: [_jsxs("div", { className: styles.header, children: [_jsx("h1", { children: "Rutina de Hoy" }), _jsx("button", { className: styles.buttonSmall, onClick: () => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'inicio' }), children: "\u2190 Atr\u00E1s" })] }), _jsxs("div", { className: styles.card, children: [_jsxs("h2", { children: [ejerciciosDia.length, " ejercicios"] }), _jsxs("p", { className: styles.adherenceText, children: [completados.size, " completados"] })] }), _jsx("div", { className: styles.ejerciciosList, children: ejerciciosDia.map((ej) => (_jsxs("div", { className: `${styles.ejercicioItem} ${completados.has(ej.id) ? styles.completado : ''}`, onClick: () => {
                        dispatch({ type: 'SELECCIONAR_EJERCICIO', payload: ej.id });
                        dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'guia' });
                    }, children: [_jsxs("div", { className: styles.ejercicioTitle, children: [_jsx("span", { className: styles.checkbox, children: completados.has(ej.id) ? '✓' : '○' }), _jsx("h3", { children: ej.nombre })] }), _jsxs("p", { className: styles.ejercicioMeta, children: [ej.minutos_estimados, " min \u2022 ", ej.dosis_minima ? '⚡ Mínima' : ''] })] }, ej.id))) }), _jsx("button", { className: styles.buttonPrimary, onClick: () => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'bitacora' }), children: "Registrar Datos" })] }));
};
