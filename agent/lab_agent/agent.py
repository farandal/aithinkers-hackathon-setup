"""
FabLab ADK agent — built on Google ADK with Gemini 2.0 Flash.

Context arrives in session state from `extract_lab_context` in server.py:
  state['systemPrompt']    — tenant-level system prompt from AgentConfiguration
  state['documentContext'] — selected lab documents (text content)
  state['mcpServers']      — active MCP server configs for this session

The agent uses two built-in tools:
  - update_lab_panel: stores A2UI panel data in session state →
      ag-ui-adk emits StateSnapshotEvent → frontend renders BYOC components
  - mcp_call: proxies calls to tenant MCP servers via HTTP SSE transport
"""

from google.adk.agents import LlmAgent
from google.adk.tools import ToolContext
from lab_agent.a2ui.catalog import A2UI_SYSTEM_PROMPT
from lab_agent.tools.mcp_proxy import mcp_call, list_mcp_tools


def build_instruction(ctx) -> str:
    state = getattr(ctx.session, "state", {}) if hasattr(ctx, "session") else {}
    system_prompt    = state.get("systemPrompt", "")
    document_context = state.get("documentContext", "")

    return f"""You are an intelligent laboratory assistant for FabLabOS STEM laboratories.
You help researchers manage experiments, analyze data, and document results.

{A2UI_SYSTEM_PROMPT}

{("--- Tenant configuration ---\n" + system_prompt) if system_prompt else ""}

When the user asks for data visualizations or structured results, call
`update_lab_panel` with the appropriate A2UI component JSON before responding.
When MCP tools are available, call `list_mcp_tools` first to discover them,
then use `mcp_call` to invoke them.

{('<documents>\n' + document_context + '\n</documents>') if document_context else ''}
"""


def update_lab_panel(panel_data: str, tool_context: ToolContext = None) -> str:
    """Store A2UI panel data in session state so the frontend can render it.

    Args:
        panel_data: JSON string matching one of the A2UI component schemas
                    (LabDataChart, LabResultTable, LabStatusCard, LabIframeTool)
                    or a JSON array of multiple components.

    Returns:
        Confirmation string.
    """
    import json
    try:
        parsed = json.loads(panel_data)
    except (json.JSONDecodeError, TypeError):
        return "Error: panel_data must be valid JSON"

    if tool_context and hasattr(tool_context, "state"):
        tool_context.state["a2uiPanel"] = parsed

    return "Panel updated"


def create_lab_agent() -> LlmAgent:
    return LlmAgent(
        name="lab_agent",
        model="gemini-2.5-flash",
        description="FabLab STEM laboratory assistant with A2UI panel rendering and MCP tool support",
        instruction=build_instruction,
        tools=[
            update_lab_panel,
            mcp_call,
            list_mcp_tools,
        ],
    )
