# Plugin Authoring Smoke Example

A AI CEO plugin

## Development

```bash
pnpm install
pnpm dev            # watch builds
pnpm dev:ui         # local dev server with hot-reload events
pnpm test
```

## Install Into AI CEO

```bash
pnpm ai-ceo plugin install ./
```

## Build Options

- `pnpm build` uses esbuild presets from `@ai-ceo/plugin-sdk/bundlers`.
- `pnpm build:rollup` uses rollup presets from the same SDK.
