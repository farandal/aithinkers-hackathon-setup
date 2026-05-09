"""
MCP proxy tool — calls tools on tenant MCP servers.

MCP server configs arrive in session state (under 'mcpServers') from the
Laravel context builder. The agent calls `mcp_call` to invoke a named tool
on a named MCP server via its HTTP transport.
"""

import json
import httpx
from google.adk.tools import ToolContext


async def mcp_call(
    server_name: str,
    tool_name: str,
    arguments: dict,
    tool_context: ToolContext = None,
) -> dict:
    """Call a tool on a configured MCP server.

    Args:
        server_name: The name of the MCP server as configured in FabLabOS.
        tool_name: The tool to invoke on that server.
        arguments: JSON-serializable arguments dict for the tool.

    Returns:
        The tool result as a dict, or an error dict.
    """
    mcp_servers: list = []

    if tool_context and hasattr(tool_context, "state"):
        mcp_servers = tool_context.state.get("mcpServers", [])

    server = next((s for s in mcp_servers if s.get("name") == server_name), None)
    if not server:
        return {"error": f"MCP server '{server_name}' is not configured for this session"}

    url = server.get("url", "").rstrip("/")
    if not url:
        return {"error": f"MCP server '{server_name}' has no URL configured"}

    transport = server.get("transport_type", "sse")
    if transport != "sse":
        return {"error": f"Only SSE transport is currently supported (got '{transport}')"}

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{url}/tools/{tool_name}",
                json=arguments,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        return {"error": f"MCP tool call failed with HTTP {e.response.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def list_mcp_tools(tool_context: ToolContext = None) -> dict:
    """Discover all tools available on all configured MCP servers.

    Returns a dict mapping server_name → list of tool definitions.
    """
    mcp_servers: list = []

    if tool_context and hasattr(tool_context, "state"):
        mcp_servers = tool_context.state.get("mcpServers", [])

    result = {}
    async with httpx.AsyncClient(timeout=10) as client:
        for server in mcp_servers:
            name = server.get("name", "unknown")
            url = server.get("url", "").rstrip("/")
            if not url:
                continue
            try:
                resp = await client.get(f"{url}/tools")
                resp.raise_for_status()
                result[name] = resp.json()
            except Exception as e:
                result[name] = {"error": str(e)}

    return result
