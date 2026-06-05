# ProjetoClube

Sistema de Gestão para Clubes de Desbravadores.

## Stack

- **Next.js 16** com App Router
- **Supabase** (autenticação + banco PostgreSQL)
- **Tailwind CSS v4**
- **Zustand** (estado global)
- **React Query** (cache e sincronização)

## Setup

```bash
cp .env.local.example .env.local
# Preencha as variáveis no .env.local
npm install
npm run dev
```

## Scripts

- `npm run dev` — Development server
- `npm run build` — Build de produção
- `npm run start` — Iniciar servidor de produção
- `npm run lint` — Verificar lint
