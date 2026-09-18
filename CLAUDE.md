# CLAUDE.md — Programa Pélvico

Instrucciones persistentes del proyecto. Se cargan en cada sesión. Leelas antes de tocar nada.

---

## 1. Qué es esto

App web personal (PWA) para seguir un programa de 12 semanas de control pélvico, movilidad,
respiración y regulación neuromuscular.

**Un solo usuario, un solo dispositivo, sin cuentas, sin backend, sin multiusuario.**
No propongas autenticación, API, base de datos remota ni sincronización entre dispositivos.
Si una tarea parece necesitar algo de eso, decilo y paramos: casi seguro el diseño está mal.

**Criterio de éxito:** que yo la abra el día 40. Todo lo demás es secundario.
El momento crítico son las 23:40, en la cama, con poca luz: marcar los checks del día y anotar
dos números tiene que llevar menos de 20 segundos. Si una decisión de diseño mejora la pureza
del código y empeora eso, se rechaza.

---

## 2. Principio arquitectónico rector

> **El programa de ejercicios es DATO. El código es MOTOR.**

El catálogo de ejercicios, dosis, pilares, fases, umbrales de progresión y reglas de dosis
mínima viven en `config/programa.yaml`, versionado en git.

El código no sabe qué es una Malasana. Sabe leer un catálogo, renderizar, calcular adherencia
y derivar tendencias.

**Cambiar el programa no debe requerir cambiar código.** Si para agregar un ejercicio o ajustar
una dosis hay que editar un `.ts` o un `.tsx`, el diseño está mal y hay que decirlo.

Los cambios de programa son aditivos: entrada nueva con `vigencia_desde`, nunca edición
destructiva. El histórico tiene que seguir siendo interpretable con el catálogo vigente al
momento en que se registró.

---

## 3. Estructura del repo

```
config/
  programa.yaml          → catálogo de ejercicios, fases, dosis, umbrales. Fuente de verdad.
  esquema.ts             → tipos + validación Zod de programa.yaml
docs/
  perfil.md              → mi línea de base clínica. NO SE COMMITEA (ver §7)
  programa-clinico.md    → fundamento clínico, técnica, nivel de evidencia
  stitch-prompts.md      → prompts de diseño de UI
  adr/NNNN-titulo.md     → decisiones caras de revertir (formato Nygard)
src/
  core/                  → LÓGICA PURA. Sin I/O, sin DOM, sin Date del sistema.
    eventos.ts           → tipos del log de eventos y reducción a estado derivado
    adherencia.ts        → % semanal, por ejercicio, por día; dosis mínima cumplida
    progresion.ts        → criterios de pasaje de fase, matriz tensión/control
    semana.ts            → semana ISO, límites de semana, cambio de año
    tendencias.ts        → promedios móviles 7/28 días, tolerantes a huecos
  ports/
    Repo.ts              → interfaz de persistencia (append evento, leer rango)
    Clock.ts             → interfaz de reloj
  adapters/
    idb/                 → implementación real sobre IndexedDB
    fake/                → en memoria: tests + dry-run
  ui/
    screens/             → una pantalla por archivo
    components/          → componentes compartidos
    state/              → estado de UI. Cero lógica de dominio acá.
  app.tsx
tools/
  dryrun.ts              → CLI que imprime el estado derivado en la terminal, sin navegador
tests/
public/
  fonts/                 → Inter auto-hospedada (ver §7)
  manifest.webmanifest
```

**Regla de dependencia:** `src/core` no importa nada de `src/adapters`, `src/ui` ni de React.
Los adaptadores dependen de las interfaces de `src/ports`. Toda I/O cruza un puerto explícito.

Si aparece `window`, `document`, `React` o `Dexie` en algún archivo bajo `src/core/`, es un bug
bloqueante. Si aparece un cálculo de adherencia o de fase dentro de un componente, también.

---

## 4. Stack

- TypeScript estricto: `strict: true`, `noUncheckedIndexedAccess: true`. Sin `any`.
  `as` solo en bordes, siempre detrás de validación Zod.
- Node 20+ · pnpm · Vite · React 18
- Persistencia: IndexedDB vía Dexie. **Nunca `localStorage` para el registro** (se desaloja y
  es sincrónico); `localStorage` solo para preferencias triviales de UI como la pestaña activa.
