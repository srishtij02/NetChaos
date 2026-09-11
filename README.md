NetChaos

NetChaos is a local network chaos engineering tool that lets you simulate unreliable network conditions through a TCP proxy.

It provides a web dashboard for configuring and observing network faults such as latency, bandwidth throttling, connection timeouts, and intentional connection drops.

Features
Artificial network latency injection
Bandwidth throttling
Connection timeout simulation
Intentional connection dropping
Async TCP proxy
REST API for configuration
Real-time backend health monitoring
Web-based control dashboard
Activity and configuration views
Automated backend tests
Local-first architecture
Architecture
                    NetChaos Dashboard
                    Next.js + React
                         │
                         │ HTTP
                         ▼
                  FastAPI REST API
                    127.0.0.1:8000
                         │
                         │
                  ┌──────┴──────┐
                  │             │
                  ▼             ▼
             config.json    TCP Proxy
                              :9000
                                │
                                ▼
                         Upstream Service
                           :8000

The dashboard communicates with the FastAPI backend.

The TCP proxy listens on port 9000 and forwards traffic to the configured upstream service on port 8000.

Chaos Controls
Control	Description
Latency	Adds artificial delay before forwarding traffic
Bandwidth	Limits throughput through the proxy
Timeout	Closes inactive connections after the configured period
Drop Connections	Intentionally terminates incoming connections
Tech Stack
Backend
Python
FastAPI
Uvicorn
asyncio
pytest
Frontend
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide Icons
Project Structure
NetChaos/
├── api.py
├── proxy.py
├── server.py
├── client.py
├── config.json
├── test/
│   └── test_proxy.py
│
└── frontend/
    ├── app/
    ├── components/
    ├── hooks/
    ├── lib/
    ├── public/
    ├── package.json
    └── ...
Configuration

The backend configuration is stored in config.json.

Example:

{
    "upstream_host": "127.0.0.1",
    "upstream_port": 8000,
    "listen_host": "127.0.0.1",
    "listen_port": 9000,
    "latency_seconds": 5.0,
    "timeout_seconds": 5.0,
    "drop_connection": false,
    "bandwidth_kbps": 0.0
}

A bandwidth value of 0 means unlimited bandwidth.

Running the Backend

Open PowerShell in the project directory:

cd C:\Users\MAA\Documents\NetChaos

Activate the virtual environment:

.\.venv\Scripts\Activate.ps1

Start the FastAPI API:

uvicorn api:app --reload

The API will be available at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs

Running the TCP Proxy

In another PowerShell window:

cd C:\Users\MAA\Documents\NetChaos

Activate the virtual environment:

.\.venv\Scripts\Activate.ps1

Start the proxy:

python proxy.py

The proxy listens on:

http://127.0.0.1:9000

Running the Frontend

Open another PowerShell window:

cd C:\Users\MAA\Documents\NetChaos\frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The dashboard will be available at:

http://localhost:3000

The frontend communicates with the backend at:

http://127.0.0.1:8000

The API URL can be overridden with the environment variable:

NEXT_PUBLIC_NETCHAOS_API_URL

API Endpoints
Method	Endpoint	Description
GET	/	Service status
GET	/health	Health check
GET	/config	Get current chaos configuration
POST	/config	Update chaos configuration
Testing

The backend includes tests for:

Latency injection
Connection dropping
Connection timeout
Multiple simultaneous clients
Bandwidth limiting

Run the test suite from the project root:

pytest

Expected result:

5 passed
Development Workflow

Run these three processes during local development.

Terminal 1 — API
uvicorn api:app --reload
Terminal 2 — Proxy
python proxy.py
Terminal 3 — Frontend
cd frontend
npm run dev

Then open:

http://localhost:3000

Current Status

NetChaos currently provides a working end-to-end local workflow:

Dashboard
   ↓
FastAPI API
   ↓
Configuration
   ↓
TCP Chaos Proxy
   ↓
Upstream Service

The frontend and backend are integrated into a single repository.

License

This project is currently intended as a personal/educational open-source project.