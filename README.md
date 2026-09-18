# Programa Pélvico

PWA offline-first para seguir un programa de 12 semanas de control pélvico, movilidad, respiración y regulación neuromuscular.

## Setup

```bash
node --version    # 20+
pnpm install
pnpm dev
```

Abre http://localhost:5173

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — build para producción
- `pnpm preview` — preview del build
- `pnpm test` — run tests
- `pnpm test:watch` — watch mode
- `pnpm typecheck` — verificar tipos
- `pnpm lint` — lint con ESLint
- `pnpm dryrun` — ejecutar lógica sin UI

## Estructura

```
config/           → programa.yaml y esquema
src/
  core/           → lógica pura (sin I/O)
  ports/          → interfaces de adaptadores
  adapters/       → implementaciones (fake, idb)
  ui/             → componentes React
public/fonts/     → Inter auto-hospedada
tools/            → CLI utilities
```

## Invariantes críticos

1. **Append-only log:** Nada se borra, solo eventos nuevos
2. **Datos versionados:** El programa vive en config/programa.yaml, no en código
3. **Cero backend:** Sin API, sin autenticación, sin sincronización
4. **Offline primero:** Funciona completa en modo avión
5. **Privacidad:** Sin telemetría, sin redes externas, datos en IndexedDB local

## Documentación

- `CLAUDE.md` — instrucciones del proyecto
- `KICKOFF.md` — secuencia de construcción
- `docs/programa-clinico.md` — contenido clínico
- `docs/perfil.md` — línea de base (privado, gitignored)
