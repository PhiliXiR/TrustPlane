from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .store import (
    approve_current_request,
    deny_current_request,
    get_runtime_snapshot,
    pause_current_request,
    resume_current_request,
    set_scenario,
)
from .models import RuntimeScenario

app = FastAPI(title='TrustPlane API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/api/health')
def health():
    return {'ok': True}


@app.get('/api/runtime', response_model=RuntimeScenario)
def get_runtime():
    return get_runtime_snapshot()


@app.post('/api/runtime/scenario/{scenario_id}', response_model=RuntimeScenario)
def set_runtime_scenario(scenario_id: str):
    return set_scenario(scenario_id)


@app.post('/api/runtime/approve', response_model=RuntimeScenario)
def approve():
    return approve_current_request()


@app.post('/api/runtime/deny', response_model=RuntimeScenario)
def deny():
    return deny_current_request()


@app.post('/api/runtime/pause', response_model=RuntimeScenario)
def pause():
    return pause_current_request()


@app.post('/api/runtime/resume', response_model=RuntimeScenario)
def resume():
    return resume_current_request()
