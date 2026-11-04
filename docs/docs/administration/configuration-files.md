---
id: configuration-files
slug: /administration/configuration-files
title: Configuration Files
sidebar_position: 2
description: BigBlueButton Configuration Files
keywords:
- configuration-files
---

## Overview


This document gives an overview of the BigBlueButton configuration files.

We recommend you make changes only to the override files (`/etc/bigbluebutton`) so that when you update to a newer version of BigBlueButton your configuration changes are not overwritten by the new packages.

## Local overrides for configuration settings

Many of the configuration files have local overrides so the administrator can specify the local equivalents. We recommend you make changes only to the override files (`/etc/bigbluebutton`) so that when you update to a newer version of BigBlueButton your configuration changes are not overwritten by the new packages.

| Package                                                                 | Override                                         | Notes                                                                            |
| :---------------------------------------------------------------------- | :----------------------------------------------- | -------------------------------------------------------------------------------- |
| /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties             | /etc/bigbluebutton/bbb-web.properties            | Minimum containing general configuration (`securitySalt` and `serverURL`) |
| /etc/default/bbb-web                                                    | /etc/bigbluebutton/bbb-web.env                   | Environment of the `bbb-web` service (heap size, listen address, `JDK_JAVA_OPTIONS`) |
| /usr/share/bbb-apps-akka/conf/application.conf                          | /etc/bigbluebutton/bbb-apps-akka.conf            |                                                                                  |
| /usr/share/bbb-fsesl-akka/conf/application.conf                         | /etc/bigbluebutton/bbb-fsesl-akka.conf           |                                                                                  |
| /usr/share/bigbluebutton/html5-client/private/config/settings.yml       | /etc/bigbluebutton/bbb-html5.yml                 | Arrays are merged by replacement (as of 2.4-rc-5)                                |
| /etc/default/bbb-graphql-server                                         | /etc/bigbluebutton/bbb-graphql-server.env        | It can replace any Hasura config but HASURA_GRAPHQL_ADMIN_SECRET                 |
| /usr/share/bbb-graphql-server/admin-secret                              |                                                  | Stores Hasura admin password (HASURA_GRAPHQL_ADMIN_SECRET), it can be edited     |
| /usr/share/bbb-graphql-middleware/config.yml                            | /etc/bigbluebutton/bbb-graphql-middleware.yml    |                                                                                  |
| /usr/lib/systemd/system/bbb-graphql-actions.service                     | /etc/bigbluebutton/bbb-graphql-actions.env       | Optional environment file (`KEY=VALUE`), e.g. `BBB_REDIS_HOST`, `BBB_REDIS_PORT`, `BBB_REDIS_PASSWORD` |
| /usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml         | /etc/bigbluebutton/turn-stun-servers.xml         | Replaces the original file                                                       |
| /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml              | /etc/bigbluebutton/bbb-webrtc-sfu/production.yml | Arrays are merged by replacement                                                 |
| /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml                        | /etc/bigbluebutton/bbb-webrtc-recorder.yml       | Replaces the original file; `BBBRECORDER_*` variables in `/etc/default/bbb-webrtc-recorder` override single settings |
| /usr/share/livekit-server/livekit.yaml                                  | /etc/bigbluebutton/livekit.yaml                  | Merged when `livekit-server` starts; holds the API keys                          |
| /usr/share/livekit-server/livekit-sip.yaml                              | /etc/bigbluebutton/livekit-sip.yaml              | Merged when `livekit-sip` starts                                                 |
| /usr/share/bbb-shared-notes-server/config/default.yml                   | /etc/bigbluebutton/bbb-shared-notes-server.yml   |                                                  |
| /usr/local/bigbluebutton/bbb-export-annotations/config/settings.json    | /etc/bigbluebutton/bbb-export-annotations.json   | JSON; arrays are merged by replacement           |
| /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml                 | /etc/bigbluebutton/recording/recording.yml       |
| /usr/local/bigbluebutton/core/scripts/presentation.yml                  | /etc/bigbluebutton/recording/presentation.yml    |
| /etc/cron.daily/bigbluebutton                                           | /etc/default/bigbluebutton-cron-config    | Only variables allowed in the override

<br /><br />

For `bbb-web.properties`, the settings are name/value pair. For example, the following `bbb-web.properties` overrides the settings for `bigbluebutton.web.serverURL` and `securitySalt` (shared secret).

```
#
# Use this file to override default entries in /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties
#

bigbluebutton.web.serverURL=https://droplet-7162.meetbbb.com
securitySalt=UsanRxRk938d02cTWfAqSM9Cvin7bnzsREfqFfzpf2U
```

This override will ensure that `bbb-web` uses the above values regardless of changes the packaging scripts make to the upgrade.

Settings can also be given as `-D` system properties or environment variables. The order, highest first, is: `-D` > environment > `/etc/bigbluebutton/bbb-web.properties` > `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`. An environment variable uses the key in upper case with `.` as `_` (for example `BIGBLUEBUTTON_WEB_SERVERURL` or `SECURITYSALT`), or the exact key name.

