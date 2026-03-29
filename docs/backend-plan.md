# Backend Plan

TrustPlane is now moving from an in-browser mocked runtime adapter toward a real backend.

## Chosen direction

- **Backend:** FastAPI
- **Frontend:** React + TypeScript + Tailwind

## Why FastAPI

This is the best future-facing option because it aligns with:

- Python-heavy AI/runtime ecosystems
- easier runtime adapter work later
- strong API ergonomics
- clear Pydantic models for runtime contracts

## Initial backend responsibilities

- serve current runtime snapshot
- switch scenario
- mutate runtime state via approve / deny / pause / resume
- expose health endpoint

## Initial endpoints

- `GET /api/health`
- `GET /api/runtime`
- `POST /api/runtime/scenario/{scenario_id}`
- `POST /api/runtime/approve`
- `POST /api/runtime/deny`
- `POST /api/runtime/pause`
- `POST /api/runtime/resume`

## Current status

The FastAPI backend scaffold exists under `backend/`.
The frontend is not yet wired to it.
That is the next migration step.
