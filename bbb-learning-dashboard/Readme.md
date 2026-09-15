Learning Analytics Dashboard will be accessible through https://yourdomain/learning-analytics-dashboard

The dashboard is a React application built with [Vite](https://vite.dev/).

# Dev Instructions

## Prepare destination directory

```bash
mkdir -p /var/bigbluebutton/learning-dashboard
chown bigbluebutton /var/bigbluebutton/learning-dashboard/
```

## Build instructions

```bash
cp .env.example .env
```

```bash
./deploy.sh
```

## Development instructions

```bash
cp .env.example .env
```

```bash
./run-dev.sh
```

`run-dev.sh` starts the Vite dev server on port 3100 and points nginx at it,
so the dashboard is reachable through `https://yourdomain/learning-analytics-dashboard/`
with hot module reload.

---

# Build modes

The dashboard supports two build modes controlled by a build-time environment variable.

## Standard mode (default)

Built without any special flags. This is the normal BBB deployment.

```bash
npm run build
```

Behavior:
- Assets served from `/learning-analytics-dashboard/`
- Meeting ID and access token read from URL query parameters (`?meeting=...&report=...`) or a cookie
- Session data fetched from the BBB token-based endpoint
- Locale files fetched from `/html5client/locales/`
- Presentation assets fetched from the BBB presentation API
- Data polling active (re-fetches every ~10 seconds)

## Standalone mode

Built with `VITE_STANDALONE_MODE=true`. Use this when the dashboard is served as a self-contained static application, decoupled from a live BBB server.

```bash
VITE_STANDALONE_MODE=true npm run build
```

Behavior:
- Asset paths are relative (Vite `base: './'`), making the bundle location-independent
- Session data fetched from `learning_dashboard_data.json` relative to the current URL
- Token validation skipped (no query parameters expected)
- Locale files fetched relative to the app root (must be bundled alongside the app)
- Presentation assets resolved relative to the current URL
- Data polling disabled (data is considered to be static)

---

# Environment variables

Variables prefixed with `VITE_` in `.env` are inlined into the bundle at build time:

- `VITE_EXTERNAL_HELP_PAGE_URL` — if set, the Help button opens this URL instead of the built-in help modal.
- `VITE_STANDALONE_MODE` — see "Standalone mode" above.
