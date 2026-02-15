# /scrub

Sanitize secrets from workflow JSON before sharing.

## Usage
```
/scrub [paste workflow JSON]
```

Or specify a workflow:
```
/scrub leadgenjay "Customer Sync"
```

## Process
1. Invoke n8n-security agent in scrub mode
2. Detect all secrets and sensitive data
3. Replace with safe placeholders
4. Generate secrets report

## Output

### 1. Sanitized JSON
Valid importable workflow with secrets replaced:
- API keys → `<<API_KEY>>`
- Tokens → `<<TOKEN>>`
- Passwords → `<<PASSWORD>>`
- Private URLs → `<<PRIVATE_URL>>`

### 2. Secrets Report
| Location | Placeholder | Recommended Credential |
|----------|-------------|----------------------|
| HTTP Request > Headers | <<API_KEY>> | Service API (Header Auth) |
| Webhook URL | <<PRIVATE_URL>> | Update in n8n settings |

### 3. Recommendations
- Credential types to create
- Rotation recommendations if secrets were exposed

## Rules
- NEVER output detected secrets
- Preserve valid importable JSON structure
- Flag risky patterns (hardcoded auth, querystring tokens)

$ARGUMENTS
