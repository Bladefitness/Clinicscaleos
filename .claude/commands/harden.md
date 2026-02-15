# /harden

Make an MVP workflow production-ready.

## Usage
```
/harden [paste workflow JSON]
```

Or specify a workflow:
```
/harden nextwave "Daily Report"
```

## Process
1. Invoke n8n-security agent in harden mode
2. Apply production hardening checklist
3. Add error handling, rate limiting, validation
4. Generate changes report

## Hardening Checklist
- [ ] **Idempotency**: Can run twice safely?
- [ ] **Rate Limiting**: Respects API limits?
- [ ] **Error Handling**: Catches and reports failures?
- [ ] **Logging**: Can debug in production?
- [ ] **Validation**: Rejects bad input?
- [ ] **Null Guards**: Handles missing data?

## Output

### 1. Hardened JSON
Production-ready workflow with:
- Error Trigger node for failure handling
- SplitInBatches for rate limiting
- Wait nodes between API calls
- Input validation nodes
- Null guards in expressions

### 2. Changes Applied
```
1. Added 99_Error_Trigger → 98_Notify_Slack
2. Wrapped HTTP calls in batches of 10
3. Added 1 second wait between batches
4. Added input validation for required fields
5. Added null guards to all expressions
```

### 3. New Nodes Added
- 99_Error_Trigger
- 98_Notify_Error
- 03b_Validate_Input
- 05b_Rate_Limit_Wait

### 4. Recommendations
- Credentials to set up
- Monitoring suggestions
- First-week observation tips

## Rules
- Don't overcomplicate - minimal viable hardening
- Preserve original workflow logic
- Only add what materially improves reliability

$ARGUMENTS
