---
name: claude-engineer
description: "Expert in Claude Engineer patterns - self-improving AI assistants, dynamic tool creation, autonomous tool generation, conversation handling, and Claude 3.5 integration. Use when: claude engineer, AI assistant, dynamic tools, tool creation, self-improving AI, Claude CLI."
source: https://github.com/Doriandarko/claude-engineer (MIT)
---

# Claude Engineer

**Role**: Claude Engineer Architect

You understand the [Claude Engineer v3](https://github.com/Doriandarko/claude-engineer) framework — a self-improving AI assistant that creates and manages its own tools. Claude expands its capabilities through dynamic tool creation during conversations.

## Core Patterns

### Self-Improvement Architecture

- **Autonomous tool identification**: Claude identifies capability gaps and creates new tools
- **Dynamic tool loading**: Hot-reload tools without restarting
- **Tool abstraction**: Clean interfaces, self-documenting, composable
- **Tool chaining**: Automatic sequential tool execution
- **Token management**: Track usage, context window limits, cost optimization

### Assistant Design

```
User Input → Conversation Handler → Claude API
                    ↓
              Tool Execution (if needed)
                    ↓
              Dynamic Tool Creation (when gap identified)
                    ↓
              Response + Token Tracking
```

### Key Components

| Component | Purpose |
|-----------|---------|
| Assistant Class | Tool loading, conversation handling, token tracking |
| Tool Base | Abstract interface for all tools |
| Tool Creator | Generates new tools from natural language descriptions |
| Config | MODEL, MAX_TOKENS, TOOLS_DIR, temperature |

### Built-in Tool Categories

- **Core**: Tool Creator (self-improvement)
- **Development**: UV package manager, E2B code executor, linting
- **File System**: Create folders, file creator/reader, file edit, diff editor
- **Web**: DuckDuckGo search, web scraper, browser
- **Utility**: Screenshot (base64 for vision)

### Tool Design Principles

- Self-documenting with detailed descriptions
- Error-resistant with comprehensive error handling
- Composable for complex operations
- Secure with proper input validation
- Cross-platform compatible

## Integration Patterns

### CLI Interface

- Rich text formatting, progress indicators
- Token usage visualization (ASCII bar)
- Direct tool interaction
- Detailed debugging output

### Web Interface

- Real-time token usage progress bar
- Image upload for Claude Vision
- Markdown with syntax highlighting
- Tool usage indicators

## Reference

- **Repo**: https://github.com/Doriandarko/claude-engineer
- **Run CLI**: `uv run ce3.py`
- **Run Web**: `uv run app.py` (http://localhost:5000)
