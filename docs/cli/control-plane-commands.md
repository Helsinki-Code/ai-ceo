---
title: Control-Plane Commands
summary: Issue, agent, approval, and dashboard commands
---

Client-side commands for managing issues, agents, approvals, and more.

## Issue Commands

```sh
# List issues
pnpm ai-ceo issue list [--status todo,in_progress] [--assignee-agent-id <id>] [--match text]

# Get issue details
pnpm ai-ceo issue get <issue-id-or-identifier>

# Create issue
pnpm ai-ceo issue create --title "..." [--description "..."] [--status todo] [--priority high]

# Update issue
pnpm ai-ceo issue update <issue-id> [--status in_progress] [--comment "..."]

# Add comment
pnpm ai-ceo issue comment <issue-id> --body "..." [--reopen]

# Checkout task
pnpm ai-ceo issue checkout <issue-id> --agent-id <agent-id>

# Release task
pnpm ai-ceo issue release <issue-id>
```

## Company Commands

```sh
pnpm ai-ceo company list
pnpm ai-ceo company get <company-id>

# Export to portable folder package (writes manifest + markdown files)
pnpm ai-ceo company export <company-id> --out ./exports/acme --include company,agents

# Preview import (no writes)
pnpm ai-ceo company import \
  <owner>/<repo>/<path> \
  --target existing \
  --company-id <company-id> \
  --ref main \
  --collision rename \
  --dry-run

# Apply import
pnpm ai-ceo company import \
  ./exports/acme \
  --target new \
  --new-company-name "Acme Imported" \
  --include company,agents
```

## Agent Commands

```sh
pnpm ai-ceo agent list
pnpm ai-ceo agent get <agent-id>
```

## Approval Commands

```sh
# List approvals
pnpm ai-ceo approval list [--status pending]

# Get approval
pnpm ai-ceo approval get <approval-id>

# Create approval
pnpm ai-ceo approval create --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]

# Approve
pnpm ai-ceo approval approve <approval-id> [--decision-note "..."]

# Reject
pnpm ai-ceo approval reject <approval-id> [--decision-note "..."]

# Request revision
pnpm ai-ceo approval request-revision <approval-id> [--decision-note "..."]

# Resubmit
pnpm ai-ceo approval resubmit <approval-id> [--payload '{"..."}']

# Comment
pnpm ai-ceo approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm ai-ceo activity list [--agent-id <id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard

```sh
pnpm ai-ceo dashboard get
```

## Heartbeat

```sh
pnpm ai-ceo heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```
