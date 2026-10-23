---
id: thin-client
slug: /administration/thin-client
title: Thin-Client Configuration
sidebar_position: 9
description: Stable UI hostname with a static entry page; HTML5 assets load from the BBB node
keywords:
- thin client
- cluster
- entry page
- CORS
---

## Motivation

Like [cluster proxy](/administration/cluster-proxy), thin-client keeps a **stable
UI hostname** so browsers ask for microphone/camera permission once, while
WebRTC and most realtime traffic still go to the BBB node that runs the meeting.

[Cluster proxy](/administration/cluster-proxy) already stays flexible across BBB
client builds: the UI host reverse-proxies `/html5client/` to each node, so it
does not store or republish the React bundle. The trade-off is that **all**
HTML5 asset traffic flows through that proxy (per-node `location` blocks, extra
bandwidth and operational surface on the UI host).

**Thin-client** is an alternative with the same permission UX: the UI host only
serves a small **static entry page**. Join redirects there with a `server`
parameter; the page loads `loader.js` and the hashed client directly from that
BBB node. The UI host does not reverse-proxy the full client tree.

| Deployment | UI URL | How HTML5 assets are delivered |
|------------|--------|--------------------------------|
| Single-server | BBB node `/html5client/` | Same origin |
| [Cluster proxy](/administration/cluster-proxy) | Proxy path (e.g. `/bbb-XX/html5client/`) | Reverse-proxied from the node |
| Thin-client (this page) | Static entry URL on a UI host | Browser loads assets from the BBB node via `loader.js` |

Configure each BBB server for **one** of these methods. The codebase supports all three.

## How it works

1. `/join` runs on the BBB node (or load balancer → node).
2. When `defaultHTML5ClientUrl` is on a **different origin** than the node, the
   redirect includes `sessionToken` and `server=<node origin>` (scheme + host
   only — no path). Same-origin joins omit `server`. Classic `index.html`
   ignores `server` if present.
3. The entry page (`entry.js`) checks `server` against a local allowlist
   (`allowed-servers.json`), stores the node origin (and join `sessionToken`)
   in `sessionStorage`, removes `server` from the address bar, then loads
   `{origin}/html5client/loader.js`. A refresh reuses the stored origin. A join
   with a different `server` and/or `sessionToken` clears the prior pairing
   (including React Auth `sessionStorage` keys) so a token is never sent to the
   wrong node. Thin-client nodes must serve the HTML5 client at `/html5client/`
   (not under a cluster-proxy-style path prefix).
4. `loader.js` (the only `no-store` HTML5 asset) stamps `__BBB_HTML5_BASE__` and
   the build hash, stamps `?v=` onto boot/CSS, then loads the **same** node
   `boot.js` as classic `index.html` (page bootstrap, TFLite, browser support
   gate, Safari bundle pick, React mount).    Packaging (`build.sh`) replaces
   `?v=VERSION` in `fonts.css` with the client build id; React static fetches
   use `assetUrl()` (loader `?v=`); React bundles are content-addressed via the
   hash in the filename. HTML5 assets may be long-cached (`immutable`) because
   those URLs change with the build.


The UI host entry files stay tiny on purpose: when the HTML5 client changes,
you update BBB nodes—not the entry page—except when adding/removing allowlisted
origins.

## Configuration (BBB node)

Example UI host: `https://meet.example.com`.

### 1. Point join at the entry page

In `/etc/bigbluebutton/bbb-web.properties`:

```ini
defaultHTML5ClientUrl=https://meet.example.com/html5client/
```

(or any path on the UI host where you serve the static entry HTML)

### 2. CORS / GraphQL origins

Allow the **UI host** hostname (no protocol in middleware) everywhere you would
allow a cluster-proxy frontend:

**Grails** (example systemd override):

```shell
Environment="JDK_JAVA_OPTIONS=-Dgrails.cors.enabled=true -Dgrails.cors.allowCredentials=true -Dgrails.cors.allowedOrigins=https://meet.example.com,https://bbb-01.example.com"
```

**graphql-middleware** `/etc/bigbluebutton/bbb-graphql-middleware.yml`:

```yaml
server:
  # Hostname only; comma-separated list supported
  authorized_cross_origin: meet.example.com
```

**Hasura** `/etc/bigbluebutton/bbb-graphql-server.env`:

```shell
HASURA_GRAPHQL_CORS_DOMAIN="https://meet.example.com"
```

Static `/html5client/` assets already send `Access-Control-Allow-Origin: *` so
the entry page can load JS/CSS/wasm from the node.

### 3. Session cookie when UI host and BBB use different root domains

