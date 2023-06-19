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

Starting with BigBlueButton 2.3 many of the configuration files have local overrides so the administrator can specify the local equivalents. We recommend you make changes only to the override files (`/etc/bigbluebutton`) so that when you update to a newer version of BigBlueButton your configuration changes are not overwritten by the new packages.

| Package                                                                 | Override                                         | Notes                                                                            |
| :---------------------------------------------------------------------- | :----------------------------------------------- | -------------------------------------------------------------------------------- |
| /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties             | /etc/bigbluebutton/bbb-web.properties            | Minimum containing general configuration (`securitySalt` and `serverURL`) |
| /usr/share/bbb-apps-akka/conf/application.conf                          | /etc/bigbluebutton/bbb-apps-akka.conf            |                                                                                  |
| /usr/share/bbb-fsesl-akka/conf/application.conf                         | /etc/bigbluebutton/bbb-fsesl-akka.conf           |                                                                                  |
| /usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml | /etc/bigbluebutton/bbb-html5.yml                 | Arrays are merged by replacement (as of 2.4-rc-5)                                |
| /usr/share/meteor/bundle/bbb-html5-with-roles.conf                      | /etc/bigbluebutton/bbb-html5-with-roles.conf     |                                                                                  |
| /usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml         | /etc/bigbluebutton/turn-stun-servers.xml         | Replaces the original file                                                       |
| /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml              | /etc/bigbluebutton/bbb-webrtc-sfu/production.yml | Arrays are merged by replacement                                                 |
| /usr/local/bigbluebutton/bbb-pads/config/settings.json                  | /etc/bigbluebutton/bbb-pads.json                 | Arrays are merged by replacement                                                 |
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

## HTML5 Client

### Configuration files

For `bbb-html5.yml` the settings file are YAML formatted. Any setting in this file overrides the corresponding setting in `/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml`. For example, the following `bbb-html5.yml` overrides the values for `public.kurento.screenshare.constraints.audio` to `true`.

```
public:
  kurento:
    screenshare:
      constraints:
        audio: true
```

### Log files

#### Log monitoring for server logs (bbb-html5)

Since BigBlueButton 2.3 we run multiple nodejs processes in production mode, so tailing logs is slightly different from `journalctl -f bbb-html5.service` which was used in 2.2. Rather than listing all the services ( `bbb-html5-backend@1.service bbb-html5-backend@2.service bbb-html5-frontend@1.service bbb-html5-frontend@2.service bbb-html5-frontend@3.service bbb-html5-frontend@4.service ...` ) you can use the wildcard operator `*`. Notice the different process id for each bbb-html5-\* service. Also notice `systemd_start_frontend.sh` signifying a log from a frontend process vs `systemd_start.sh` - backend process.

```
# journalctl -f -u bbb-html5-*
-- Logs begin at Mon 2021-03-15 12:13:05 UTC. --
Mar 15 15:14:18 demo2 systemd_start_frontend.sh[3881]: debug: Redis: SendCursorPositionEvtMsg completed sync
Mar 15 15:14:18 demo2 systemd_start_frontend.sh[3891]: debug: Redis: SendCursorPositionEvtMsg completed sync
Mar 15 15:14:18 demo2 systemd_start_frontend.sh[3888]: debug: Publishing Polls {"meetingId":"37d0fb4f4617b3c97948d717435f9e1cf6998477-1615821214341","userId":"w_el87iar97iwa"}
...
Mar 15 15:30:18 demo2 systemd_start.sh[3869]: debug: Redis: UpdateBreakoutUsersEvtMsg completed sync
```

#### Logs sent directly from the client

To assist with monitoring and debugging, the HTML5 client can send its logs to the BigBlueButton server via the `logger` function. Here's an example of its use:

The client logger accepts three targets for the logs: `console`, `server` and `external`.

| Name   | Default Value | Accepted Values                  | Description                                                                                             |
| ------ | ------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| target | "console"     | "console", "external", "server"  | Where the logs will be sent to.                                                                         |
| level  | "info"        | "debug", "info", "warn", "error" | The lowest log level that will be sent. Any log level higher than this will also be sent to the target. |
| url    | -             | -                                | The end point where logs will be sent to when the target is set to "external".                          |
| method | -             | "POST", "PUT"                    | HTTP method being used when using the target "external".                                                |

The default values are:

```yaml
clientLog:
  server: { enabled: true, level: info }
  console: { enabled: true, level: debug }
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

This configures nginx to use `/var/www/bigbluebutton-default/assets` as the default site. ([src](https://github.com/bigbluebutton/bigbluebutton/blob/develop/build/packages-template/bbb-html5/bigbluebutton.nginx))


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

https://github.com/bigbluebutton/bigbluebutton/blob/main/bigbluebutton-web/grails-app/conf/bigbluebutton.properties

### Log files

Located in `/var/log/bigbluebutton/bbb-web`

| Log                      | Description                                                  |
| :----------------------- | :----------------------------------------------------------- |
| catalina.yyyy-mm-dd.log  | General log information from startup.              |
| localhost.yyyy-mm-dd.log | General log information from startup of applications. |
| /var/log/syslog          | Also contains output from bbb-web.                            |
| /var/log/bigbluebutton   | Contains BigBlueButton Web and Recording processing logs.    |

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
