# Thin wrappers around docker compose, so the host only needs Docker.
# Without make, run the commands on the right directly.

.PHONY: up down logs test lint

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

test:
	docker compose run --rm --no-deps backend pytest

lint:
	docker compose run --rm --no-deps backend ruff check .
	docker compose run --rm --no-deps backend ruff format --check .
	docker compose run --rm --no-deps frontend npm run typecheck
