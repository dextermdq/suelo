# Prompts para Google Stitch

Stitch acepta **texto e imágenes**. Si tenés un boceto a mano o una captura del `pnpm dryrun`,
subila junto con el prompt: describir un layout en prosa es la forma más ineficiente de usarlo.

**Cómo usar este archivo:**

1. Generá primero el **Prompt 0** como *style tile*, para fijar el sistema de diseño.
2. Después, una pantalla por prompt. **Nunca varias juntas** — Stitch reinventa tipografía y
   espaciado en cada pantalla y terminás con diseños que no combinan.
3. El bloque PREÁMBULO va pegado **adelante de cada prompt**, siempre.
4. Iterá con el chat de Stitch en lugar de reescribir el prompt desde cero.

---

## PREÁMBULO (copiar adelante de cada prompt)

```
Mobile web app. Viewport 390×844. Dark mode only. Use these tokens exactly
and invent nothing outside them.

COLOR
  bg/base         #0F172A
  bg/surface      #1E293B
  bg/surface-alt  #293548
  border          #334155
  text/primary    #F1F5F9
  text/secondary  #94A3B8
  accent          #06B6D4
  success         #22C55E
  warning         #F59E0B
  danger          #EF4444
  disabled        #475569

TYPE   Inter. 28/700 título · 20/600 sección · 17/500 título de tarjeta
       16/400 cuerpo · 14/400 caption. Nada por debajo de 14px.
SPACE  4 8 12 16 24 32 48.   RADIUS 12 tarjetas · 8 controles · 999 pills.
TOUCH  Mínimo 48×48. Toda acción primaria en el 60% inferior de la pantalla.

REGLAS
- Nunca color solo para comunicar estado: completado = relleno verde MÁS tilde.
- Sin sombras. Las superficies se separan con el token border.
- Tab bar inferior, exactamente 4 ítems: Inicio · Rutina · Guía · Bitácora
- Todo el texto de interfaz en español rioplatense. Cero inglés en la UI.
- Sin streaks, sin contadores de días perdidos, sin números en rojo por no cumplir.
- Sin imágenes hero, sin ilustraciones, sin gradientes decorativos.
- Se usa de noche, con poca luz, a veces acostado y con una sola mano.
```

---

## Prompt 0 — Style tile

```
[PREÁMBULO]

Generate a design system style tile screen (not an app screen) showing every token above
as a visual specimen:

- Color swatches with the hex and the token name on each
- The full type scale with sample Spanish text
- Button states: primary, secondary, ghost, disabled
- A checkbox in both states: unchecked, and checked with green fill plus checkmark glyph
- A progress ring at 68% and a horizontal progress bar at 40%
- A pill/chip: "Fase 1 · Semana 3"
- A card with border, no shadow
- The bottom tab bar with the 4 items and one active

No app content. This is a reference sheet I will keep open while reviewing other screens.
```

---

## Prompt 1 — Inicio (pantalla principal)

```
[PREÁMBULO]

Screen: "Inicio". The main dashboard. Content, top to bottom:

HEADER
- "Buenas noches" — 28/700
- Chip below it: "Fase 1 · Semana 3 de 4"
- NO streak counter anywhere on this screen.

TARJETA DE ADHERENCIA
- Progress ring, 68%, accent color, large and readable
- Label under it: "Adherencia de la semana"
- Caption: "5 de 7 días con registro"
- Small text, secondary color: "Arranca de nuevo cada lunes"

BANNER (bg/surface-alt, no alarm icon, low visual weight)
- "¿Te salteaste ayer? No importa. Marcá solo lo de hoy — acá no se acumula nada."

DOS BOTONES, side by side
- Secondary: "Tengo 5 minutos"
- Primary (accent): "Empezar rutina"

CHECKLIST DE HOY, grouped in three sections with a section header each.
Each row: exercise name (17/500), dose caption underneath (14/400, secondary),
estimated minutes on the right, and a 48×48 checkbox on the far right.
Rows that are part of the minimum dose carry a small "mín" pill next to the name.

Sección "Respiración y suelo pélvico"
  Respiración diafragmática · 3 series · 8 respiraciones · 5 min   [mín] [✓ marcado]
  Kegel inverso · 3 series · 6 reps · 10 s de soltar · 4 min       [mín] [✓ marcado]

Sección "Movilidad"
  Malasana · 2 series · 60 s · 3 min                                     [ ]
  Mariposa (Baddha Konasana) · 2 series · 60 s · 3 min                   [ ]
  Bebé feliz · 2 series · 45 s · 2 min                                   [ ]

Sección "Práctica"
  Sesión stop-start · 1 sesión · pausa en nivel 6 · 12 min         [mín] [ ]

SECCIÓN COLAPSADA al final, muted, con chevron
- "Fase 2 agrega 2 ejercicios" — collapsed, not expanded, low contrast.

Interaction: tapping a checkbox fills the row card with success green, adds a checkmark glyph,
and advances the progress ring. Nothing turns red. Nothing is ever locked because of a
previous day.

Bottom tab bar with "Inicio" active.

Do not add: notifications bell, settings gear, avatar, search, streak, calendar strip.
```

