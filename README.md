# Proveento

Marketplace inverso B2B. Los compradores publican necesidades; el admin (Concierge) carga propuestas; el comprador compara a ciegas hasta aceptar.

## Flujo Git (obligatorio)

```
feat/mi-funcionalidad  →  develop  →  main
```

1. Nueva funcionalidad = nueva rama desde `develop`.
2. Nombre de rama en kebab-case y alineado a lo que se construye (`feat/formulario-request`).
3. Commits en español, cortos y claros (porqué + qué).
4. Push de la rama de funcionalidad. PR a `develop`. Cuando esté estable, PR de `develop` a `main`.
5. Los commits salen con la identidad Git local del dueño del repo. Nunca como Cursor.

Detalle para el agente: `.cursor/rules/` (siempre activo):

- `git-workflow.mdc` — ramas y commits
- `proveento-architecture.mdc` — PLAN y Blind Broker
- `ui-design.mdc` — skill UI/UX Pro Max
- `agent-checklist.mdc` — orden obligatorio al inicio de cada ajuste

## Stack

Next.js (App Router), TypeScript, Tailwind, Shadcn UI, Prisma, PostgreSQL (Supabase), Supabase Auth.

## Arranque local

1. Copia `.env.example` a `.env.local` y completa las keys.
2. `npm install`
3. `npx prisma migrate deploy`
4. `npm run dev`
