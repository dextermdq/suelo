# ADR 0002: IndexedDB Schema y Persistencia

**Status:** Aceptado  
**Fecha:** 2026-09-18

## Decisión

Usar Dexie v4 sobre IndexedDB para persistencia defendida del log de eventos. Schema versionado, sin migraciones destructivas.

## Justificación

1. **Dexie abstrae IndexedDB:** API limpia, tipado, manejo de errores
2. **Versionado:** Permite agregar índices futuros sin romper
3. **Persistencia defendida:** Solicitar `navigator.storage.persist()` al instalar
4. **Validación:** Zod en lectura/escritura previene corrupción

## Schema v1

```
eventos
├── id (primary key, UUID)
├── timestamp (index)
└── fecha (index, para range queries)
```

El campo `fecha` permite `where('fecha').between(desde, hasta)` para lecturas eficientes.

## Errores manejados

- `QuotaExceededError` → Mensaje accionable en español
- Eventos corruptos → Aislados con Zod, no tumban la app
- Red desconectada → N/A (IndexedDB es local)

## Migración futura

Si necesitamos agregar índices:
```javascript
version(2).stores({
  eventos: 'id, timestamp, fecha, tipo'  // agregar índice tipo
})
```

No borra datos. Dexie maneja la migración.

## Import/Export

- Exporta JSON con metadatos (timestamp, version)
- Import valida con Zod antes de escribir
- Idempotente: importar dos veces = mismo estado

## Persistencia defendida

```typescript
// Al instalar la app
await repo.solicitarPersistencia()

// Mostrar al usuario si está persistido
const persistido = await repo.estaPersistido()
```

Browser: mostrar banner si NO está persistido (iOS la revoca en 7 días si no es persistente).
