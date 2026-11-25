# Seguimiento de candidaturas

**App publicada:** https://seguimiento-candidaturas.vercel.app

App web para llevar el control de una búsqueda de empleo: empresas, puesto, estado de cada candidatura, fecha de seguimiento y notas. Cada usuario entra con su email y contraseña y solo ve sus propias candidaturas.

## Qué hace

- Registro e inicio de sesión con email y contraseña (Firebase Authentication).
- Crear, editar y borrar candidaturas, con confirmación antes de borrar.
- Estados: pendiente de enviar, enviada, entrevista, oferta y rechazada.
- Resumen con el total por estado y aviso de los seguimientos vencidos.
- Buscador sin distinguir mayúsculas ni tildes, y filtro por estado.
- Datos en Cloud Firestore, con reglas que aíslan a cada usuario y validan cada campo.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Firebase (Auth + Firestore), Vitest y Vercel.

## Equipo de agentes

El proyecto se ha construido con tres agentes de Claude Code:

| Agente | Archivo | Papel |
|---|---|---|
| Orquestador | [`CLAUDE.md`](CLAUDE.md) (y [`AGENTS.md`](AGENTS.md) para Codex) | Divide el trabajo en tareas, las reparte y decide cuándo están terminadas |
| Develop | [`.claude/agents/develop.md`](.claude/agents/develop.md) | Programa siguiendo su guía |
| Testing | [`.claude/agents/testing.md`](.claude/agents/testing.md) + [`DIRECTRICES.md`](DIRECTRICES.md) | Revisa el trabajo de Develop contra las directrices y le devuelve los fallos hasta que todo pasa |

Las rondas del bucle Develop → Testing, con los fallos que se encontraron y cómo se corrigieron, están en [`docs/registro-agentes.md`](docs/registro-agentes.md).

## Ejecutarlo en local

```bash
npm install
cp .env.example .env.local   # y rellena la configuración web de tu proyecto de Firebase
npm run dev
```

`npm run check` ejecuta lint, comprobación de tipos, tests y build: es lo que exige Testing antes de aprobar una tarea.

Las reglas de Firestore se publican con `firebase deploy --only firestore`.

Las claves no están en el repositorio. En Vercel se configuran como variables de entorno `NEXT_PUBLIC_FIREBASE_*`.
