#!/usr/bin/env bash
# Test Anthropic and Gemini API keys directly (isolates app from API)
# Usage: ./scripts/test-api-keys.sh
# Or: source .env 2>/dev/null; ./scripts/test-api-keys.sh

set -e

echo "=== Testing API Keys (direct curl) ==="
echo ""

# Anthropic
echo "1. Anthropic API..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "   ANTHROPIC_API_KEY not set. Export it first."
else
  ANTHROPIC_RESP=$(curl -s -w "\n%{http_code}" -X POST https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d '{"model":"claude-sonnet-4-5","max_tokens":50,"messages":[{"role":"user","content":"Say OK"}]}')
  ANTHROPIC_BODY=$(echo "$ANTHROPIC_RESP" | sed '$d')
  ANTHROPIC_STATUS=$(echo "$ANTHROPIC_RESP" | tail -1)
  if [ "$ANTHROPIC_STATUS" = "200" ]; then
    echo "   ✓ Anthropic: OK (200)"
  else
    echo "   ✗ Anthropic: $ANTHROPIC_STATUS"
    echo "$ANTHROPIC_BODY" | head -c 300
    echo ""
  fi
fi
echo ""

# Gemini
echo "2. Gemini API..."
if [ -z "$GEMINI_API_KEY" ]; then
  echo "   GEMINI_API_KEY not set. Export it first."
else
  GEMINI_RESP=$(curl -s -w "\n%{http_code}" \
    "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY")
  GEMINI_BODY=$(echo "$GEMINI_RESP" | sed '$d')
  GEMINI_STATUS=$(echo "$GEMINI_RESP" | tail -1)
  if [ "$GEMINI_STATUS" = "200" ]; then
    echo "   ✓ Gemini: OK (200)"
  else
    echo "   ✗ Gemini: $GEMINI_STATUS"
    echo "$GEMINI_BODY" | head -c 300
    echo ""
  fi
fi
echo ""
echo "Done. If both show ✓, keys work — problem is in app (env loading, request format)."
