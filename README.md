# Carbon Journal — Agentic Capstone

Built on top of an existing personal project, [Folio Carbon Journal](https://github.com/grLavanya/folio-carbon-journal), extended for the Kaggle x Google AI Agents Intensive Vibe Coding Capstone.

## Problem
People struggle to connect small daily choices to real environmental impact. Most carbon trackers feel like judgmental spreadsheets, which causes disengagement rather than reflection.

## Solution
A personal carbon journal where users write freeform entries about eco-actions. An AI agent reasons about each entry's real-world impact (grounded in real emission-factor data via a custom MCP tool) and generates a personalized reflection. A live illustrated world reacts visually to cumulative impact over time.

## Architecture
User submits entry
│
▼
/api/analyze-entry.ts (Vercel serverless function)
│
├─► get_emission_factor (MCP tool, JSON-RPC 2.0) — looks up grounded CO2e data
│
▼
Gemini 1.5 Flash (Impact Agent) — reasons about impact using entry + emission data + mood
│
├─ success ─► returns { score, impactType, worldEffect, reflection }
└─ failure ─► usedFallback: true → frontend calls existing rule-based analyzeEntry()

## Key Concepts Demonstrated
| Concept | Where |
|---|---|
| Agent | `api/analyze-entry.ts` — Gemini-powered reasoning agent |
| MCP Server | `src/mcp/emissionServer.ts` — JSON-RPC 2.0 tool server, `get_emission_factor` |
| Agent Skill | `.agents/skills/journal-impact-analysis/SKILL.md` |
| Security | Supabase Row-Level Security; Gemini API key server-side only (never in client bundle) |
| Deployability | Deployed on Vercel — experiencing a post-deploy Supabase connectivity issue at submission time. Code and architecture are fully functional; see demo video. |
| Antigravity | Built using Antigravity IDE throughout development — see demo video |

## Tech Stack
React 18, TypeScript, Vite, Tailwind CSS, Supabase (auth + Postgres + RLS), Gemini 1.5 Flash, Vercel (hosting + serverless functions), Vitest.

## Setup Instructions
1. Clone this repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (server-side, used by `/api/analyze-entry`, NOT prefixed with VITE_)
4. `npm run dev`
5. Deployed version auto-builds via Vercel on push to `main`

## Note on Reuse
This project builds on an existing personal project (Folio Carbon Journal — journal UI, auth, database, deployment pipeline, tests). New for this capstone: the Impact Agent, MCP server, reliability fallback pattern, agent skill packaging, and the security hardening of the API key.