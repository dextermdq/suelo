# Secuencia de arranque en Claude Code

No pegues todo esto de una. **Un bloque por vez**, y esperá a que cierre antes de seguir.
Claude Code ya lee `CLAUDE.md` en cada turno: no lo repitas en los prompts.

---

## Paso previo (en un chat, no acá)

La anamnesis y el diseño clínico **no van en el agente de código**. Son una conversación con
preguntas y repreguntas, y meterla acá te quema contexto y te ensucia las sesiones.

Hacelo en un chat aparte y guardá el resultado en el repo:

- Línea de base y respuestas de la anamnesis → `docs/perfil.md` (gitignored)
- Técnica de cada ejercicio, dosis, fases, nivel de evidencia → `docs/programa-clinico.md`

Claude Code arranca **después**, con esos dos archivos ya en el repo. Su trabajo es convertirlos
en datos versionados y en una app que funcione, no diseñar el programa.

---

## Prompt 0 — Reconocimiento

```
Leé CLAUDE.md, docs/perfil.md y docs/programa-clinico.md.

No escribas código ni crees archivos todavía.

Devolveme:
1. En 5 líneas, qué entendiste que hay que construir.
2. Las contradicciones o huecos que veas entre CLAUDE.md, el perfil y el programa clínico.
3. Las 3 decisiones estructurales que hay que cerrar antes de escribir la primera línea,
   con tu recomendación para cada una y el trade-off.
4. La pregunta más importante que necesitás que yo responda. Una sola.
```

---

## Prompt 1 — Andamiaje

```
Armá el andamiaje mínimo del proyecto:

- package.json (pnpm), tsconfig.json con strict y noUncheckedIndexedAccess
- Vite + React 18 + TypeScript
- vitest + fast-check, eslint
- Dexie, Zod, js-yaml
- vite-plugin-pwa configurado pero sin service worker todavía
- Inter auto-hospedada en public/fonts, cargada con @font-face local.
  Cero referencias a Google Fonts ni a ningún CDN.
- Scripts: dev / build / preview / test / test:watch / typecheck / lint / dryrun

Creá la estructura de carpetas de la sección 3 de CLAUDE.md, con .gitkeep donde haga falta.
Un solo test trivial que pase, para verificar que la cadena funciona.

No implementes lógica todavía.
```

---

## Prompt 2 — Esquema de datos (la decisión más cara de revertir)

```
Diseñá config/programa.yaml y su validación en config/esquema.ts.

Requisitos:
- Un ejercicio tiene: id estable, nombre, pilar, fase(s) en que aparece, dosis estructurada
  (series, reps, seg_contraccion, seg_relajacion, descanso, frecuencia_semanal), minutos
  estimados, flag es_dosis_minima, nivel_evidencia, vigencia_desde, vigencia_hasta, activo.
- Las fases tienen: número, semanas, objetivo, ejercicios incluidos, y criterios de pasaje
  EXPRESADOS COMO DATOS EVALUABLES, no texto libre. El motor tiene que poder decidir
  "cumplido / no cumplido / datos insuficientes" sin que un humano interprete.
- El registro diario también se define acá: qué variables, qué escala, en qué momento del día,
  cuáles son obligatorias. Todas las escalas subjetivas van de 0 a 10 — el 0 tiene que ser
  representable, es el dato que confirma mejoría.
- Los ejercicios de fuerza (Kegel de fuerza, plancha) llevan una condición explícita de
  habilitación que depende del escenario funcional del perfil. Si el escenario es hipertónico
  o indeterminado, no se habilitan.
- Cambios aditivos: vigencia_desde/hasta, nunca edición destructiva.

Entregá:
1. docs/adr/0001-esquema-programa.md con el formato, por qué, y las alternativas descartadas.
2. config/esquema.ts con tipos y esquema Zod.
3. config/programa.yaml poblado con el contenido real de docs/programa-clinico.md.
4. Test que valide que el YAML pasa el esquema.

Antes de escribir: plan de 10 líneas y esperá mi OK. Esto es estructural.
```

---

## Prompt 3 — Log de eventos y núcleo puro

```
Implementá src/core con TDD. Test rojo primero, siempre.

Primero el log de eventos (src/core/eventos.ts):
- Tipos de evento: EJERCICIO_MARCADO, EJERCICIO_DESMARCADO, REGISTRO_DIARIO, CORRECCION,
  FASE_CAMBIADA. Todos con timestamp e id.
- Una función pura de reducción: log de eventos -> estado derivado.
- Invariante testeado: reducir el mismo log dos veces da el mismo estado. Property-based.
- Un evento duplicado no cambia el estado derivado.
- La fecha del evento se resuelve en America/Argentina/Buenos_Aires. Test explícito con un
  evento a las 23:40 hora local, que NO debe caer en el día siguiente.

Después el resto:
- semana.ts: semana ISO, límites de semana. Property-based. Bordes: 31/12 y 1/1 de años
  distintos, años con semana 53, lunes y domingo.
- adherencia.ts: % semanal, por ejercicio, por día, dosis mínima cumplida. Un ejercicio dado
  de baja a mitad de semana no cuenta como incumplido.
- tendencias.ts: promedios móviles 7 y 28 días, tolerantes a huecos. Definí explícitamente qué
  hace con días sin dato: no interpola y no los cuenta como cero.
- progresion.ts: evalúa los criterios de pasaje del YAML y devuelve
  cumplido / no cumplido / datos insuficientes, con el motivo y el número.
  Implementá la matriz tensión/control de 2x2 y qué recomendación devuelve cada cuadrante.

Sin I/O, sin DOM, sin React, sin new Date. El reloj entra por src/ports/Clock.ts.

Cerrá con: qué probé, qué no probé, riesgo residual.
```

