from queue import Empty
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .store import (
    approve_current_request,
    create_intake_request,
    deny_current_request,
    get_runtime_snapshot,
    pause_current_request,
    resume_current_request,
    set_scenario,
    subscribe_events,
    unsubscribe_events,
)
from .models import IntakeAccepted, IntakeRequest, RuntimeScenario, ScenarioOption
from .scenarios import list_scenarios

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


@app.get('/api/scenarios', response_model=list[ScenarioOption])
def scenarios():
    return list_scenarios()


@app.get('/api/runtime', response_model=RuntimeScenario)
def get_runtime():
    return get_runtime_snapshot()


@app.get('/api/events')
def events():
    q = subscribe_events()

    def event_stream():
        try:
            yield 'event: connected\ndata: {"ok": true}\n\n'
            while True:
                try:
                    item = q.get(timeout=15)
                    yield f"event: {item['type']}\ndata: {item['payload']}\n\n"
                except Empty:
                    yield 'event: keepalive\ndata: {}\n\n'
        finally:
            unsubscribe_events(q)

    return StreamingResponse(event_stream(), media_type='text/event-stream')


@app.post('/api/intake/slack', response_model=IntakeAccepted)
def intake_slack(request: IntakeRequest):
    accepted = create_intake_request(request)
    return IntakeAccepted(
        status='accepted',
        requestId=accepted['requestId'],
        scenarioId=accepted['scenarioId'],
        clarificationNeeded=accepted['clarificationNeeded'],
    )


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
