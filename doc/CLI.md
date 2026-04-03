# CLI Reference

AI CEO CLI now supports both:

- instance setup/diagnostics (`onboard`, `doctor`, `configure`, `env`, `allowed-hostname`)
- control-plane client operations (issues, approvals, agents, activity, dashboard)

## Base Usage

Use repo script in development:

```sh
pnpm ai-ceo --help
```

First-time local bootstrap + run:

```sh
pnpm ai-ceo run
```

Choose local instance:

```sh
pnpm ai-ceo run --instance dev
```

## Deployment Modes

Mode taxonomy and design intent are documented in `doc/DEPLOYMENT-MODES.md`.

Current CLI behavior:

- `ai-ceo onboard` and `ai-ceo configure --section server` set deployment mode in config
- runtime can override mode with `AI_CEO_DEPLOYMENT_MODE`
- `ai-ceo run` and `ai-ceo doctor` do not yet expose a direct `--mode` flag

Target behavior (planned) is documented in `doc/DEPLOYMENT-MODES.md` section 5.

Allow an authenticated/private hostname (for example custom Tailscale DNS):

```sh
pnpm ai-ceo allowed-hostname dotta-macbook-pro
```

All client commands support:

- `--data-dir <path>`
- `--api-base <url>`
- `--api-key <token>`
- `--context <path>`
- `--profile <name>`
- `--json`

Company-scoped commands also support `--company-id <id>`.

Use `--data-dir` on any CLI command to isolate all default local state (config/context/db/logs/storage/secrets) away from `~/.ai-ceo`:

```sh
pnpm ai-ceo run --data-dir ./tmp/ai-ceo-dev
pnpm ai-ceo issue list --data-dir ./tmp/ai-ceo-dev
```

## Context Profiles

Store local defaults in `~/.ai-ceo/context.json`:

```sh
pnpm ai-ceo context set --api-base http://localhost:3100 --company-id <company-id>
pnpm ai-ceo context show
pnpm ai-ceo context list
pnpm ai-ceo context use default
```

To avoid storing secrets in context, set `apiKeyEnvVarName` and keep the key in env:

```sh
pnpm ai-ceo context set --api-key-env-var-name AI_CEO_API_KEY
export AI_CEO_API_KEY=...
```

## Company Commands

```sh
pnpm ai-ceo company list
pnpm ai-ceo company get <company-id>
pnpm ai-ceo company delete <company-id-or-prefix> --yes --confirm <same-id-or-prefix>
```

Examples:

```sh
pnpm ai-ceo company delete PAP --yes --confirm PAP
pnpm ai-ceo company delete 5cbe79ee-acb3-4597-896e-7662742593cd --yes --confirm 5cbe79ee-acb3-4597-896e-7662742593cd
```

Notes:

- Deletion is server-gated by `AI_CEO_ENABLE_COMPANY_DELETION`.
- With agent authentication, company deletion is company-scoped. Use the current company ID/prefix (for example via `--company-id` or `AI_CEO_COMPANY_ID`), not another company.

## Issue Commands

```sh
pnpm ai-ceo issue list --company-id <company-id> [--status todo,in_progress] [--assignee-agent-id <agent-id>] [--match text]
pnpm ai-ceo issue get <issue-id-or-identifier>
pnpm ai-ceo issue create --company-id <company-id> --title "..." [--description "..."] [--status todo] [--priority high]
pnpm ai-ceo issue update <issue-id> [--status in_progress] [--comment "..."]
pnpm ai-ceo issue comment <issue-id> --body "..." [--reopen]
pnpm ai-ceo issue checkout <issue-id> --agent-id <agent-id> [--expected-statuses todo,backlog,blocked]
pnpm ai-ceo issue release <issue-id>
```

## Agent Commands

```sh
pnpm ai-ceo agent list --company-id <company-id>
pnpm ai-ceo agent get <agent-id>
pnpm ai-ceo agent local-cli <agent-id-or-shortname> --company-id <company-id>
```

`agent local-cli` is the quickest way to run local Claude/Codex manually as a AI CEO agent:

- creates a new long-lived agent API key
- installs missing AI CEO skills into `~/.codex/skills` and `~/.claude/skills`
- prints `export ...` lines for `AI_CEO_API_URL`, `AI_CEO_COMPANY_ID`, `AI_CEO_AGENT_ID`, and `AI_CEO_API_KEY`

Example for shortname-based local setup:

```sh
pnpm ai-ceo agent local-cli codexcoder --company-id <company-id>
pnpm ai-ceo agent local-cli claudecoder --company-id <company-id>
```

## Approval Commands

```sh
pnpm ai-ceo approval list --company-id <company-id> [--status pending]
pnpm ai-ceo approval get <approval-id>
pnpm ai-ceo approval create --company-id <company-id> --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]
pnpm ai-ceo approval approve <approval-id> [--decision-note "..."]
pnpm ai-ceo approval reject <approval-id> [--decision-note "..."]
pnpm ai-ceo approval request-revision <approval-id> [--decision-note "..."]
pnpm ai-ceo approval resubmit <approval-id> [--payload '{"...":"..."}']
pnpm ai-ceo approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm ai-ceo activity list --company-id <company-id> [--agent-id <agent-id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard Commands

```sh
pnpm ai-ceo dashboard get --company-id <company-id>
```

## Heartbeat Command

`heartbeat run` now also supports context/api-key options and uses the shared client stack:

```sh
pnpm ai-ceo heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100] [--api-key <token>]
```

## Local Storage Defaults

Default local instance root is `~/.ai-ceo/instances/default`:

- config: `~/.ai-ceo/instances/default/config.json`
- embedded db: `~/.ai-ceo/instances/default/db`
- logs: `~/.ai-ceo/instances/default/logs`
- storage: `~/.ai-ceo/instances/default/data/storage`
- secrets key: `~/.ai-ceo/instances/default/secrets/master.key`

Override base home or instance with env vars:

```sh
AI_CEO_HOME=/custom/home AI_CEO_INSTANCE_ID=dev pnpm ai-ceo run
```

## Storage Configuration

Configure storage provider and settings:

```sh
pnpm ai-ceo configure --section storage
```

Supported providers:

- `local_disk` (default; local single-user installs)
- `s3` (S3-compatible object storage)
