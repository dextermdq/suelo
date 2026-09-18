import { calcularAdherenciaSemanal } from './adherencia';
/** Evalúa un criterio individual */
function evaluarCriterio(criterio, estado, programa, numeroFase, fecha) {
    switch (criterio.tipo) {
        case 'adherencia_minima': {
            const adherencia = calcularAdherenciaSemanal(estado, programa, numeroFase, fecha);
            const cumplido = adherencia.porcentaje_general >= (criterio.valor || 75);
            return {
                tipo: 'adherencia_minima',
                resultado: cumplido ? 'cumplido' : 'no_cumplido',
                valor_esperado: criterio.valor || 75,
                valor_actual: Math.round(adherencia.porcentaje_general),
                motivo: `Adherencia ${Math.round(adherencia.porcentaje_general)}%`,
            };
        }
        case 'tension_basal_max': {
            // Calcular promedio de tensión basal de la semana
            const tensionesValidas = [];
            for (const [, estadoDia] of estado.dias) {
                if (estadoDia.registro_diario &&
                    estadoDia.registro_diario.tension_basal !== undefined) {
                    tensionesValidas.push(estadoDia.registro_diario.tension_basal);
                }
            }
            if (tensionesValidas.length === 0) {
                return {
                    tipo: 'tension_basal_max',
                    resultado: 'datos_insuficientes',
                    valor_esperado: criterio.valor,
                    valor_actual: null,
                    motivo: 'Sin registros de tensión basal',
                };
            }
            const promedio = tensionesValidas.reduce((a, b) => a + b, 0) / tensionesValidas.length;
            const cumplido = promedio <= (criterio.valor || 6);
            return {
                tipo: 'tension_basal_max',
                resultado: cumplido ? 'cumplido' : 'no_cumplido',
                valor_esperado: criterio.valor,
                valor_actual: Math.round(promedio * 10) / 10,
                motivo: `Tensión promedio: ${Math.round(promedio * 10) / 10}`,
            };
        }
        case 'registros_con_tension_baja': {
            // Contar registros con tensión basal <= 5
            let conteo = 0;
            for (const [, estadoDia] of estado.dias) {
                if (estadoDia.registro_diario &&
                    estadoDia.registro_diario.tension_basal !== undefined &&
                    estadoDia.registro_diario.tension_basal <= 5) {
                    conteo++;
                }
            }
            const cumplido = conteo >= (criterio.valor || 3);
            return {
                tipo: 'registros_con_tension_baja',
                resultado: cumplido ? 'cumplido' : 'no_cumplido',
                valor_esperado: criterio.valor,
                valor_actual: conteo,
                motivo: `${conteo} registros con tensión ≤5`,
            };
        }
        case 'sin_empeoramiento_sintomas': {
            // Comparar síntomas al inicio vs fin de semana
            const diasOrdenados = Array.from(estado.dias.keys()).sort();
            if (diasOrdenados.length < 2) {
                return {
                    tipo: 'sin_empeoramiento_sintomas',
                    resultado: 'datos_insuficientes',
                    valor_esperado: null,
                    valor_actual: null,
                    motivo: 'Datos insuficientes',
                };
            }
            const primerDia = estado.dias.get(diasOrdenados[0]);
            const ultimoDia = estado.dias.get(diasOrdenados[diasOrdenados.length - 1]);
            const sintomasInicio = primerDia?.registro_diario?.sintomas ?? 0;
            const sintomasUltimo = ultimoDia?.registro_diario?.sintomas ?? 0;
            const cumplido = sintomasUltimo <= sintomasInicio;
            return {
                tipo: 'sin_empeoramiento_sintomas',
                resultado: cumplido ? 'cumplido' : 'no_cumplido',
                valor_esperado: null,
                valor_actual: null,
                motivo: `Síntomas: ${sintomasInicio} → ${sintomasUltimo}`,
            };
        }
        default:
            return {
                tipo: criterio.tipo,
                resultado: 'datos_insuficientes',
                valor_esperado: criterio.valor,
                valor_actual: null,
                motivo: 'Criterio no implementado',
            };
    }
}
/** Evalúa si puede avanzar de fase */
export function evaluarProgresiónFase(estado, programa, numeroFase, fecha) {
    const fase = programa.fases.find((f) => f.numero === numeroFase);
    if (!fase)
        throw new Error(`Fase ${numeroFase} no existe`);
    const criterios = fase.criterios_pasaje.map((c) => evaluarCriterio(c, estado, programa, numeroFase, fecha));
    // Todos deben estar cumplidos para avanzar
    const todosCumplidos = criterios.every((c) => c.resultado === 'cumplido');
    const sinDatos = criterios.some((c) => c.resultado === 'datos_insuficientes');
    return {
        fase_actual: numeroFase,
        puede_avanzar: todosCumplidos,
        criterios,
        recomendacion: todosCumplidos
            ? `Listo para avanzar a fase ${numeroFase + 1}`
            : sinDatos
                ? 'Faltan datos para evaluar'
                : 'No cumple criterios todavía',
    };
}
/** Calcula el cuadrante tensión/control */
export function calcularCuadranteTensionControl(estado) {
    // Promedios de última semana
    const tensionesValidas = [];
    const controlesValidos = [];
    for (const [, estadoDia] of estado.dias) {
        if (estadoDia.registro_diario?.tension_basal !== undefined) {
            tensionesValidas.push(estadoDia.registro_diario.tension_basal);
        }
        if (estadoDia.registro_diario?.control !== undefined) {
            controlesValidos.push(estadoDia.registro_diario.control);
        }
    }
    const tensionPromedio = tensionesValidas.length > 0
        ? tensionesValidas.reduce((a, b) => a + b, 0) / tensionesValidas.length
        : 5;
    const controlPromedio = controlesValidos.length > 0
        ? controlesValidos.reduce((a, b) => a + b, 0) / controlesValidos.length
        : 5;
    const esAlta = tensionPromedio >= 6;
    const esControlAlto = controlPromedio >= 6;
    let cuadrante;
    let recomendacion;
    if (esAlta && !esControlAlto) {
        cuadrante = 'alto_bajo';
        recomendacion =
            'Continuar down-training intenso. Aumentar conciencia propioceptiva.';
    }
    else if (esAlta && esControlAlto) {
        cuadrante = 'alto_alto';
        recomendacion =
            'Tensión alta con control alto: considerar evaluación profesional.';
    }
    else if (!esAlta && esControlAlto) {
        cuadrante = 'bajo_alto';
        recomendacion =
            'Recuperación normal. Continuar en programa. Evitar sobreentrenamiento.';
    }
    else {
        cuadrante = 'bajo_bajo';
        recomendacion =
            'Relajación recuperada. Listo para aumentar carga si corresponde.';
    }
    return {
        cuadrante,
        tension_basal: Math.round(tensionPromedio * 10) / 10,
        control: Math.round(controlPromedio * 10) / 10,
        recomendacion,
    };
}
