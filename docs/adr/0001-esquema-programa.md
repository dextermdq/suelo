# ADR 0001: Esquema del programa — estructura de datos

**Status:** Aceptado  
**Fecha:** 2026-09-18  
**Decisor:** Lucas Mauro + Claude  

## Contexto

El programa de 12 semanas vive en datos versionados (`config/programa.yaml`), no en código. Esta es la decisión más cara de revertir en todo el proyecto: cambiar el esquema significa migrar históricos, revalidar tests y potencialmente borrar información.

Tres decisiones estructurales gobiernan todo:
1. Cómo se representa la **dosis** de un ejercicio
2. Cómo se versionan ejercicios (aditivos vs. destructivos)
3. Dónde vive la lógica de decisión de la matriz tensión/control

## Decisión 1: Dosis estructurada vs. texto libre

### Opción A: Dosis como estructura (ELEGIDA)

```yaml
ejercicios:
  - id: breathing_diaphragmatic
    dosis:
      series: 1
      ciclos: 10
      seg_inhalacion: 4
      seg_exhalacion: 6
```

**Ventajas:**
- Zod valida la estructura completa al cargar el yaml
- El motor puede hacer cálculos (e.g., "¿cumplió 5 series de 10?")
- Una dosis malformada falla inmediatamente, no silenciosamente

**Desventajas:**
- Más rígido; cambiar "4 seg" a "5 seg" requiere editar estructura
- El yaml es más verboso

### Opción B: Texto libre (descartada)

```yaml
dosis: "10 ciclos, 1 serie, 4 seg inhalación, 6 seg exhalación"
```

**Ventajas:**
- Más flexible para escribir el programa
- Más legible para humanos

**Desventajas:**
- Hay que parsear en runtime, con errores difíciles de debuggear
- El invariante "el histórico tiene que seguir siendo interpretable" se rompe si el parser cambia
- Zod no puede validar la estructura, solo que existe

**Decisión:** Opción A. Razón: todo borde debe ser validable de forma estatica.

---

## Decisión 2: Vigencia de ejercicios — aditivo vs. destructivo

### Opción A: vigencia_desde / vigencia_hasta en cada ejercicio (ELEGIDA)

```yaml
ejercicios:
  - id: kegel_fast
    vigencia_desde: "2026-09-18"
    vigencia_hasta: null  # sigue vigente indefinidamente
    # ... resto de campos
  - id: kegel_fast
    vigencia_desde: "2026-10-15"  # nueva versión, versión anterior sigue en el histórico
    vigencia_hasta: null
    dosis:
      # cambio de parámetros
```

**Ventajas:**
- El histórico es autónomo: cargas el log de hace 2 meses, ves qué ejercicios eran válidos en esa fecha
- Cambios son aditivos: nunca editas destructivamente un registro existente
- Auditable: ves exactamente cuándo cambió cada parámetro

**Desventajas:**
- El yaml crece; hay que limpiar manualmente ejercicios muy viejos
- Hay que gestionar solapamientos (dos versiones del mismo ejercicio válidas a la vez)

### Opción B: Una rama activa + historial separado (descartada)

```yaml
ejercicios_activos:
  - id: kegel_fast
    # versión actual

historial:
  2026-09-15:
    - id: kegel_fast
      # versión anterior
```

**Desventajas:**
- Complica la carga: hay que hacer merge entre histórico y presente
- Si el esquema cambia, el histórico no se puede reinterpretar sin conversión manual

**Decisión:** Opción A. Razón: cumple el invariante crítico de CLAUDE.md §5: "El histórico tiene que seguir siendo interpretable con el catálogo vigente al momento en que se registró".

---

## Decisión 3: Matriz tensión/control — parámetro vs. lógica

### Opción A: Matriz hardcodeada en src/core/progresion.ts (ELEGIDA)

```typescript
// src/core/progresion.ts
const matriz = {
  'alto/bajo': { recomendacion: 'continuar_down_training_intenso', ... },
  'alto/alto': { recomendacion: 'investigar_hipertonía_emocional', ... },
  // ...
}
```

