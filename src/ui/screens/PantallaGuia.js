import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import styles from './screens.module.css';
export const PantallaGuia = ({ state, dispatch, }) => {
    if (!state.programa || !state.ejercicioSeleccionado) {
        return _jsx("div", { children: "Ejercicio no seleccionado" });
    }
    const ejercicio = state.programa.ejercicios.find((e) => e.id === state.ejercicioSeleccionado);
    if (!ejercicio) {
        return _jsx("div", { children: "Ejercicio no encontrado" });
    }
    const [tiempoRestante, setTiempoRestante] = useState(ejercicio.minutos_estimados * 60);
    const [activo, setActivo] = useState(false);
    useEffect(() => {
        if (!activo)
            return;
        const interval = setInterval(() => {
            setTiempoRestante((prev) => {
                if (prev <= 1) {
                    setActivo(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [activo]);
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    return (_jsxs("div", { className: styles.screen, children: [_jsxs("div", { className: styles.header, children: [_jsx("h1", { children: ejercicio.nombre }), _jsx("button", { className: styles.buttonSmall, onClick: () => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'rutina' }), children: "\u2190 Volver" })] }), _jsxs("div", { className: styles.card, children: [_jsxs("p", { className: styles.metadata, children: [ejercicio.minutos_estimados, " min \u2022 ", ejercicio.pilar] }), _jsxs("p", { className: styles.evidencia, children: ["Evidencia: ", ejercicio.nivel_evidencia] })] }), _jsxs("div", { className: styles.timerBox, children: [_jsxs("div", { className: styles.timer, children: [String(minutos).padStart(2, '0'), ":", String(segundos).padStart(2, '0')] }), _jsx("button", { className: activo ? styles.buttonDanger : styles.buttonPrimary, onClick: () => setActivo(!activo), children: activo ? 'Pausar' : 'Iniciar' })] }), _jsxs("div", { className: styles.card, children: [_jsx("h3", { children: "Instrucciones" }), _jsxs("p", { children: [ejercicio.dosis?.series ?? 0, " series \u2022", ' ', ejercicio.dosis?.ciclos ?? ejercicio.dosis?.repeticiones ?? 0, " reps"] })] }), _jsx("button", { className: styles.buttonSuccess, onClick: () => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'rutina' }), children: "\u2713 Completado" })] }));
};
