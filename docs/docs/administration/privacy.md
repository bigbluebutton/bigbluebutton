---
id: privacy
slug: /administration/privacy
title: Privacy
sidebar_position: 10
description: BigBlueButton Privacy
keywords:
- privacy
---

## Overview

Many countries regulate the protection of personal data, and for operators of BigBlueButton servers those regulations are an important topic.
In the European Union the relevant regulation is the [General Data Protection Regulation (GDPR)](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation). Many other countries have adopted similar regulations (for example the [California Consumer Privacy Act (CCPA)](https://en.wikipedia.org/wiki/California_Consumer_Privacy_Act) in California, USA, or the [Lei Geral de Proteção de Dados (LGPD)](https://pt.wikipedia.org/wiki/Lei_Geral_de_Prote%C3%A7%C3%A3o_de_Dados_Pessoais) in Brazil), and some of them also apply outside their country under certain conditions. This page describes where a BigBlueButton 4.0 server processes and stores personal data, for how long, and which configuration options exist.

Disclaimer: this page is neither legal advice nor complete.

## BigBlueButton

This section documents privacy related settings, defaults, and configuration options in BigBlueButton itself. Keep in mind that changes to files installed by the packages are overwritten on upgrades. Make your changes in the override files under [`/etc/bigbluebutton`](/administration/configuration-files#local-overrides-for-configuration-settings) so they survive upgrades and restarts. The retention periods of the daily cleanup job are set in `/etc/default/bigbluebutton-cron-config` (see [Retention settings](#retention-settings)).

### Recordings

#### BigBlueButton either records all of a session or does not record at all

When a meeting is created with `record=true`, BigBlueButton captures the entire session: audio, webcams, screen sharing, whiteboard and presentation events, chat, and shared notes. This is independent of whether the recording button is pressed. The button only sets recording marks; the raw material of the whole session is needed because parts of the recording (for example the whiteboard) depend on earlier state, see [Recording](/development/recording).

After the meeting ends, the archive step checks for recording marks. If the meeting has none, it is not processed into a recording: the meeting's events are deleted from Redis, the media files are deleted after they were copied into the raw directory, and the raw directory `/var/bigbluebutton/recording/raw/` keeps its copy, marked with a `.norecord` status file. The daily cleanup job deletes those raw directories `unrecorded_days` (default 14) after the meeting. Depending on the use case and jurisdiction it might be prudent to keep that window, so that a recording can still be produced when users forgot to click the recording button.

If the front end (which uses the BigBlueButton API to create the meeting) specifies `record=false` or does not specify the parameter, no media is recorded and the "start"/"stop" recording button is not shown. The presentation files and the session data described below are still stored.

##### Resolution

###### Globally disable recordings in BigBlueButton

Set `disableRecordingDefault=true` in `/etc/bigbluebutton/bbb-web.properties` (it overrides the default in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`). Meetings are then never recorded, whatever the front end passes as `record`. Breakout rooms are not recorded by default (`breakoutRoomsRecord=false`); keep it that way, because breakout rooms imply a certain level of privacy for typical users.

###### Shorten the retention of raw files without recording marks

Set `unrecorded_days` in `/etc/default/bigbluebutton-cron-config`. With `unrecorded_days=0` the raw directory of a meeting without recording marks is deleted on the first daily run that happens more than one day after the meeting ended.

#### BigBlueButton stores presentations uploaded during sessions

BigBlueButton stores the uploaded presentations and the slides generated from them in `/var/bigbluebutton/<meetingId>/`, also when the meeting was created with `record=false`. The daily cleanup job deletes these directories `history` (default 5) days after the meeting. For recorded meetings, the archive step also copies them into the raw recording directory.

##### Resolution

Lower `history` in `/etc/default/bigbluebutton-cron-config`.

#### BigBlueButton keeps session data for a while after the meeting

Independent of recording, a running meeting is stored in several places, each with its own cleanup:

- The PostgreSQL database `bbb_graphql` holds the state of the meeting that the client reads through GraphQL: the users with their names and roles, chat messages, polls, and so on. bbb-apps-akka deletes a meeting from the database one hour after it ended, and the rows that belong to it (users, chat messages, and so on) are deleted with it.
- Shared notes are stored by `bbb-shared-notes-server` in the PostgreSQL database `blocknote_app`. A meeting's notes are deleted `documentExpireMinutesAfterMeetingEnd` (default 60) minutes after the meeting ended; the setting can be changed in `/etc/bigbluebutton/bbb-shared-notes-server.yml`.
- The Learning Dashboard data (names, join and leave times, talk time, chat and poll activity) is written to `/var/bigbluebutton/learning-dashboard/`. The files are deleted `learningDashboardCleanupDelayInMinutes` (default 2) minutes after the meeting ended; for recorded meetings the archive step keeps a copy in the raw recording directory. The dashboard can be turned off with `disabledFeatures=learningDashboard` in `/etc/bigbluebutton/bbb-web.properties`.
- Redis holds the events of a recorded meeting until the archive step has stored them in the raw recording directory.
- When a meeting is created with `meetingKeepEvents=true` (or `defaultKeepEvents=true` is set in `bbb-web.properties`, default `false`), the events of the meeting are written to `/var/bigbluebutton/events/<meetingId>/events.xml` even if the meeting is not recorded. No cleanup job removes these files.

#### BigBlueButton stores full raw recording data

The raw data of a recorded meeting (audio, webcam and screen sharing files, events, presentations, shared notes, Learning Dashboard data) stays in `/var/bigbluebutton/recording/raw/<meetingId>/` after the recording was processed. This includes the parts of the session before the presenter clicked the recording button. The daily cleanup job deletes the raw directory `published_days` (default 14) after a recording was published. The raw directory of a recording that was unpublished through the API is kept until the recording is deleted.

##### Resolution

Lower `published_days` in `/etc/default/bigbluebutton-cron-config`.

For deployments using Scalelite, set `delete_recording: true` in `/usr/local/bigbluebutton/core/scripts/scalelite.yml`. The `scalelite_post_publish.rb` script then runs `bbb-record --delete` for each recording after it was transferred, which removes the raw directory, the published and unpublished copies, and the processing logs of the recording. `bbb-record --delete` can be run by the `bigbluebutton` user, so no `sudo` rule is needed.

For other deployments, a [post-publish script](/development/recording#post-scripts) can run `bbb-record --delete` the same way after the recording was copied elsewhere.

#### All recordings are always accessible

A published recording is served by nginx to anyone who has its link. BigBlueButton does not authenticate requests for recordings, see for example [issue 8505](https://github.com/bigbluebutton/bigbluebutton/issues/8505) and [issue 9443](https://github.com/bigbluebutton/bigbluebutton/issues/9443).

##### Resolution

Recordings that should not be reachable can be unpublished with the `publishRecordings` API call (`publish=false`); an unpublished recording is kept on disk but not served.

Server administrators can also change the nginx configuration to restrict access to the recording URLs. Depending on the use case, an `auth_request` in nginx can call the front end to enforce its own permissions (for example, requiring the same credentials as the front end). [bbb-rec-perm](https://github.com/ichdasich/bbb-rec-perm) is an example of this pattern (written for Greenlight v2).

#### Cache files

When recording is enabled, the BigBlueButton stack writes the session's media and data to disk in several directories:

- `/var/bigbluebutton/recording/raw/`, `/var/bigbluebutton/published/`, `/var/bigbluebutton/unpublished/` and `/var/bigbluebutton/deleted/` (raw and processed recordings), `/var/bigbluebutton/<meetingId>/` (presentations), `/var/bigbluebutton/learning-dashboard/` and `/var/bigbluebutton/events/`, owned by the `bigbluebutton` user
- `/var/lib/bbb-webrtc-recorder/` (webcams, screen sharing and, with the LiveKit audio bridge, audio, written by `bbb-webrtc-recorder`), owned by the `bigbluebutton` user
- `/var/freeswitch/meetings/` (audio, with the FreeSWITCH audio bridge), owned by the `freeswitch` user
- `/var/mediasoup/` (webcams and screen sharing, only with the mediasoup media bridge), owned by the `bigbluebutton` user

The media files of a meeting are deleted by the archive step once it has copied them into the raw directory; the daily cleanup job deletes anything older than `history` days that was left behind.

##### Resolution

To keep this data out of persistent storage, the directories can be mounted as tmpfs, so the files only exist in memory. Add lines like the following to `/etc/fstab`:

```
tmpfs /var/bigbluebutton/recording/raw/ tmpfs rw,nosuid,noatime,uid=998,gid=998,size=16G,mode=0755 0 0
tmpfs /var/bigbluebutton/unpublished/ tmpfs rw,nosuid,noatime,uid=998,gid=998,size=16G,mode=0755 0 0
tmpfs /var/bigbluebutton/published/ tmpfs rw,nosuid,noatime,uid=998,gid=998,size=16G,mode=0755 0 0
tmpfs /var/lib/bbb-webrtc-recorder/ tmpfs rw,nosuid,noatime,uid=998,gid=998,size=16G,mode=0755 0 0
tmpfs /var/freeswitch/meetings/ tmpfs rw,nosuid,noatime,uid=997,gid=997,size=16G,mode=0755 0 0
```

Then run `bbb-conf --stop; mount -a; bbb-conf --start`.

Replace the `uid` and `gid` values with the ones on your server; `getent passwd bigbluebutton freeswitch` prints them (the user and group IDs are the third and fourth fields). Size the mounts for the longest sessions you expect, and keep in mind that a tmpfs is empty after a reboot: recordings that were not processed yet are lost.

#### Deleted recordings remain on disk

When recordings are deleted with the `deleteRecordings` API call, BigBlueButton does not remove them from disk. It moves them from `/var/bigbluebutton/published/` or `/var/bigbluebutton/unpublished/` to `/var/bigbluebutton/deleted/`, as a safety measure against accidental deletions. Deleted recordings are not listed by `getRecordings` unless `state=deleted` is requested explicitly, and they are not served, but they keep using disk space and may contain personal data subject to retention requirements. Nothing purges them automatically. The raw directory of a deleted recording also stays in `/var/bigbluebutton/recording/raw/` until the daily cleanup job removes it (`published_days` after the recording was published).

##### Resolution

Remove the files yourself. `bbb-record --delete <recordId>` removes everything that belongs to one recording, including its raw directory. To purge every deleted recording at once, run:

```bash
rm -rf /var/bigbluebutton/deleted/*
```

Both actions are irreversible, so verify your backups before proceeding.

#### Retention settings

The daily cleanup job `/etc/cron.daily/bigbluebutton` deletes files after a number of days. The periods are variables that you can override in `/etc/default/bigbluebutton-cron-config` (one `name=value` per line):

- `history` (default 5): presentations in `/var/bigbluebutton/<meetingId>/`, and media files the archive step left behind in `/var/lib/bbb-webrtc-recorder/`, `/var/mediasoup/` and `/var/freeswitch/meetings/`
- `unrecorded_days` (default 14): raw directories of meetings without recording marks
- `published_days` (default 14): raw directories of recordings that were published
- `log_history` (default 28): rotated log files in `/var/log/bigbluebutton/`, `/var/log/bbb-webrtc-sfu/` and `/opt/freeswitch/var/log/freeswitch/`

To keep the raw directories of published recordings, comment out the `remove_raw_of_published_recordings` call in `/etc/cron.daily/bigbluebutton` (this edit is lost on upgrades), or set `published_days` to a large value.

### Logs

#### General log rotation

Server operators who keep logs should know these retention settings:

- `log_history` in `/etc/default/bigbluebutton-cron-config` (default 28 days) for the rotated files under `/var/log/bigbluebutton/`, `/var/log/bbb-webrtc-sfu/` and `/opt/freeswitch/var/log/freeswitch/`
- `/etc/logrotate.d/bbb-record-core`, which rotates `/var/log/bigbluebutton/bbb-rap-worker.log` and `sanity.log` weekly and keeps 8 rotations
- `/etc/logrotate.d/bbb-webrtc-sfu`, which rotates `/var/log/bbb-webrtc-sfu/*.log` daily and keeps 7 rotations
- `/usr/share/bbb-web/WEB-INF/classes/logback.xml`, which rotates `/var/log/bigbluebutton/bbb-web.log` daily and keeps 14 days
- `/etc/logrotate.d/nginx` (Ubuntu's default: daily, 14 rotations) for the nginx logs
- `/etc/systemd/journald.conf` (`SystemMaxUse`, `MaxRetentionSec`) for the services that log to the systemd journal: `bbb-graphql-server`, `bbb-graphql-middleware`, `bbb-graphql-actions`, `bbb-webrtc-recorder`, `bbb-shared-notes-server`, `bbb-export-annotations`, `livekit-server`, `livekit-sip`, and the optional `bbb-webhooks` and `bbb-transcription-controller`

#### BigBlueButton logging

`bbb-web` logs every API request, including meeting creation and the join requests with the users' names, to `/var/log/bigbluebutton/bbb-web.log`. The log level is `appLogLevel` in `/etc/bigbluebutton/bbb-web.properties` (default `DEBUG`); the individual loggers are configured in `/usr/share/bbb-web/WEB-INF/classes/logback.xml`.

`bbb-apps-akka` logs what happens inside meetings (users joining and leaving, roles, and so on) to `/var/log/bbb-apps-akka/bbb-apps-akka.log`, at `DEBUG` by default. Set `loglevel` in `/etc/bigbluebutton/bbb-apps-akka.conf` (the override of `/usr/share/bbb-apps-akka/conf/application.conf`) and the logger levels in `/usr/share/bbb-apps-akka/conf/logback.xml`. `bbb-fsesl-akka`, which connects the meetings to FreeSWITCH, logs the voice users the same way to `/var/log/bbb-fsesl-akka/bbb-fsesl-akka.log`; its settings are `/etc/bigbluebutton/bbb-fsesl-akka.conf` and `/usr/share/bbb-fsesl-akka/conf/logback.xml`.

`bbb-webrtc-sfu` logs the media sessions, including user identifiers, to `/var/log/bbb-webrtc-sfu/bbb-webrtc-sfu.log`. To reduce it, set the log level in `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`:

```yaml
log:
  level: error
```

`livekit-server` and `livekit-sip` log to the journal; their `log_level` (default `info`) is set in `/etc/bigbluebutton/livekit.yaml` and `/etc/bigbluebutton/livekit-sip.yaml`. The GraphQL server (Hasura) logs at `warn` by default (`HASURA_GRAPHQL_LOG_LEVEL`, overridable in `/etc/bigbluebutton/bbb-graphql-server.env`).

The client can send its own logs to the server. `public.clientLog` in `/etc/bigbluebutton/bbb-html5.yml` controls this: with the default configuration the browser only logs to its console; the `external` target, which posts the client log (with the user's and meeting's identifiers) to a URL of your choice, is disabled by default. Leave it disabled unless you need it, and keep the receiving endpoint under the same retention rules as the server logs.

#### FreeSWITCH

FreeSWITCH logs to `/opt/freeswitch/var/log/freeswitch/freeswitch.log`, at `debug` level by default. The log includes the names of the users who joined audio through the FreeSWITCH audio bridge and the numbers of dial-in callers. The level is set with `loglevel` in `/opt/freeswitch/etc/freeswitch/autoload_configs/switch.conf.xml`, and the levels written to the file in `/opt/freeswitch/etc/freeswitch/autoload_configs/logfile.conf.xml`. Both files are installed by the `bbb-freeswitch-core` package and overwritten on upgrades.

#### nginx and HAProxy

By default nginx keeps a full access log, which includes the users' IP addresses and every requested URL, among them the join URLs with the users' names. The BigBlueButton site configuration `/etc/nginx/sites-available/bigbluebutton` logs to `/var/log/nginx/bigbluebutton.access.log`, and `/etc/nginx/nginx.conf` logs everything else to `/var/log/nginx/access.log`. To turn the access logs off, set `access_log off;` in both files and reload nginx with `systemctl reload nginx`.

Since BigBlueButton 4.0, HAProxy terminates TLS on port 443 in front of nginx. `bbb-install.sh` configures it in `/etc/haproxy/haproxy.cfg` with `option tcplog`, so every connection is logged with the client's IP address through syslog (facility `local0`, on Ubuntu `/var/log/haproxy.log`). To turn this off, add `no log` to the `frontend nginx_or_turn` section and reload HAProxy with `systemctl reload haproxy`; `bbb-install.sh` rewrites the file when it is run again, so repeat the change after an upgrade.

### Integrations

#### TURN and STUN servers

Browsers use STUN and TURN servers for NAT traversal. The default `turn-stun-servers.xml` shipped with `bbb-web` lists the public STUN server `stun:stun.l.google.com:19302`, so every client sends STUN requests, which reveal its IP address, to Google. You can [set up your own TURN/STUN server](/administration/turn-server) and configure it in `/etc/bigbluebutton/turn-stun-servers.xml`, which replaces the shipped file; `bbb-install.sh -c` writes that file for you. The logs of a coturn server are covered [below](#coturn).

#### Live captions and transcription

Automatic transcription is disabled by default (`public.app.audioCaptions.enabled` in `/etc/bigbluebutton/bbb-html5.yml`). When it is enabled, the users' audio leaves the server: the default `webspeech` provider uses the browser's speech recognition API, which in Chrome sends the audio to Google, and the `gladia` provider sends it to gladia.io, through `bbb-transcription-controller` or `bbb-livekit-stt` (see [Configuration of gladia.io](/administration/customize#configuration-of-gladiaio)). Inform your users before enabling it.

#### Webhooks and callbacks

The optional `bbb-webhooks` package posts meeting and user events, including user names, to the URLs that the front end registers, and a meeting created with `meta_analytics-callback-url` sends its events to that URL after it ends. Whoever receives these callbacks processes personal data as well.

## Greenlight

This section is about Greenlight v3. Greenlight is a front end; everything above still applies to the BigBlueButton server it uses.

### Rooms are recordable by default

The default rooms configuration enables "Allow room to be recorded" for new rooms, so their meetings are created with `record=true` and the whole session is captured, see [above](#bigbluebutton-either-records-all-of-a-session-or-does-not-record-at-all). Room owners can turn the setting off per room, and the setting is forced off for users whose role does not have the permission to record.

#### Resolution

Administrators can disable recording for every room under Administration > Rooms Configuration by setting "Allow Room to be recorded" to disabled, or disable recording on the BigBlueButton server as described above.

### Consent to recording and privacy policy

When a room allows recording, Greenlight shows the checkbox "I acknowledge that this session may be recorded. This may include my voice and video if enabled." on the join page, and the join form cannot be submitted until it is checked. There is no built-in consent to a privacy policy, but the "Terms & Conditions" and "Privacy Notice" links shown at the bottom of every page can be set under Administration > Site Settings.

BigBlueButton itself has no feature that asks participants for consent before joining, and no selective recording: audio, video, chat and drawing input of users who did not consent cannot be excluded from a recording.

### Room URLs

Room URLs contain a random identifier (for example `/rooms/abcd-efgh-ijkl/join`), not the owner's name.

### Recording visibility

Greenlight's recording visibility (and the "Default Recording Visibility" site setting) controls where a recording is listed in Greenlight. The BigBlueButton server still serves every published recording to anyone with the link; to restrict access, unpublish the recording or protect the recording URLs in nginx as described [above](#all-recordings-are-always-accessible).

### Logs

#### Rails logs

Greenlight runs in a Docker container and logs to its standard output, which the Docker logging driver stores (`docker logs greenlight-v3`). The log level is `LOG_LEVEL` in Greenlight's `.env` (default `info`), and `LOGGING_DRIVER` selects the Docker logging driver; its options, such as `max-size` and `max-file` for the default `json-file` driver, decide how much is kept.

#### nginx logs

The nginx in front of Greenlight keeps the same access logs as described for BigBlueButton [above](#nginx-and-haproxy), including IP addresses and user names in join URLs; turn them off the same way.

## coturn

With `bbb-install.sh -c` or the `bbb-coturn` package, coturn logs to `/var/log/turnserver/turnserver.log`, rotated daily with 7 rotations kept (`/etc/logrotate.d/coturn`). The log contains the IP addresses and ports of the users who relay media through the TURN server; together with the other logs it allows identifying the sessions these users joined.

coturn has no option to log less. To stop logging, change `--log-file` in the `coturn` systemd unit (`systemctl edit coturn`, where `bbb-install.sh` sets it) to `/dev/null`, or shorten the rotation in `/etc/logrotate.d/coturn`.

## Scalelite

Scalelite's nginx and API containers log to the Docker logging driver, like Greenlight. The nginx access log includes the users' IP addresses and the join URLs with their names, and the API log records which meeting each user was redirected to. Limit the retention with the logging driver's options (`max-size` and `max-file` for `json-file`), or send the logs to a collector with its own retention.

## General GDPR Considerations

The GDPR lists several important considerations, especially:

- The right to request a (machine readable) aggregate of all private data stored
- The right to have all personal data be erased
- Purpose limitation
- Data minimisation
- Storage limitation

These pose challenges in the context of BigBlueButton, especially when considering that rooms can be joined anonymously. This means that an operator may not be able to easily identify all stored private information connected to a user, even though it is considered personal data, for example webcam recordings of a room joined as a guest with a pseudonym.

For many use cases the easiest solution is to not store any private data of users at all. This includes reducing log levels or disabling logging, storing temporary data only in memory (tmpfs) instead of on disk, and disabling the session recording feature. Even after all this is done, the BigBlueButton server still processes all this data. Thus, usually a data processing agreement with the hosting company is needed, and information about the processing of personal data has to be provided to the users of the service.
