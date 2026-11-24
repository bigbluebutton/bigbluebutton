---
id: monitoring
slug: /administration/monitoring
title: Server Monitoring
sidebar_position: 6
description: BigBlueButton Configuration Monitoring
keywords:
- monitoring
- prometheus
- grafana
- metrics
---

# Overview
Once you have installed BigBlueButton it is important to setup or integrate BigBlueButton into a monitoring system.
A popular monitoring stack nowadays is Prometheus, Grafana and Alertmanager.

* [Prometheus](https://prometheus.io/) is used to collect metrics.
It collects these metrics by visiting a service's endpoint, which exposes metrics in the Prometheus format.
If a service does not natively support Prometheus metrics, you can install _exporters_ which query the service
and expose metrics in the appropriate Prometheus format.
For a quick and effective introduction into Prometheus go over the
 [getting started documentation](https://prometheus.io/docs/prometheus/latest/getting_started/). In this article, we describe all exporters that are relevant to the operation of BigBlueButton.

* [Grafana](https://grafana.com/grafana/) is used to visualize metrics, logs and other data from different data sources
including Prometheus.
It is common practice to view Prometheus metrics using Grafana.
User's must write a collection of panels (a panel is a graph, table or any other visual element of a metric) in a
dashboard.
For common dashboards there are pre-made dashboards that you can download from
[Grafana's website](https://grafana.com/grafana/dashboards?orderBy=name&direction=asc).

* [Alertmanager](https://prometheus.io/docs/alerting/alertmanager/) is an extension written by the Prometheus folks.
It is used to trigger alerts to Email, Slack, PagerDuty, etc. from predefined suspicious metrics (CPU utilization > 75%,
90% RAM usage, 90% disk storage used, etc.).

Prometheus, Grafana and Alertmanager work together to form a highly flexible, extensible and powerful monitoring solution.

### BigBlueButton Metrics
Currently BigBlueButton does not expose and metrics, however there is a community driven project that has implemented
a Prometheus exporter which enables you to scrape using Prometheus key BigBlueButton metrics.

### BigBlueButton Exporter
[BigBlueButton Exporter](https://github.com/greenstatic/bigbluebutton-exporter) is a community driven project to expose
various metrics that are available via the API that BigBlueButton exposes.

Metrics that are exposed:
* Number of participants by type (listeners, voice, video)
* Number of participants by client (HTML5, dial-in)
* Number of recordings (processing, published, unpublished, deleted, unprocessed)
* Number of participants in rooms by bucket

The Grafana dashboard that is enabled by the project:
![](https://bigbluebutton-exporter.greenstatic.dev/assets/img_grafana_dashboard_server_instance.png)

The [project's documentation](https://bigbluebutton-exporter.greenstatic.dev/) is extensive and guides your through
multiple different installation setups.
As well as provides Grafana dashboards with different views: all servers aggregated and single specific server.

### Monitoring the system

The [Prometheus Node Exporter](https://prometheus.io/download/#node_exporter) collects fundamental metrics from the underlying operating system that BigBlueButton is running on. It collects over 500 values, including CPU and memory usage, disk IO and network statistics. These will help to observe the basic system behavior
via Grafana and alert on abnormalities via Alertmanager.

There are [three different Node Exporter dashboards](https://grafana.com/oss/prometheus/exporters/node-exporter/?tab=dashboards) for Grafana depending on your usecase. The most basic looks like this:
![](https://grafana.com/api/dashboards/13978/images/9972/image)

### Monitoring individual systemd services

The third-party [systemd
exporter](https://github.com/prometheus-community/systemd_exporter) can be used
to monitor BigBlueButton services on a systemd level, i. e. track the usage of
resources for every service. This allows fine-grained insights into the
resource usage and distribution among the various components of BigBlueButton.

The following command line will start the systemd exporter and instruct it to
only monitor services relevant to BigBlueButton on port 9558:

```shell
systemd_exporter --systemd.collector.unit-include=(bbb.*|b3scale.*|freeswitch|livekit.*)\.service
```
It can be queried via `curl http://bbb.example.com:9558/metrics`.

**Note:** You need to provide appropriate firewalling to those endpoints.


### Internal BigBlueButton Metrics

Some of the components in BigBlueButton provide Prometheus scraping endpoints.
The exposed information can help in operation to troubleshoot issues or optimize the system towards goals such as scalability, particularly when
special requirements mandate adjustments. They are not required for normal operation.

**Note:** You need to provide appropriate firewalling to those endpoints.

#### WebRTC SFU
BigBlueButtons *Selective Forwarding Unit* can be configured to expose a number of Prometheus endpoints by adding the following snippets to
`/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`:

```yaml
prometheus:
  enabled: true
  # mcs-core specific metrics
  host: localhost
  port: 3014
  path: '/metrics'
  collectDefaultMetrics: false
  # Main process metrics endpoint (main == websocket entrypoint, module manager)
  main:
    host: localhost
    port: 3016
    path: '/metrics'
    collectDefaultMetrics: false
  # Video process metrics endpoint (video == webcam req handler, ...)
  video:
    host: localhost
    port: 3026
    path: '/metrics'
    collectDefaultMetrics: false
  screenshare:
    host: localhost
    port: 3022
    path: '/metrics'
    collectDefaultMetrics: false
  audio:
    host: localhost
    port: 3024
    path: '/metrics'
    collectDefaultMetrics: false
  livekit:
    host: localhost
    port: 6759
    path: '/metrics'
    collectDefaultMetrics: false
```
After a restart of bbb-webrtc-sfu, the metrics can now be queried via

  * `curl http://localhost:3014/metrics` (mcs-core)
  * `curl http://localhost:3016/metrics` (main)
  * `curl http://localhost:3026/metrics` (video)
  * `curl http://localhost:3022/metrics` (screenshare)
  * `curl http://localhost:3024/metrics` (audio)
  * `curl http://localhost:6759/metrics` (bbb-webrtc-sfu's LiveKit controller)

respectively.

#### GraphQL middleware
`bbb-graphql-middleware`, which carries the client's GraphQL subscriptions, always serves Prometheus metrics on its listen port: `curl http://127.0.0.1:8378/metrics`. It only listens on localhost. The series cover the connections and why they are rejected, the subscriptions and why they end, the reconnections to Hasura and their reason, the wait for a subscription's first data, the calls the middleware makes to bbb-web and akka-apps, and the rate limiters. The series labeled by operation name, and the `application` series of `bbb_application_reach_latency_milliseconds`, appear with the traffic. The series whose labels are a closed set exist at zero from the start: the `result` of `auth_hook_request_total` and `session_vars_hook_request_total`, the `reason` of `gql_hasura_reconnection_total` and `ws_connection_rejected`, and the `type` of `gql_subscription_first_data_duration_seconds`. `prometheus_advanced_metrics_enabled: true` in `/etc/bigbluebutton/bbb-graphql-middleware.yml` adds one histogram, `gql_received_data_payload_length`, the number of items in each data message.

`ws_connection_rejected` counts each connection the middleware refuses, by why: the error message id of the refusal (`param_missing`, `too_many_connections`, `check_authorization_error`, `meeting_not_found`, `user_not_found` or `connections_limit_exceeded`), `closed_before_init` when the browser left before it sent its `connection_init`, `init_timeout` when it sent none within 30 seconds and the connection was closed with code 4408, and `other` for any other message id.

`gql_received_data_total` and `gql_subscription_first_data_duration_seconds` count the data messages that arrive from Hasura, not those that reach the browser: `gql_received_data_total` includes a message that repeats the previous data of its subscription, which is not passed on, and one that does not decode, which is discarded, and the first data of a subscription can be such a discarded message.

`gql_subscription_removed_total` counts each subscription that ends by why it ended: `client_complete`, `hasura_complete` or `connection_closed`. A subscription that Hasura ends with an `error` message is not removed: the error is passed on to the browser, the subscription is sent to Hasura again after a reconnection, and it is counted only when the connection closes, as `connection_closed`. `gql_hasura_reconnection_total` counts attempts: each time the middleware dials Hasura again after a connection or an attempt ended, labeled with why it ended, so it keeps rising while Hasura is down.

The series that carry an `operationName` label keep their own label for every operation of the BigBlueButton client, listed in `/usr/share/bbb-graphql-middleware/client-operation-names.txt` (`prometheus_client_operation_names_file`), and for at most 500 other distinct operation names, and label any other name `(other)`. The `type` label of these series comes from the query the client sends, so one name used in several types has a series in each: in the worst case, every name in every type, the series labeled by operation name stay below about 30,000 (36,000 with the advanced histogram) with the default cap of 500, and the bound grows with the cap. An operation without a name is labeled `(unnamed)`, and a name longer than 128 bytes or outside the GraphQL name grammar is labeled `(other)` even below the cap. `prometheus_operation_name_limit` in the same file changes the cap, and a value below 1 means the default of 500. It is read once at start, so a change needs a restart.

#### GraphQL server
`bbb-graphql-server` serves Prometheus metrics at `GET /v1/metrics` on each of its instances, which listen on 127.0.0.1, one port per instance, 8085 by default: `curl -H "Authorization: Bearer <secret>" http://127.0.0.1:8085/v1/metrics`. The endpoint is on when `HASURA_GRAPHQL_ENABLED_APIS` includes `metrics`, as the list the package installs in `/etc/default/bbb-graphql-server` does; an override in `/etc/bigbluebutton/bbb-graphql-server.env` replaces that list, and without `metrics` in it the endpoint answers 404. Requests must send `Authorization: Bearer <secret>`, and a missing or wrong token is answered with 401. The secret is `HASURA_GRAPHQL_METRICS_SECRET`, generated at installation in `/etc/default/bbb-graphql-server-metrics-secret`; change it in that file, which is read last, and restart `bbb-graphql-server` for the change to apply.

#### WebRTC recorder
`bbb-webrtc-recorder` exposes metrics when `prometheus.enable` is set. Set it with environment variables in `/etc/default/bbb-webrtc-recorder`, which keeps the rest of the packaged configuration in place (naming rules in the [bbb-webrtc-recorder README](https://github.com/bigbluebutton/bbb-webrtc-recorder#configuration)):

```shell
BBBRECORDER_PROMETHEUS_ENABLE=true
BBBRECORDER_PROMETHEUS_LISTENADDRESS=127.0.0.1:3200
```

The override file `/etc/bigbluebutton/bbb-webrtc-recorder.yml` is not merged: when it exists, the recorder reads it instead of `/etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml`, and any setting missing from it falls back to the recorder's built-in default. To use it, copy the packaged file first and edit the `prometheus` section of the copy:

```shell
sudo cp /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml /etc/bigbluebutton/bbb-webrtc-recorder.yml
```

```yaml
prometheus:
  enable: true
  listenAddress: 127.0.0.1:3200
```

After a restart of bbb-webrtc-recorder, query them via `curl http://127.0.0.1:3200/metrics`.

#### LiveKit
`livekit-server` exposes metrics when a port is set in `/etc/bigbluebutton/livekit.yaml`:

```yaml
prometheus:
  port: 6789
```

After a restart of livekit-server, query them via `curl http://bbb.example.com:6789/metrics`. The port is bound on all interfaces, so firewall it.

### Optimization: Consolidating local metrics endpoints

Using 3rd party software such as
[exporter_exporter](https://github.com/QubitProducts/exporter_exporter) or
[reverse_exporter](https://github.com/wrouesnel/reverse_exporter), it is
possible to consolidate all of the above endpoints into a single metrics
endpoint. This simplifies scraping and reduces the amount of connections
across machines. This also allows the other exporters to be either
firewalled or bound to localhost. Only the port of the proxy exporter will
need to be exposed for the prometheus server to scrape it.

### All-In-One monitoring stack

If you do not wish to install Prometheus and Grafana by yourself, an interesting feature is the
[All-In-One monitoring stack](https://bigbluebutton-exporter.greenstatic.dev/installation/all_in_one_monitoring_stack/).
The documentation guides you how to setup the entire monitoring stack (Prometheus, Grafana and BigBlueButton exporter)
on your BigBlueButton server by using a single docker-compose file.
This is useful if you are administering a single BigBlueButton server and have no existing monitoring infrastructure.
