# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Office Talk is a Discord-style business collaboration site (company workspaces → team/project servers with chat, files, tasks/calendar, roadmap, and LiveKit calls). It is a CV portfolio project: real-product quality, but no real payments and no public launch.

The repo is at **phase 0**. It holds:

- `docs/plan.md`: the source of truth for scope, roles, data model, stack, phases and compliance. Read the relevant section before starting any task.
- `docs/wireframes/*.html`: static HTML/CSS/JS mockups with no build step. Open them directly in a browser.
- `backend/`: a FastAPI app with `GET /health` and one pytest. It has no database code yet.
- `frontend/`: React + TS + Vite. One page that shows the backend health. No Tailwind or TanStack Query yet.
- `infra/`: a placeholder. Terraform comes later.
- `docker-compose.yml`: db (Postgres 16), redis, backend (:8000) and frontend (:5173). Every port is bound to `127.0.0.1`; keep it that way for any new service.

CI, Caddy, MinIO and LiveKit don't exist yet. Don't invent commands for them.

## Commands

The host only needs Docker. `make` isn't installed on the dev machine, so each target has its `docker compose` equivalent:

| make | docker compose |
| --- | --- |
| `make up` | `docker compose up --build` |
| `make test` | `docker compose run --rm --no-deps backend pytest` |
| `make lint` | `docker compose run --rm --no-deps backend ruff check .`, then `... backend ruff format --check .`, then `... frontend npm run typecheck` |
| `make down` | `docker compose down` |

Run a single test with `docker compose run --rm --no-deps backend pytest tests/test_health.py::test_health_returns_ok`.

## How to work from the plan

- Build in the phase order of plan §8, and finish each phase's "Done when" check before starting the next. Don't add features outside the current phase. Work only on the issue named in the prompt.
- Where the plan says **Decision needed** (or lists something under §13 "Still open"), stop and ask the owner. Don't guess.
- If a wireframe and `plan.md` disagree, the plan wins and the wireframe gets updated. Plan §3 lists the known gaps for each screen (for example, Messages should have only Chat and Files tabs, and the pre-join screen starts with mic and camera **off**).
- Record decisions in `docs/decisions.md`, one dated line each. When a checklist item is done, tick it in `docs/plan.md`.
- One feature per branch and pull request. Keep diffs under about 400 lines.
- A task is only done when the tests and linter pass. Never skip, delete or weaken a failing test to make it pass; explain the failure instead.
- Ask before any AWS, Terraform or `git push` action, even if it seems safe.

## Wireframes

- There are two shells. Marketing/auth pages (`index`, `pricing`, `signup`, `login`, `create-company`, `join`, `call`) use `site.css` + `site.js`. In-app pages (`company`, `server`, `messages`, `settings`, `personal-*`) use `app.css` + `app.js`.
- `app.js` holds the shared app behaviour: toasts, the side drawer (`openDrawer`/`closeDrawer`), the status menu, the Ctrl+K switcher, and the `window.store` localStorage helper (keys prefixed `wf.`). Placeholder data like `window.SERVERS` stands in for the backend.
- The wireframes get rebuilt as React components. Use them for **layout and structure only. Never copy their colours** (`app.css`/`site.css` tokens included).

## Theme and colours

- Every colour is a CSS variable defined in one place, `frontend/src/theme.css`, with a light set (`:root`, `:root[data-theme="light"]`) and a dark set (`:root[data-theme="dark"]`). Names: `--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--accent`, `--accent-contrast`, `--success`, `--danger`. Add new tokens there, to both sets.
- The theme switches on the `data-theme` attribute of `<html>`. It defaults to the system setting (`prefers-color-scheme`), set by the inline script in `frontend/index.html` before first paint. Phase 0 has no toggle button.
- **Never hard-code a colour in a component** (no hex/rgb/hsl/named colours in TSX or component CSS). Use `var(--token)`. When Tailwind arrives, map its theme colours to these variables.

## Planned architecture (plan §6–7)

The backend is a modular monolith on AWS (eu-west-2):

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2, Alembic, Pydantic. It serves REST plus one WebSocket per browser tab for live events.
- **Data and jobs:** PostgreSQL 16 for data. Redis + arq workers handle presence, fan-out, rate limits, email and guest expiry.
- **Frontend:** React + TypeScript + Vite + Tailwind + TanStack Query.
- **External services:** S3 (MinIO locally) served via CloudFront signed URLs, SES email, LiveKit Cloud calls (the LiveKit server runs in Docker for dev), OnlyOffice for Office editing (phase 3), and Stripe in **test mode only**.
- **Edge, infra and CI:** Cloudflare at the edge, Terraform for infra, Caddy as reverse proxy, GitHub Actions for CI/CD.
- **Call media:** goes browser → LiveKit directly. The backend only signs short-lived, single-room tokens and consumes LiveKit webhooks into `call_sessions`/`usage_records`.

Rules that cut across the whole codebase:

- **Permissions:** every permission check goes through one function, `can(user, company, server, action, resource)` in `backend/app/permissions.py`. Never put checks inside route handlers.
- **Multi-tenancy:** every table except `users` has `company_id`, and every query on company data filters on it. Each new endpoint gets a cross-company access test.
- **Migrations:** schema changes go only through Alembic migrations. Use UUID primary keys and `created_at`/`updated_at` everywhere.
- **Provider interfaces:** calls (`CallProvider`), email (`Mailer`), storage (`Storage`) and billing (`Billing`) each sit behind a small interface class, so swapping a provider touches one file.
- **Shared scope pattern:** files and folders use `scope` = `personal` | `chat` | `server`; tasks, calendar events and roadmap items use `scope` = `personal` | `server`, plus the matching id. Chat attachments live in an automatic Chat folder and count against storage once. Personal views ("My tasks", "My calendar") are queries across scopes, not copies.
- **Role layers:** platform admin (`/platform`, MFA), then company (owner / IT admin / member), then server (manager / lead / member / viewer). Guests have no accounts: they join one call by link, each visit is capped at 6 hours, and the link dies when the meeting ends.
- **Secrets:** they live in a git-ignored `.env` and AWS Secrets Manager, never in the repo.

## Repo conventions

- `.gitattributes` forces LF line endings (`* text=auto eol=lf`). Development happens on Windows, so keep LF.
- Hosting budget is about £15 a month. Prefer free tiers and small instances when proposing infrastructure.