# /debug

Troubleshoot an n8n workflow using hybrid analysis + Playwright testing.

## Usage
```
/debug The "Sync Customers" workflow on leadgenjay is failing with "Cannot read property of undefined"
```

Or with workflow JSON:
```
/debug [paste workflow JSON here]
Error: HTTP 401 on the API call
```

## Process

### Phase 1: Static Analysis
1. Analyze workflow JSON or fetch from instance
2. Check common root causes:
   - Expression syntax errors
   - Data type mismatches
   - Missing null guards
   - HTTP configuration issues

### Phase 2: Playwright Testing (if needed)
If static analysis is insufficient:
1. Login to specified n8n instance
2. Navigate to workflow
3. Execute test run
4. Screenshot error states
5. Analyze with AI vision

## Output
```
## ROOT CAUSE
[One-sentence description]

## EXACT FIX
[Specific change to make]

## BEFORE
[Code/config before fix]

## AFTER
[Code/config after fix]

## GUARD RAIL
[Optional prevention measure]
```

## Instance Credentials
Uses config/playwright-auth.json for login:
- leadgenjay: server.leadgenjay.com
- nextwave: server.nextwave.io

## Safety
- Never modifies workflows during debug
- Only tests in manual/test mode
- Screenshots before any action

$ARGUMENTS
