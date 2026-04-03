---
title: Docker
summary: Docker Compose quickstart
---

Run AI CEO in Docker without installing Node or pnpm locally.

## Compose Quickstart (Recommended)

```sh
docker compose -f docker/docker-compose.quickstart.yml up --build
```

Open [http://localhost:3100](http://localhost:3100).

Defaults:

- Host port: `3100`
- Data directory: `./data/docker-ai-ceo`

Override with environment variables:

```sh
AI_CEO_PORT=3200 AI_CEO_DATA_DIR=../data/pc \
  docker compose -f docker/docker-compose.quickstart.yml up --build
```

**Note:** `AI_CEO_DATA_DIR` is resolved relative to the compose file (`docker/`), so `../data/pc` maps to `data/pc` in the project root.

## Manual Docker Build

```sh
docker build -t ai-ceo-local .
docker run --name ai-ceo \
  -p 3100:3100 \
  -e HOST=0.0.0.0 \
  -e AI_CEO_HOME=/ai-ceo \
  -v "$(pwd)/data/docker-ai-ceo:/ai-ceo" \
  ai-ceo-local
```

## Data Persistence

All data is persisted under the bind mount (`./data/docker-ai-ceo`):

- Embedded PostgreSQL data
- Uploaded assets
- Local secrets key
- Agent workspace data

## Claude and Codex Adapters in Docker

The Docker image pre-installs:

- `claude` (Anthropic Claude Code CLI)
- `codex` (OpenAI Codex CLI)

Pass API keys to enable local adapter runs inside the container:

```sh
docker run --name ai-ceo \
  -p 3100:3100 \
  -e HOST=0.0.0.0 \
  -e AI_CEO_HOME=/ai-ceo \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-... \
  -v "$(pwd)/data/docker-ai-ceo:/ai-ceo" \
  ai-ceo-local
```

Without API keys, the app runs normally — adapter environment checks will surface missing prerequisites.
