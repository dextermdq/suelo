# Programa Clínico — Estructura y Evidencia

## 1. Pilares del programa

El programa se estructura en 3 pilares independientes que se progresan en paralelo:

1. **Down-training (relajación):** desensibilización del suelo pélvico hipertónico
2. **Movilidad:** restauración de ROM pélvica y espinal
3. **Up-training (fuerza):** solo después de normalizar tono basal

## 2. Fases y duraciones

- **Fase 1 (semanas 1-4):** Down-training + movilidad. Sin trabajo de fuerza.
- **Fase 2 (semanas 5-8):** Transición. Down-training + movilidad + introducción relajación profunda.
- **Fase 3 (semanas 9-12):** Up-training (si corresponde) + movilidad + mantenimiento.

Duración total: 12 semanas. Cada semana tiene un ciclo fijo de 7 días.

## 3. Catálogo de ejercicios

### Pilar: Down-training (Relajación)

#### Respiración diafragmática (ID: `breathing_diaphragmatic`)
- **Técnica:** Inhalación nasal lenta (4 seg), exhalación bucal lenta (6 seg). El suelo pélvico desciende en la inhalación.
- **Dosis:** 10 ciclos, 1 serie
- **Frecuencia:** 5 días/semana
- **Fases:** 1, 2, 3
- **Duración estimada:** 3 minutos
- **Dosis mínima:** sí
- **Nivel de evidencia:** `consenso_clinico`
- **Vigencia:** desde siempre

#### Estiramiento de aductores en rangura (ID: `stretch_adductors_lunge`)
- **Técnica:** Posición de estocada baja, mantener sin forzar. 30 segundos. El suelo pélvico baja.
- **Series:** 2
- **Duración de la serie:** 30 segundos
- **Descanso entre series:** 15 segundos
- **Frecuencia:** 5 días/semana
- **Fases:** 1, 2, 3
- **Duración estimada:** 2 minutos
- **Dosis mínima:** sí
- **Nivel de evidencia:** `consenso_clinico`
- **Vigencia:** desde siempre

#### Respiración 4-7-8 (ID: `breathing_478`)
- **Técnica:** Inhalación (4 seg) - retención (7 seg) - exhalación (8 seg). Estado profundo de relajación.
- **Series:** 1
- **Ciclos por serie:** 5
- **Frecuencia:** 3 días/semana
- **Fases:** 2, 3
- **Duración estimada:** 5 minutos
- **Dosis mínima:** no
- **Nivel de evidencia:** `moderado`
- **Vigencia:** desde siempre

### Pilar: Movilidad

#### Movilidad de cadera — círculos (ID: `mobility_hip_circles`)
- **Técnica:** De pie, manos en cintura, hacer círculos amplios con las caderas. 10 en cada dirección.
- **Series:** 1
- **Repeticiones:** 10 cada dirección
- **Frecuencia:** 6 días/semana
- **Fases:** 1, 2, 3
- **Duración estimada:** 2 minutos
- **Dosis mínima:** sí
- **Nivel de evidencia:** `consenso_clinico`
- **Vigencia:** desde siempre

#### Gato-vaca (ID: `mobility_cat_cow`)
- **Técnica:** A cuatro puntos. Alterna extensión (vaca) y flexión (gato) de columna. Respiración coordinada.
- **Series:** 1
- **Repeticiones:** 10
- **Frecuencia:** 5 días/semana
- **Fases:** 1, 2, 3
- **Duración estimada:** 2 minutos
- **Dosis mínima:** sí
- **Nivel de evidencia:** `consenso_clinico`
- **Vigencia:** desde siempre

### Pilar: Up-training (Fuerza) — **BLOQUEADO EN FASE 1-2**

