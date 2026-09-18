export function appReducer(state, action) {
    switch (action.type) {
        case 'SET_PROGRAMA':
            return { ...state, programa: action.payload };
        case 'SET_ESTADO':
            return { ...state, estado: action.payload, faseActual: action.payload.fase_actual };
        case 'CAMBIAR_PANTALLA':
            return { ...state, pantallaActual: action.payload };
        case 'SELECCIONAR_EJERCICIO':
            return { ...state, ejercicioSeleccionado: action.payload };
        case 'SET_CARGANDO':
            return { ...state, cargando: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_PERSISTIDO':
            return { ...state, persistido: action.payload };
        default:
            return state;
    }
}
export const initialState = {
    programa: null,
    estado: null,
    faseActual: 1,
    pantallaActual: 'inicio',
    ejercicioSeleccionado: null,
    cargando: true,
    error: null,
    persistido: false,
};
