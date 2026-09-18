Learning Analytics Dashboard will be accessible through https://yourdomain/learning-analytics-dashboard

# Dev Instructions

## Prepare destination directory

```
mkdir -p /var/bigbluebutton/learning-dashboard
chown bigbluebutton /var/bigbluebutton/learning-dashboard/
```

## Build instructions

```
cp .env.example .env
```

```
./deploy.sh
```

## Development instructions

```
cp .env.example .env
```

```
./run-dev.sh
```

---

# Build modes

The dashboard supports two build modes controlled by a build-time environment variable.

## Standard mode (default)

Built without any special flags. This is the normal BBB deployment.

```
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

Built with `REACT_APP_STANDALONE_MODE=true`. Use this when the dashboard is served as a self-contained static application, decoupled from a live BBB server.

```
REACT_APP_STANDALONE_MODE=true npm run build
```

Behavior:
- Asset paths are relative (`homepage: "."`), making the bundle location-independent
- Session data fetched from `learning_dashboard_data.json` relative to the current URL
- Token validation skipped (no query parameters expected)
- Locale files fetched relative to the app root (must be bundled alongside the app)
- Presentation assets resolved relative to the current URL
- Data polling disabled (data is considered to be static)