Join sets `JSESSIONID` on the **BBB node**. GraphQL and other node calls from the
entry-page origin are cross-origin, so the browser must still send that cookie
(same as [cluster proxy](/administration/cluster-proxy)).

If the UI host shares a root domain with the nodes (e.g. `meet.example.com` and
`bbb-01.example.com`), the default cookie policy is usually enough — skip this
step.

If the UI host uses a **different root domain**, set the same overrides as
cluster proxy in `/usr/share/bbb-web/WEB-INF/classes/application.properties`:

```shell
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.SameSite=none
```

_**Note:** This change will be reverted with subsequent bbb-web updates. If you
rely on the override, include it in a post-installation routine._

Keep `allowRequestsWithoutSession` at its default (`false`) unless cookies still
cannot be sent (strict third-party cookie blocking, iframe embeds, or a join URL
opened without the browser ever hitting `/join` on the node). In those cases you
may set `allowRequestsWithoutSession=true` in
`/etc/bigbluebutton/bbb-web.properties` and treat `sessionToken` as a bearer
credential — prefer HTTPS and avoid sharing URLs that still contain the token
(the HTML5 client removes it from the address bar after load).

### 4. Restart

```bash
bbb-conf --restart
```

## UI host (static entry page)

Serve a static page at the URL configured in `defaultHTML5ClientUrl`. An
example ships with the HTML5 client build as `thin-client-entry/index.html`.
It:

1. Reads `server` / `sessionToken` from the query string, or `server` from
   `sessionStorage` on refresh.
2. If the URL’s `server` or `sessionToken` differs from what was stored, clears
   the old thin-client pairing and Auth `sessionStorage` keys.
3. Allows the UI host’s own origin always; for any **other** origin, loads
   `allowed-servers.json` from the same directory and checks the allowlist.
4. Persists the allowed origin (and token when present), strips `server` from
   the URL, then loads `{origin}/html5client/loader.js`. React Auth still
   consumes `sessionToken` from the query string and removes it.

Copy `index.html`, `entry.js`, and `allowed-servers.json` to
`https://meet.example.com/html5client/` (or your chosen path). The entry page
does **not** need updates when the React bundle hash changes—only `loader.js`
on the BBB node does.

`server` is an **origin** only. The entry always requests
`{server}/html5client/loader.js`, so each BBB node must expose `/html5client/`
at the origin root (same layout as a normal single-server install).

### Allowlist remote BBB nodes (`allowed-servers.json`)

Accepting an arbitrary `server` parameter is unsafe: a crafted join URL could
point the browser (and the `sessionToken` query string) at a malicious host.
The entry page therefore **fails closed** for remote origins unless they appear
in a JSON file next to the HTML:

```json
{
  "allowedOrigins": [
    "https://bbb-01.example.com",
    "https://bbb-02.example.com"
  ]
}
```

| Field | Meaning |
|-------|---------|
| `allowedOrigins` | Exact match on the origin (`scheme://host[:port]`), e.g. `https://bbb-01.example.com` |

Rules:

- The UI host’s own `window.location.origin` is always allowed (no config needed).
- Remote BBB nodes must be listed explicitly (exact origin only).
- If `allowed-servers.json` is missing, unreadable, or does not match, the entry
  page refuses to load `loader.js`.
- Match the **origin only** (no path). Prefer `https` in production.

Edit the file on disk on the UI host whenever you add or remove BBB nodes; no
HTML5 rebuild is required.

## GraphQL / media URLs

Keep `graphqlWebsocketUrl`, `graphqlApiUrl`, and media endpoints pointed at the
BBB node (as in a normal install or cluster-proxy node). The thin-client path
derives the API root from `__BBB_HTML5_BASE__` set by the node’s `loader.js`
(`/bigbluebutton/api` on that origin).

Single-server and cluster-proxy installs are unchanged: join omits `server`,
`__BBB_HTML5_BASE__` is same-origin so API/asset roots stay pathname- or
settings-relative, and existing `defaultHTML5ClientUrl` /
`authorized_cross_origin` values keep working.

## Comparison with cluster proxy

| | Cluster proxy | Thin-client |
|---|---------------|-------------|
| Stable UI hostname | Yes | Yes |
| Client builds on UI host | Not stored; reverse-proxied from nodes | Not stored; browser fetches from nodes |
| HTML5 asset traffic via UI host | Yes | No |
| Per-node nginx `location` on UI host for `/html5client` | Yes | No (static entry HTML only) |
| Session cookie when UI host uses a different root domain | `SameSite=none` (+ `Secure`) | Same |
| `allowRequestsWithoutSession` | Default `false`; optional fallback if cookies cannot be sent | Same |
| Join config knob | `defaultHTML5ClientUrl` → proxy path | `defaultHTML5ClientUrl` → entry URL |
