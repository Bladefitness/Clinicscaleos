# /list

View workflows on n8n instances.

## Usage
```
/list leadgenjay
/list nextwave
/list all
/list leadgenjay active
/list nextwave "customer"
```

## Arguments
- **instance**: leadgenjay, nextwave, or all
- **filter**: Optional - "active", "inactive", or search term

## Output
```
## Workflows on LeadGenJay (server.leadgenjay.com)

| ID | Name | Status | Last Updated |
|----|------|--------|--------------|
| abc123 | Customer Sync | Active | 2024-01-15 |
| def456 | Daily Report | Inactive | 2024-01-10 |
| ghi789 | Webhook Handler | Active | 2024-01-14 |

Total: 3 workflows (2 active, 1 inactive)
```

## MCP Tools Used
- n8n-leadgenjay: list_workflows
- n8n-nextwave: list_workflows

$ARGUMENTS
