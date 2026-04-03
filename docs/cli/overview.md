---
title: CLI Overview
summary: CLI installation and setup
---

The AI CEO CLI handles instance setup, diagnostics, and control-plane operations.

## Usage

```sh
pnpm ai-ceo --help
```

## Global Options

All commands support:

| Flag | Description |
|------|-------------|
| `--data-dir <path>` | Local AI CEO data root (isolates from `~/.ai-ceo`) |
| `--api-base <url>` | API base URL |
| `--api-key <token>` | API authentication token |
| `--context <path>` | Context file path |
| `--profile <name>` | Context profile name |
| `--json` | Output as JSON |

Company-scoped commands also accept `--company-id <id>`.

For clean local instances, pass `--data-dir` on the command you run:

```sh
pnpm ai-ceo run --data-dir ./tmp/ai-ceo-dev
```

## Context Profiles

Store defaults to avoid repeating flags:

```sh
# Set defaults
pnpm ai-ceo context set --api-base http://localhost:3100 --company-id <id>

# View current context
pnpm ai-ceo context show

# List profiles
pnpm ai-ceo context list

# Switch profile
pnpm ai-ceo context use default
```

To avoid storing secrets in context, use an env var:

```sh
pnpm ai-ceo context set --api-key-env-var-name AI_CEO_API_KEY
export AI_CEO_API_KEY=...
```

Context is stored at `~/.ai-ceo/context.json`.

## Command Categories

The CLI has two categories:

1. **[Setup commands](/cli/setup-commands)** — instance bootstrap, diagnostics, configuration
2. **[Control-plane commands](/cli/control-plane-commands)** — issues, agents, approvals, activity
