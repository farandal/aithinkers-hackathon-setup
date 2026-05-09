"""
A2UI component catalog schemas injected into the agent's system prompt.

Without the `a2ui` Python SDK, component schemas are described here as
JSON-formatted strings. The agent uses them to decide what structured data
to emit via `update_lab_panel`, which the frontend renders through the
BYOC catalog in @copilotkit/a2ui-renderer.
"""

COMPONENT_SCHEMAS = """
## A2UI Lab Components

When presenting structured data, call the `update_lab_panel` tool with a
JSON object that matches one of the following component schemas. The frontend
will render the appropriate React component automatically.

### LabDataChart
Use for time-series or categorical numerical data (sensor readings, experiment
results, measurements over time).
```json
{
  "type": "LabDataChart",
  "title": "string",
  "unit": "string",
  "data": [{"label": "string", "value": "number"}]
}
```

### LabResultTable
Use for tabular data (experiment results, comparisons, multi-column records).
```json
{
  "type": "LabResultTable",
  "title": "string",
  "columns": ["string"],
  "rows": [["string or number"]]
}
```

### LabStatusCard
Use for summarizing lab status, equipment health, or project metrics.
```json
{
  "type": "LabStatusCard",
  "title": "string",
  "status": "active | warning | error | idle",
  "metrics": [{"label": "string", "value": "string"}]
}
```

### LabIframeTool
Use for embedding interactive tools, simulations, or external dashboards.
```json
{
  "type": "LabIframeTool",
  "url": "string",
  "title": "string",
  "height": "number (pixels)"
}
```

When you want to display a panel, call `update_lab_panel` with the component
JSON. You can combine multiple components by wrapping them in an array:
```json
[
  {"type": "LabStatusCard", ...},
  {"type": "LabDataChart", ...}
]
```
"""

A2UI_SYSTEM_PROMPT = COMPONENT_SCHEMAS.strip()