- Zod en todo borde: el YAML del programa y todo dato que se lea de IndexedDB.
- PWA: `vite-plugin-pwa`, precache total, instalable, funciona en modo avión.
- Tests: vitest. `fast-check` para property-based en fechas, adherencia y reducción de eventos.
- Zona horaria de referencia: `America/Argentina/Buenos_Aires`. La fecha de un evento se
  resuelve en esa zona, no en UTC, o un registro de las 23:40 cae en el día equivocado.

---

## 5. Invariantes (violarlas es bug crítico, no preferencia de estilo)

1. **Nada se borra. El store es un log de eventos append-only.**
   Marcar, desmarcar, registrar y corregir son todos eventos nuevos. Todo lo que se muestra es
   estado derivado del log. Nunca un `update` ni un `delete` sobre un registro histórico.
2. **Idempotencia.** Reproducir el log dos veces da el mismo estado derivado. Las migraciones
   de esquema de IndexedDB son idempotentes y nunca destructivas.
3. **Cero deuda.** No hay rachas, no hay contador de días perdidos, no hay "te debés 3 sesiones",
   no hay números en rojo por no cumplir. La adherencia es porcentaje de la semana en curso y
   nada más. Si una propuesta introduce cualquier forma de castigo por día salteado, rechazala
   y explicá por qué. **Esto aplica también a la UI**, no solo al modelo.
4. **Reloj como puerto.** Ningún `new Date()` dentro de `src/core`. La fecha entra por `Clock`.
5. **Cálculo puro y testeable.** Toda decisión (adherencia, promedios, pasaje de fase,
   matriz tensión/control) se calcula en `src/core` y se testea sin navegador.
6. **Cero red en runtime.** La app no hace **ninguna** petición después de cargar. Sin analytics,
   sin telemetría, sin reporte de errores remoto, sin fuentes de CDN, sin iconos remotos,
   sin webhooks. Mis datos no salen del dispositivo.
7. **Persistencia defendida.** `navigator.storage.persist()` al instalar. Exportación a JSON de
   un toque. La app me recuerda exportar en la revisión semanal. Sin esto, el invariante 1 es
   mentira: iOS puede desalojar IndexedDB.
8. **Offline primero.** Tiene que funcionar completa en modo avión, siempre. Si una pantalla
   necesita red para renderizar, está mal hecha.
9. **Discreción.** Nombre corto y neutro en el manifest y en el ícono de inicio. Ninguna
   notificación con texto específico sobre el contenido. Nada de compartir, publicar ni exportar
   a servicios de terceros.
10. **Sin datos personales en el repo.** Ver §7.

---

## 6. Anti-patrones prohibidos

- Rachas, streaks, contadores de días perdidos, emojis de castigo, badges de "perfect week".
- Cualquier ejercicio, dosis, fase o umbral hardcodeado en código o en un componente.
- `if (ejercicio === 'kegel')` fuera de la capa de datos.
- Lógica de dominio dentro de un componente React.
- `update` o `delete` sobre un evento ya guardado.
- `localStorage` para el registro.
- Fuentes de Google Fonts o cualquier recurso de CDN: filtra que uso la app y cuándo.
  Inter va auto-hospedada en `public/fonts/`.
- Un `try/catch` que se traga el error y sigue.
- Levantar un backend, agregar autenticación, agregar multiusuario, agregar sincronización.
- Escribir contenido clínico nuevo sin fuente (ver §8).
- Notificaciones push con texto explícito.

---

## 7. Privacidad — esto es lo más sensible del repo

Esto es un registro de salud sexual. Tratalo como tal.

- `docs/perfil.md`, cualquier `*.local.*`, cualquier export de datos y cualquier captura de la
  app van en `.gitignore`. Verificá el `.gitignore` antes de cada commit que agregue archivos.
- Nunca pegues datos de mi perfil, síntomas o registros en un commit, en un test, en un fixture
  ni en un comentario. Los fixtures usan datos inventados y obviamente falsos.
- El despliegue es estático y sin datos: el host nunca recibe nada mío. Aun así, no despliegues
  sin preguntarme, y no sugieras un dominio que describa el contenido.
- Si necesitás un dato de `docs/perfil.md` para una decisión de diseño, leelo pero no lo
  reproduzcas en tu respuesta ni en un archivo versionado.

---

## 8. Barandas sobre el contenido clínico

El contenido clínico **no es código y no se improvisa**.

