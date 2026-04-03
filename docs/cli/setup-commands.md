---
title: Setup Commands
summary: Onboard, run, doctor, and configure
---

Instance setup and diagnostics commands.

## `ai-ceo run`

One-command bootstrap and start:

```sh
pnpm ai-ceo run
```

Does:

1. Auto-onboards if config is missing
2. Runs `ai-ceo doctor` with repair enabled
3. Starts the server when checks pass

Choose a specific instance:

```sh
pnpm ai-ceo run --instance dev
```

## `ai-ceo onboard`

Interactive first-time setup:

```sh
pnpm ai-ceo onboard
```

If AI CEO is already configured, rerunning `onboard` keeps the existing config in place. Use `ai-ceo configure` to change settings on an existing install.

First prompt:

1. `Quickstart` (recommended): local defaults (embedded database, no LLM provider, local disk storage, default secrets)
2. `Advanced setup`: full interactive configuration

Start immediately after onboarding:

```sh
pnpm ai-ceo onboard --run
```

Non-interactive defaults + immediate start (opens browser on server listen):

```sh
pnpm ai-ceo onboard --yes
```

On an existing install, `--yes` now preserves the current config and just starts AI CEO with that setup.

## `ai-ceo doctor`

Health checks with optional auto-repair:

```sh
pnpm ai-ceo doctor
pnpm ai-ceo doctor --repair
```

Validates:

- Server configuration
- Database connectivity
- Secrets adapter configuration
- Storage configuration
- Missing key files

## `ai-ceo configure`

Update configuration sections:

```sh
pnpm ai-ceo configure --section server
pnpm ai-ceo configure --section secrets
pnpm ai-ceo configure --section storage
```

## `ai-ceo env`

Show resolved environment configuration:

```sh
pnpm ai-ceo env
```

## `ai-ceo allowed-hostname`

Allow a private hostname for authenticated/private mode:

```sh
pnpm ai-ceo allowed-hostname my-tailscale-host
```

## Local Storage Paths

| Data | Default Path |
|------|-------------|
| Config | `~/.ai-ceo/instances/default/config.json` |
| Database | `~/.ai-ceo/instances/default/db` |
| Logs | `~/.ai-ceo/instances/default/logs` |
| Storage | `~/.ai-ceo/instances/default/data/storage` |
| Secrets key | `~/.ai-ceo/instances/default/secrets/master.key` |

Override with:

```sh
AI_CEO_HOME=/custom/home AI_CEO_INSTANCE_ID=dev pnpm ai-ceo run
```

Or pass `--data-dir` directly on any command:

```sh
pnpm ai-ceo run --data-dir ./tmp/ai-ceo-dev
pnpm ai-ceo doctor --data-dir ./tmp/ai-ceo-dev
```
