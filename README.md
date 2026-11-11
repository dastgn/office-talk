# Office Talk

A Discord-style collaboration site for businesses: company workspaces, team and project servers with chat, files, tasks, calendar, roadmap and calls. It's a CV portfolio project: built to real-product quality, with no real payments and no public launch. See [`docs/plan.md`](docs/plan.md) for scope and phases.

## Layout

| Folder | What's in it |
| --- | --- |
| `backend/` | FastAPI app (Python 3.12) |
| `frontend/` | React + TypeScript + Vite |
| `infra/` | Terraform (later) |
| `docs/` | Plan, decisions and wireframes |

## Run it locally

You need only Docker Desktop. `make` is optional, because every target wraps one `docker compose` command.

```sh
docker compose up --build      # or: make up
```

- App: http://localhost:5173
- API health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

All ports are bound to `127.0.0.1`, so they can't be reached from other devices on your network. Copy `.env.example` to `.env` to change the database credentials.

## Test and lint

```sh
docker compose run --rm --no-deps backend pytest                  # make test
docker compose run --rm --no-deps backend ruff check .            # make lint (all three)
docker compose run --rm --no-deps backend ruff format --check .
docker compose run --rm --no-deps frontend npm run typecheck
```

Stop with `docker compose down`. Add `-v` to delete the Postgres data volume.
