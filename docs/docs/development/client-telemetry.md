---
id: client-telemetry
slug: /development/client-telemetry
title: Client performance telemetry
sidebar_position: 8
description: Find the slow components, requests and GraphQL operations of the HTML5 client in a real session
keywords:
- telemetry
- performance
- opentelemetry
- prometheus
---

The HTML5 client can measure its own performance during a real session and answer three questions:

1. **Which component** is slow to render?
2. **Which request** is slow, and did it go over HTTP/2 or HTTP/1.1?
3. **Which GraphQL operation** is slow to answer?

It also keeps a short, content-free **repro trail** of the last user actions, so a reported problem
can be turned into a test.

Telemetry is **off by default**. When it is off, no observer is registered and nothing is sent. The
code ships in the client bundle (about 4 KB gzipped) whether it is enabled or not.

## Enabling it

Add the block to `/etc/bigbluebutton/bbb-html5.yml` and restart BigBlueButton
(`sudo bbb-conf --restart`). Client settings are read when the server starts, and new meetings pick
up the change.

```yaml
public:
  app:
    telemetry:
      enabled: true
```

All keys, with their defaults:

| Key | Default | Meaning |
|---|---|---|
| `enabled` | `false` | Master switch. Off means no observer and no request. |
| `sampleRate` | `1` | Fraction of sessions that collect, decided once per session. |
| `bufferSize` | `200` | Slow entries kept per kind for the debug window. |
| `flushIntervalMs` | `30000` | How often summaries and metrics are sent, when a sink is on. |
| `logToServer` | `false` | Send a periodic p50/p95/max summary through `clientLog.external`, which must be enabled too, and the repro trail when an error happens. See [Repro trail](#repro-trail). |
| `exporter` | `none` | `otlp` sends OpenTelemetry metrics to `otlpUrl`. See [Sending metrics to a monitoring backend](#sending-metrics-to-a-monitoring-backend). |
| `otlpUrl` | `/api/telemetry` | Base URL of the BBB `/api/telemetry` location. Relative URLs go to the server that serves the client. Never a monitoring backend's own ingest URL: the session token is only sent to this page's origin and the GraphQL host. |
| `thresholds.slowRenderMs` | `16` | A render slower than one frame at 60 fps is listed as slow. |
| `thresholds.slowRequestMs` | `1000` | Slow HTTP request. |
| `thresholds.slowGraphqlMs` | `500` | Slow GraphQL operation. |
| `thresholds.longTaskMs` | `50` | Slow main-thread task (Chromium only). |
| `thresholds.slowInteractionMs` | `200` | Slow response to a click or key press. |
| `thresholds.slowPluginMs` | `500` | Slow plugin load, first UI, panel opening or data channel round trip. |
| `webrtcMonitor.enabled` | `false` | Measure WebRTC quality with ObserveRTC. See [WebRTC quality](#webrtc-quality). |
| `webrtcMonitor.collectingPeriodMs` | `5000` | How often the monitor reads `getStats()` from each peer connection. |
| `webrtcMonitor.scriptUrl` | `compatibility/observertc-client-monitor.min.js` | Where the monitor library is loaded from. |

`thresholds` and `webrtcMonitor` are maps, so a deployment can override one value without repeating the others.

## Reading the data

### Debug window

With `public.app.enableDebugWindow: true`, press the debug window shortcut (<kbd>Alt</kbd> + <kbd>K</kbd> by
default, `public.app.shortcuts.openDebugWindow`). When telemetry is on, the window has a
**Performance** section, refreshed every two seconds:

- **Summary**: count, p50, p95 and max for each kind of measurement.
- **Requests by protocol**: how many requests went over HTTP/2, HTTP/1.1 or HTTP/3, with the average duration.
- **Slowest components**, **Slowest requests** and **Slowest GraphQL operations**: the top entries above their threshold.
- **Plugins**: one row per plugin, see [Plugins](#plugins).
- **Recent actions**: the end of the repro trail.
- Buttons to copy everything as JSON, copy the repro trail, or clear the data.

### Browser console

The console API exists only when telemetry is on. Any script on the page can read it, plugins included:

```js
bbbTelemetry.dump()   // config, stats, slowest entries and metric series
bbbTelemetry.stats()  // count, p50, p95 and max per kind
bbbTelemetry.trail()  // the repro trail
bbbTelemetry.clear()  // discard the slow entries and the trail (exported totals keep counting)
```

## What is measured

| Kind | Source | Attribution |
|---|---|---|
| `render` | `React.Profiler` around the main areas: app, nav bar, sidebar navigation, each sidebar panel, webcams, presentation, screenshare, external video, actions bar, plugins, layout engine | subtree id and render phase |
| `request` | `PerformanceObserver` on resource and navigation timing | path on this server (query string dropped, long ids replaced by `:id`), host only for other servers, initiator, `nextHopProtocol`, TTFB |
| `graphql` | Apollo link on every operation | `operationName`, query, mutation or subscription. Subscriptions are timed to their first result. Also WebSocket connect and reconnect times. |
| `longtask` | `PerformanceObserver` on long tasks (Chromium only) | browser attribution (`self`, `same-origin`, …) |
| `interaction` | Event Timing API, one entry per interaction | `data-test` of the control, event type |
| `plugin` | The plugins engine, see [Plugins](#plugins) | plugin name and phase |

:::note
Production builds of React only report render times when `react-dom` is replaced by
`react-dom/profiling`. Without it, the `render` kind stays empty in production. The other kinds work
in any build.
:::

### Plugins

Plugins run outside the client's React tree: each one mounts its own root with its own copy of React
and of the plugin SDK, so the `render` kind cannot see inside them. The client measures them where it
hands control over, and no plugin change is needed:

| Phase | From → to |
|---|---|
| `load` | script tag inserted → `onload` (or `onerror`, with `failed: true`) |
| `ready` | script tag inserted → first non-empty call to any `pluginApi.set*Items`. Recorded only when it happens within 60 s of the load: a plugin that adds its first item later (on some event) shows no `ready` instead of an hour-long one. |
| `panel` | the client calls a plugin `contentFunction` (sidekick panel, main content, floating window) → the plugin puts content in the element |
| `script` | time a plugin script ran inside a long animation frame (Chromium only), matched by script URL |
| `data-channel` | the client sends a data channel push to everyone → the entry comes back in the data channel subscription |

GraphQL operations the client runs for plugins carry `bbb.plugin.name`. Data channel mutations have
the exact plugin name. Custom subscriptions, queries and mutations get the plugin name from the SDK's
subscribe event (`pluginName`, next to the arguments the client deduplicates by). An operation sent by
more than one plugin gets `(shared)`, and one sent through an SDK without the telemetry API gets
`(unknown)`. Only plugins from the meeting's manifests are accepted as names. Name every plugin
operation with a plugin prefix (`PickRandomUser_Picked`), so it can also be told apart in the
middleware metrics, which are labeled by operation name.

#### Telemetry API for plugins

The client injects `pluginApi.telemetry` next to the logger, and the SDK exposes it as
`pluginTelemetry` (a no-op with telemetry off or on an older client, so plugins do not need to raise
`requiredSdkVersion`):

| Call | Result |
|---|---|
| `measure(name, work)` / `start(name).end()` | `bbb.client.plugin.duration` with phase `measure` and `bbb.plugin.measure` = name. A throw or rejection is recorded with `failed: true`. |
| `gauge(name, value)` | `bbb.client.plugin.gauge`, last value, with `bbb.plugin.gauge` = name |
| `mark(action)` | a `plugin` action in the repro trail (plugin and action name), at most one per 100 ms |
| `reportError(error)` | `bbb.client.plugin.errors` and a `plugin_error` incident. The SDK's `PluginErrorBoundary` calls it, which is the only way to attribute render errors of a plugin served from another origin. |

Names must match `^[A-Za-z][A-Za-z0-9_.-]{0,39}$` and never carry meeting content. Each plugin gets at
most 8 measure and gauge names. Anything rejected is counted in `bbb.client.plugin.telemetry.dropped`
with `bbb.drop.reason` (`invalid_name`, `too_many_names`, `invalid_value`, `rate`).

Counters, sent as cumulative sums:

| Counter | Attributes |
|---|---|
| `bbb.client.plugin.load_failures` | `bbb.plugin.name`, `bbb.failure.source` (`client`, or the server component that refused the plugin) |
| `bbb.client.plugin.errors` | `bbb.plugin.name`. Uncaught errors whose file is a plugin script, plus errors the plugin reports itself (`PluginErrorBoundary`). A plugin on another origin without CORS reports `Script error.` with no file, so only the reported ones are counted. |
| `bbb.client.plugin.activations` | `bbb.plugin.name`, `bbb.plugin.event` (`started` or `stopped`), from the `plg_started` / `plg_stopped` usage logs |
| `bbb.client.plugin.data_channel.entries` | `bbb.plugin.name`. New data channel entries received. |
| `bbb.client.plugin.telemetry.dropped` | `bbb.plugin.name`, `bbb.drop.reason`. Calls to the plugin telemetry API that were rejected. |

What it cannot see: render cost inside a plugin, script time outside Chromium, and work the core does
on behalf of a plugin (hook managers, extensible area renders), which counts as core.

### WebRTC quality

With `webrtcMonitor.enabled: true` (and `enabled: true`), the client runs
[ObserveRTC's client monitor](https://observertc.org) on every peer connection of the session. Each
connection is labeled with `bbb.webrtc.source`: `sfu` for the ones the client opens to
`bbb-webrtc-sfu`, `livekit` for everything else (LiveKit and plugins). The local audio loopback is left
out. For each source, it reports:

- a **score** from 0 (unusable) to 5 (perfect), the worst among that source's connections,
  recalculated every collection;
- the **worst round-trip time** among those connections;
- **detected issues**, such as `frozen-video`, `congestion`, `audio-interruption`, `cpulimitation`
  or `dry-inbound-track` (a track that receives nothing). With `logToServer`, each issue type is
  sent at most once a minute, and only its numeric fields leave the browser.

The library (about 68 KB gzipped) lives in its own file under `public/compatibility` and is only
downloaded when the flag is on, so other sessions do not pay for it. The current values show up in
`bbbTelemetry.dump().webrtc`.

The monitor only reads connection stats. Its `getUserMedia` integration and tab-visibility watcher are
turned off, so it never wraps media capture or lists devices.

### HTTP/2 versus HTTP/1.1

Every request entry carries the protocol the browser actually used (`nextHopProtocol`). If the
**Requests by protocol** table shows HTTP/1.1 while the server is configured for HTTP/2, a proxy or
load balancer in front of BigBlueButton is downgrading the connection. Under HTTP/1.1, browsers open
at most six parallel connections per host, so requests queue. The `stall` field of each request
shows that queueing time.

## Sending metrics to a monitoring backend

The client and the server use OpenTelemetry names. Any backend that ingests OTLP or Prometheus can
read them: Grafana, Prometheus, Datadog, New Relic, Elastic, Honeycomb and others.

### Server metrics

`bbb-graphql-middleware` exposes Prometheus metrics at `http://127.0.0.1:8378/metrics`, including two
latency histograms per `operationName`:

| Metric | Labels | Meaning |
|---|---|---|
| `gql_mutation_duration_milliseconds` | `action` | Time for `bbb-graphql-actions` to accept a mutation, successful ones only |
| `gql_subscription_first_data_milliseconds` | `type`, `operationName` | Time from a new query or subscription reaching the middleware (rate-limiter wait included) to its first result from Hasura, successful ones only. Operation names past the first 500 become `other` |

These sit next to the existing counters (`gql_subscription_total`, `gql_mutation_total`,
`gql_received_data_*`) and `bbb_application_reach_latency_milliseconds`.

An [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) running on the server can
scrape them and forward everything over OTLP. If `prometheus.enabled` is set in `bbb-webrtc-sfu`, it
can scrape the SFU (port 3014 by default) as well:

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: bbb-graphql-middleware
          static_configs: [{ targets: ['127.0.0.1:8378'] }]
  otlp:
    protocols:
      http:
        endpoint: 127.0.0.1:4318
processors:
  batch: {}
  resource:
    attributes:
      - { key: service.namespace, value: bigbluebutton, action: upsert }
exporters:
  otlphttp:
    endpoint: https://otlp.example.com
service:
  pipelines:
    metrics:
      receivers: [prometheus, otlp]
      processors: [resource, batch]
      exporters: [otlphttp]
```

### Client metrics

With `exporter: otlp`, every client posts OTLP/HTTP JSON to `<otlpUrl>/v1/metrics` once per
`flushIntervalMs`, and when the tab is hidden or closed. With `logToServer` on as well, incident trails
go to `<otlpUrl>/v1/logs` (see [Repro trail](#repro-trail)). The client does not include the OpenTelemetry
SDK; the payload is serialized directly.

The request carries the user's session token in the `x-session-token` header, so nginx can authorize
it with the same check as `/graphql` and pass it to the local collector. The token is only sent to this
page's origin and to the GraphQL host; for any other `otlpUrl` the client posts without it (and without
cookies) and logs `telemetry_untrusted_otlp_url` once. Add rate-limit zones in the `http` context and a
location such as:

```nginx
# http context, e.g. a file in /etc/nginx/conf.d/
limit_req_zone $http_x_session_token zone=bbb_telemetry_session:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=bbb_telemetry_ip:10m rate=300r/m;

location /api/telemetry/ {
    limit_req zone=bbb_telemetry_session burst=10 nodelay;
    limit_req zone=bbb_telemetry_ip burst=100 nodelay;
    limit_req_status 429;

    auth_request /bigbluebutton/connection/checkGraphqlAuthorization;
    auth_request_set $meeting_id $sent_http_meeting_id;
    auth_request_set $user_id $sent_http_user_id;

    client_max_body_size 512k;
    proxy_set_header Meeting-Id $meeting_id;
    proxy_set_header User-Id $user_id;
    proxy_pass http://127.0.0.1:4318/;
}
```

The meeting and user ids come from the server, never from the client. A collector can add them to
log records only (`bbb.meeting.id`, `bbb.user.id`, with `include_metadata: true` on its OTLP receiver
and an `attributes` processor reading `metadata.meeting-id` and `metadata.user-id`), so abuse can be
traced to a session, and should keep them out of metric labels. Because browsers send this data, the
collector should also drop any metric not named `bbb.client.*` and any log not from
`bbb-html5-client` or larger than 32 KB, and cap the number and length of attributes (`filter` and
`transform` processors).

In a cluster proxy setup, the client is served by the proxy. Set `otlpUrl` to an absolute URL on a
host that can authorize the session.

Client metric names:

| Metric | Attributes |
|---|---|
| `bbb.client.render.duration` | `bbb.subtree.id`, `bbb.render.phase` |
| `bbb.client.request.duration` | `bbb.request.initiator_type`, `network.protocol.name`, `network.protocol.version` |
| `bbb.client.graphql.round_trip.duration` | `bbb.operation.name`, `bbb.operation.type`, `bbb.operation.failed`, `bbb.plugin.name` (plugin operations only) |
| `bbb.client.graphql.first_data.duration` | `bbb.operation.name`, `bbb.operation.failed`, `bbb.plugin.name` (plugin operations only). Not recorded for Hasura streaming subscriptions (`*_stream` fields such as `notification_stream`), which answer only when a new row arrives, except when they fail before any result. |
| `bbb.client.websocket.connect.duration` | `bbb.connect.phase` (`connect` or `reconnect`) |
| `bbb.client.long_task.duration` | `bbb.long_task.attribution` |
| `bbb.client.interaction.duration` | `bbb.event.type`, `bbb.action.data_test` |
| `bbb.client.plugin.duration` | `bbb.plugin.name`, `bbb.plugin.phase`, `bbb.plugin.failed`, `bbb.plugin.measure` (phase `measure` only) |
| `bbb.client.plugin.gauge` | `bbb.plugin.name`, `bbb.plugin.gauge` (gauge, value set by the plugin) |
| `bbb.client.webrtc.score` | `bbb.webrtc.source` (gauge, 0 to 5) |
| `bbb.client.webrtc.rtt` | `bbb.webrtc.source` (gauge, worst round-trip time in milliseconds) |

The two `webrtc` metrics are gauges and only exist with `webrtcMonitor.enabled`; `bbb.client.plugin.gauge` is a gauge too. The plugin counters
above are cumulative sums. All the others are cumulative histograms in milliseconds. Resource attributes are `service.name`
(`bbb-html5-client`), `service.version`, `session.id` (a random id per tab), `service.instance.id`
(the same id), `browser.mobile` and `user_agent.original`. Each tab sends its own cumulative series, so
the instance id keeps them apart: Prometheus-style backends turn it into the `instance` label, and
without it they merge all sessions into one series and read the values as counter resets. The first
time a series is sent it also carries a zero point at the moment it was created, so `increase()` and
delta conversions count the measurements of that first export. Attributes only take bounded values; URLs and user ids never become
attributes. A session holds at most 200 series, plus 80 for series with `bbb.plugin.name`; anything beyond that is
folded into one series per metric with `bbb.series.overflow=true`. Values are cumulative, so each flush
sends only the series that changed since the previous one, and every tenth flush sends all of them.
A full flush of 280 series is about 125 KB, and a first export carries two points per series (the
zero point), so the `client_max_body_size` above leaves room for both.

### Log summaries

With `logToServer: true` and `public.clientLog.external.enabled: true`, the client adds one log record
per kind (`logCode` `perf_render`, `perf_request`, `perf_graphql`, `perf_longtask` and
`perf_interaction`) whenever that kind has new measurements. Each record has the count, p50, p95, max
and the five slowest entries.

With `exporter: otlp` as well, the same summaries go to `<otlpUrl>/v1/logs` as OTLP log records, one
request per flush. Each record has `event.name=bbb.perf_summary`, `bbb.kind`, the numeric attributes
`bbb.count`, `bbb.p50_ms`, `bbb.p95_ms` and `bbb.max_ms`, and `bbb.slowest` with the five slowest
entries (request paths are scrubbed the same way as everywhere else).

With `webrtcMonitor.enabled` as well, `webrtc` is one more kind: every flush adds one summary per
source with open connections (`logCode` `perf_webrtc`; over OTLP, `bbb.kind=webrtc`,
`bbb.webrtc.source`, `bbb.webrtc.score`, `bbb.webrtc.rtt_ms`, `bbb.webrtc.peer_connections`,
`bbb.webrtc.issue_count`). It is sent even when nothing is wrong, so a good call is visible too. Each
detected issue also goes out on its own, as `logCode` `webrtc_issue` and, over OTLP,
`event.name=bbb.webrtc_issue` with `bbb.kind=webrtc`, `bbb.webrtc.source`, `bbb.webrtc.issue_type` and
the issue's numeric fields as `bbb.webrtc.issue.<field>`.

To correlate with the media servers, LiveKit (`prometheus_port`) and `bbb-webrtc-sfu`
(`prometheus.enabled`) expose Prometheus metrics that the same collector can scrape, such as
`livekit_quality_score`, `livekit_forward_jitter` and the `sfu_livekit_*` series.

## Repro trail

The client keeps the last 50 user actions while telemetry is on:

| Recorded | Never recorded |
|---|---|
| clicks, with the `data-test`, tag and role of the control | typed text, field values, element text, `aria-label`, `data-test` values built from user content |
| named keys (<kbd>Enter</kbd>, <kbd>Esc</kbd>, arrows, <kbd>Tab</kbd>…) and shortcuts outside text fields | character keys, and shortcuts typed inside text fields |
| mutation names, with repeated ones folded into a count | mutation variables |
| the time between actions, the client build, viewport, language and user agent | user names, meeting content, session tokens |

A few `data-test` values are built from user content (breakout room names). Those elements carry
`data-telemetry-redact`, and any `data-test` that is not shaped like an id is skipped too: the trail and
the `interaction` metric name the nearest safe ancestor instead. Mark new elements the same way when
their `data-test` includes user content.

Copy the trail from the debug window or with `bbbTelemetry.trail()`.

With `logToServer: true`, the trail also leaves the browser on its own when something breaks: a React
error caught by an error boundary, a GraphQL or network error, an uncaught exception or an unhandled
promise rejection. It is sent at most once a minute and five times per session:

- through `clientLog.external`, as a record with `logCode` `repro_trail`;
- with `exporter: otlp`, also as an OTLP log record with `event.name=bbb.repro_trail`,
  `exception.type` and the trail as body. The error message stays in the client (debug window), since
  it can quote user content.

With `logToServer: false` (the default), the trail never leaves the browser on its own. The `data-test` values match the selectors of the Playwright suite in
`bigbluebutton-tests/playwright`, so a trail can be replayed as a test skeleton.

## Where to look

| Symptom | Look at |
|---|---|
| The client freezes for a moment | `longtask` max, then `render` for the subtree that committed at the same time |
| A panel is slow to open | `render` for `sidebar-content:<panel>`, and `interaction` for the button that opened it |
| Joining takes long | `graphql` first-data on the server histograms, the `navigation` request, and the first long task |
| Slides or avatars load slowly | **Slowest requests**: compare TTFB with duration, and check the protocol |
| Buttons react late | `interaction` entries above `slowInteractionMs`, with the control's `data-test` |
| Audio or video is bad for one user | `bbb.client.webrtc.score` and `rtt` for that session, then the `bbb.webrtc_issue` logs |
| Everything is slow for one user only | the same tables in that user's browser; compare `user_agent.original` and `browser.mobile` |
