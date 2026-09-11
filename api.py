from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
import json
from pathlib import Path


app = FastAPI(title="NetChaos API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONFIG_PATH = Path(__file__).parent / "config.json"
METRICS_PATH = Path(__file__).parent / "metrics.json"


class ChaosConfig(BaseModel):
    latency_seconds: float = Field(ge=0)
    timeout_seconds: float = Field(gt=0)
    drop_connection: bool
    reset_connection: bool
    bandwidth_kbps: float = Field(ge=0)

    @model_validator(mode="after")
    def validate_chaos_config(self):
        if self.drop_connection and self.reset_connection:
            raise ValueError(
                "drop_connection and reset_connection cannot both be enabled"
            )

        return self

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

    return current_config


@app.get("/metrics")
async def get_metrics():
    with open(METRICS_PATH, "r") as file:
        return json.load(file)