#### Kegel de fuerza — rápidos (ID: `kegel_fast`)
- **Técnica:** Contracciones máximas rápidas. 1 segundo contracción, 1 segundo relajación.
- **Series:** 2
- **Repeticiones:** 10
- **Descanso entre series:** 20 segundos
- **Frecuencia:** 3 días/semana
- **Fases:** 3
- **Duración estimada:** 3 minutos
- **Dosis mínima:** no
- **Nivel de evidencia:** `alto`
- **Nota de habilitación:** Solo si escenario es `hipotónico` o `mixto`. **Bloqueado en `hipertónico`.**
- **Vigencia:** desde siempre

#### Kegel de fuerza — sostenidos (ID: `kegel_sustained`)
- **Técnica:** Contracción máxima sostenida 5-10 segundos, relajación el doble. Aumento gradual.
- **Series:** 2
- **Duración contracción:** 5 segundos (semana 1), +1 seg/semana hasta 10 seg
- **Duración relajación:** 10 segundos (siempre el doble)
- **Descanso entre series:** 30 segundos
- **Frecuencia:** 3 días/semana
- **Fases:** 3
- **Duración estimada:** 4 minutos
- **Dosis mínima:** no
- **Nivel de evidencia:** `alto`
- **Nota de habilitación:** Solo si escenario es `hipotónico` o `mixto`. **Bloqueado en `hipertónico`.**
- **Vigencia:** desde siempre

## 4. Registro diario

Cada día, el usuario registra:

| Variable | Escala | Significado | Obligatorio |
|----------|--------|-------------|------------|
| `tension_basal` | 0-10 | Tensión de reposo a una hora fija | sí |
| `control` | 0-10 | Sensación de control sobre el suelo pélvico | no |
| `sintomas` | 0-10 | Presencia de síntomas (dolor, tirantez, etc.) | no |

- **Tensión basal:** 0 = suelo pélvico completamente relajado; 10 = máxima contracción
- **Control:** 0 = no siento nada; 10 = máximo control consciente
- **Síntomas:** 0 = ausencia total; 10 = severo e incapacitante

## 5. Criterios de progresión entre fases

### Fase 1 → Fase 2

Se avanza si se cumplen **todos**:

1. Adherencia ≥ 75% durante la semana 4
2. Tensión basal promedio semana 4 ≤ 6 (bajó desde línea de base)
3. Al menos 3 registros con tensión basal ≤ 5
4. Sin empeoramiento de síntomas: síntomas prom ≤ síntomas prom día 1

### Fase 2 → Fase 3

Se avanza si se cumplen **todos**:

1. Adherencia ≥ 75% durante la semana 8
2. Tensión basal promedio semana 8 ≤ 5
3. Escenario funcional sigue siendo `hipertónico` (re-evaluar)
4. Si escenario cambió a `hipotónico`, se habilita up-training

## 6. Matriz de decisión: Tensión vs Control

| Tensión basal | Control bajo | Control alto |
|---------------|---|---|
| **Alto (≥6)** | Continuar down-training intenso | Down-training suave + introducir fuerza |
| **Bajo (<6)** | Investigar si hay sensibilización; suavizar | Continuar fuerza + mantenimiento |

- **Alto/Bajo control:** recomendación es aumentar propiocepción y consciencia
- **Bajo/Alto control:** riego de "sobreentrenamiento emocional"; frenar y validar
- **Alto/Alto:** estado que amerita profesional presencial
- **Bajo/Bajo:** recuperación normal, continuar en programa

## 7. Niveles de evidencia

- `alto`: ensayos clínicos randomizados, metanálisis
- `moderado`: estudios observacionales, consenso amplio
- `bajo`: casos anecdóticos, opinión experta
- `consenso_clinico`: práctico estándar sin necesariamente estudios formales

## 8. Restricciones clínicas críticas

1. **Hipertónico sin down-training:** Kegels de fuerza empeoran el tono. Son un anti-tratamiento.
2. **Registro a los 7 días:** Un evento duplicado (mismo timestamp) se considera el mismo evento.
3. **Cambio de fase a mitad de semana:** Entra en vigencia el lunes siguiente.
4. **Ejercicio dado de baja:** No cuenta como incumplido la semana en que fue retirado.