- Vive en `docs/programa-clinico.md` y en `config/programa.yaml`. No lo inventes ahí.
- Cada ejercicio lleva `nivel_evidencia`: `alto` | `moderado` | `bajo` | `consenso_clinico`.
- Si no tenés la fuente, escribí `TODO(verificar): <qué hay que confirmar>` y preguntame.
  No rellenes con algo plausible.
- **Distinción que gobierna todo el programa:** un suelo pélvico hipertónico empeora con Kegels
  de fortalecimiento. El orden es down-training primero, up-training después y solo si
  corresponde. Si una tarea te pide agregar trabajo de fuerza y `docs/perfil.md` indica escenario
  hipertónico o indeterminado, paralo y avisame.
- **La UI muestra los ejercicios de la fase vigente, nunca el catálogo completo.** Si la app
  muestra un ejercicio que la fase no habilita, lo voy a hacer. Eso es un bug clínico.
- El timer tiene **dos modos separados y no intercambiables**: relajación (sin fase de apnea;
  el suelo pélvico baja en la inhalación) y fuerza (relajación al menos el doble de larga que
  la contracción, y bloqueado hasta que la fase lo habilite). Fusionarlos es un bug clínico.
- Si detectás en mi perfil o en mis registros algo que amerita consulta presencial (dolor,
  cuadro adquirido reciente, empeoramiento sostenido), decilo en la primera línea de tu
  respuesta y no sigas con la tarea de código como si nada.

---

## 9. Comandos

Podés correr sin preguntar:

```
pnpm install · pnpm dev · pnpm build · pnpm preview
pnpm test · pnpm test:watch · pnpm typecheck · pnpm lint · pnpm dryrun
git status · git diff · git log · git add · git commit
```

**Pedí confirmación explícita antes de:**

```
git push · cualquier git reset/rebase/checkout que descarte trabajo
cualquier comando de despliegue (vercel, netlify, wrangler, gh-pages)
agregar una dependencia nueva — decime qué agrega y por qué no alcanza lo que hay
```

---

## 10. Cómo trabajás conmigo

- **Antes de escribir código:** plan de 10 líneas o menos, qué archivos tocás, y qué invariante
  de §5 estás protegiendo. Si la tarea es estructural, esperás mi OK. Si es chica, avanzás.
- **TDD en el núcleo.** Para fechas, adherencia, reducción de eventos y progresión: test rojo
  primero. Casos borde obligatorios: semana ISO a caballo del cambio de año, años con semana 53,
  registro a las 23:40 hora local, semana incompleta, ejercicio dado de baja a mitad de semana,
  evento duplicado, corrección de un registro anterior, cambio de fase a mitad de semana.
- **Diffs completos.** Nada de `// ... resto igual`. Si el archivo es largo, entregás el archivo
  entero.
- **ADR** en `docs/adr/` para toda decisión cara de revertir: esquema de `programa.yaml`,
  forma del log de eventos, esquema de IndexedDB y su versionado, estrategia de export.
- **Una pregunta concreta por vez** cuando algo es ambiguo. No asumas y sigas.
- **Contexto acotado.** Leé los archivos que la tarea necesita, no el repo entero.
- Español rioplatense en docs, UI, mensajes de error y comentarios. Inglés en código, tipos,
  nombres de funciones y mensajes de commit.
- **Cada entrega termina con tres líneas:** qué probé, qué no probé, riesgo residual.

---

## 11. Definition of Done

- [ ] Tests del núcleo pasan, incluidos los casos borde de §10
- [ ] `pnpm typecheck` limpio, sin `any`, sin `@ts-ignore`
- [ ] Verificado con el adaptador `fake` antes de tocar IndexedDB
- [ ] Reproducir el log dos veces da el mismo estado derivado
- [ ] Funciona en modo avión
- [ ] Ningún recurso remoto: verificá la pestaña Network con el filtro en "todo"
- [ ] Targets de toque ≥48px, tipografía ≥16px, acciones primarias en el 60% inferior
- [ ] Errores en castellano y accionables
      ("No pude guardar: el almacenamiento está lleno. Exportá y liberá espacio."
      y no "QuotaExceededError")
- [ ] Nada de programa hardcodeado: el cambio se puede hacer editando `config/programa.yaml`
- [ ] `.gitignore` cubre todo dato personal nuevo que la tarea haya introducido
- [ ] ADR o README del módulo actualizado si la decisión es estructural
- [ ] Sin secretos, sin `TODO` sin dueño, sin datos reales en fixtures
