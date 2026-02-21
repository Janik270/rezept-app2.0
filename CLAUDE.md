# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

German recipe management web app ("Rezept-App") built with Next.js 16 App Router, TypeScript, Prisma (SQLite), and Tailwind CSS v4. Features AI-powered recipe generation/scanning via OpenAI, Chefkoch.de recipe import, i18n (DE/EN), and a cooking mode.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint 9 flat config)
- **Prisma migrate:** `npx prisma migrate dev --name <migration_name>`
- **Prisma generate:** `npx prisma generate`
- **Prisma studio:** `npx prisma studio`
- **No test suite exists** in this project.

## Architecture

- **App Router:** `app/` directory with server components (pages) and client components (`"use client"`)
- **API routes:** `app/api/` using Next.js Route Handlers (route.ts files)
- **Database:** SQLite via Prisma ORM. Schema in `prisma/schema.prisma`. Singleton client in `lib/db.ts`
- **Session:** Cookie-based via `iron-session`, configured in `lib/session.ts`. Secret via `SECRET_COOKIE_PASSWORD` env var
- **AI integration:** OpenAI (GPT-4o, GPT-4o-mini, DALL-E 3) in `lib/openai.ts`. API key stored in DB `Setting` table, configured via admin dashboard
- **i18n:** Client-side React Context in `lib/i18n.tsx` with DE/EN translations, default German
- **Shared components:** `components/` at project root; page-specific components in `app/components/`
- **Path alias:** `@/*` maps to project root (tsconfig)

## Key Patterns

- First two registered users automatically get ADMIN role
- Generated recipes go through a PENDING → APPROVED/REJECTED workflow managed by admins
- Recipe import scrapes Chefkoch.de using axios + cheerio (`app/api/import/route.ts`)
- Ingredients and instructions are stored as newline-separated strings
- Standalone output mode for Docker deployment (Raspberry Pi with Caddy reverse proxy)

## Environment Variables

- `DATABASE_URL` — Prisma SQLite connection (e.g., `file:./dev.db`)
- `SECRET_COOKIE_PASSWORD` — iron-session cookie encryption (min 32 chars)
- `NODE_ENV` — production/development
- `USE_SECURE_COOKIES` — set to `"true"` for HTTPS deployments
