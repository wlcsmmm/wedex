# Wedex — Claude Context

## Wayne-OS

This project is part of the [wayne-os](https://github.com/WayinMobbin/wayne-os) context system.

- Full instructions: [`projects/wedex/instructions.md`](https://github.com/WayinMobbin/wayne-os/blob/main/projects/wedex/instructions.md)
- Current context: [`projects/wedex/context.md`](https://github.com/WayinMobbin/wayne-os/blob/main/projects/wedex/context.md)
- Session log: [`projects/wedex/evolve/observations.md`](https://github.com/WayinMobbin/wayne-os/blob/main/projects/wedex/evolve/observations.md)
- Distilled principles: [`projects/wedex/evolve/distilled.md`](https://github.com/WayinMobbin/wayne-os/blob/main/projects/wedex/evolve/distilled.md)

## What this project is

An AI-powered wedding budget planner for Singapore couples. Budget-first: plan vendor spend → assign credit cards for miles → track actuals vs plan → intelligent insights.

## Current state

- Phase 1 build spec: complete (`app/wedex-claude-code-prompt.md`)
- Early PWA prototype: exists (`documents/wedding-ledger/index.html`)
- Supabase project: not provisioned
- Next.js scaffold: not started
- Next: provision Supabase → build auth → 7-step onboarding → dashboard

## Key rules (full rules in wayne-os)

- Build in phases: A (Plan) → B (Track) → C (Intelligence). Phase A only until confirmed.
- All amounts in SGD. SG credit card rewards, venue tiers, and ang bao are first-class features.
- RLS policies must be set up before any user-facing feature
- Ang bao tracking is a separate table — never merge with expenses
- Mobile-first (iPhone viewport primary)
- Multi-couple data isolation is a hard requirement — enforce via RLS

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL + Auth) · Claude Haiku · Vercel · next-pwa

## Base working rules

See [`global/instructions.md`](https://github.com/WayinMobbin/wayne-os/blob/main/global/instructions.md) in wayne-os.
