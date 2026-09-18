import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { calcularTendenciasSemanal } from '../../core/tendencias';
import styles from './screens.module.css';
export const PantallabitÁcora = ({ state, dispatch, }) => {
    const [tension, setTension] = useState(5);
    const [control, setControl] = useState(5);
    const [sintomas, setSintomas] = useState(0);
    if (!state.programa || !state.estado) {
        return _jsx("div", { children: "Cargando..." });
    }
    const hoy = new Date().toISOString().split('T')[0];
    const tendencias = calcularTendenciasSemanal(state.estado, 'tension_basal', hoy);
    const handleRegistrar = async () => {
        // Aquí iría la lógica para guardar en IndexedDB
        // Por ahora solo mostramos confirmación
        alert(`Registrado: Tensión ${tension}, Control ${control}, Síntomas ${sintomas}`);
        dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'inicio' });
    };
    return (_jsxs("div", { className: styles.screen, children: [_jsxs("div", { className: styles.header, children: [_jsx("h1", { children: "Bit\u00E1cora" }), _jsx("button", { className: styles.buttonSmall, onClick: () => dispatch({ type: 'CAMBIAR_PANTALLA', payload: 'inicio' }), children: "\u2190 Atr\u00E1s" })] }), _jsxs("div", { className: styles.card, children: [_jsx("h2", { children: "Registro de Hoy" }), _jsxs("div", { className: styles.inputGroup, children: [_jsx("label", { children: "Tensi\u00F3n Basal (0-10)" }), _jsx("input", { type: "range", min: "0", max: "10", value: tension, onChange: (e) => setTension(Number(e.target.value)), className: styles.slider }), _jsx("div", { className: styles.sliderValue, children: tension })] }), _jsxs("div", { className: styles.inputGroup, children: [_jsx("label", { children: "Control (0-10)" }), _jsx("input", { type: "range", min: "0", max: "10", value: control, onChange: (e) => setControl(Number(e.target.value)), className: styles.slider }), _jsx("div", { className: styles.sliderValue, children: control })] }), _jsxs("div", { className: styles.inputGroup, children: [_jsx("label", { children: "S\u00EDntomas (0-10)" }), _jsx("input", { type: "range", min: "0", max: "10", value: sintomas, onChange: (e) => setSintomas(Number(e.target.value)), className: styles.slider }), _jsx("div", { className: styles.sliderValue, children: sintomas })] })] }), tendencias.promedio_7_dias !== null && (_jsxs("div", { className: styles.card, children: [_jsx("h2", { children: "Tendencias (7 d\u00EDas)" }), _jsxs("p", { className: styles.trendValue, children: ["Promedio: ", tendencias.promedio_7_dias.toFixed(1)] }), _jsxs("p", { className: styles.trendDirection, children: ["Tendencia: ", tendencias.tendencia] }), _jsxs("p", { className: styles.dataCount, children: ["Datos: ", tendencias.datos_disponibles, "/7 d\u00EDas"] })] })), _jsx("button", { className: styles.buttonPrimary, onClick: handleRegistrar, children: "Guardar Registro" }), _jsx("button", { className: styles.buttonSecondary, onClick: () => alert('Exportar JSON de histórico'), children: "Exportar Datos" })] }));
};
