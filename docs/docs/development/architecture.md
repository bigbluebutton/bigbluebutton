---
id: architecture
slug: /development/architecture
title: Architecture
sidebar_position: 1
description: BigBlueButton Architecture
keywords:
- architecture
---

BigBlueButton is built upon a solid foundation of underlying components, including NGINX, FreeSWITCH, mediasoup, Redis, Node.js, React.js, and others.

This page describes the overall architecture of BigBlueButton and how these components work together.

## High-level architecture

The following diagram provides a high-level view of how BigBlueButton's components work together.

```mermaid
flowchart TB
  %% Blue = new/default in 4.0 · grey-dashed = alternative/opt-in path

  %% ── Edge / reverse proxies ──────────────────────────
  client[client]
  haproxy[HAProxy]
  nginx[NginX]
  thirdparty[3rd party]

  client <--> haproxy
  nginx --> haproxy
  thirdparty --> nginx

  %% ── HTML5 client, GraphQL stack & datastore ─────────
  html5["bbb-html5<br/>(static client)"]
  gqlmw[graphql-middleware]
  hasura["graphql-server<br/>(Hasura)"]
  gqlactions[graphql-actions]
  postgres[(PostgreSQL)]

  html5 --> haproxy
  haproxy <--> gqlmw
  gqlmw <--> hasura
  gqlmw --> gqlactions
  gqlmw <--> redis
  gqlactions --> redis
  hasura --> nginx
  postgres --> hasura

  %% ── Core apps ───────────────────────────────────────
  akkaapps[akka-apps]
  webapi[Web API]
  redis[RedisPubSub]

  akkaapps --> postgres
  akkaapps <--> redis
  akkaapps --> redisdb
  webapi <--> nginx
  webapi <--> redis

  %% ── Media: LiveKit (default) ─────────────────────────
  livekit["LiveKit server<br/>(default A/V/screenshare)"]:::neo
  livekitsip["LiveKit SIP<br/>(dial-in)"]:::neo
  sfu["bbb-webrtc-sfu<br/>(media controller)"]
  recorder[webrtc-recorder]

  nginx <--> livekit
  livekitsip --> livekit
  sfu <--> livekit
  sfu <--> nginx
  sfu <--> redis
  recorder <--> livekit
  sfu <--> recorder

  %% ── Media: mediasoup + FreeSWITCH (alternative) ──────
  mediasoup["mediasoup<br/>(alternative)"]:::alt
  freeswitch["FreeSWITCH<br/>(alternative / dial-in)"]:::alt
  akkafsesl[akka-fsesl]:::alt

  sfu -.-> mediasoup
  mediasoup -.-> freeswitch
  akkaapps -.-> akkafsesl
  akkafsesl -.-> freeswitch

  %% ── Shared notes: BlockNote (default) ────────────────
  sharednotes["bbb-shared-notes-server<br/>(Hocuspocus / Yjs)"]:::neo
  blocknotedb[("blocknote_app<br/>(Yjs docs)")]:::neo

  nginx <--> sharednotes
  sharednotes <--> blocknotedb
  sharednotes <--> redis

  %% ── Shared notes: Etherpad (alternative) ─────────────
  pads["bbb-pads<br/>(alternative)"]:::alt
  etherpad["Etherpad<br/>(alternative)"]:::alt

  redis <--> pads
  pads <--> etherpad

  %% ── Presentation conversion & static files ──────────
  prescon[Presentation Conversion]
  presfiles[(presentation files)]

  webapi --> prescon
  prescon --> presfiles
  prescon --> redis
  presfiles --> nginx

  %% ── Recording & other Redis consumers ────────────────
  exportann[export-annotations]
  webhooks[webhooks]
  transcription[transcription-controller]
  redisdb[(RedisDB)]
  recproc[recording processor]

  redis <--> exportann
  exportann --> presfiles
  redis <--> webhooks
  redis <--> transcription
  redisdb --> recproc

  %% ── Styling ─────────────────────────────────────────
  classDef store fill:#e8ecf3,stroke:#5b6b8c,color:#1c2733;
  classDef alt   fill:#f2f2f2,stroke:#b0b0b0,color:#7a7a7a,stroke-dasharray:4 4;
  classDef neo   fill:#e6f0ff,stroke:#2b6cb0,color:#12345a;
  class postgres,presfiles,redisdb store;
```

