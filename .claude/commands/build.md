# /build

Generate an importable n8n workflow JSON from a description or plan.

## Usage
```
/build Create a webhook that receives form data and sends to Slack
```

## Process
1. Invoke n8n-builder agent directly
2. Generate MVP workflow JSON
3. Include sticky notes for documentation
4. Provide credentials/env requirements

## Output

### 1. Workflow JSON
```json
{
  "name": "Form to Slack Notification",
  "nodes": [...],
  "connections": {...}
}
```

### 2. Required Setup
```
## Credentials
- Slack API (OAuth2)

## Environment
- SLACK_CHANNEL_ID: Target channel for notifications
```

## Rules
- MVP first, not enterprise-perfect
- Use placeholders for all secrets
- Include error handling path
- Add sticky notes explaining each section
- Name nodes with numeric prefixes

## Instance Selection
If not specified, ask which instance:
- leadgenjay (server.leadgenjay.com)
- nextwave (server.nextwave.io)

$ARGUMENTS
