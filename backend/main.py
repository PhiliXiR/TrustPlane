from queue import Empty
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .store import (
    approve_current_request,
    create_intake_request,
    deny_current_request,
    get_intake_example,
    get_request_context,
    get_runtime_snapshot,
    list_intake_examples,
    list_runtime_scenarios,
    pause_current_request,
    project_request_snapshot,
    project_request_timeline,
    release_execution_authority,
    resume_current_request,
    set_current_by_request_id,
    set_scenario,
    subscribe_events,
    unsubscribe_events,
)
from .models import IntakeAccepted, IntakeExampleFixture, IntakeExampleSummary, IntakeRequest, RequestSnapshot, RequestTimelineResponse, RuntimeScenario, ScenarioOption

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
    return [ScenarioOption.model_validate(item) for item in list_runtime_scenarios()]


@app.get('/api/examples', response_model=list[IntakeExampleSummary])
def examples():
    return list_intake_examples()


@app.get('/api/examples/{example_id}', response_model=IntakeExampleFixture)
def example_detail(example_id: str):
    item = get_intake_example(example_id)
    if item is None:
        return {}
    return item


@app.get('/api/runtime', response_model=RuntimeScenario)
def get_runtime():
    return get_runtime_snapshot()


@app.get('/api/requests/{request_id}', response_model=RequestSnapshot)
def get_request_snapshot(request_id: str):
    context = get_request_context(request_id)
    return project_request_snapshot(context['scenario'])


@app.get('/api/requests/{request_id}/timeline', response_model=RequestTimelineResponse)
def get_request_timeline(request_id: str):
    context = get_request_context(request_id)
    return project_request_timeline(context['scenario'])


@app.post('/api/requests/{request_id}/approve', response_model=RuntimeScenario)
def approve_request(request_id: str):
    set_current_by_request_id(request_id)
    return approve_current_request()


@app.post('/api/requests/{request_id}/deny', response_model=RuntimeScenario)
def deny_request(request_id: str):
    set_current_by_request_id(request_id)
    return deny_current_request()


@app.post('/api/requests/{request_id}/pause', response_model=RuntimeScenario)
def pause_request(request_id: str):
    set_current_by_request_id(request_id)
    return pause_current_request()


@app.post('/api/requests/{request_id}/resume', response_model=RuntimeScenario)
def resume_request(request_id: str):
    set_current_by_request_id(request_id)
    return resume_current_request()


@app.post('/api/requests/{request_id}/release-execution', response_model=RuntimeScenario)
def release_request_execution(request_id: str):
    set_current_by_request_id(request_id)
    return release_execution_authority()


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


@app.get('/api/requests/{request_id}/stream')
def request_events(request_id: str):
    q = subscribe_events(request_id=request_id)

    def event_stream():
        try:
            yield f'event: connected\\ndata: {{"ok": true, "requestId": "{request_id}"}}\\n\\n'
            while True:
                try:
                    item = q.get(timeout=15)
                    yield f"event: {item['type']}\\ndata: {item['payload']}\\n\\n"
                except Empty:
                    yield 'event: keepalive\\ndata: {}\\n\\n'
        finally:
            unsubscribe_events(q)

    return StreamingResponse(event_stream(), media_type='text/event-stream')


@app.post('/api/intake', response_model=IntakeAccepted)
def intake(request: IntakeRequest):
    accepted = create_intake_request(request)
    return IntakeAccepted(
        status='accepted',
        requestId=accepted['requestId'],
        scenarioId=accepted['scenarioId'],
        clarificationNeeded=accepted['clarificationNeeded'],
    )


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


@app.post('/api/runtime/release-execution', response_model=RuntimeScenario)
def release_execution():
    return release_execution_authority()


@app.post('/api/runtime/deny', response_model=RuntimeScenario)
def deny():
    return deny_current_request()


@app.post('/api/runtime/pause', response_model=RuntimeScenario)
def pause():
    return pause_current_request()


@app.post('/api/runtime/resume', response_model=RuntimeScenario)
def resume():
    return resume_current_request()
