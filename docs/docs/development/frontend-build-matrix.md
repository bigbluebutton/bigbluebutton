---
id: frontend-build-matrix
slug: /development/frontend-build-matrix
title: Frontend build matrix
sidebar_position: 3
description: Bundlers and toolchain used by BigBlueButton frontends and related Node packages
keywords:
- vite
- webpack
- oxc
- frontend
- build
---

Inventory of JavaScript/TypeScript build tools in the BigBlueButton monorepo and closely related ecosystem packages. Use this when changing bundlers, lint/format tooling, or packaging scripts.

## In-tree browser apps

| Package | Path | Bundler | Notes |
|---|---|---|---|
| HTML5 client | `bigbluebutton-html5/` | Vite 8 (Rolldown / Oxc) | Minified ESM bundle plus lazy chunks (Mermaid); served under `/html5client` |
| Learning Analytics Dashboard | `bbb-learning-dashboard/` | Vite 8 (Rolldown / Oxc) | Tailwind + PostCSS; served under `/learning-analytics-dashboard/` |
| GraphQL test client | `bbb-graphql-client-test/` | CRA (`react-scripts`) | Dev/test only; not a production deb |
| Docs site | `docs/` | Docusaurus 3 | Ships its own Babel preset; leave as-is |

## In-tree Node packages

| Package | Path | Build | Lint / format |
|---|---|---|---|
| GraphQL actions | `bbb-graphql-actions/` | `tsc` → `dist/` | none |
| Shared notes server | `bbb-shared-notes-server/` | tsup (esbuild) | ESLint |
| Export annotations | `bbb-export-annotations/` | plain Node ESM | ESLint |
| Playwright tests | `bigbluebutton-tests/playwright/` | Playwright + `@swc/core` | ESLint, Prettier |

## External packages (cloned at package time)

| Deb / image | Upstream | Frontend bundler |
|---|---|---|
| `bbb-playback` | `bigbluebutton/bbb-playback` | Webpack/CRA-style `npm run build` — migrate to Vite 8 in that repo, then bump the placeholder tag |
| Plugin SDK / samples | `bigbluebutton-html-plugin-sdk` / `plugin-template` | Documented Webpack `build-bundle`; Vite 8 template planned (see `docs/docs/plugins.md`) |
| `bbb-webrtc-sfu`, `bbb-webhooks`, `bbb-transcription-controller` | respective repos | Install only; no SPA bundler |

## Packaging touchpoints

- Deb: `build/packages-template/bbb-html5/`, `build/packages-template/bbb-learning-dashboard/`
- Docker: `bigbluebutton-html5/Dockerfile`, `bbb-learning-dashboard/Dockerfile`, `docker-bake.hcl`
- Dev nginx HMR: `bbb-html5.nginx.dev`; LAD uses `bbb-learning-dashboard/learning-dashboard-dev.nginx` (canonical; `run-dev.sh` installs it)
- CI: `.github/workflows/ts-code-compilation.yml`, `ts-code-validation.yml`, `automated-tests.yml`

## HTML5 boot

Classic `public/boot.js` owns the UA gate and loads `window.__BBB_ENTRY__` (hashed `bundle.[hash].js` in prod). Vite does not inject a module tag into HTML. Thin-client `loader.js` / entry hosts are not unified yet (see PR #26115).

## Oxc tooling

- **Bundler transforms / minify:** Vite 8 (Rolldown + Oxc) and `@vitejs/plugin-react` v6
