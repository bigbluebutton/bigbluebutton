---
id: monitoring
slug: /administration/monitoring
title: BigBlueButton Server Monitoring
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
 [getting started documentation](https://prometheus.io/docs/prometheus/latest/getting_started/).

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

## BigBlueButton Metrics
Currently BigBlueButton does not expose and metrics, however there is a community driven project that has implemented
a Prometheus exporter which enables you to scrape using Prometheus key BigBlueButton metrics.

## BigBlueButton Exporter
[BigBlueButton Exporter](https://github.com/greenstatic/bigbluebutton-exporter) is a community driven project to expose 
various metrics that are available via the API that BigBlueButton exposes.

Metrics that are exposed:
* Number of participants by type (listeners, voice, video)
* Number of participants by client (HTML5, dial-in, flash)
* Number of recordings (processing, published, unpublished, deleted, unprocessed)
* Number of participants in rooms by bucket

The Grafana dashboard that is enabled by the project:
![](https://bigbluebutton-exporter.greenstatic.dev/assets/img_grafana_dashboard_server_instance.png)

The [project's documentation](https://bigbluebutton-exporter.greenstatic.dev/) is extensive and guides your through
multiple different installation setups.
As well as provides Grafana dashboards with different views: all servers aggregated and single specific server.

If you do not wish to install Prometheus and Grafana by yourself, an interesting feature is the 
[All-In-One monitoring stack](https://bigbluebutton-exporter.greenstatic.dev/installation/all_in_one_monitoring_stack/). 
The documentation guides you how to setup the entire monitoring stack (Prometheus, Grafana and BigBlueButton exporter) 
on your BigBlueButton server by using a single docker-compose file. 
This is useful if you are administering a single BigBlueButton server and have no existing monitoring infrastructure.
