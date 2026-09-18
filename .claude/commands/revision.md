Revisión semanal del programa. Seguí estos pasos en orden.

1. Leé `config/programa.yaml` y `docs/perfil.md`. No reproduzcas el contenido del perfil
   en tu respuesta.

2. Pedime el export JSON de la app (Bitácora → Respaldo → Exportar). Si no lo tengo a mano,
   pedime los números a mano: adherencia por pilar y las series de tensión y de control.
   Recordame exportar antes de cerrar la revisión si el último respaldo tiene más de 7 días.

3. Corré la evaluación de criterios de pasaje de fase con el núcleo
   (`pnpm dryrun --export <archivo>` o el test correspondiente) y devolveme:
   - Criterio por criterio: cumplido / no cumplido / datos insuficientes, con el número.
   - En qué cuadrante de la matriz tensión/control caí esta semana.
   - Si corresponde pasar de fase, mantener, o retroceder.

4. Marcá explícitamente si el patrón sugiere alguna de estas tres cosas, y cuál es la
   evidencia numérica concreta en cada caso:
   - Progreso real
   - Sobreentrenamiento del suelo pélvico
   - Trabajo de fuerza aplicado sobre un cuadro que no lo tolera

5. Si algo de la sección "Banderas rojas activas" del perfil está marcado, o si ves
   empeoramiento sostenido en las series, decilo en la primera línea de tu respuesta
   y no lo suavices.

6. Proponé como máximo **un** ajuste al programa para la semana que entra, expresado como
   un diff concreto sobre `config/programa.yaml` con `vigencia_desde`. Nunca edites una
   entrada existente de forma destructiva.

7. No toques código en esta tarea. Si el ajuste requiere un cambio de código, es señal de
   que el esquema de datos está incompleto: decilo y abrí un ADR en lugar de parchear.

Cerrá con: qué miré, qué no pude mirar por falta de datos, y el riesgo residual.
