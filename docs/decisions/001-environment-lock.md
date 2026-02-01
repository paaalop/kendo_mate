# Environment Lock & Configuration Decisions

**Date:** 2026-02-02
**Status:** Active

## 1. Core Stack Versions
To ensure stability and industry-standard compliance for 2026, the following versions are locked:

- **Next.js:** `16.1.6` (Latest Stable)
- **React:** `19.0.0`
- **TypeScript:** `5.x`
- **Tailwind CSS:** `4.x`
- **Supabase JS:** `2.48.4`
- **Node.js:** `>= 20.0.0`

## 2. Architectural Decisions

### Middleware vs Proxy
**Decision:** Migrate from `middleware.ts` to `proxy.ts`.
**Reason:** Next.js 16 deprecated the `middleware.ts` file convention in favor of `proxy.ts` to strictly define the network boundary layer.
**Implementation:**
- File: `kendo/proxy.ts`
- Export: `export async function proxy(request: NextRequest)`
- Config: Standard matcher configuration retained.

### Package Management
**Decision:** Strict versioning.
**Reason:** To prevent `SWC` binary mismatches and React 19 peer dependency warnings.
**Action:** `package-lock.json` must be respected. Use `npm ci` or clean installs if version drift occurs.

## 3. Restriction for AI Agents
**Rule:** AI Agents are **FORBIDDEN** from downgrading Next.js below version 16.x or reverting `proxy.ts` to `middleware.ts` without explicit user override. This configuration is considered the "Golden Path" for this project.
