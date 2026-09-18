# Programa Pélvico

PWA offline-first para seguir un programa de 12 semanas de control pélvico, movilidad, respiración y regulación neuromuscular.

## Instalación

### Requisitos
- Node 20+
- pnpm 8+

### Desarrollo

```bash
pnpm install
pnpm dev
```

Abre http://localhost:5173

### Build

```bash
pnpm build
pnpm preview  # ver build local
```

## En el teléfono (iOS/Android)

### iOS
1. Abre en Safari
2. Toca el menú de compartir (cuadro con flecha)
3. "Añadir a pantalla de inicio"
4. Acepta "Usar datos sin conexión"

### Android
1. Abre en Chrome
2. Menú (⋮) → "Instalar app"

## Arquitectura

```
Core Layer (94 tests)
├── eventos.ts       — log append-only
├── semana.ts        — fechas ISO 8601
├── adherencia.ts    — % semanal
├── tendencias.ts    — promedios móviles
└── progresion.ts    — criterios fase

Persist Layer
├── Repo interface
├── FakeRepo (memoria)
└── IdbRepo (IndexedDB, offline)

UI Layer (React)
├── PantallaInicio   — adherencia + botones
├── PantallaRutina   — ejercicios del día
├── PantallaGuía     — detalle + timer
└── PantallabitÁcora — registro + tendencias

PWA Layer
├── Service Worker   — precache
├── Manifest        — instalable
└── Offline-first   — funciona sin red
```

## Privacidad

✅ **Cero backend.** Todos los datos quedan en tu dispositivo.  
✅ **Cero telemetría.** Sin analytics, sin tracking.  
✅ **Offline-first.** Funciona completa sin red.  
✅ **Persistencia defendida.** iOS no la desaloja si está instalada.

## Exportar datos

Dentro de la app: Bitácora → "Exportar". Se descarga un JSON con todo tu histórico.

## Importar datos

Bitácora → "Importar JSON" → selecciona el archivo.

## Scripts

```bash
pnpm dev           # Servidor de desarrollo
pnpm build         # Build para producción
pnpm preview       # Preview local del build
pnpm test          # Tests unitarios
pnpm test:watch    # Tests en watch mode
pnpm typecheck     # Verificar tipos
pnpm lint          # Lint con ESLint
pnpm dryrun        # CLI para probar lógica sin UI
```

## Documentación

- `CLAUDE.md` — Instrucciones del proyecto (no editar)
- `docs/programa-clinico.md` — Contenido clínico (no editar)
- `docs/adr/` — Decisiones de arquitectura
- `config/programa.yaml` — Programa (datos, versioned)

## Desarrollo

Ver `CLAUDE.md` §10 para workflow de desarrollo.

**Criterio de éxito:** Que la abra el día 1 de la semana 1, y al día 40.  
**Momento crítico:** Las 23:40 en la cama con poca luz. Marcar checks + anotar dos números debe llevar <20 segundos.

---

**Built with ❤️ for pelvic health.**