For `bbb-apps-akka` and `bbb-fsesl-akka`, the settings file are formatted as shown below. For example, the file `bbb-apps-akka.conf` overrides the settings for `/usr/share/bbb-apps-akka/conf/application.conf`.

```
// include default config from upstream
include "/usr/share/bbb-apps-akka/conf/application.conf"

// you can customize everything here. API endpoint and secret have to be changed
// This file will not be overridden by packages

services {
  bbbWebAPI="https://bbb.example.com/bigbluebutton/api"
  sharedSecret="UsanRxRk938d02cTWfAqSM9Cvin7bnzsREfqFfzpf2U"
}
```

### Using a password-protected Redis

Redis has no password by default. To require one, set `requirepass` in `/etc/redis/redis.conf` and restart `redis-server`, then set the same password in every service that connects to Redis and restart them:

| Service                    | File                                                         | Setting                                 |
| :------------------------- | :----------------------------------------------------------- | :-------------------------------------- |
| bbb-web                    | /etc/bigbluebutton/bbb-web.properties                        | `redisPassword=`                        |
| bbb-apps-akka              | /etc/bigbluebutton/bbb-apps-akka.conf                        | `redis { password="" }`                 |
| bbb-fsesl-akka             | /etc/bigbluebutton/bbb-fsesl-akka.conf                       | `redis { password="" }`                 |
| bbb-graphql-middleware     | /etc/bigbluebutton/bbb-graphql-middleware.yml                | `redis.password`                        |
| bbb-graphql-actions        | /etc/bigbluebutton/bbb-graphql-actions.env                   | `BBB_REDIS_PASSWORD=`                   |
| bbb-shared-notes-server    | /etc/bigbluebutton/bbb-shared-notes-server.yml               | `redis.password`                        |
| bbb-webrtc-sfu             | /etc/bigbluebutton/bbb-webrtc-sfu/production.yml             | `redisPassword`                         |
| Recording processing       | /etc/bigbluebutton/recording/recording.yml                   | `redis_password`                        |
| bbb-export-annotations     | /etc/bigbluebutton/bbb-export-annotations.json               | `redis.password`                        |
| bbb-webrtc-recorder        | /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml             | `pubsub.adapters.redis.password`        |
| bbb-transcription-controller | /etc/bigbluebutton/bbb-transcription-controller/production.yml | `redis.password`                      |
| livekit-server             | /etc/bigbluebutton/livekit.yaml                              | `redis.password`                        |
| livekit-sip                | /etc/bigbluebutton/livekit-sip.yaml                          | `redis.password`                        |
| bbb-webhooks (if installed) | /usr/local/bigbluebutton/bbb-webhooks/config/default.yml    | `redis.password` (regenerated on package upgrades) |

## HTML5 Client

### Configuration files

For `bbb-html5.yml` the settings file are YAML formatted. Any setting in this file overrides the corresponding setting in `/usr/share/bigbluebutton/html5-client/private/config/settings.yml`. For example, the following `bbb-html5.yml` overrides the values for `public.kurento.screenshare.constraints.audio` to `true`.

```
public:
  kurento:
    screenshare:
      constraints:
        audio: true
```

### Log files

#### Log monitoring for server logs

The HTML5 client is a static bundle served by nginx, so it has no service of its own. The services behind it are `bbb-apps-akka`, which holds the meeting logic, and the GraphQL stack that the client talks to:

`journalctl -f -u bbb-apps-akka.service`

`SYSTEMD_LESS=FRXMK journalctl -f -u bbb-graphql-middleware.service -u bbb-graphql-server.service -u bbb-graphql-actions.service`

`bbb-apps-akka` also writes `/var/log/bbb-apps-akka/bbb-apps-akka.log`.

#### Logs sent directly from the client

To assist with monitoring and debugging, the HTML5 client can send its logs to the BigBlueButton server via the `logger` function. Here's an example of its use:

The client logger has two targets, `console` and `external`, configured under `public.clientLog` in `/etc/bigbluebutton/bbb-html5.yml`. Each target has its own settings:

| Name   | Target | Accepted Values                  | Description                                                                                             |
| ------ | ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| enabled | both  | true / false                     | Whether the target receives logs.                                                                       |
| level  | both   | "debug", "info", "warn", "error" | The lowest log level that will be sent. Any log level higher than this will also be sent to the target. |
| enableRuntimeErrorLogging | console | true / false   | When true, the client installs global listeners to capture runtime errors, unhandled rejections, and resource load failures. |
| url    | external | -                              | The end point where logs will be sent to.                                                               |
| method | external | "POST", "PUT"                  | HTTP method used to send the logs.                                                                      |
| throttleInterval | external | milliseconds         | How often buffered log entries are sent.                                                                |
| flushOnClose | external | true / false             | Send the remaining entries when the page is closed.                                                     |