We'll break down each component in more detail below.

### HTML5 client

The HTML5 client is a single page, responsive web application that is built upon the following components:

- [React.js](https://facebook.github.io/react/) for rendering the user interface in an efficient manner
- [WebRTC](https://webrtc.org/) for sending/receiving audio and video
- [tl;draw](https://www.tldraw.com/) for the whiteboard
- [Apollo](https://www.apollographql.com/) graphql client
- [TypeScript](https://www.typescriptlang.org/) most of the client is written in TypeScript

The HTML5 client connects directly with the BigBlueButton server over port 443 (SSL), from loading the BigBlueButton client to making a web socket connection. These connections are all handled by nginx.

In BigBlueButton 3.0 we have performed a major architecture restructuring removing our dependency on Meteor.js and MongoDB.

### bbb-graphql-server

The `bbb-graphql-server` leverages the Hasura platform and listens on port `8085`. It handles GraphQL queries and subscriptions from clients, checks user permissions, and verifies if a user has access to requested content before returning the information. If it's a subscription, it will continue to update whenever new data is available.

### bbb-graphql-middleware

The `bbb-graphql-middleware` sits between the browser and the `bbb-graphql-server` service, forwarding messages back and forth. It's a Go application that listens for WebSocket connections on port `8378`. Apart from message forwarding, it reconnects to `the bbb-graphql-server` service whenever the client needs to refresh permissions and creates JSON patches to minimize data transfer by sending only the differences.

### bbb-graphql-actions

The `bbb-graphql-actions` application is written in Node.js. Whenever `bbb-graphql-middleware` receives a GraphQL mutation, it forwards it to `bbb-graphql-actions` via HTTP request on port 8093. The actions service validates the received parameters and sends a message via Redis to the Akka-apps.

### PostgreSQL

The PostgreSQL stores all GraphQL information in the database `bbb_graphql`. The `bbb-graphql-server` retrieves data from this database, while Akka-apps inserts information into it.

### HAproxy

<!-- TODO add info --->

### TURN server (coturn)

<!-- TODO add info --->

### BBB web

BigBlueButton web application is a Java-based application written in Scala. It implements the [BigBlueButton API](/development/api) and holds a copy of the meeting state.

The BigBlueButton API provides a third-party integration (such as the [BigBlueButtonBN plugin](https://moodle.org/plugins/mod_bigbluebuttonbn) for Moodle) with an endpoint to control the BigBlueButton server.

Every access to BigBlueButton comes through a front-end portal (we refer to as a third-party application). BigBlueButton integrates Moodle, Wordpress, Canvas, Sakai, MatterMost, and others (see [third-party integrations](https://bigbluebutton.org/schools/integrations/)). BigBlueButton comes with its own front-end called [Greenlight](/greenlight/v3/install). When using a learning management system (LMS) such as Moodle, teachers can set up BigBlueButton rooms within their course and students can access the rooms and their recordings.

Regardless of which front-end you use, they all use the [API](/development/api) under the hood.

### Redis PubSub

Redis PubSub provides a communication channel between different applications running on the BigBlueButton server.

### Redis DB

When a meeting is recorded, all events are stored in Redis DB. When the meeting ends, the Recording Processor will take all the recorded events as well as the different raw (PDF, WAV, FLV) files for processing.


### Apps akka

BigBlueButton Apps is the main application that pulls together the different applications to provide real-time collaboration in the meeting. It provides the list of users, chat, whiteboard, presentations in a meeting.

Below is a diagram of the different components of Apps Akka.

![Apps Akka architecture](/img/diagrams/30-akka-apps.drawio.png)

The meeting business logic is in the MeetingActor. This is where information about the meeting is stored and where all messages for a meeting are processed.

### FSESL akka

We have extracted out the component that integrates with FreeSWITCH into its own application. This allows others who are using voice conference systems other than
FreeSWITCH to easily create their own integration. Communication between Akka Apps and FreeSWITCH Event Socket Layer (fsels) uses messages through redis pubsub.

![FsESL Akka architecture](/img/fsesl-akka-arch.png)

### FreeSWITCH

We think FreeSWITCH is an amazing piece of software for handling audio.

In BigBlueButton 4.0, LiveKit (see below) is the default voice backend; FreeSWITCH remains available as an alternative audio bridge for the HTML5 client and powers dial-in/telephony alongside LiveKit as well.
FreeSWITCH can also be [integrated with VOIP providers](/administration/customize#add-a-phone-number-to-the-conference-bridge) so that users who are not able to join using the headset will be able to call in using their phone.

### LiveKit

[LiveKit](https://livekit.io/) is the default media server, handling audio, camera video, and screen sharing through a single WebRTC SFU. It replaces the mixed FreeSWITCH (audio) plus mediasoup (video) topology with a unified stack. The LiveKit controller module in bbb-webrtc-sfu performs token generation, permission handling, webhook processing, and bbb-webrtc-recorder (capture) orchestration.

### Mediasoup and WebRTC-SFU

Mediasoup is a media server that implements an SFU model. It remains available as an alternative media bridge for streaming of webcams, listen-only audio, and screensharing. The WebRTC-SFU acts as the media controller handling negotiations and to manage the media streams.

### Joining a voice conference

A user can join the voice conference (handled by LiveKit by default, or by FreeSWITCH when configured and for dial-in) from the BigBlueButton HTML5 client or through the [phone](/administration/customize#add-a-phone-number-to-the-conference-bridge). When joining through the client, the user can choose to join Microphone or Listen Only, and the BigBlueButton client will make an audio connection to the server via WebRTC. WebRTC provides the user with high-quality audio with lower delay.

![Joining Voice Conference](/img/joining-voice-conf.png)

### Uploading a presentation

Uploaded presentations go through a conversion process in order to be displayed inside the client. When the uploaded presentation is an Office document, it needs to be converted into PDF using LibreOffice. The PDF document is then converted into scalable vector graphics (SVG) via `bbb-web`.

![Uploading Presentation](/img/presentation-upload-11.png)

The conversion process sends progress messages to the client through the Redis pubsub.

### Presentation conversion flow

The diagram below describes the flow of the presentation conversion. We take in consideration the configuration for enabling and disabling SWF, SVG and PNG conversion.

![General Conversion Flow](/img/diagrams/presentation-conversion-diagram-general-conversion-flow.png)

Then below the SVG conversion flow. It covers the conversion fallback. Sometimes we detect that the generated SVG file is heavy to load by the browser, we use the fallback to put a rasterized image inside the SVG file and make its loading light for the browser.

![SVG Conversion Flow](/img/diagrams/presentation-conversion-diagram-svg-conversion-flow.png)

### Internal network connections

The following diagram shows how the various components of BigBlueButton connect to each other via sockets. Teal lines carry media. Dashed boxes and lines are alternative or opt-in paths (the FreeSWITCH and mediasoup bridges, and telephone dial-in): those services are installed on every server but only carry traffic when that path is in use. The orange box is the local disk that `bbb-record-core` collects raw recording data from.

```mermaid
---
config:
  layout: elk
  flowchart:
    wrappingWidth: 320
  elk:
    considerModelOrder: NODES_AND_EDGES
---
flowchart TB
  %% Teal = media · dashed = alternative or opt-in path · orange = local disk recordings are collected from

  browser["<b>Browser</b><br/>bbb-html5 client"]
  pstn["<b>Phone / SIP trunk</b><br/>optional dial-in"]:::optional

  subgraph host["ONE UBUNTU HOST · bigbluebutton.target"]
    proxy["<b>HAProxy</b> :443 · TLS<br/>→ <b>nginx</b>"]

    html5["<b>bbb-html5</b><br/>static files"]
    web["<b>bbb-web</b> :8090<br/>API · authorizes every ws upgrade"]
    gqlmw["<b>graphql-middleware</b> :8378<br/>Go · JSON-patches subscription updates"]
    notes["<b>shared-notes-server</b> :8787<br/>Hocuspocus / Yjs"]
    sfu["<b>bbb-webrtc-sfu</b> :3008<br/>LiveKit controller · rooms · tokens · recording"]
    livekit["<b>livekit-server</b> :7880<br/>ws signaling + API · UDP media"]:::media

    hasura["<b>Hasura</b> :8085<br/>graphql-server"]
    actions["<b>graphql-actions</b> :8093<br/>turns mutations into Redis messages"]
    akka["<b>bbb-apps-akka</b> :8901<br/>meeting state · single Pekko process"]
    redis["<b>Redis</b> :6379<br/>pub/sub + recording events"]
    pg[("<b>PostgreSQL</b> :5432<br/>bbb_graphql (unlogged) · blocknote_app")]

    recorder["<b>bbb-webrtc-recorder</b><br/>hidden LiveKit subscriber"]
    sip["<b>livekit-sip</b> :5062<br/>dial-in for LiveKit meetings"]:::optional
    mediasoup["<b>mediasoup workers</b><br/>inside bbb-webrtc-sfu · alternative bridge"]:::optional
    fsesl["<b>bbb-fsesl-akka</b><br/>akka-apps ↔ FreeSWITCH"]:::optional
    freeswitch["<b>FreeSWITCH</b> :5060<br/>alternative audio bridge · dial-in gateway"]:::optional

    disk[["<b>local filesystem</b><br/>raw recording data"]]:::disk
    reccore["<b>bbb-record-core</b><br/>rap-starter (inotify) · resque workers<br/>copy/remux, then delete originals"]
  end

  %% ── Everything from the browser enters through HAProxy/nginx on TCP 443 ──
  browser -- TCP 443 --> proxy
  proxy -- /html5client --> html5
  proxy -- "/bigbluebutton · auth_request" --> web
  proxy -- /graphql ws --> gqlmw
  proxy -- /hocuspocus/collaboration ws --> notes
  proxy -- /bbb-webrtc-sfu ws --> sfu
  proxy -- /livekit/ ws --> livekit

  %% ── Meeting state ──
  gqlmw -- "queries · subscriptions (ws via nginx :8185)" --> hasura
  gqlmw -- "mutations (HTTP)" --> actions
  hasura -- reads --> pg
  hasura -- "auth hook /userInfo" --> akka
  actions -- publishes --> redis
  akka <-- pub/sub --> redis
  akka -- writes --> pg
  notes -- blocknote_app --> pg

  %% ── Media ──
  sfu -- "server API :7880" --> livekit
  livekit -- "webhooks :3040" --> sfu
  sfu -- "start/stop (via Redis)" --> recorder
  recorder m1@== "WebRTC · subscribe" ==> livekit
  browser m2@== "UDP 16384–32768 · straight to the host IP, bypasses nginx" ==> livekit
  sip m3@== SIP participant ==> livekit

  %% ── Alternative bridges and dial-in ──
  sfu -. spawns .-> mediasoup
  browser m4@-. "UDP · alternative bridge" .-> mediasoup
  mediasoup -. RTP audio .-> freeswitch
  fsesl -. ESL :8021 .-> freeswitch
  fsesl <-. voice pub/sub .-> redis
  pstn -. SIP :5060 .-> freeswitch
  freeswitch -. "SIP :5062 after PIN prompt" .-> sip

  %% ── Recording ──
  web -- "/var/bigbluebutton" --> disk
  recorder -- "/var/lib/bbb-webrtc-recorder" --> disk
  freeswitch -. "/var/freeswitch/meetings" .-> disk
  disk -- "inotify on .done marker · media" --> reccore
  redis -- "events · resque queue" --> reccore

  %% ── Styling (translucent fills so it reads in light and dark mode) ──
  classDef media     stroke:#0f8a83,stroke-width:2px;
  classDef optional  fill:#8881,stroke:#888,stroke-dasharray:4 4;
  classDef disk      fill:#d9603b22,stroke:#d9603b;
  classDef mediaEdge stroke:#0f8a83,stroke-width:2.5px;
  class m1,m2,m3,m4 mediaEdge;
  style host fill:#5b6b8c14,stroke:#5b6b8c66;
```

Besides the links drawn above, `bbb-web`, `bbb-graphql-middleware`, `bbb-webrtc-sfu` and `bbb-shared-notes-server` also exchange messages with `bbb-apps-akka` over Redis pub/sub. Those links are left out to keep the diagram readable.
