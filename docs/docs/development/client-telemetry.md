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
| `otlpUrl` | `/api/telemetry` | Base URL of the OTLP/HTTP endpoint. Relative URLs go to the server that serves the client. |
| `thresholds.slowRenderMs` | `16` | A render slower than one frame at 60 fps is listed as slow. |
| `thresholds.slowRequestMs` | `1000` | Slow HTTP request. |
| `thresholds.slowGraphqlMs` | `500` | Slow GraphQL operation. |
| `thresholds.longTaskMs` | `50` | Slow main-thread task (Chromium only). |
| `thresholds.slowInteractionMs` | `200` | Slow response to a click or key press. |
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
- **Recent actions**: the end of the repro trail.
- Buttons to copy everything as JSON, copy the repro trail, or clear the data.

### Browser console

The console API exists in every session, and reports `enabled: false` when telemetry is off:

```js
bbbTelemetry.dump()   // config, stats, slowest entries and metric series
bbbTelemetry.stats()  // count, p50, p95 and max per kind
bbbTelemetry.trail()  // the repro trail
bbbTelemetry.clear()  // discard measurements and the trail
```

## What is measured

| Kind | Source | Attribution |
|---|---|---|
| `render` | `React.Profiler` around the main areas: app, nav bar, sidebar navigation, each sidebar panel, webcams, presentation, screenshare, external video, actions bar, plugins, layout engine | subtree id and render phase |
| `request` | `PerformanceObserver` on resource and navigation timing | path (query string dropped, long ids replaced by `:id`), initiator, `nextHopProtocol`, TTFB |
| `graphql` | Apollo link on every operation | `operationName`, query, mutation or subscription. Subscriptions are timed to their first result. Also WebSocket connect and reconnect times. |
| `longtask` | `PerformanceObserver` on long tasks (Chromium only) | browser attribution (`self`, `same-origin`, …) |
| `interaction` | Event Timing API, one entry per interaction | `data-test` of the control, event type |

:::note
Production builds of React only report render times when `react-dom` is replaced by
`react-dom/profiling`. Without it, the `render` kind stays empty in production. The other kinds work
in any build.
:::

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
| `gql_mutation_duration_milliseconds` | `operationName` | Time for `bbb-graphql-actions` to accept a mutation |
| `gql_subscription_first_data_milliseconds` | `type`, `operationName` | Time from a new query or subscription to its first result from Hasura |

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
it with the same check as `/graphql` and pass it to the local collector. Add a location such as:

```nginx
location /api/telemetry/ {
    auth_request /bigbluebutton/connection/checkGraphqlAuthorization;
    auth_request_set $meeting_id $sent_http_meeting_id;
    auth_request_set $user_id $sent_http_user_id;

    client_max_body_size 128k;
    proxy_set_header Meeting-Id $meeting_id;
    proxy_set_header User-Id $user_id;
    proxy_pass http://127.0.0.1:4318/;
}
```

The meeting and user ids come from the server, never from the client. If they are needed in the
backend, promote the headers to attributes in the collector, and keep them out of metric labels.

In a cluster proxy setup, the client is served by the proxy. Set `otlpUrl` to an absolute URL on a
host that can authorize the session.

Client metric names:

| Metric | Attributes |
|---|---|
| `bbb.client.render.duration` | `bbb.subtree.id`, `bbb.render.phase` |
| `bbb.client.request.duration` | `bbb.request.initiator_type`, `network.protocol.name`, `network.protocol.version` |
| `bbb.client.graphql.round_trip.duration` | `bbb.operation.name`, `bbb.operation.type`, `bbb.operation.failed` |
| `bbb.client.graphql.first_data.duration` | `bbb.operation.name`, `bbb.operation.failed` |
| `bbb.client.websocket.connect.duration` | `bbb.connect.phase` (`connect` or `reconnect`) |
| `bbb.client.long_task.duration` | `bbb.long_task.attribution` |
| `bbb.client.interaction.duration` | `bbb.event.type`, `bbb.action.data_test` |
| `bbb.client.webrtc.score` | `bbb.webrtc.source` (gauge, 0 to 5) |
| `bbb.client.webrtc.rtt` | `bbb.webrtc.source` (gauge, worst round-trip time in milliseconds) |

The two `webrtc` metrics are gauges and only exist with `webrtcMonitor.enabled`. All the others are
cumulative histograms in milliseconds. Resource attributes are `service.name`
(`bbb-html5-client`), `service.version`, `session.id` (a random id per tab), `browser.mobile` and
`user_agent.original`. Attributes only take bounded values; URLs and user ids never become
attributes. A session holds at most 100 series; anything beyond that is folded into one series with
`bbb.series.overflow=true`.

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
| clicks, with the `data-test`, tag and role of the control | typed text, field values, element text, `aria-label` |
| named keys (<kbd>Enter</kbd>, <kbd>Esc</kbd>, arrows, <kbd>Tab</kbd>…) and shortcuts outside text fields | character keys, and shortcuts typed inside text fields |
| mutation names, with repeated ones folded into a count | mutation variables |
| the time between actions, the client build, viewport, language and user agent | user names, meeting content, session tokens |

Copy the trail from the debug window or with `bbbTelemetry.trail()`.

With `logToServer: true`, the trail also leaves the browser on its own when something breaks: a React
error caught by an error boundary, a GraphQL or network error, an uncaught exception or an unhandled
promise rejection. It is sent at most once a minute and five times per session:

- through `clientLog.external`, as a record with `logCode` `repro_trail`;
- with `exporter: otlp`, also as an OTLP log record with `event.name=bbb.repro_trail`,
  `exception.type`, `exception.message` (first 200 characters) and the trail as body.

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
