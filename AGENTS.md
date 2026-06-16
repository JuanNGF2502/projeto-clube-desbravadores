<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-status -->
# STATUS DO PROJETO — 14/06/2026

**Framework:** Next.js 16.2.6 | **Banco:** Supabase PostgreSQL | **Status GERAL:** ~95%

## ✅ CONCLUÍDO

### Etapa 1 — Fundações (100%)
- Next.js + Supabase client configurados
- Tipos TypeScript (698 linhas em `src/types/index.ts`)
- Estado global com Zustand + persistência
- 15+ componentes UI base (AppButton, AppCard, AppModal, AppBadge, etc.)
- AppLayout com header, breadcrumbs, bottom nav (4 abas: Início, Classes, Unidades, Perfil)
- Tema dark/light com ThemeProvider e script anti-flash
- React Query, Toast, ColorPicker, ClubeSelector

### Etapa 2 — Membros e Unidades (100%)
- CRUD completo de membros com busca, filtros, ativar/desativar
- MembroCard, MembroFormModal, MembroDetailModal, MembroInativoModal, CriarAcessoModal
- Atribuição de cargos (com validação de nível) e classes (múltiplas)
- Histórico de unidades (membros_unidades)
- CRUD completo de unidades com ColorPicker (até 5 cores)
- Página de detalhes da unidade (tabs: Resumo, Integrantes, Sobre)
- ScoreCard, RankingModal, UnitHeader com gradiente
- Modo Conselheiro (vê apenas unidades que orienta)

### Etapa 3 — Classes e Requisitos (100%)
- Lista de classes com progresso circular e ordem
- Modal de requisitos por classe (ClassRequirementsPopup)
- Requisições em 4+ áreas (Espiritualidade, Habilidades, Vida ao Ar Livre, Liderança)
- Progresso individual por membro (membros_requisitos)
- Modo Instrutor (marcar requisitos ensinados)
- Conclusão de classe com transição automática
- 7 classes regulares (Amigo a Guia + Agrupadas)
- Dashboard com progresso por classe

### Etapa 4 — Avaliações e Ranking (100%)
- 7 critérios (Pontualidade, Uniforme, Material, etc.)
- Níveis A(30pts)/B(20pts)/C(0pts)
- Sessões de avaliação (CRUD + ativar/desativar)
- Salvamento batch
- Ranking de unidades (30 dias) e de membros
- Classificação: A ≥120, B ≥90, C <90

### Etapa 5 — Especialidades (100%)
- Lista com busca e filtro por categoria (7 categorias)
- CRUD completo com níveis (Básico/Intermediário/Avançado)
- Atribuição/marcação de conclusão

### Etapa 6 — Histórico e Transições (100%)
- 8 tipos de transição (ENTRADA, SAIDA, TROCA_UNIDADE, etc.)
- Timeline do membro (`/membros/[id]/timeline`)
- Atividades recentes no dashboard
- Transição automática ao concluir classe

### Etapa 7 — Autenticação e Clubes (100%)
- Login com email/senha, cadastro com role, esqueci senha
- AuthProvider, useAuth, useRequireAuth
- CRUD de clubes, ClubeSelector, persistência
- useClubId com fallback

### PWA e Extras (100%)
- Service Worker (cache-first static, network-first API)
- Manifest, PWABanner, InstallPWAButton
- Página offline, usePWA hook
- API routes (/api/debug, /api/sync, /api/webhooks, /api/create-user)
- 26 migrations, 15+ índices, RLS policies

## 🔄 EM DESENVOLVIMENTO

Nenhum — todas as etapas estão concluídas.

## ❌ PENDENTE

- Testes automatizados (nenhum encontrado)
- Hardcoded club ID fallback (`'00000000-0000-0000-0000-000000000001'` em `useClube.ts`)
- Verificar imagens das classes em `/public/images/`

## PÁGINAS (15)
`/`, `/login`, `/dashboard`, `/membros`, `/membros/[id]/timeline`, `/unidades`, `/unidades/[id]`, `/unidades/[id]/avaliacoes`, `/unidades/gerenciar`, `/classes`, `/classes/gerenciar`, `/especialidades`, `/clubes`, `/profile`, `/offline`
<!-- END:project-status -->
