# CanariasCerca — Architecture (public-safe)

This is an **architectural overview**, not proprietary source code or an exact infrastructure inventory.

```mermaid
flowchart LR
  subgraph PUBLIC[Public facing]
    WEB[Responsive frontend / MapLibre]
    CHARTS[Tourism analytics views]
    STUDIO[Editorial Studio]
  end
  subgraph BACKEND[Production system — conceptual]
    API[FastAPI · Pydantic]
    JOBS[Python jobs / scheduled ingestion]
    VALID[Data normalization + validation]
    DB[(PostgreSQL / Neon)]
    SRC[External data providers]
  end
  WEB --> API
  CHARTS --> API
  STUDIO --> API
  SRC --> JOBS --> VALID --> DB
  API <--> DB
```

## Boundaries

- Browser demonstration: static HTML/CSS/JavaScript with synthetic records.
- Real product: https://canariascerca.es. The architecture reflects high-level technological responsibilities verified against the project, not a claim that GitHub Pages executes Python.
- **Not included:** application servers, operational endpoints, schemas from production, prompts, credentials, proprietary algorithms, internal scheduler settings, production data or admin access.
- Job and AI controls on the demonstration are local deterministic simulations. They neither issue provider requests nor publish anything.
