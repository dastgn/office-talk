from fastapi import FastAPI

app = FastAPI(title="Office Talk")


@app.get("/health")
def health() -> dict[str, str]:
    """Liveness check used by Docker and the frontend."""
    return {"status": "ok"}
