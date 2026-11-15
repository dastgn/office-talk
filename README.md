# Office Talk

A Discord-style collaboration site for businesses: company workspaces, team and project servers with chat, files, tasks, calendar, roadmap and calls. It's a CV portfolio project: built to real-product quality, with no real payments and no public launch. See [`docs/plan.md`](docs/plan.md) for scope and phases.

## Layout

| Folder | What's in it |
| --- | --- |
| `backend/` | FastAPI app (Python 3.12) |
| `frontend/` | React + TypeScript + Vite |
| `infra/` | Local Caddy config now; Terraform later |
| `scripts/` | Smoke test for the local stack |
| `docs/` | Plan, decisions and wireframes |

## Run it locally

You need only Docker Desktop. `make` is optional, because every target wraps one `docker compose` command.

```sh
docker compose up --build      # or: make up
```

Caddy is the single front door, set up like production: `/api/*` goes to FastAPI with the prefix stripped, and everything else goes to the Vite dev server (hot reload included).

| What | URL |
| --- | --- |
| App | http://localhost:8080 |
| API health | http://localhost:8080/api/health |
| API docs | http://localhost:8080/api/docs |
| S3 API (RustFS) | http://localhost:9000 (bucket `officetalk-dev`, created on start-up) |
| S3 console | http://localhost:9001/rustfs/console/ (dev login `officetalk` / `officetalk-dev-secret`) |
| LiveKit | `ws://localhost:7880` (dev key `devkey`) |
| Postgres / Redis | `localhost:5432` / `localhost:6379` |

All ports are bound to `127.0.0.1`, so they can't be reached from other devices on your network. Every credential is a dev placeholder. Copy `.env.example` to `.env` to change them.

RustFS stands in for S3 locally. MinIO was the original plan, but its community edition was archived and its Docker images were removed (see [`docs/decisions.md`](docs/decisions.md)).

Check the running stack with the smoke test (Git Bash on Windows):

```sh
sh scripts/smoke.sh            # or: make smoke
```

### LiveKit on Docker Desktop for Windows

WebRTC media normally travels over UDP. LiveKit needs three ports, all published on `127.0.0.1`:

| Port | Used for |
| --- | --- |
| 7880/tcp | HTTP API and the WebSocket signalling connection |
| 7881/tcp | ICE over TCP, a fallback when UDP is blocked |
| 7882/udp | All audio and video, multiplexed onto one port in dev mode |

Docker Desktop runs containers inside a WSL2 VM and forwards published TCP **and UDP** ports from Windows into it, so `127.0.0.1:7882:7882/udp` works. The catch is ICE: LiveKit has to tell the browser an address it can reach, but inside the container it only knows its internal 172.x Docker IP. `--node-ip 127.0.0.1` makes it advertise `127.0.0.1` instead, and the browser on the same PC reaches that through Docker's port forwarding. Dev mode's single UDP port avoids publishing the production range of 10,000 ports, which Docker Desktop handles badly.

What this rules out: only browsers on the same PC can join a local call, so there's no testing from a phone, and there's no TURN server. `http://localhost` counts as a secure context, so camera and mic access work without HTTPS.

## Test and lint

```sh
docker compose run --rm --no-deps backend pytest                  # make test
docker compose run --rm --no-deps backend ruff check .            # make lint (all three)
docker compose run --rm --no-deps backend ruff format --check .
docker compose run --rm --no-deps frontend npm run typecheck
```

Stop with `docker compose down`. Add `-v` to delete the data volumes (Postgres, S3 and Caddy).
