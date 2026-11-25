# DIRECTRICES de calidad

Las mantiene el agente **Testing**. El agente **Develop** está obligado a cumplirlas todas. Un incumplimiento de una directriz **bloqueante** hace que la tarea se rechace.

## Calidad básica

| ID | Tipo | Directriz |
|---|---|---|
| D-01 | Bloqueante | `npm run check` (lint, tipos, tests y build) termina sin errores. |
| D-02 | Bloqueante | No hay `any`, `@ts-ignore` ni `eslint-disable` en el código. |
| D-03 | Bloqueante | No quedan `console.log` ni código comentado. |

## Seguridad

| ID | Tipo | Directriz |
|---|---|---|
| D-04 | Bloqueante | No hay claves, tokens ni contraseñas en el código ni en el repositorio. La configuración se lee de `process.env.NEXT_PUBLIC_FIREBASE_*` y solo se sube `.env.example` vacío. |
| D-05 | Bloqueante | `firestore.rules` solo deja leer y escribir a cada usuario sus propios documentos (`users/{uid}/...`) y deniega todo lo demás. |
| D-06 | Bloqueante | Las reglas validan los campos y tipos de cada candidatura. Si el modelo de datos cambia, las reglas cambian con él. |
| D-07 | Bloqueante | Las páginas privadas no muestran datos sin sesión: redirigen a `/login`. |
| D-19 | Bloqueante | `firestore.rules` y `validateApplication` son coherentes: mismos campos, límites y estados; `followUp` es `null` o fecha `AAAA-MM-DD` en ambos; `createdAt` y `updatedAt` son números en las reglas y `createdAt` no cambia al actualizar. |

## Arquitectura

| ID | Tipo | Directriz |
|---|---|---|
| D-08 | Bloqueante | Los componentes no importan `firebase/*`. Todo el acceso a Firebase está en `src/lib` (excepción: el proveedor de autenticación). |
| D-09 | Bloqueante | La validación de una candidatura está en una función pura de `src/lib` y se usa antes de guardar. |
| D-10 | Recomendación | `"use client"` solo en componentes que lo necesitan. |

## Tests

| ID | Tipo | Directriz |
|---|---|---|
| D-11 | Bloqueante | Cada función exportada de `src/lib/applications.ts` y `src/lib/stats.ts` que no dependa de Firebase tiene tests. |
| D-12 | Bloqueante | Cada función testeada tiene al menos un caso normal y un caso límite (vacío, fecha pasada, texto demasiado largo...). |

## Experiencia de usuario

| ID | Tipo | Directriz |
|---|---|---|
| D-13 | Bloqueante | Toda operación con Firebase muestra un estado de carga y un mensaje de error en español si falla. |
| D-14 | Bloqueante | Los formularios muestran los errores de validación junto al campo y no se envían si no son válidos. |
| D-15 | Bloqueante | Borrar una candidatura pide confirmación antes. |
| D-16 | Bloqueante | Todos los textos están en español con tildes correctas. |
| D-17 | Recomendación | La interfaz se usa bien en móvil (375 px de ancho, sin scroll horizontal). |
| D-18 | Recomendación | Los campos de formulario tienen `label` y los botones con solo icono tienen `aria-label`. |
