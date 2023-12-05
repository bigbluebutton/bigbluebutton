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

In many countries there exist regulation of data protection. For operators of BigBlueButton services, especially private data protection regulations are an important topic.
In the European Union the relevant regulation is the [General Data Protection Regulation (GDPR)](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation). Many other countries also adopted similar regulations (for example the [California Consumer Privacy Act (CCPA)](https://en.wikipedia.org/wiki/California_Consumer_Privacy_Act) in California USA or the [Lei Geral de Proteção de Dados (LGPD)](https://pt.wikipedia.org/wiki/Lei_Geral_de_Prote%C3%A7%C3%A3o_de_Dados_Pessoais) in Brazil) and some of these regulation even have to be complied with outside of these countries under certain conditions. The following documentation is supposed to help understand where private data gets processed and stored in a typical setup of BigBlueButton, and what configuration options there are.

Disclaimer: the following documentation is neither legal advice, nor complete. This is work-in-progress.

## BigBlueButton

This section documents privacy related settings, defaults, and configuration options in BigBlueButton itself. Keep in mind that your configration changes here may be silently overwritten upon upgrades via apt, see [issue 9111](https://github.com/bigbluebutton/bigbluebutton/issues/9111)
To prevent this, make sure to use the [`apply-config.sh` script](/administration/customize#automatically-apply-configuration-changes-on-restart) to ensure changes are retained upon upgrades and restarts.

### Recordings

#### BigBlueButton either records all of a session or does not record at all

When a room is created in BigBlueButton that allows recordings (i.e., the recording button is visible) BigBlueButton will record the entire session. This is independent of the recording-button actually being pressed or not. The technical reason behind this is that parts of the recordings (esp. the SVG files for the Whiteboard) depend on earlier state to be properly processed, see: [Recording](/development/recording)
By default these files are stored for two weeks (see 'Retention of Cache Files' below). Furthermore, depending on the use-case and jurisdiction it might be prudent to retain the
option to create 'retroactive' recordings, e.g., when users forgot to click the recording button.

If the frontend (which uses the BigBlueButton API to create/start a room) specifies `record=true`, the entire session will be recorded, unless recording is disabled for all rooms in BigBlueButton. If the frontend specifies `record=false` or does not specify this parameter, then the session will not be recorded and the "start"/"stop" recording button will not be available during the session.

##### Resolution

Operators have at least these two options for handling this:

###### Globally disable recordings in BigBlueButton

Server operators can overwrite default value for `disableRecordingDefault` initially set in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties` by overwriting it in `/etc/bigbluebutton/bbb-web.properties` - set `disableRecordingDefault=false` to `disableRecordingDefault=true` for globally disabling recordings. Furthermore, recording of breakout rooms should be disabled by setting `breakoutRoomsRecord=false`. In general, this is an advisable idea (independently of `disableRecordingDefault=true`, because break-out rooms might imply a certain level of privacy for typical users.

###### Post-recording script to remove recordings without any recording markers

Server operators can deploy a custom script which purges recordings and cache-files of recordings for which no recording markers were created.

Simple version:
`/etc/sudoers:`
`bigbluebutton ALL = NOPASSWD: /usr/bin/bbb-record`

and

`/usr/local/bigbluebutton/core/scripts/archive/archive.rb (after line 242):`
` BigBlueButton.logger.info("There are no recording marks for #{meeting_id}, deleting the recording.")`
` system('sudo', 'bbb-record', '--delete', "#{meeting_id}") || raise('Failed to delete local recording')`

For a more complete version that also explicitly deletes cache files of recordings for freeswitch/kurento, please see:
[bbb-recording-archive-workaround](https://github.com/Kalagon/bbb-recording-archive-workaround)

#### BigBlueButton stores presentations uploaded during sessions

BigBlueButton stores the presentations of sessions in `/var/bigbluebutton` even if the room is started with record=false.

##### Resolution

Unknown, unclear which post-recording actions are triggered if no recording is created.
TODO: add some best practices here

#### BigBlueButton stores full raw recording data

BigBlueButton stores the raw recording data for meetings that have recording markers indefinitely. This includes parts of the session where the presenter/moderator did not yet click the recording button.

##### Resolution

This can be resolved by deleting raw recording data after a meeting has been successfully archived. For deployments using scalelite, this can be achieved by the following changes:

`/etc/sudoers:`
`bigbluebutton ALL = NOPASSWD: /usr/bin/bbb-record`

`/usr/local/bigbluebutton/core/scripts/post_publish/scalelite_post_publish.rb`, after line 66:
`system('sudo', 'bbb-record', '--delete', "#{meeting_id}") || raise('Failed to delete local recording')`

For other deployments, removal of `/var/bigbluebutton/recording/raw/$meeting/` should be added to the post-archive script.

This data can also be removed periodically, see `Retention of cache files`

#### All recordings are always accessible

By default, BigBlueButton recordings are accessible, see e.g., [issue 8505](https://github.com/bigbluebutton/bigbluebutton/issues/8505)

Additionally, the URLs for recordings are easily enumerable, see [issue 1466](https://github.com/bigbluebutton/greenlight/issues/1466) and [issue 9443](https://github.com/bigbluebutton/bigbluebutton/issues/9443)

##### Resolution

Server administrators can change the nginx configuration to restrict access to the recording URLs. Depending on the use-case, the auth statement in nginx can interact with the used frontend to enforce further restrictions (e.g., requesting the same credentials as the frontend). For example configuration options and an authentication callback to a Greenlight frontend, see: [bbb-rec-perm](https://github.com/ichdasich/bbb-rec-perm)

#### Cache files

The stack of BigBlueButton creates various cache files when recordings are enabled.
Specifically in:

`/var/bigbluebutton/recording/raw/`
`/var/bigbluebutton/unpublished/`
`/var/bigbluebutton/published/presentation/`
`/usr/share/red5/webapps/video/streams/`
`/usr/share/red5/webapps/screenshare/streams/`
`/usr/share/red5/webapps/video-broadcast/streams/`
`/var/kurento/recordings/`
`/var/kurento/screenshare/`
`/var/freeswitch/meetings/`

##### Resolution

For automatically cleaning up these files after recordings, see `BigBlueButton always records when recording of a room is enabled`. In addition, to prevent this data to be written to disk, these files can be mounted with tmpfs to keep recording caches in-memory.
For this, the following lines have to be added to `/etc/fstab`:

`tmpfs /var/bigbluebutton/recording/raw/ tmpfs rw,nosuid,noatime,uid=998,gid=998,size=16G,mode=0755 0 0`
`tmpfs /var/bigbluebutton/unpublished/ tmpfs rw,nosuid,noatime,uid=998,gid=998,size=16G,mode=0755 0 0`
`tmpfs /var/bigbluebutton/published/presentation/ tmpfs rw,nosuid,noatime,uid=998,gid=998,size=16G,mode=0755 0 0`
`tmpfs /usr/share/red5/webapps/video/streams/ tmpfs rw,nosuid,noatime,uid=999,gid=999,size=16G,mode=0755 0 0`
`tmpfs /usr/share/red5/webapps/screenshare/streams/ tmpfs rw,nosuid,noatime,uid=999,gid=999,size=16G,mode=0755 0 0`
`tmpfs /usr/share/red5/webapps/video-broadcast/streams/ tmpfs rw,nosuid,noatime,uid=999,gid=999,size=16G,mode=0755 0 0`
`tmpfs /var/kurento/recordings/ tmpfs rw,nosuid,noatime,uid=996,gid=996,size=16G,mode=0755 0 0`
`tmpfs /var/kurento/screenshare/ tmpfs rw,nosuid,noatime,uid=996,gid=996,size=16G,mode=0755 0 0`
`tmpfs /var/freeswitch/meetings/ tmpfs rw,nosuid,noatime,uid=997,gid=997,size=16G,mode=0755 0 0`

After applying that, the server administrator has to execute `bbb-conf --stop; mount -a; bbb-conf --start`.

Furthermore, the uid/gid values have to be adjusted to the local installation.
The above example assumes:

`red5:x:999:999:red5 user-daemon:/usr/share/red5:/bin/false`
`bigbluebutton:x:998:998:bigbluebutton:/home/bigbluebutton:/bin/false`
`freeswitch:x:997:997:freeswitch:/opt/freeswitch:/bin/bash`
`kurento:x:996:996::/var/lib/kurento:`

TODO: explain what these uid/gid values are and how to get the correct ones

#### Retention of cache files

BigBlueButton retains various cache and log files. The general retention period for these files can be configured in `/etc/cron.daily/bigbluebutton`.

- `history` is the retention period for presentations, red5 caches, kurento caches, and freeswitch caches in days
- `unrecorded_days` the retention periods of recordings for meetings which have no recording markers set (user expectation: Were not recorded)
- `published_days` the retention period of recordings' raw data, if these got published. To disable this, the line `remove_raw_of_published_recordings` has to be commented

For directly deleting these caches, please see
'Post-recording script to remove recordings without any recording markers'

### Logs

#### General log rotation

If server operators opt to keep recording files and logs, they should know and change:

- the duration for which to keep the recording files in `/etc/cron.daily/bigluebutton`, using the `log_history` setting
- the logrotate settings in `/etc/logrotate.d/(bbb-record-core.logrotate|bbb-webrtc-sfu.logrotate)` which rotate logs in `/var/log/bbb-webrtc-sfu/` every 7 days, and `/var/log/bigbluebutton/(bbb-rap-worker.log|sanity.log)` every 8 days
- the logrotate settings in `/usr/share/bbb-web/WEB-INF/classes/logback.xml` which rotate logs at `/var/log/bigbluebutton/bbb-web.log` daily and keep them for 14 days

#### BigBlueButton logging

BigBlueButton logs all interactions with rooms, i.e., when they were created, who joined when, and when they left in `/var/log/bigbluebutton/bbb-web.log`

The log verbosity of the core application can be reduced by setting
`appLogLevel=Error` in
`/etc/bigbluebutton/bbb-web.properties`
and by adjusting the individual settings in `/usr/share/bbb-web/WEB-INF/classes/logback.xml`.

To avoid logging ip-addresses in bbb-webrtc-sfu, set
`level: error` in
`/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml`.

Also these files contain log levels regarding chat usage and chat messages:

- /etc/bbb-apps-akka/application.conf and /etc/bbb-apps-akka/logback.xml

#### nginx

By default BigBlueButton has "full access logs" enabled for nginx. This includes users IP addresses, usernames, joined meetings, etc.
This can be disable by switching the loglevel to 'ERROR' only in `/etc/nginx/sites-available/bigbluebutton` and `/etc/nginx/nginx.conf`:

`error_log /var/log/nginx/bigbluebutton.error.log;`
`access_log /dev/null;`

#### freeswitch

The default installation of FreeSWITCH by default logs with loglevel DEBUG. This can be changed in `/etc/bbb-fsesl-akka/application.conf` and `/etc/bbb-fsesl-akka/logback.xml`. The default configuration stores usernames, joined sessions and timestamps.

#### kurento

Logs session names and timestamps, as well as user IP addresses. This also includes user IP addresses behind NATs, i.e., the actual client addresses, potentially making users identifiable accross sessions. This can be configured in `/etc/default/kurento-media-server`, see [Kurento logging](https://doc-kurento.readthedocs.io/en/latest/features/logging.html)

Note that this can most likely be overridden by kurento's systemd unit file. Hence, `--gst-debug-level=1` should also be set in `/usr/lib/systemd/system/kurento-media-server.service`.

### Integrations

#### TURN server

BigBlueButton uses a TURN server for NAT traversal. By default, a STUN server from freeswitch.org is configured for BigBlueButton. You can [set up your own TURN/STUN server](/administration/turn-server), and configure it in `/usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml`.

#### sip.js

There is a hardcoded google STUN server in `/usr/share/meteor/bundle/programs/web.browser/app/compatibility/sip.js`.
However, this should not be a problem because the hardcoded STUN server will not be used: a failed `GET` of the TURN/STUN settings in BBB-web should return an empty array, overwriting this setting. Nonetheless, careful server administrators may want to replace this default.

#### Hardcoded Google STUN server for kurento

On the server, Kurento uses a Google STUN server to identify its own external IP address on each ICE connect. This can be changed in `/etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini` by statically setting the IP address of the external interface and disabling the stun server if the kurento system itself does not sit behind NAT.

#### Kurento client side defaults

For client side kurento activities (listen only, screenshare, video) there is a public fallback STUN server pool which is used if the bbb-web GET request fails. There is work in progress on removing this default.

## Greenlight

### Greenlight always starts new rooms with recording=true

By default, when Greenlight creates a conference, the value 'record=true' is passed to BigBlueButton. These conferences will be recorded even if the record button is not pressed. See also: [Recording](/administration/privacy#bigbluebutton-either-records-all-of-a-session-or-does-not-record-at-all)

#### Resolution

You can disable the recording globally in the Greenlight room settings for everyone or optinally for everyone in their room. see: [pull request 1296](https://github.com/bigbluebutton/greenlight/pull/1296) Alternatively, if necessary, completely disable the recording feature in the BigBlueButton server configuration.

### Greenlight does not request consent to a privacy policy and/or recording of a session when joining a room as a guest.

BigBlueButton has no feature that forces participants to consent to a privacy policy or being recorded prior to joining a room. Greenlight has an optional feature that you have to switch on in the basic settings: "Requires the consent of the room initiator and the participants for recording". This gives all participants a warning text before entering the conference that this room will be recorded.

#### Resolution

In [issue 1163](https://github.com/bigbluebutton/greenlight/issues/1163) it is discussed how the required changed can be addressed.
[line 21](https://github.com/bigbluebutton/greenlight/blob/52ed7150f68c6c66c0488374ccc3457d30fd09d4/app/views/rooms/components/_room_event.html.erb#L21)
adds a disclaimer. The code could be extended to provide a link to the privacy policy, and a checkbox which users have to press to acknowledge that the meeting they are about to join will be recorded, and that they consent to this; The join button should only be enabled when that checkmark is set.

A more substantial change to BigBlueButton and Greenlight would be selective recording, i.e., excluding video, audio, chat and drawing input from users that did not consent to a recording.

### Greenlight includes user-names in room URLs

In Greenlight, room URLs contain the username of the owner, which might also be private data depending on local laws. Solving this depends on [issue 1057](https://github.com/bigbluebutton/greenlight/issues/1057)

### Terms of Service

Greenlight supports displaying of terms and conditions for registered users or upon registration. See [adding-terms-and-conditions](/greenlight/config#adding-terms-and-conditions)

### All recordings are always accessible

By default, BigBlueButton recordings are accessible, see e.g.,
[issue 8505](https://github.com/bigbluebutton/bigbluebutton/issues/8505) . Additionally, the URLs for recordings are easily enumerable, see [issue 1466](https://github.com/bigbluebutton/greenlight/issues/1466) and [issue 9443](https://github.com/bigbluebutton/bigbluebutton/issues/9443) .

Greenlight, by default provides two settings for recordings: public, i.e., the recording is listed on the room page, and unlisted, i.e., the recording is only accessible via the (enumerable) direct link.

##### Resolution

Greenlight can be patched to allow more fine-grained control of recording visibility and publications. With [rec_restrictions](https://github.com/ichdasich/greenlight/tree/rec_restrictions) a third value is added to the recording visibility pull-down menu (public/unlisted/private), which leads to corresponding recording metadata being set (gl-listed=true/unlisted/false) in the recording either in scalelite or on the BigBlueButton host.

[bbb-rec-perm](https://github.com/ichdasich/bbb-rec-perm) can then be used to check requests for recordings against that metadata, returning a 403 if the recording is set to private, and returning the recording if it is set to unlisted or public.

### Logs

#### Rails Logs

By default, Greenlight logs to `$GREENLIGHTDIR/logs/production.log`. Removing that line from .env does keep the logs, but does not expose them to the docker host. The easiest solution is linking `$GREENLIGHTDIR/logs/production.log` to `/dev/null`

#### nginx Logs

By default Greenlight has full access logs enabled for nginx. This includes users IP addresses, usernames, joined meetings, etc. This can be disable by switching the loglevel to 'ERROR' only in `/etc/nginx/sites-available/bigbluebutton` and `/etc/nginx/nginx.conf`:

`error_log /var/log/nginx/bigbluebutton.error.log;`
`access_log /dev/null;`

## coturn

By default, coturn logs to `/var/log/coturn.log`, with regular log-rotation. This logfile includes IP addresses of users using the TURN server, and the ports they use. Together with other BigBlueButton logs this enables identification of the sessions these users joined.

coturn has no option of restricting logging. The best option here is linking
`/var/log/coturn.log` to `/dev/null`

## scalelite

### Logs

#### Nginx logs

Scalelite uses a container running nginx as frontend, which accumulates standard access logs. By default scalelite has full access logs enabled for nginx. This includes users IP addresses, usernames, joined meetings, watched meetings etc. The easiest way to address this is migrating the nginx to the host, thus getting rid of Docker.

Then the logging can be disable by switching the loglevel to 'ERROR' in `/etc/nginx/sites-available/bigbluebutton` and `/etc/nginx/nginx.conf`:

`error_log /var/log/nginx/bigbluebutton.error.log;`
`access_log /dev/null;`

#### Scalelite-API-Container logs

The container of the scalelite-API-Image (blindsidenetwks/scalelite:v1-api) is also logging user activities. For example:
Who joined which meeting:

`{"log":"I, [<timestamp>] INFO -- : [<some_identifier>] Redirected to https://<URL>/bigbluebutton/api/join?meetingID=<meeting_ID>\u0026fullName=<name>\u0026password=<hashed_pw>... }`

With the Scalelite version 1.0.9 a rotating of the logs was implemented. These are automatically deleted after one day.

## General GDPR Considerations

The GDPR lists several important considerations, especially:

- The right to request a (machine readable) aggregate of all private data stored
- The right to have all personal data be erased
- Purpose limitation
- Data minimisation
- Storage limitation

These pose challenges in the context of BigBlueButton, especially when considering that rooms can be joined anonymously. This means that an operator may not be able to easily identify all stored private information connected to a user, even though it is consider personal/private data, e.g., webcam recordings of a room joined to as a guest with a
pseudonym.

For many use cases the easiest solution is to not store any private data of users at all. This includes reducing log levels or disabling logging (log to `/dev/null`), storing temporary data only im memory (tmpfs) instead of on disk, and disabling the session recording feature. Even after all this is done, the BigBlueButton server still processes all this data. Thus, usually a data processing agreement from the server hosting company is needed and also information about private data processing has to be provided to the users of the service.