**Ventajas:**
- La matriz es una decisión clínica conceptual, no un parámetro del programa
- Si cambia, es un ADR + cambio de código, que es lo correcto para una decisión de esa magnitud
- Cero ambigüedad: la lógica está explícita y testeada

**Desventajas:**
- No se puede ajustar sin programador
- Cambios requieren rebuild

### Opción B: Matriz en el yaml (descartada)

```yaml
matriz_decision:
  alto/bajo:
    recomendacion: continuar_down_training_intenso
```

**Desventajas:**
- Disimula que es una decisión clínica bajo un "parámetro"
- Invita a tweaks ad-hoc sin ADR
- La recomendación sigue siendo código (en `src/ui` o `src/core`)

**Decisión:** Opción A. Razón: una matriz de decisión clínica es arquitectura, no configuración.

---

## Estructura del programa.yaml

```yaml
version: "1.0"
# Versión del esquema. Incrementar solo si cambios incompatibles

fases:
  - numero: 1
    nombre: "Down-training (semanas 1-4)"
    semanas: 4
    objetivo: "Desensibilización y relajación"
    ejercicios:
      - id: breathing_diaphragmatic
        dosis_minima: true
      - id: stretch_adductors_lunge
        dosis_minima: true
      - id: mobility_hip_circles
        dosis_minima: true
      - id: mobility_cat_cow
        dosis_minima: true
    criterios_pasaje:
      - tipo: adherencia_minima
        valor: 75
      - tipo: tension_basal_max
        valor: 6
      - tipo: registros_con_tension_baja
        valor: 3
      - tipo: sin_empeoramiento_sintomas
        valor: null

ejercicios:
  - id: breathing_diaphragmatic
    nombre: "Respiración diafragmática"
    pilar: down-training
    dosis:
      series: 1
      ciclos: 10
      seg_inhalacion: 4
      seg_exhalacion: 6
    minutos_estimados: 3
    dosis_minima: true
    nivel_evidencia: consenso_clinico
    vigencia_desde: "2026-09-18"
    vigencia_hasta: null
    activo: true

  - id: kegel_fast
    nombre: "Kegel de fuerza — rápidos"
    pilar: up-training
    dosis:
      series: 2
      repeticiones: 10
      seg_contraccion: 1
      seg_relajacion: 1
      descanso_entre_series: 20
    minutos_estimados: 3
    dosis_minima: false
    nivel_evidencia: alto
    # Solo si escenario NO es hipertónico
    habilitacion_condicion:
      tipo: escenario_funcional
      valor_excluido: hipertonico
    vigencia_desde: "2026-09-18"
    vigencia_hasta: null
    activo: true

registro_diario:
  - variable: tension_basal
    escala_minima: 0
    escala_maxima: 10
    obligatorio: true
    descripcion: "Tensión de reposo del suelo pélvico"
  - variable: control
    escala_minima: 0
    escala_maxima: 10
    obligatorio: false
    descripcion: "Sensación de control consciente"
  - variable: sintomas
    escala_minima: 0
    escala_maxima: 10
    obligatorio: false
    descripcion: "Presencia de síntomas (0=ausente, 10=severo)"
```

## Invariantes del esquema

1. **Sin ediciones destructivas:** Un ejercicio **jamás se edita**. Se retira (vigencia_hasta) y se crea uno nuevo (vigencia_desde).
2. **Idempotencia:** Cargar el mismo yaml dos veces debe producir el mismo estado derivado.
3. **Versionado:** La versión del esquema está en la raíz. Incrementar solo si cambios incompatibles.
4. **Validación estática:** Zod rechaza cualquier yaml malformado antes de que se ejecute código.
5. **Bloqueos explícitos:** Los ejercicios con `habilitacion_condicion` se evalúan contra el perfil al cargar.

## Costo de revertir

**ALTO.** Cambiar el esquema requiere:
- Migración de históricos en tests
- Revalidación de todos los eventos guardados
- Posible ADR de migración de datos

Por eso esta decisión está en ADR, con revisión explícita.

---

## Referencias

- CLAUDE.md §5: Invariantes (append-only, idempotencia, versionado)
- CLAUDE.md §8: Restricciones clínicas
- docs/programa-clinico.md: Contenido que se mapea a este esquema
