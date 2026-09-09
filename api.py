from fastapi import FastAPI

app = FastAPI(title="NetChaos API")


@app.get("/")
async def root():
    return {
        "name": "NetChaos",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }