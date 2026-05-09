import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from ag_ui_adk import ADKAgent
from ag_ui_adk.endpoint import _sse_stream, _legacy_stream
from ag_ui.core import RunAgentInput
from ag_ui.encoder import EventEncoder
from sse_starlette.sse import EventSourceResponse, ServerSentEvent
from lab_agent.agent import create_lab_agent

app = FastAPI(title="FabLab ADK Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

adk_agent_instance = ADKAgent(adk_agent=create_lab_agent())


async def _extract_lab_context(request: Request, input_data: RunAgentInput) -> dict:
    props = input_data.forwarded_props or {}
    if not isinstance(props, dict):
        return {}
    return {
        "systemPrompt":    props.get("systemPrompt", ""),
        "documentContext": props.get("documentContext", ""),
        "mcpServers":      props.get("mcpServers", []),
    }


def _sse(data: str) -> ServerSentEvent:
    """Byte-identical to ag_ui_adk.endpoint._sse_event."""
    return ServerSentEvent(data=data, sep="\n")


async def _noop_sse_stream(thread_id: str, run_id: str):
    """No-op AG-UI SSE stream for state-sync runs that carry no user message."""
    yield _sse(json.dumps({"type": "RUN_STARTED", "threadId": thread_id, "runId": run_id}))
    yield _sse(json.dumps({"type": "STATE_SNAPSHOT", "snapshot": {}}))
    yield _sse(json.dumps({"type": "RUN_FINISHED", "threadId": thread_id, "runId": run_id}))


async def _noop_legacy_stream(thread_id: str, run_id: str):
    """No-op AG-UI NDJSON stream for non-SSE clients."""
    for event in [
        {"type": "RUN_STARTED", "threadId": thread_id, "runId": run_id},
        {"type": "STATE_SNAPSHOT", "snapshot": {}},
        {"type": "RUN_FINISHED", "threadId": thread_id, "runId": run_id},
    ]:
        yield f"data: {json.dumps(event)}\n\n"


@app.post("/api/copilotkit")
async def copilotkit_endpoint(request: Request):
    body = await request.json()
    import logging
    logging.getLogger("server").info(
        "POST /api/copilotkit | Accept: %s | method: %s | msgs: %s",
        request.headers.get("accept", ""),
        body.get("method") if isinstance(body, dict) else "?",
        [m.get("role") for m in (body.get("body", {}) or {}).get("messages", []) if isinstance(m, dict)]
        if isinstance(body, dict) and "body" in body else "?"
    )

    # CopilotKit sends {"method": "info"} on mount to discover agents.
    if isinstance(body, dict) and body.get("method") == "info":
        return JSONResponse({
            "mode": "sse",
            "a2uiEnabled": True,
            "agents": {
                "default": {
                    "description": "FabLab STEM laboratory assistant",
                },
                "lab_agent": {
                    "description": "FabLab STEM laboratory assistant",
                },
            },
        })

    # CopilotKit single-transport wraps run requests as
    # {"method": "agent/run"|"agent/connect", "params": {...}, "body": {RunAgentInput fields}}
    method = body.get("method", "") if isinstance(body, dict) else ""
    if method in ("agent/run", "agent/connect"):
        run_body = body.get("body", {})
    else:
        run_body = body

    accept_header = request.headers.get("accept", "")
    encoder = EventEncoder(accept=accept_header)
    content_type = encoder.get_content_type()

    thread_id = run_body.get("threadId", "") if isinstance(run_body, dict) else ""
    run_id = run_body.get("runId", "") if isinstance(run_body, dict) else ""

    # Guard: ADK requires a new user message. CopilotKit sends state-sync runs on
    # mount (useCoAgent hydration) with no user messages — return a no-op stream.
    messages = run_body.get("messages", []) if isinstance(run_body, dict) else []
    has_user_message = any(
        isinstance(m, dict) and m.get("role") == "user" for m in messages
    )
    if not has_user_message:
        if content_type == "text/event-stream":
            return EventSourceResponse(_noop_sse_stream(thread_id, run_id))
        return StreamingResponse(_noop_legacy_stream(thread_id, run_id), media_type=content_type)

    input_data = RunAgentInput.model_validate(run_body)

    extracted = await _extract_lab_context(request, input_data)
    if extracted:
        existing_state = input_data.state if isinstance(input_data.state, dict) else {}
        input_data = input_data.model_copy(update={"state": {**existing_state, **extracted}})

    if content_type == "text/event-stream":
        return EventSourceResponse(_sse_stream(adk_agent_instance, input_data))
    return StreamingResponse(
        _legacy_stream(adk_agent_instance, input_data, encoder),
        media_type=content_type,
    )


@app.get("/api/copilotkit/threads")
async def threads_endpoint(agentId: str = "default"):
    return JSONResponse({"threads": []})


@app.get("/api/copilotkit/capabilities")
async def capabilities_endpoint():
    return JSONResponse({})