---

## Prompt 2 — Inicio, estado vacío (día 1)

```
[PREÁMBULO]

Same screen as "Inicio", but the first-ever launch state: no data at all.

- Header: "Bienvenido" + chip "Fase 1 · Semana 1 de 4"
- Where the progress ring goes: an empty ring at 0% with the label
  "Todavía sin datos" and caption "Tu primera semana arranca hoy"
- Instead of the catch-up banner, an onboarding card (bg/surface-alt):
  "Marcá lo que completes. No hay nada que recuperar y nada que perder.
   Si algún día tenés 5 minutos, usá la dosis mínima."
- The checklist appears complete and unchecked, same rows as the main screen
- Primary button: "Empezar la primera sesión"
- Below the checklist, a single quiet line:
  "Tip: registrá la tensión a la misma hora todos los días. Elegí una y no la cambies."

Empty state must not look broken or like a loading skeleton. It must look intentional.
```

---

## Prompt 3 — Rutina, modo dosis mínima

```
[PREÁMBULO]

Screen: "Rutina" tab, in "dosis mínima" mode. This is the screen for a day with no time.
It must feel like a complete, legitimate session — not a consolation prize.

- Title: "Dosis mínima" — 28/700
- Subtitle: "5 minutos. Esto es lo que más mueve la aguja."
- A large total timer chip: "5:00"

Exactly three large cards, stacked, each 96px tall minimum:
  1. "Respiración diafragmática" · "2 min" · "8 respiraciones lentas"
  2. "Kegel inverso" · "2 min" · "6 reps · 10 s de soltar cada una"
  3. "Escaneo de tensión" · "1 min" · "Perineo, glúteos, mandíbula"

Each card has a 48×48 checkbox and a small "Ver cómo" ghost link to the visual guide.

Bottom, fixed: primary accent button "Empezar" full width.

Below it, one quiet line, secondary color:
  "Un día de dosis mínima cuenta como día cumplido."

Do not include: a comparison with the full routine, a percentage of the full routine,
any text suggesting this is less than enough.

Bottom tab bar with "Rutina" active.
```

---

## Prompt 4 — Guía, timer de respiración

```
[PREÁMBULO]

Screen: "Guía" tab, the breathing and pelvic floor timer. TWO SEPARATE MODES, selected by a
segmented control at the top. They are not interchangeable.

SEGMENTED CONTROL: [ Relajación ] [ Fuerza ]
- "Relajación" is selected by default.
- "Fuerza" is visibly DISABLED, disabled color, with a small caption underneath:
  "Se habilita en Fase 2"

MODO RELAJACIÓN (the state to design)
- Card at top: "Kegel inverso · Concepto paracaídas"
  Body: "No empujes. Dejá caer. El suelo pélvico baja solo cuando el diafragma baja."
- Large breathing ring in the center, accent color, with the countdown inside at 48/700
- Current phase label above the number, large: "Inhalá — dejá bajar"
- Two-phase cycle displayed as a horizontal strip underneath:
  "Inhalar 4 s  →  Exhalar 6 s"
  There is NO hold phase. Do not add one.
- Rep counter: "Rep 3 de 6"
- Warning card at the bottom, warning color border, not a red alert:
  "Si sentís tensión o molestia, pará. Este ejercicio no tiene que doler."
- Bottom: secondary full-width button "Detener"

Below the fold, a collapsed card:
- "Kegel vs. Kegel inverso" with two mini-diagrams side by side labeled
  "Ascensor — subir" and "Paracaídas — bajar"

Bottom tab bar with "Guía" active.
```

---

## Prompt 5 — Guía, detalle de ejercicio

