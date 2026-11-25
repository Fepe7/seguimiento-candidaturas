# Registro de agentes

Cada ronda del bucle Develop → Testing queda apuntada aquí por el orquestador.

## Plan

| # | Tarea | Criterio de aceptación |
|---|---|---|
| T1 | Base: Firebase, modelo de datos y lógica pura | `src/lib` con validación, estadísticas y tests; `npm run check` en verde |
| T2 | Autenticación | Login y registro con email y contraseña; `/` redirige a `/login` sin sesión |
| T3 | Panel de candidaturas | Crear, editar, borrar con confirmación, filtrar por estado, buscar y ver seguimientos vencidos |

## Rondas

### T1 · Ronda 1
- **Develop:** crea `src/lib/firebase.ts`, `applications.ts`, `stats.ts` y 31 tests. `npm run check` en verde.
- **Testing:** RECHAZADO.
  1. [D-06] `firestore.rules` no comprobaba el tipo de `createdAt`/`updatedAt` y dejaba cambiar `createdAt` al editar.
  2. [D-19] `followUp` aceptaba cualquier texto en las reglas, pero la app solo admite `AAAA-MM-DD`.
- Testing añade la directriz **D-19** (coherencia entre reglas y validación).

### T1 · Ronda 2
- **Develop:** corrige `firestore.rules`: `createdAt` y `updatedAt` como `number`, `createdAt` no cambia en `update` y `followUp` con formato `AAAA-MM-DD`. El orquestador despliega las reglas.
- **Testing:** **APROBADO**. Sin fallos.