---

## Prompt 4 — Puertos, adaptador fake y dry-run

```
Definí src/ports/Repo.ts: la interfaz mínima de persistencia.
Operaciones: append(evento), leerRango(desde, hasta), leerTodo(), exportar(), importar(json).
Nada de update ni delete.

Implementá src/adapters/fake/ en memoria.

Implementá tools/dryrun.ts: un CLI que cargue config/programa.yaml, genere un log de eventos
de ejemplo de 3 semanas con datos obviamente falsos, y me imprima en la terminal:
- la rutina del día de hoy según la fase vigente
- la adherencia semanal
- las tendencias de 7 y 28 días
- el resultado criterio por criterio del pasaje de fase
- en qué cuadrante de la matriz cae

Agregá el script pnpm dryrun.

Objetivo: que yo pueda validar toda la lógica sin navegador y sin UI. No escribas nada de
IndexedDB ni de React en esta tarea.
```

---

## Prompt 5 — Adaptador IndexedDB y persistencia defendida

```
Implementá src/adapters/idb/ sobre la interfaz Repo, con Dexie.

- Esquema versionado, migraciones idempotentes y nunca destructivas. ADR con el esquema.
- Validación Zod en la lectura: un registro corrupto no debe tumbar la app, se aísla y se
  reporta con un mensaje accionable.
- navigator.storage.persist() al instalar, y un indicador de si el navegador lo concedió.
- exportar(): JSON completo del log, con nombre de archivo que incluya la fecha.
- importar(): valida con Zod antes de escribir, y es idempotente — importar el mismo archivo
  dos veces no duplica eventos.
- Errores de cuota mapeados a castellano accionable.

Test de contrato: la misma suite de tests debe pasar contra el adaptador fake y contra el de
IndexedDB (usá fake-indexeddb para correrlo en vitest).

No escribas UI todavía.
```

---

## Prompt 6 — UI

```
Implementá src/ui a partir de los diseños de docs/stitch-prompts.md y de lo que te voy a pasar
como referencia visual.

Pantallas: Inicio, Rutina (dosis mínima), Guía (timer + detalle de ejercicio),
Bitácora (carga + tendencias).

Reglas no negociables:
- Cero lógica de dominio en componentes. Todo cálculo viene de src/core.
- Los ejercicios que se muestran son los de la fase vigente. Nunca el catálogo completo.
- El timer tiene dos modos separados: relajación (sin apnea) y fuerza (bloqueado si la fase
  no lo habilita, relajación al menos el doble que la contracción).
- Sin rachas, sin contadores de días perdidos, sin rojo por no cumplir.
- Targets ≥48px, tipografía ≥16px, acciones primarias en el 60% inferior de la pantalla.
- Estados vacíos resueltos: día 1 sin datos, semana sin registros, fase sin datos suficientes.

Empezá por Inicio y su estado vacío. Esperá mi OK antes de seguir con las demás.
```

---

## Prompt 7 — PWA, offline y cierre

```
- Service worker con precache total. Verificá que la app funciona completa en modo avión.
- manifest.webmanifest: nombre corto y neutro, ícono discreto, standalone, tema oscuro.
- Recordatorio de exportación en la revisión semanal, dentro de la app.
- Auditoría de red: build de producción, pestaña Network sin filtro, confirmá CERO peticiones
  externas después de la carga inicial. Pegame la lista de lo que se carga.
- README con instalación desde cero, cómo instalarla en el teléfono, y cómo exportar/importar.
- Repasá el .gitignore contra todo lo que se agregó.
- Verificá que no haya quedado ningún dato del perfil en código, tests o fixtures.
```

---

## Prompt recurrente — revisión semanal

Ya está en `.claude/commands/revision.md`. Se llama con `/revision`.

---

## Setup del entorno, una sola vez

```bash
node --version     # 20 o más
npm install -g pnpm

cd ~/proyectos/programa-pelvico
git init
cp docs/perfil.plantilla.md docs/perfil.md    # queda fuera de git
git add -A && git status                       # que NO aparezca perfil.md
git commit -m "chore: initial project scaffold"
```

Después abrís la carpeta en Antigravity y pegás el Prompt 0.
