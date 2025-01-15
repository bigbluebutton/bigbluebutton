---
id: cluster-proxy
slug: /administration/cluster-proxy
title: Cluster Proxy Configuration
sidebar_position: 8
description: BigBlueButton Cluster Proxy Configuration
keywords:
- cluster
- proxy
---

## Motivation

In a traditional cluster setup, a scaler such as Scalelite is responsible for
distributing new meetings and the joining users to one of the available
BigBlueButton servers. While this setup is simple, it requires users to grant
permissions for the access to microphones, videos and screensharing whenever a
user gets assigned to a different server. This is due to the behavior of the
[getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
browser API call. This is a preventive measure that protects users so they will
only grant access to servers they intend to. However in a cluster setup, each
server prompts for permission individually. This is perceived as annoying or
even erratic.

This document describes an approach to set up a BigBlueButton cluster in a way
that will only prompt each user once per media type. To ensure horizontal
scalability media traffic and web socket connections are directly exchanged
between the user and the BigBlueButton server which runs the conference. This
is achieved by relaying only the HTML5 client UI through a common proxy server.

Before diving into the details, it is important to emphasize what this solution
is not:

* It is *not* a full reverse proxy for all BigBlueButton-related traffic. Browser
  and BigBlueButton server will still exchange most of the traffic directly.
* It is also *not* tied to Scalelite. You can choose any other BigBlueButton
  loadbalancer of your choice.

**Note:** The cluster proxy setup requires BigBlueButton 2.4.0 or later!

## Basic principle

The following image visualizes the conceptual dependencies. Note that it is not
a flow diagram.

![Conceptual drawing of the cluster proxy setup](/img/bbb-clusterproxy.png)

Once a user starts or joins a meeting (1), Greenlight or another BigBlueButton
frontend will initiate a new meeting by calling the `create` and `join` API
calls on Scalelite respectively (2). Scalelite in turn will forward the API calls
to one of the BigBlueButton servers (3). The BigBlueButton server will advise
the browser to fetch the HTML5 client UI via the cluster proxy address. Thus,
the BigBlueButton server will appear as if it was hidden behind the cluster
proxy (4).

While assets like images, CSS and javascript files are loaded via the cluster
proxy, all websocket, media streams and slides up/downloads are directly
exchanged with the BigBlueButton server which runs the meeting (5).

## Configuration

In this example, we will be using the following host names:

* `bbb-proxy.example.com`: The cluster proxy
* `bbb-XX.example.com`: The BigBlueButton servers (`XX` represents the number
  of the BigBlueButton server)

### Proxy Cluster Server

In this example, we will use a simple nginx based setup. For each BigBlueButton
server, add a new location directive. For the first node, this would be:

```
location /bbb-01/html5client/ {
  proxy_pass https://bbb-01.example.com/bbb-01/html5client/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "Upgrade";
}
```

Repeat this `location` directive for every BigBlueButton server.

You are free to choose any other HTTP reverse proxy software to fill the role
of the reverse proxy in this setup.

As this is the user visible host name, you may want to pick a nicer hostname,
such as `bbb-cluster.example.com`. Make sure to adjust it in all places.

### BigBlueButton Servers

For each BigBlueButton server in your cluster, repeat the following steps:

Add these options to `/etc/bigbluebutton/bbb-web.properties`:

```ini
defaultHTML5ClientUrl=https://bbb-proxy.example.com/bbb-01/html5client/join
presentationBaseURL=https://bbb-01.example.com/bigbluebutton/presentation
accessControlAllowOrigin=https://bbb-proxy.example.com
defaultGuestWaitURL=https://bbb-01.example.com/bbb-01/html5client/guestWait
```

Merge the following options into `/etc/bigbluebutton/bbb-html5.yml`:

```yaml
public:
  app:
    basename: '/bbb-01/html5client'
    bbbWebBase: 'https://bbb-01.example.com/bigbluebutton'
    learningDashboardBase: 'https://bbb-01.example.com/learning-analytics-dashboard'
  media:
    stunTurnServersFetchAddress: 'https://bbb-01.example.com/bigbluebutton/api/stuns'
    sip_ws_host: 'bbb-01.example.com'
  kurento:
    wsUrl: wss://bbb-01.example.com/bbb-webrtc-sfu
  presentation:
    uploadEndpoint: 'https://bbb-01.example.com/bigbluebutton/presentation/upload'
  pads:
    url: 'https://bbb-01.example.com/pad'
```

You may use `yq` to merge the new settings:

```bash
yq m -xi /etc/bigbluebutton/bbb-html5.yml /tmp/bbb-html5.yml
```

Create (or edit if it already exists) these unit file overrides:

* `/etc/systemd/system/bbb-html5-frontend@.service.d/cluster.conf`
* `/etc/systemd/system/bbb-html5-backend@.service.d/cluster.conf`

Each should have the following content:

```
[Service]
Environment=ROOT_URL=https://127.0.0.1/bbb-01/html5client
Environment=DDP_DEFAULT_CONNECTION_URL=https://bbb-01.example.com/bbb-01/html5client
```

Change the nginx `$bbb_loadbalancer_node` variable to the name of the load
balancer node in `/usr/share/bigbluebutton/nginx/loadbalancer.nginx` to allow CORS
requests:

```
set $bbb_loadbalancer_node https://bbb-proxy.example.com;
```

Prepend the mount point of bbb-html5 in all location sections except for the
`location @html5client` section in `/usr/share/bigbluebutton/nginx/bbb-html5.nginx`:

```
location @html5client {
  ...
}

location /bbb-01/html5client/locales {
  ...
}
```

**Note:** It is important that the location configuration is equal between the
BigBlueButton server and the proxy.

Add a route for the locales handler for the guest lobby. The guest lobby is served directly from the BBB node.

```
# /usr/share/bigbluebutton/nginx/bbb-html5.nginx
location =/html5client/locale {
  return 301 /bbb-01$request_uri;
}
```

Create the file `/etc/bigbluebutton/etherpad.json` with the following content:

```json
{
	"cluster_proxies": [
		"https://bbb-proxy.example.org"
	]
}
```

Adjust the CORS settings in `/etc/default/bbb-web`:

```shell
JDK_JAVA_OPTIONS="-Dgrails.cors.enabled=true -Dgrails.cors.allowCredentials=true -Dgrails.cors.allowedOrigins=https://bbb-proxy.example.org,https://bbb-01.example.com"
```


Restart BigBlueButton:

```shell
$ bbb-conf --restart
```

Now, opening a new session should show
`bbb-proxy.example.com/bbb-XX/html5client/` in the browser address bar and the
browser should ask for access permission only once.

## Further Considerations

### Security

If your proxy has access to internal machines, make sure that the reverse proxy
does not give access to websites on machines other than the BigBlueButton
servers.  In the suggested configuration outlined above, this is not the case.
It might become an issue if you resort to e.g. regular expression-based
`location` directives in order to avoid adding one `location` per BigBlueButton
server.

### Performance, Data Traffic and Role Separation

The BigBlueButton HTML5 is several megabytes in size. Make sure that the
traffic between BigBlueButton servers and the cluster proxy server does not
incur additional cost.

This setup introduces user visible single point of failure, i.e. a prominent
DDoS target. Make sure your frontend server is resiliant to DDoS-attacks, e.g.
has connection tracking disabled in its firewall settings and the web server is
configured to handle enough connections. Those optimizations however are rather
specific to individual setups and thus out of the scope of this document.

For the same reason, it is advisable to keep Scalelite on a different machine and
to provide a HA setup for the proxy server (i.e. using IP failover or Anycast).
Please monitor your setup carefully.

### Caching the HTML5 Client on the Proxy

You may cache the BBB HTML5 client javascript and css files and other assets on
the proxy. This reduces network traffic on the BBB server especially if many
clients join in a short period of time.

On the proxy server add the following configuration to the nginx configuration:

```
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=bbb:10m max_size=1g
                 inactive=60m use_temp_path=off;
```

For each BBB Server add the following snippet on the proxy:

```
location ~* ^/bbb-01/html5client/.+\.(ico|css|js|gif|jpeg|jpg|png|woff|ttf|otf|svg|woff2|eot)$ {
    proxy_pass https://bbb-01.example.com;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_cache bbb;
    proxy_cache_revalidate on;
    proxy_cache_min_uses 3;
    proxy_cache_use_stale error timeout updating http_500 http_502
                          http_503 http_504;
    proxy_cache_background_update on;
    proxy_cache_lock on;
    add_header X-Cache-Status $upstream_cache_status;
    add_header X-Asset "yes";
    proxy_cache_valid 200 302 60m;
}
```