```
[PREÁMBULO]

Screen: exercise detail, reached from the routine. Design it for "Malasana".

- Media placeholder at the top: aspect ratio 4:3, NOT 16:9 (the videos are shot vertically,
  of floor poses). Placeholder shows a play icon and the caption "Video · 40 s".
- Title: "Malasana" — 28/700
- Subtitle: "Sentadilla profunda · Movilidad de cadera y apertura pélvica"
- Dose chip row: "2 series" · "60 s" · "3 min"

Sections, in this order:

"Cómo se hace" — numbered list, max 5 steps, 16/400, generous line height.

"Señal de que lo estás haciendo bien" — card with success-green left border:
  "Sentís apertura en la cadera, no presión en la rodilla. Podés respirar al ritmo normal
   todo el tiempo."

"Errores frecuentes" — three items, each with a short bold lead and one line of explanation.

"Cuándo NO hacerlo" — card with warning-color left border. This card is REQUIRED on every
exercise detail screen and must not be smaller or quieter than the others:
  "Si aparece dolor en la rodilla, en el pubis o en el perineo, salí de la postura.
   No la sostengas para 'aguantar'."

"Clave" — accent-bordered callout, one sentence only:
  "La exhalación es lo que profundiza la postura. No la fuerces con el peso del cuerpo."

Bottom, fixed: primary accent button "Marcar como hecha"

Do not label anything "PRO TIP" or any other English string.
```

---

## Prompt 6 — Bitácora, carga diaria

```
[PREÁMBULO]

Screen: "Bitácora" tab, daily entry. This is used at 23:40 in bed, one-handed, low light.
Single focus, large targets. This is NOT a spreadsheet grid — do not design a table here.

- Title: "Registro de hoy" + date caption "Viernes 18 de septiembre"
- Caption, secondary: "Siempre a la misma hora · 21:00"

VARIABLE 1
- Label: "Tensión en reposo" — 20/600
- Helper: "Antes de empezar la rutina"
- A row of 11 large tappable pills, 0 through 10, each at least 48×48, horizontally scrollable
  if needed. Value 3 is selected, filled with accent.
- End labels under the row: "0 · nada" on the left, "10 · máxima" on the right

VARIABLE 2
- Label: "Control de excitación" — 20/600
- Helper: "En la sesión de stop-start. Dejalo vacío si hoy no hubo."
- Same 11-pill row, nothing selected
- End labels: "0 · ninguno" / "10 · total"

VARIABLE 3
- Label: "¿Hubo dolor hoy?"
- A two-option toggle: "No" (selected) / "Sí"
- If "Sí" were selected, a text field appears asking where. Show the collapsed state.

NOTAS
- A multiline text field, placeholder: "Algo que quieras recordar de hoy (opcional)"

Bottom, fixed: primary accent full-width button "Guardar"

Do not include: mood emojis, star ratings, a 1-5 scale anywhere, a spreadsheet table.

Bottom tab bar with "Bitácora" active.
```

---

## Prompt 7 — Bitácora, tendencias

```
[PREÁMBULO]

Screen: "Bitácora" tab, second view — history and trends. Reached by a segmented control at
the top: [ Registrar ] [ Tendencias ]. "Tendencias" is selected.

TARJETA 1 — dos líneas de tendencia
- Title: "Últimos 28 días"
- One line chart with two series: "Tensión en reposo" (warning color) and
  "Control de excitación" (accent). Y axis 0 to 10. Gaps in the data are shown as gaps,
  never interpolated and never drawn as zero.
- Legend below with both series named in Spanish.

TARJETA 2 — matriz tensión / control
- Title: "Dónde estás esta semana"
- A 2×2 matrix, axes labeled: horizontal "Tensión" (baja → alta),
  vertical "Control" (bajo → alto). Quadrants labeled in Spanish, small text.
- A marker showing the current position in the low-tension / mid-control quadrant.
- One line of interpretation under it, in plain Spanish, secondary color.

TARJETA 3 — criterios de pasaje de fase
- Title: "Para pasar a Fase 2"
- Three rows, each with a status glyph (check, dash, or hollow circle — not color alone),
  the criterion in Spanish, and the actual number on the right:
    ✓  "Tensión promedio bajo 4 durante 7 días"        "3,2"
    —  "Adherencia sobre 70% dos semanas seguidas"     "68%"
    ○  "Sin dolor registrado en 14 días"               "Datos insuficientes"
- Footer line, secondary: "No hay apuro. La fase se extiende sola si falta algo."

TARJETA 4 — respaldo
- Title: "Respaldo"
- "Último respaldo: hace 9 días" with warning color on the number
- Secondary button: "Exportar ahora"

Do not include: streaks, badges, trophies, comparisons with other users, week-over-week
percentage changes framed as failure.
```

---

## Después de Stitch

Stitch te devuelve diseño y código de frontend. **El código no lo pegues tal cual en el repo.**
Sirve como referencia visual para el Prompt 6 de `KICKOFF.md`: Claude Code lo reimplementa
respetando los invariantes de `CLAUDE.md` (cero lógica de dominio en componentes, ejercicios
de la fase vigente, fuentes auto-hospedadas, cero red).

Lo que sí conviene levantar literal del output de Stitch: los valores de espaciado, tamaños y
jerarquía visual que hayan quedado bien.
