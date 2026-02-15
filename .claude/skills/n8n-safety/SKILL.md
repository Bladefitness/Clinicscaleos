---
name: n8n-safety
description: Enforces safety protocols for n8n workflow modifications. Automatically activated for any workflow create/update/delete operations.
---

# N8N Safety Guardrails

## Mandatory Confirmation Protocol

### Before ANY Modification Operation
You MUST confirm with the user:

1. **Instance Confirmation**
   ```
   Please confirm the target instance:
   - [ ] server.leadgenjay.com (leadgenjay)
   - [ ] server.nextwave.io (nextwave)
   ```

2. **Workflow Identification**
   ```
   Please confirm the workflow:
   - Workflow ID: {id}
   - Workflow Name: {name}
   - Current Status: {active/inactive}
   ```

3. **Operation Confirmation**
   ```
   I will perform the following operation:
   - Action: {create/update/delete/activate/deactivate}
   - Changes: {description of changes}

   Type 'CONFIRM' to proceed or describe any modifications.
   ```

## Pre-Operation Checklist

### For Updates
- [ ] Fetched current workflow state
- [ ] Identified specific nodes to modify
- [ ] User explicitly named this workflow in current conversation
- [ ] Changes are clearly defined
- [ ] Backup recommended for complex changes

### For Deletions
- [ ] User explicitly requested deletion
- [ ] Workflow ID confirmed
- [ ] Warned about irreversibility
- [ ] Suggested export backup first

### For Activations
- [ ] Workflow validated
- [ ] Trigger conditions reviewed
- [ ] Dependencies confirmed available

## Prohibited Actions

NEVER perform these without explicit user request:
1. Bulk workflow modifications
2. Deleting multiple workflows
3. Modifying production workflows without confirmation
4. Changing webhook URLs on active workflows
5. Disabling error notifications

## Error Recovery

If an operation fails:
1. Report exact error message
2. Do NOT retry automatically
3. Suggest corrective actions
4. Offer to restore from backup if available

## Audit Trail

For every modification, log:
```markdown
## Modification Log
- **Timestamp**: {ISO timestamp}
- **Instance**: {instance}
- **Workflow**: {id} - {name}
- **Operation**: {operation}
- **Changes**: {summary}
- **User Confirmation**: {confirmation text}
```
