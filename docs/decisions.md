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
- 2026-11-15: CI (`.github/workflows/ci.yml`) runs directly on GitHub-hosted `ubuntu-24.04` runners with Python 3.12 and Node 26 to match the Dockerfiles, not through docker compose, so pip and npm caching work.
- 2026-11-15: CI pins every action to a commit SHA, gives the workflow token `contents: read` only, and has no path filters, so the required `backend` and `frontend` checks always report.
- 2026-11-15: Dependabot checks pip, npm and GitHub Actions weekly, groups minor and patch updates into one PR per ecosystem, and waits 7 days before suggesting a new release.
- 2026-11-15: RustFS (`rustfs/rustfs`, Apache-2.0) replaces MinIO as the local S3 stand-in. MinIO's community edition was archived in April 2026, Docker Hub deleted `minio/minio` and `minio/mc` in September 2026, and quay.io rejects anonymous pulls. Code will use only the S3 API, behind `Storage`, so the stand-in can change without touching app code.
- 2026-11-15: The dev bucket is created by a one-shot `amazon/aws-cli` container using plain S3 API calls, not a vendor CLI. Credentials use provider-neutral `S3_*` names.
- 2026-11-15: Caddy is the only local web entry, on `127.0.0.1:8080`, HTTP only (`http://localhost` is a secure context, so camera and mic work). The backend and Vite ports are no longer published. Caddy strips `/api` and uvicorn runs with `--root-path /api`, so `/api/docs` works.
- 2026-11-15: LiveKit and the S3 API aren't proxied through Caddy. The browser reaches them directly, as it will reach LiveKit Cloud and CloudFront in production.
- 2026-11-15: Local LiveKit runs in dev mode with `--node-ip 127.0.0.1`, published on 127.0.0.1 as 7880/tcp (HTTP/WS), 7881/tcp (ICE over TCP) and 7882/udp (all media on one muxed port), with keys from `LIVEKIT_KEYS`. Only browsers on the same PC can join, and there's no TURN locally.
- 2026-11-15: Every Docker image (compose and Dockerfiles) is pinned to an exact version tag, choosing releases at least 7 days old to match the Dependabot cooldown.
