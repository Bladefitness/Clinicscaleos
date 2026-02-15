---
name: api-research
description: Research and document API endpoints before creating HTTP Request nodes. Use when adding any external API integration to n8n workflows.
allowed-tools:
  - Read
  - Write
  - WebFetch
  - WebSearch
  - mcp__apify__*
---

# API Research Skill

## When to Use
Activate this skill BEFORE creating any HTTP Request node in n8n workflows.

## Research Process

### Step 1: Find Official Documentation
1. Search for official API docs: `{service_name} API documentation`
2. Look for OpenAPI/Swagger specifications
3. Check for API reference pages

### Step 2: Document Key Information
For every API endpoint, document:

```markdown
# API: {Service Name}

## Base URL
`https://api.example.com/v1`

## Authentication
- **Type**: Bearer Token / API Key / OAuth2
- **Header**: `Authorization: Bearer {token}`
- **Location**: Header / Query Parameter

## Endpoint: {Endpoint Name}

### Request
- **Method**: GET/POST/PUT/DELETE
- **Path**: `/resource/{id}`
- **Headers**:
  - `Content-Type: application/json`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1 | string | Yes | Description |

### Request Body
```json
{
  "field1": "string",
  "field2": 123
}
```

### Response
**Status**: 200 OK
```json
{
  "data": {},
  "meta": {}
}
```

### Error Codes
| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Refresh token |
| 429 | Rate Limited | Wait and retry |

### Rate Limits
- **Requests**: 100/minute
- **Headers**: `X-RateLimit-Remaining`
```

### Step 3: Cache Documentation
Save to: `docs/api-cache/{api-name}.md`

### Step 4: Create Sticky Note
Generate a condensed sticky note for the workflow containing:
- Endpoint and method
- Auth requirements
- Key parameters
- Rate limits
- Error handling notes

## Using Apify for Research
When official docs are unclear or unavailable:
- Use apify/rag-web-browser to fetch current API documentation
- Use Playwright to screenshot API pages if needed

## Common APIs Quick Reference

### n8n Internal API
- Base: `https://{instance}/api/v1`
- Auth: `X-N8N-API-KEY` header

### Webhook Patterns
- n8n webhook: `https://{instance}/webhook/{path}`
- Test webhook: `https://{instance}/webhook-test/{path}`
