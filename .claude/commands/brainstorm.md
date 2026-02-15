# /brainstorm

Multi-turn Q&A to design and build an n8n workflow.

## Process

### Phase 1: Discovery
Ask clarifying questions about:
1. **Trigger**: What starts this workflow?
   - Webhook, Schedule, Manual, App trigger?
2. **Data Sources**: Where does data come from?
   - APIs, databases, files, user input?
3. **Transformations**: What processing is needed?
   - Filtering, mapping, aggregating, enriching?
4. **Outputs**: What should happen at the end?
   - Send data, create records, notify someone?
5. **Error Handling**: What if something fails?
   - Retry, notify, log, skip?

### Phase 2: Clarification
For each unclear requirement, ask:
- "Should X happen before or after Y?"
- "What should happen if Z is empty/null?"
- "Do you need to handle pagination for this API?"
- "What's the expected volume (items per run)?"

### Phase 3: Design Summary
Present a summary:
```
## Workflow: [Name]

### Trigger
[How it starts]

### Steps
1. [First action]
2. [Second action]
...

### Error Handling
[What happens on failure]

### Dependencies
- [APIs needed]
- [Credentials required]
```

### Phase 4: Build
Once user approves, invoke the n8n-builder agent to generate:
1. Valid importable workflow JSON
2. Required credentials list
3. Environment variables needed

## Usage
```
/brainstorm I want to sync new Stripe customers to HubSpot
```

## Tips
- Ask about edge cases early
- Clarify data formats and schemas
- Confirm which n8n instance to target
- Suggest proven patterns from n8n-workflow-patterns skill

$ARGUMENTS
