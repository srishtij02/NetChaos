from fastapi import FastAPI
from pydantic import BaseModel
import json
from pathlib import Path


app = FastAPI(title="NetChaos API")

CONFIG_PATH = Path(__file__).parent / "config.json"


class ChaosConfig(BaseModel):
    latency_seconds: float
    timeout_seconds: float
    drop_connection: bool
    bandwidth_kbps: float


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


@app.get("/config")
async def get_config():
    with open(CONFIG_PATH, "r") as file:
        return json.load(file)


@app.post("/config")
async def update_config(config: ChaosConfig):
    with open(CONFIG_PATH, "r") as file:
        current_config = json.load(file)

    current_config.update(config.model_dump())

    with open(CONFIG_PATH, "w") as file:
        json.dump(current_config, file, indent=4)

    return {
        "status": "updated",
        "config": current_config
    }