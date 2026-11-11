# Decisions

One dated line per decision, newest at the bottom.

- 2026-11-11: Backend dependencies use pip with pinned `requirements.txt` / `requirements-dev.txt`. `pyproject.toml` holds tool config only (pytest, ruff), not uv or poetry.
- 2026-11-11: The frontend container uses `node:26-alpine`, matching the dev machine's Node 26.
- 2026-11-11: The backend health check is `GET /health`. The frontend calls the API under `/api`, which the Vite dev proxy strips; Caddy will do the same in production.
- 2026-11-11: The Makefile only wraps `docker compose`, so the host needs only Docker (make isn't installed on the Windows dev machine).
- 2026-11-11: Every Docker Compose published port is bound to `127.0.0.1`, so Postgres, Redis and the dev servers can't be reached from other devices on the network.
- 2026-11-11: Wireframes are for layout and structure only; their colours are not reused. All frontend colours are CSS variables in `frontend/src/theme.css`, with one light set and one dark set, switched by `data-theme` on `<html>` and defaulting to `prefers-color-scheme`. Components never hard-code colours. Phase 0 has no theme toggle button.
- 2026-11-11: The `.claude/settings.json` read-deny rule is narrowed from `.env*` to `.env`, `.env.local` and `.env.production`, so `.env.example` (placeholders only) can be committed.
- 2026-11-11: The backend tests keep `httpx==0.28.1` for Starlette's TestClient and accept its `StarletteDeprecationWarning` (Starlette 1.10.0 prefers `httpx2`). We'll switch once the `httpx2` PyPI maintainers have been checked by hand.