The default values are:

```yaml
clientLog:
  console:
    {
      enabled: true,
      level: debug,
      enableRuntimeErrorLogging: false,
    }
  external:
    {
      enabled: false,
      level: info,
      url: https://LOG_HOST/html5Log,
      method: POST,
      throttleInterval: 400,
      flushOnClose: true,
    }
```

Notice that the `external` option is disabled by default - you can enable it on your own server after a few configuration changes.

When enabling the `external` logging output, the BigBlueButton client will POST the log events to the URL endpoint provided by `url`. To create an associated endpoint on the BigBlueButton server for the POST request, create a file `/etc/bigbluebutton/nginx/html5-client-log.nginx` with the following contents:

```nginx
location /html5Log {
    access_log /var/log/nginx/html5-client.log postdata;
    echo_read_request_body;
}
```

Then create a file in `/etc/nginx/conf.d/html5-client-log.conf` with the following contents:

```nginx
log_format postdata '$remote_addr [$time_iso8601] $request_body';
```

Next, install the full version of nginx.

```bash
$ sudo apt-get install nginx-full
```

You may also need to create the external output file and give it the appropriate permissions and ownership:

```bash
$ sudo touch /var/log/nginx/html5-client.log
$ sudo chown www-data:adm /var/log/nginx/html5-client.log
$ sudo chmod 640 /var/log/nginx/html5-client.log
```

Restart BigBlueButton with `sudo bbb-conf --restart` and launch the BigBlueButton HTML5 client in a new session. You should see the logs appearing in `/var/log/nginx/html5-client.log` as follows

```log
99.239.102.0 [2018-09-09T14:59:10+00:00] [{\x22name: .. }]
```

You can follow the logs on the server with the command

```bash
$ tail -f /var/log/nginx/html5-client.log | sed -u -e 's/\\x22/"/g' -e 's/\\x5C/\\/g'
```

Here's a sample log entry

```json
      "requesterUserId":"w_klfavdlkumj8",
      "fullname":"Ios",
      "confname":"Demo Meeting",
      "externUserID":"w_klfavdlkumj8"
   },
   "url":"https://demo.bigbluebutton.org/html5client/users",
   "userAgent":"Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1",
   "count":1
}
```

## nginx

### Configuration files

Located in `/etc/nginx/sites-enabled/bigbluebutton`

This configures nginx to use `/var/www/bigbluebutton-default/assets` as the default site. ([src](https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-release/build/packages-template/bbb-html5/bigbluebutton.nginx)) The configuration of each component is included from `/etc/bigbluebutton/nginx/*.nginx`.

On a server installed by `bbb-install.sh` with the built-in TURN server, port 443 belongs to HAProxy, which terminates TLS and passes HTTP connections to nginx on ports 81 and 82 (with the PROXY protocol) and TURN connections to coturn. nginx itself listens on port 80 and on those two local ports.


### Log files

| Log                                     | Description                                                     |
| :-------------------------------------- | :-------------------------------------------------------------- |
| /var/log/nginx/bigbluebutton.access.log | Web log of access to BigBlueButton HTML pages.                  |
| /var/log/nginx/error.log                | Web log of errors generated by nginx based on browser requests. |

## bbb-web

### Configuration files

```
 /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties
 /etc/bigbluebutton/bbb-web.properties
```

This is one of the main configuration files for BigBlueButton applications.

https://github.com/bigbluebutton/bigbluebutton/blob/v4.1.x-release/bigbluebutton-web/grails-app/conf/bigbluebutton.properties

### Log files

| Log                                   | Description                                                  |
| :------------------------------------ | :----------------------------------------------------------- |
| /var/log/bigbluebutton/bbb-web.log    | The bbb-web application log (API calls, meetings, presentation conversion); rotated daily, 14 days are kept. |
| `journalctl -u bbb-web`               | The service's standard output, including startup errors.     |
| /var/log/bigbluebutton                | Also contains the recording processing logs (see below).     |

## FreeSWITCH

### Configuration Files

```
/opt/freeswitch/conf/vars.xml
```

Setup host and external IP values.

```
/opt/freeswitch/conf/autoload_configs/conference.conf.xml
```

Setup voice conference properties.

```
/opt/freeswitch/conf/dialplan/default
/opt/freeswitch/conf/dialplan/public
```

## Recording

### Log files

For each workflow and meeting we have a different logfile, they come in the form: `<workflow>-<meetingId>.log`, as specified below:

| Log                      | Description                                                  |
| :----------------------- | :----------------------------------------------------------- |
| `/var/log/bigbluebutton/archive-<meetingId>.log`  | All logs for archive phase              |
| `/var/log/bigbluebutton/presentation/process-<meetingId>.log`  | All logs for process phase              |
| `/var/log/bigbluebutton/presentation/publish-<meetingId>.log`  | All logs for publish phase              |
