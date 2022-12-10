---
id: customize
slug: /administration/customize
title: BigBlueButton Server Customization
sidebar_position: 5
description: BigBlueButton Configuration Customization
keywords:
- customization
---

BigBlueButton has many configuration files that offer you opportunities to customize your installation. This document covers common customizations of BigBlueButton 2.2.

# apply-conf.sh

Whenever you upgrade a server to the latest version of BigBlueButton, either using the [manual upgrade steps](/2.2/install.html#upgrading-from-bigbluebutton-22) or the [bbb-install.sh](https://github.com/bigbluebutton/bbb-install) script, if you have made custom changes to BigBlueButton's configuration files, the packaging scripts may overwrite these changes.

To make it easier to apply your configuration changes, you can create a BASH script at `/etc/bigbluebutton/bbb-conf/apply-config.sh` that contains commands to apply your changes. The `bbb-conf` script, which is run as part of the last steps in a manual upgrade steps or using `bbb-install.sh`, will detect `apply-config.sh` and invoke it just before starting all of BigBlueButton's components.

In this way, you can use `apply-conf.sh` to apply your custom configuration changes after all packages have updated but just before BigBlueButton starts.

For example, if you create `/etc/bigbluebutton/bbb-conf/apply-config.sh` with the following contents and make it executable with `chmod +x /etc/bigbluebutton/bbb-conf/apply-config.sh`

```sh
#!/bin/bash

# Pull in the helper functions for configuring BigBlueButton
source /etc/bigbluebutton/bbb-conf/apply-lib.sh

enableUFWRules

echo " - Disable screen sharing"
yq w -i $HTML5_CONFIG public.kurento.enableScreensharing false
chown meteor:meteor $HTML5_CONFIG
```

then when called by `bbb-conf`, the above `apply-conf.sh` script will

- use the helper function `enableUFWRules` to [restrict access to specific ports](#restrict-access-to-specific-ports), and
- set `enableScreensharing` to `false` in the HTML5 configuration file at `/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml`.

Notice that `apply-conf.sh` includes a helper script [apply-lib.sh](https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-config/bin/apply-lib.sh). This helper script contains some functions to make it easy to apply common configuratino changes, along with some helper variables, such as `HTML5_CONFIG`.

The contents of `apply-config.sh` are not owned by any package, so it will never be overwritten.

# Common Customizations

## Recording

### Delete raw data from published recordings

When a meeting finishes, the BigBlueButton server [archives the meeting data](/dev/recording.html#archive) (referred to as the "raw" data).

Retaining the raw data lets you [rebuild](/dev/recording.html#rebuild-a-recording) a recording if it was accidentally deleted by a user; however, the tradeoff is the storage of raw data will consume more disk space over time.

By default, BigBlueButton server automatically remove the raw data for a recording after 14 days of its being published. To disable this, edit the BigBlueButton cron job, located at `/etc/cron.daily/bigbluebutton`, and comment the following line

```bash
remove_raw_of_published_recordings
```

The default duration (days)

```bash
published_days=14
```

is defined near the top of the BigBlueButton cron job.

### Delete recordings older than N days

To delete recordings older than 14 days, create the file `/etc/cron.daily/bbb-recording-cleanup` with the contents

```bash
#!/bin/bash

MAXAGE=14

LOGFILE=/var/log/bigbluebutton/bbb-recording-cleanup.log

shopt -s nullglob

NOW=$(date +%s)

echo "$(date --rfc-3339=seconds) Deleting recordings older than ${MAXAGE} days" >>"${LOGFILE}"

for donefile in /var/bigbluebutton/recording/status/published/*-presentation.done ; do
        MTIME=$(stat -c %Y "${donefile}")
        # Check the age of the recording
        if [ $(( ( $NOW - $MTIME ) / 86400 )) -gt $MAXAGE ]; then
                MEETING_ID=$(basename "${donefile}")
                MEETING_ID=${MEETING_ID%-presentation.done}
                echo "${MEETING_ID}" >> "${LOGFILE}"

                bbb-record --delete "${MEETING_ID}" >>"${LOGFILE}"
        fi
done

for eventsfile in /var/bigbluebutton/recording/raw/*/events.xml ; do
        MTIME=$(stat -c %Y "${eventsfile}")
        # Check the age of the recording
        if [ $(( ( $NOW - $MTIME ) / 86400 )) -gt $MAXAGE ]; then
                MEETING_ID="${eventsfile%/events.xml}"
                MEETING_ID="${MEETING_ID##*/}"
                echo "${MEETING_ID}" >> "${LOGFILE}"

                bbb-record --delete "${MEETING_ID}" >>"${LOGFILE}"
        fi
done
```

Change the value for `MAXAGE` to specify how many days to retain the `presentation` format recordings on your BigBlueButton server. After you create the file, make it executable.

```bash
$ chmod +x /etc/cron.daily/bbb-recording-cleanup
```

### Move recordings to a different partition

Most of BigBlueButton's storage occurs in the `/var/bigbluebutton` directory (this is where all the recordings are stored). If you want to move this directory to another partition, say to `/mnt/data`, do the following

```bash
$ sudo bbb-conf --stop
$ mv /var/bigbluebutton /mnt/data
$ ln -s /mnt/data/bigbluebutton /var/bigbluebutton
$ sudo bbb-conf --start
```

### Migrate recordings from a previous version

Depending of the previous version there may be some differences in the metadata generated. In order to fix that it will be necessary to execute the corresponding scripts for updating the migrated recordings.

```bash
$ cd /usr/local/bigbluebutton/core/scripts
```

#### From version 0.9

```bash
$ sudo ./bbb-0.9-beta-recording-update
$ sudo ./bbb-0.9-recording-size
```

#### From version 1.0

```bash
$ sudo ./bbb-1.1-meeting-tag
```

If for some reason the scripts have to be run more than once, use the --force modifier.

```bash
$ sudo ./bbb-x.x-script --force
```

### Enable playback of recordings on iOS

The `presentation` playback format encodes the video shared during the session (webcam and screen share) as `.webm` (VP8) files; however, iOS devices only support playback of `.mp4` (h.264) video files. To enable playback of the `presentation` recording format on iOS devices, edit `/usr/local/bigbluebutton/core/scripts/presentation.yml` and uncomment the entry for `mp4`.

```yaml
video_formats:
  - webm
  - mp4
```

This change will cause BigBlueButton to generate an additional `.mp4` file for the video components (webcam and screen share) that was shared during the session. This change only applies to new recordings. If you want this change to apply to any existing recordings, you need use the `bbb-record` command to [rebuild them](/dev/recording.html#rebuild-a-recording).

This change will increase the processing time and storage size of recordings with video files as it will now generate two videos: `.webm` and `.mp4` for the webcam and screen share videos.

### Always record every meeting

By default, the BigBlueButton server will produce a recording when (1) the meeting has been created with `record=true` in the create API call and (2) a moderator has clicked the Start/Stop Record button (at least once) during the meeting.

However, you can configure a BigBlueButton server to record every meeting, edit `/etc/bigbluebutton/bbb-web.properties` and set

```properties
# Start recording when first user joins the meeting.
# For backward compatibility with 0.81 where whole meeting
# is recorded.
autoStartRecording=false

# Allow the user to start/stop recording.
allowStartStopRecording=true
```

to

```properties
# Start recording when first user joins the meeting.
# For backward compatibility with 0.81 where whole meeting
# is recorded.
autoStartRecording=true

# Allow the user to start/stop recording.
allowStartStopRecording=false
```

To apply the changes, restart the BigBlueButton server using the command

```bash
$ sudo bbb-conf --restart
```

### Transfer recordings

When setting up BigBlueButton on a server, you may want to transfer recordings from an older server. If your old server has all of the original recording files in the `/var/bigbluebutton/recording/raw` directory, then you can transfer these files to the new server using `rsync`.

For example, running this `rsync` command new server will copy over the recording file from the old server.

```bash
$ rsync -rP root@old-bbb-server.example.com:/var/bigbluebutton/recording/raw/ /var/bigbluebutton/recording/raw/
```

Alternatively, you could create a tar archive of the `/var/bigbluebutton/recording/raw` directory, and copy it with scp, or use a shared NFS mount.

After you copy over the files (either through rsync or tar-and-copy), you will then need to fix the permissions on the new server using the following `chown` command.

```bash
$ chown -R bigbluebutton:bigbluebutton /var/bigbluebutton/recording/raw
```

After transfer of recordings, view a sampling of the recordings to ensure they playback correctly (they should).

### Re-process raw recordings

If you have transferred over the raw content, you can also reprocess the recordings using the newer scripts to rebuild them with the latest playback format (including any bug fixes made in the latest version). Note: Re-processing can take a long time (around 25% to 50% of the original length of the recordings), and will use a lot of CPU on your new BigBlueButton server while you wait for the recordings to process.

If you are interested in reprocessing the older recordings, try it first with one or two of the larger recordings. If there is no perceptible difference, you don't need to reprocess the others.

And initiate the re-processing of a single recording, you can do

```bash
$ sudo bbb-record --rebuild <recording_id>
```

where `<recording_id>` is the the file name of the raw recording in `/var/bigbluebutton/recording/raw`, such as

```bash
$ sudo bbb-record --rebuild f4ae6fd61e2e95940e2e5a8a246569674c63cb4a-1517234271176
```

If your old server has all of the original recording files in the `/var/bigbluebutton/recording/raw` directory, then you can transfer these files to the new server, for example with rsync:

If you want to rebuild all your recordings, enter the command

Warning: If you have a large number of recordings, this will rebuild _all_ of them, and not process any new recordings until the rebuild process finishes. Do not do this unless this is you intent. Do not do this command to troubleshoot recording errors, instead see [Recording Troubleshooting](/dev/recording.html#troubleshooting).

```bash
$ sudo bbb-record --rebuildall
```

The BigBlueButton server will automatically go through the recordings and rebuild and publish them. You can use the `bbb-record --watch` command to see the progress.

### Transfer published recordings from another server

If you want to do the minimum amount of work to quickly make your existing recordings on an older BigBlueButton server, transfer the contents of the `/var/bigbluebutton/published` and `/var/bigbluebutton/unpublished` directories. In addition, to preserve the backup of the original raw media, you should transfer the contents of the `/var/bigbluebutton/recording/raw` directory.

Here is an example set of rsync commands that would accomplish this; run these on the new server to copy the files from the old server.

```bash
$ rsync -rP root@old-bbb-server:/var/bigbluebutton/published/ /var/bigbluebutton/published/
$ rsync -rP root@old-bbb-server:/var/bigbluebutton/unpublished/ /var/bigbluebutton/unpublished/
$ rsync -rP root@old-bbb-server:/var/bigbluebutton/recording/raw/ /var/bigbluebutton/recording/raw/
```

Other methods of transferring these files can also be used; for example, you could create a tar archive of each of the directories, and transfer it via scp, or use a shared NFS mount.

You will then need to fix the permissions on the newly copied recordings:

```bash
$ chown -R bigbluebutton:bigbluebutton /var/bigbluebutton/published /var/bigbluebutton/unpublished /var/bigbluebutton/recording/raw
```

If the recordings were copied from a server with a different hostname, you will have to run the following command to fix the stored hostnames. (If you don't do this, it'll either return a 404 error, or attempt to load the recordings from the old server instead of the new server!)

Note that this command will restart the BigBlueButton server, interrupting any live sessions.

```bash
$ sudo bbb-conf --setip <ip_address_or_hostname>
```

For example,

```bash
$ sudo bbb-conf --setip bigbluebutton.example.com
```

The transferred recordings should be immediately visible via the BigBlueButton recordings API.

### Change processing time

On a 2.2.x BigBlueButton server, the server will process recordings as meetings finish. You can restrict the recording processing interval to specific hours by creating the file `/etc/systemd/system/bbb-record-core.timer.d/override.conf` with the contents

```
[Timer]
OnActiveSec=
OnUnitInactiveSec=
OnCalendar=21,22,23,00,01,02,03:*:00
Persistent=false
```

and do `systemctl daemon-reload`. This file overrides the timing of when systemd runs `bbb-record-core.target`. In the above example, recordings will start processing between 21:00 and 03:59.

## Video

### Reduce bandwidth from webcams

You can use a banwidth usage on your BigBlueButton server using a tool such as `bmon` (`sudo apt-get install bmon`). You can change the maximum bandwidth settings for each webcam options (low, medium, high, high definition) by editing `/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml` and modifying the entries for

```yaml
cameraProfiles:
  - id: low
    name: Low quality
    default: false
    bitrate: 100
  - id: medium
    name: Medium quality
    default: true
    bitrate: 200
  - id: high
    name: High quality
    default: false
    bitrate: 500
  - id: hd
    name: High definition
    default: false
    bitrate: 800
```

The settings for `bitrate` are in kbits/sec (i.e. 100 kbits/sec). After your modify the values, save the file, restart your BigBlueButton server `sudo bbb-conf --restart` to have the settings take effect. The lowest setting allowed for WebRTC is 30 Kbits/sec.

If you have sessions that like to share lots of webcams, such as ten or more, then then setting the `bitrate` for `low` to 50 and `medium` to 100 will help reduce the overall bandwidth on the server. When many webcams are shared, the size of the webcams get so small that the reduction in `bitrate` will not be noticable during the live sessions.

### Disable webcams

You can disable webcams by setting `enableVideo` to `false` in the `settings.yml` file for the HTML5 client.

To do this automatically between package upgrades and restarts of BigBlueButton, add the following lines to [apply-conf.sh](https://docs.bigbluebutton.org/admin/customize.html#apply-confsh).

```bash
echo " - Disable webcams"
yq w -i $HTML5_CONFIG public.kurento.enableVideo false
chown meteor:meteor $HTML5_CONFIG
```

and run `bbb-conf --restart`

### Disable screen sharing

You can disable screen sharing by setting `enableScreensharing` to `false` in the `settings.yml` file for the HTML5 client.

To do this automatically between package upgrades and restarts of BigBlueButton, add the following lines to [apply-conf.sh](https://docs.bigbluebutton.org/admin/customize.html#apply-confsh).

```bash
echo " - Disable screen sharing"
yq w -i $HTML5_CONFIG public.kurento.enableScreensharing false
chown meteor:meteor $HTML5_CONFIG
```

### Reduce bandwidth for webcams

If you expect users to share many webcams, you can [reduce bandwidth for webcams](#reduce-bandwidth-from-webcams).

To do this automatically between package upgrades and restarts of BigBlueButton, add the following lines to [apply-conf.sh](https://docs.bigbluebutton.org/admin/customize.html#apply-confsh).

```bash
echo "  - Setting camera defaults"
yq w -i $HTML5_CONFIG 'public.kurento.cameraProfiles.(id==low).bitrate' 50
yq w -i $HTML5_CONFIG 'public.kurento.cameraProfiles.(id==medium).bitrate' 100
yq w -i $HTML5_CONFIG 'public.kurento.cameraProfiles.(id==high).bitrate' 200
yq w -i $HTML5_CONFIG 'public.kurento.cameraProfiles.(id==hd).bitrate' 300

yq w -i $HTML5_CONFIG 'public.kurento.cameraProfiles.(id==low).default' true
yq w -i $HTML5_CONFIG 'public.kurento.cameraProfiles.(id==medium).default' false
yq w -i $HTML5_CONFIG 'public.kurento.cameraProfiles.(id==high).default' false
yq w -i $HTML5_CONFIG 'public.kurento.cameraProfiles.(id==hd).default' false
chown meteor:meteor $HTML5_CONFIG
```

### Run three parallel Kurento media servers

[ Available since BigBluebutton 2.2.24+ ]

Kurento media server handles three different types of media streams: listen only, webcams, and screen share.

Running three parallel Kurento media servers (KMS) -- one dedicated to each type of media stream -- should increase the stability of media handling as the load for starting/stopping media streams spreads over three separate KMS processes. Also, it should increase the reliability of media handling as a crash (and automatic restart) by one KMS will not affect the two.

To configure your BigBlueButton server to run three KMS processes, add the following line to [apply-conf.sh](https://docs.bigbluebutton.org/admin/customize.html#apply-confsh)

```sh
enableMultipleKurentos
```

and run `sudo bbb-conf --restart`, you should see

```
  - Configuring three Kurento Media Servers: one for listen only, webcam, and screeshare
Generating a 2048 bit RSA private key
....................+++
......+++
writing new private key to '/tmp/dtls-srtp-key.pem'
-----
Created symlink from /etc/systemd/system/kurento-media-server.service.wants/kurento-media-server-8888.service to /usr/lib/systemd/system/kurento-media-server-8888.service.
Created symlink from /etc/systemd/system/kurento-media-server.service.wants/kurento-media-server-8889.service to /usr/lib/systemd/system/kurento-media-server-8889.service.
Created symlink from /etc/systemd/system/kurento-media-server.service.wants/kurento-media-server-8890.service to /usr/lib/systemd/system/kurento-media-server-8890.service.
```

After BigBlueButton finishes restarting, you should see three KMS processes running using the `netstat -antp | grep kur` command.

```
# netstat -antp | grep kur
tcp6       0      0 :::8888                 :::*                    LISTEN      5929/kurento-media-
tcp6       0      0 :::8889                 :::*                    LISTEN      5943/kurento-media-
tcp6       0      0 :::8890                 :::*                    LISTEN      5956/kurento-media-
tcp6       0      0 127.0.0.1:8888          127.0.0.1:49132         ESTABLISHED 5929/kurento-media-
tcp6       0      0 127.0.0.1:8890          127.0.0.1:55540         ESTABLISHED 5956/kurento-media-
tcp6       0      0 127.0.0.1:8889          127.0.0.1:41000         ESTABLISHED 5943/kurento-media-
```

Each process has its own log file (distinguished by its process ID).

```
# ls -alt /var/log/kurento-media-server/
total 92
-rw-rw-r--  1 kurento kurento 11965 Sep 13 17:10 2020-09-13T170908.00000.pid5929.log
-rw-rw-r--  1 kurento kurento 10823 Sep 13 17:10 2020-09-13T170908.00000.pid5943.log
-rw-rw-r--  1 kurento kurento 10823 Sep 13 17:10 2020-09-13T170908.00000.pid5956.log
```

Now, if you now join a session and choose listen only (which causes Kurento setup a single listen only stream to FreeSWITCH), share your webcam, or share your screen, you'll see updates occuring independently to each of the above log files as each KMS process handles your request.

To revert back to running a single KMS server (which handles all three meida streams), change the above line in `/etc/bigbluebutton/bbb-conf/apply-config.sh` to

```sh
disableMultipleKurentos
```

and run `sudo bbb-conf --restart` again.

### Limit overall media streams

On a typical BigBlueButton server Kurento can handle about 1000 media streams. A media stream is created when a user broadcasts or receives a webcam or screen share video, or when a user joins audio listening only. If your server will be using webcams, you can set limits per user, per room, and an overall limit per server in `/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml`. The default is no limit.

```
mediaThresholds:
  global: 0
  perRoom: 0
  perUser: 0
```

For example, the following settings would limit the overall number of media across all meetings to 1000 streams, the maximum number of webcam streams per meeting to 300, and no limit on the number of webcam streams per user.

```
mediaThresholds:
  global: 1000
  perRoom: 300
  perUser: 0
```

On a BigBlueButton 2.3 (or later) server, you can place the above in `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`, which `bbb-webrtc-sfu` will use to override the settings in `default.yml` (even after package upgrades).

If any of these thresholds are reached, then a user will receive a "Media resources not available (2002)" error when sharing webcams.

Thus, we recommend you [enable multiple Kurento](customize.html#run-three-parallel-kurento-media-servers) servers, thereby having one Kurento server for webcams, one for screen share, and one for listen only streams. The settings apply to each Kurento server, so in the above example each Kurento server would have a maximum of 1000 media streams.

BigBlueButton will dynamically reduce the number of webcams in a meeting as the meeting grows larger. These are set in `/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml`, but you can override them by placing them in `/etc/bigbluebutton/bbb-html5.yml`.

For example, the follwing `/etc/bigbluebutton/bbb-html5.yml` file would ensure that no single meeting will have more than 300 streams. For example, in a meeting with 30 users, the moderator will see 25 webcams and the viewers 6 webcams. This gives 25 + 29 _ 6 = 196 webcam streams. If the meeting grows to 100 users, the moderator will see 8 webcams and viewers will see 2 webcams. This gives 8 + 99 _ 2 = 206 webcam streams.

```
public:
    app:
        defaultSettings:
            application:
                paginationEnabled: true
    kurento:
        pagination:
            desktopPageSizes:
                moderator: 0
                viewer: 5
            mobilePageSizes:
                moderator: 2
                viewer: 2
            paginationToggleEnabled: false
        paginationThresholds:
            enabled: true
            thresholds:
            -   desktopPageSizes:
                    moderator: 25
                    viewer: 6
                users: 30
            -   desktopPageSizes:
                    moderator: 20
                    viewer: 5
                users: 40
            -   desktopPageSizes:
                    moderator: 16
                    viewer: 4
                users: 50
            -   desktopPageSizes:
                    moderator: 12
                    viewer: 4
                users: 60
            -   desktopPageSizes:
                    moderator: 8
                    viewer: 3
                users: 70
            -   desktopPageSizes:
                    moderator: 8
                    viewer: 2
                users: 80
            -   desktopPageSizes:
                    moderator: 8
                    viewer: 2
                users: 90
            -   desktopPageSizes:
                    moderator: 8
                    viewer: 2
                users: 100
HERE
```

### Use custom images for virtual background

Starting from version 2.4 BigBlueButton offers virtual background for webcams.
To use your own background images copy them into the directory
`/usr/share/meteor/bundle/programs/web.browser/app/resources/img/virtual-backgrounds`.
For each image copy a thumbnail of the image of 50x50 pixels size into
`/usr/share/meteor/bundle/programs/web.browser/app/resources/img/virtual-backgrounds/thumbnails`.

To generate thumbnails you can use the following shell snippet:

```bash
#!/bin/bash
FULL="/usr/share/meteor/bundle/programs/web.browser/app/resources/img/virtual-backgrounds"
THUMB="${FULL}/thumbnails"

cd "$FULL"
for pic in *.jpg; do
    convert "$pic" -resize 50x50^ -gravity Center -extent 50x50 "${THUMB}/${pic}"
done
```

Reference them in the configuration file `/etc/bigbluebutton/bbb-html5.yml`:

```
public:
  virtualBackgrounds:
    fileNames:
      - image1.jpg
      - image2.jpg
      - image3.jpg
```

Background images should not be too large as clients have to download them. You
can optimize them using the `jpegoptim` command which is available as an Ubuntu
package.

## Audio

### Mute all users on startup

If you want to have all users join muted, you can add an overwrite in `/etc/bigbluebutton/bbb-web.properties` and set this as a server-wide configuration.

```properties
# Mute the meeting on start
muteOnStart=false
```

After making them modification, restart your server with `sudo bbb-conf --restart` to apply the changes.

### Turn off "you are now muted"

You can remove this sound for all users by editing `/opt/freeswitch/etc/freeswitch/autoload_configs/conference.conf.xml` and moving the lines containing `muted-sound` and `unmuted-sound` into the commented section.

```xml
    <profile name="cdquality">
      <param name="domain" value="$${domain}"/>
      <param name="rate" value="48000"/>
      <param name="interval" value="20"/>
      <param name="energy-level" value="100"/>
      <!-- <param name="sound-prefix" value="$${sounds_dir}/en/us/callie"/> -->
      <param name="muted-sound" value="conference/conf-muted.wav"/>
      <param name="unmuted-sound" value="conference/conf-unmuted.wav"/>
      <param name="alone-sound" value="conference/conf-alone.wav"/>
<!--
      <param name="moh-sound" value="$${hold_music}"/>
      <param name="enter-sound" value="tone_stream://%(200,0,500,600,700)"/>
      <param name="exit-sound" value="tone_stream://%(500,0,300,200,100,50,25)"/>
-->
      <param name="kicked-sound" value="conference/conf-kicked.wav"/>
      <param name="locked-sound" value="conference/conf-locked.wav"/>
      <param name="is-locked-sound" value="conference/conf-is-locked.wav"/>
      <param name="is-unlocked-sound" value="conference/conf-is-unlocked.wav"/>
      <param name="pin-sound" value="conference/conf-pin.wav"/>
      <param name="bad-pin-sound" value="conference/conf-bad-pin.wav"/>
      <param name="caller-id-name" value="$${outbound_caller_name}"/>
      <param name="caller-id-number" value="$${outbound_caller_id}"/>
      <param name="comfort-noise" value="true"/>

      <!-- <param name="conference-flags" value="video-floor-only|rfc-4579|livearray-sync|auto-3d-position|minimize-video-encoding"/> -->

      <!-- <param name="video-mode" value="mux"/> -->
      <!-- <param name="video-layout-name" value="3x3"/> -->
      <!-- <param name="video-layout-name" value="group:grid"/> -->
      <!-- <param name="video-canvas-size" value="1920x1080"/> -->
      <!-- <param name="video-canvas-bgcolor" value="#333333"/> -->
      <!-- <param name="video-layout-bgcolor" value="#000000"/> -->
      <!-- <param name="video-codec-bandwidth" value="2mb"/> -->
      <!-- <param name="video-fps" value="15"/> -->

    </profile>
```

### Enable background music when only one person is in a session

p
FreeSWITCH enables you to have music play in the background when only one users is in the voice conference. To enable background music, edit `/opt/freeswitch/conf/autoload_configs/conference.conf.xml` (as root) and around line 204 you'll see the music on hold (moh-sound) commented out

```xml
<!--
      <param name="moh-sound" value="$${hold_music}"/>
      <param name="enter-sound" value="tone_stream://%(200,0,500,600,700)"/>
      <param name="exit-sound" value="tone_stream://%(500,0,300,200,100,50,25)"/>
-->
```

Uncomment it and save this file.

```xml
      <param name="moh-sound" value="$${hold_music}"/>
<!--
      <param name="enter-sound" value="tone_stream://%(200,0,500,600,700)"/>
      <param name="exit-sound" value="tone_stream://%(500,0,300,200,100,50,25)"/>
-->
```

The default BigBlueButton installation does not come with any music files. You'll need to upload a music file in WAV format to the server and change a reference in `/opt/freeswitch/conf/vars.xml`.

For example, to use the file `/opt/freeswitch/share/freeswitch/sounds/en/us/callie/ivr/48000/ivr-to_listen_to_moh.wav` as music on hold, edit `/opt/freeswitch/conf/vars.xml` and change the line

```xml
  <X-PRE-PROCESS cmd="set" data="hold_music=local_stream://moh"/>
```

to

```xml
  <X-PRE-PROCESS cmd="set" data="hold_music=/opt/freeswitch/share/freeswitch/sounds/en/us/callie/ivr/48000/ivr-to_listen_to_moh.wav" />
```

and then restart BigBlueButton

```bash
$ bbb-conf --restart
```

and join an audio session. You should now hear music on hold if there is only one user in the session.

### Add a phone number to the conference bridge

The built-in WebRTC-based audio in BigBlueButton is very high quality audio. Still, there may be cases where you want users to be able to dial into the conference bridge using a telephone number.

Before you can configure FreeSWITCH to route the call to the right conference, you need to first obtain a phone number from a [Internet Telephone Service Providers](https://freeswitch.org/confluence/display/FREESWITCH/Providers+ITSPs) and configure FreeSWITCH accordingly to receive incoming calls via session initiation protocol (SIP) from that provider. Ensure that the context is `public` and that the file is called `/opt/freeswitch/conf/sip_profiles/external/YOUR-PROVIDER.xml`. Here is an example; of course, hostname and ALL-CAPS values need to be changed:

```xml
<include>
  <gateway name="ANY-NAME-FOR-YOUR-PROVIDER">
    <param name="proxy" value="sip.example.net"/>
    <param name="username" value="PROVIDER-ACCOUNT"/>
    <param name="password" value="PROVIDER-PASSWORD"/>
    <param name="extension" value="EXTERNALDID"/>
    <param name="register" value="true"/>
    <param name="context" value="public"/>
  </gateway>
</include>
```

To route the incoming call to the correct BigBlueButton audio conference, you need to create a `dialplan` which, for FreeSWITCH, is a set of instructions that it runs when receiving an incoming call. When a user calls the phone number, the dialplan will prompt the user to enter a five digit number associated with the conference.

To create the dialplan, use the XML below and save it to `/opt/freeswitch/conf/dialplan/public/my_provider.xml`. Replace `EXTERNALDID` with the value specified as the `extension` in the SIP profile (such as 6135551234, but see above).

```xml
<extension name="from_my_provider">
 <condition field="destination_number" expression="^EXTERNALDID">
   <action application="start_dtmf" />
   <action application="answer"/>
   <action application="sleep" data="1000"/>
   <action application="play_and_get_digits" data="5 7 3 30000 # conference/conf-pin.wav ivr/ivr-that_was_an_invalid_entry.wav pin \d+"/>

   <!-- Uncomment the following block if you want to mask the phone number in the list of participants. -->
   <!-- Instead of `01711233121` it will then show `xxx-xxx-3121`. -->
   <!--
   <action application="set_profile_var" data="caller_id_name=${regex(${caller_id_name}|^.*(.{4})$|xxx-xxx-%1)}"/>
   -->

   <action application="transfer" data="SEND_TO_CONFERENCE XML public"/>
 </condition>
</extension>
<extension name="check_if_conference_active">
 <condition field="${conference ${pin} list}" expression="/sofia/g" />
 <condition field="destination_number" expression="^SEND_TO_CONFERENCE$">
   <action application="set" data="bbb_authorized=true"/>
   <action application="transfer" data="${pin} XML default"/>
 </condition>
</extension>

<extension name="conf_bad_pin">
 <condition field="${pin}" expression="^\d{5}$">
   <action application="answer"/>
   <action application="sleep" data="1000"/>
   <action application="play_and_get_digits" data="5 7 3 30000 # conference/conf-bad-pin.wav ivr/ivr-that_was_an_invalid_entry.wav pin \d+"/>
   <action application="transfer" data="SEND_TO_CONFERENCE XML public"/>
 </condition>
</extension>
```

Change ownership of this file to `freeswitch:daemon`

```bash
$ chown freeswitch:daemon /opt/freeswitch/conf/dialplan/public/my_provider.xml
```

and then restart FreeSWITCH:

```bash
$ sudo systemctl restart freeswitch
```

Try calling the phone number. It should connect to FreeSWITCH and you should hear a voice prompting you to enter the five digit PIN number for the conference. Please note, that dialin will currently only work if at least one web participant has joined with their microphone.

To always show users the phone number along with the 5-digit PIN number within BigBlueButton, not only while selecting the microphone participation, edit `/etc/bigbluebutton/bbb-web.properties` and set the phone number provided by your Internet Telephone Service Provider

```properties
#----------------------------------------------------
# Default dial access number
defaultDialAccessNumber=613-555-1234
```

and set `defaultWelcomeMessageFooter` to

```properties
defaultWelcomeMessageFooter=<br/><br/>To join this meeting by phone, dial:<br/>  %%DIALNUM%%<br/>Then enter %%CONFNUM%%# as the conference PIN number.
```

Save `/etc/bigbluebutton/bbb-web.properties` and restart BigBlueButton again. Each user that joins a session will see a message in the chat similar to.

```text
To join this meeting by phone, dial:
   613-555-1234
and enter 12345 as the conference PIN number.
```

Finally, setup the firewall rules so you are only accepting incoming calls from the IP address of your SIP provider. For example, if your SIP provider forwards incoming calls from 64.2.142.33, then setup the following firewall rules on your server.

```bash
iptables -A INPUT -i eth0 -p tcp --dport 5060 -s 0.0.0.0/0 -j REJECT
iptables -A INPUT -i eth0 -p udp --dport 5060 -s 0.0.0.0/0 -j REJECT
iptables -A INPUT -i eth0 -p tcp --dport 5080 -s 0.0.0.0/0 -j REJECT
iptables -A INPUT -i eth0 -p udp --dport 5080 -s 0.0.0.0/0 -j REJECT
iptables -I INPUT  -p udp --dport 5060 -s 64.2.142.33 -j ACCEPT
```

With these rules, you won't get spammed by bots scanning for SIP endpoints and trying to connect.

### Turn on the "comfort noise" when no one is speaking

FreeSWITCH has the ability to add a "comfort noise" that is a slight background hiss to let users know they are still in a voice conference even when no one is talking (otherwise, they may forget they are connected to the conference bridge and say something unintended for others).

If you want to enable, edit `/opt/freeswitch/conf/autoload_configs/conference.conf.xml`, look for the block `<profile name="cdquality">`, and change the value for `comfort-noise`. You can specify a level of noise, such as 0 (no noise), 350, 1400, etc. Try different values to get the level you desire.

```xml
<param name="comfort-noise" value="1400"/>
```

You need to restart BigBlueButton between each change. For more information, see [comfort-noise](https://freeswitch.org/confluence/display/FREESWITCH/mod_conference) in FreeSWITCH documentation.

```bash
$ sudo bbb-conf --restart
```

## Presentation

### Change the default presentation

When a new meeting starts, BigBlueButton displays a default presentation. The file for the default presentation is located in `/var/www/bigbluebutton-default/default.pdf`. You can replace the contents of this file with your presentation. Whenever a meeting is created, BigBlueButton will automatically load, convert, and display this presentation for all users.

Alternatively, you can change the global default by adding an overwriting rule in `/etc/bigbluebutton/bbb-web.properties` specifying the URL for `beans.presentationService.defaultUploadedPresentation`.

```properties
# Default Uploaded presentation file
beans.presentationService.defaultUploadedPresentation=${bigbluebutton.web.serverURL}/default.pdf
```

You'll need to restart BigBlueButton after the change with `sudo bbb-conf --restart`.

If you want to specify the default presentation for a given meeting, you can also pass a URL to the presentation as part of the [create](/dev/api.html#pre-upload-slides) meeting API call.

### Increase the 200 page limit for uploads

BigBlueButton, by default, restricts uploads to 200 pages. To increase this value, add an overwrite rule in `/etc/bigbluebutton/bbb-web.properties` and set the `maxNumPages` value:

```properties
#----------------------------------------------------
# Maximum number of pages allowed for an uploaded presentation (default 200).
maxNumPages=200
```

After you save the changes to `/etc/bigbluebutton/bbb-web.properties`, restart the BigBlueButton server with

```bash
$ sudo bbb-conf --restart
```

### Increase the file size for an uploaded presentation

The default maximum file upload size for an uploaded presentation is 30 MB.

The first step is to change the size restriction in nginx. Edit `/etc/bigbluebutton/nginx/web.nginx` (2.4) or `/usr/share/bigbluebutton/nginx/web.nginx` (2.5) and modify the values for `client_max_body_size`.

```nginx
       location ~ "^\/bigbluebutton\/presentation\/(?<prestoken>[a-zA-Z0-9_-]+)/upload$" {
          ....
          # Allow 30M uploaded presentation document.
          client_max_body_size       30m;
          ....
       }

       location = /bigbluebutton/presentation/checkPresentation {
          ....
          # Allow 30M uploaded presentation document.
          client_max_body_size       30m;
          ....
       }
```

Next change the restriction in bbb-web. Add an overwrite rule in `/etc/bigbluebutton/bbb-web.properties` and set the value `maxFileSizeUpload`.

```properties
# Maximum file size for an uploaded presentation (default 30MB).
maxFileSizeUpload=30000000
```

You will have to additionally increase the size for the HTML5 client, edit `/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml` and modify `uploadSizeMax`.

Restart BigBlueButton with `sudo bbb-conf --restart`. You should now be able to upload larger presentations within the new limit.

### Add custom fonts for presentation conversion

Starting with BigBlueButton 2.3 we added support for using additional fonts when converting presentation files.

On the server where you want the new fonts supported you would want to download the fonts (.ttf) file. For example:

```
wget https://github.com/bigbluebutton/bigbluebutton/files/6391912/Street.Ruler.zip
unzip Street.Ruler.zip
```

Then copy the font (.ttf) to `/usr/share/fonts/`

`sudo cp 'Street Ruler.ttf' /usr/share/fonts/`

That's all! The font will be available on next presentations.

## Frontends

### Remove the API demos

If you have earlier installed the API demos for testing (which makes it possible for anyone to use your BigBlueButton server without authentication) and want to now remove them, enter the command:

```bash
$ sudo apt-get purge bbb-demo
```

### Modify the default landing page

The default HTML landing page is located in

```bash
/var/www/bigbluebutton-default/index.html
```

Change this page to create your own landing page (and keep a back-up copy of it as it will be overwritten during package updates to `bbb-conf`).

### Use the Greenlight front-end

BigBlueButton comes with Greenlight, a front-end application written in Ruby on Rails that makes it easy for users to create meetings, invite others, start meetings, and manage recordings.

![greenlight-start](/img/greenlight/room.png)

For more information see [Installing Greenlight](/greenlight/gl-install.html).

## Networking

### Setup a firewall

Configuring IP firewalling is _essential for securing your installation_. By default, many services are reachable across the network. This allows BigBlueButton operate in clusters and private data center networks -- but if your BigBlueButton server is publicly available on the internet, you need to run a firewall to reduce access to the minimal required ports.

If your server is behind a firewall already -- such as running within your company or on an EC2 instance behind a Amazon Security Group -- and the firewall is enforcing the above restrictions, you don't need a second firewall and can skip this section.

BigBlueButton comes with a [UFW](https://launchpad.net/ufw) based ruleset. It it can be applied on restart (c.f. [Automatically apply configuration changes on restart](#automatically-apply-configuration-changes-on-restart)) and restricts access only to the following needed ports:

- TCP/IP port 22 for SSH
- TCP/IP port 80 for HTTP
- TCP/IP port 443 for HTTPS
- UDP ports 16384 to 32768 for media connections

Note: if you have configured `sshd` (the OpenSSH daemon) to use a different port than 22, then before running the commands below, change `ufw allow OpenSSH` to `ufw allow <port>/tcp` where `<port>` is the port in use by `sshd`. You can see the listening port for `sshd` using the command `# netstat -antp | grep sshd`. Here the command shows `sshd` listening to the standard port 22.

```bash
$ netstat -antp | grep sshd
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1739/sshd
tcp6       0      0 :::22                   :::*                    LISTEN      1739/sshd
```

To restrict external access minimal needed ports for BigBlueButton (with [HTML5 client set as default](#make-the-html5-client-default)). BigBlueButton supplies a helper function that you can call in `/etc/bigbluebutton/bbb-conf/apply-conf.sh` to setup a minimal firewall (see [Setup Firewall](#setup-firewall).

You can also do it manually with the following commands

```bash
$ apt-get install -y ufw
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw allow 16384:32768/udp
ufw --force enable
```

These `ufw` firewall rules will be automatically re-applied on server reboot.

Besides IP-based firewalling, you can explore web application firewalls such as [ModSecurity](https://modsecurity.org/) that provide additional security by checking requests to various web-based components.

### Setup Firewall

To configure a firewall for your BigBlueButton server (recommended), add `enableUFWRules` to `/etc/bigbluebutton/bbb-conf/apply-config.sh`, as in

```sh
enableUFWRules
```

With `enableUFWRule` added to `apply-config.sh`, whenever you do `bbb-conf` with `--restart` or `--setip`, you'll see the following output

```bash
sudo bbb-conf --restart

Restarting BigBlueButton ..
Stopping BigBlueButton

Applying updates in /etc/bigbluebutton/bbb-conf/apply-config.sh:
  - Enable Firewall and opening 22/tcp, 80/tcp, 443/tcp and 16384:32768/udp
Rules updated
Rules updated (v6)
Rules updated
Rules updated (v6)
Rules updated
Rules updated (v6)
Rules updated
Rules updated (v6)
Firewall is active and enabled on system startup

Starting BigBlueButton
```

### Change UDP ports

By default, BigBlueButton uses the UDP ports 16384-32768 which are used by FreeSWITCH, mediasoup and Kurento to send real-time packets (RTP).

**FreeSWITCH** uses the range 16384 - 24576, which is defined in `/opt/freeswitch/etc/freeswitch/autoload_configs/switch.conf.xml`

```xml
    <!-- RTP port range -->
    <param name="rtp-start-port" value="16384"/>
    <param name="rtp-end-port" value="24576"/>
```

**Kurento** uses the range 24577 - 32768, which is defined in `/etc/kurento/modules/kurento/BaseRtpEndpoint.conf.ini`

```ini
    minPort=24577
    maxPort=32768
```

**mediasoup** also uses 24577 - 32768 by default (defined in `/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml`). If it needs to be changed, bbb-webrtc-sfu's [override configuration file](https://docs.bigbluebutton.org/admin/configuration-files.html) (located in `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`) should be used. For example, setting the range to 50000 - 51999 should be of the following format (YAML syntax, `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`):

```yaml
mediasoup:
  worker:
    rtcMinPort: 50000
    rtcMaxPort: 51999
```

### Apply custom settings for TURN server

If always want a specific TURN server configuration, the following to [apply-config.sh](#apply-confsh) and modify `aaa.bbb.ccc.ddd` and `secret` with your values.

```bash
echo "  - Update TURN server configuration turn-stun-servers.xml"
  cat <<HERE > /usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans-2.5.xsd">
    <bean id="stun0" class="org.bigbluebutton.web.services.turn.StunServer">
        <constructor-arg index="0" value="stun:aaa.bbb.ccc.ddd"/>
    </bean>
    <bean id="turn0" class="org.bigbluebutton.web.services.turn.TurnServer">
        <constructor-arg index="0" value="secret"/>
        <constructor-arg index="1" value="turns:aaa.bbb.ccc.ddd:443?transport=tcp"/>
        <constructor-arg index="2" value="86400"/>
    </bean>
    <bean id="stunTurnService"
            class="org.bigbluebutton.web.services.turn.StunTurnService">
        <property name="stunServers">
            <set>
                <ref bean="stun0"/>
            </set>
        </property>
        <property name="turnServers">
            <set>
                <ref bean="turn0"/>
            </set>
        </property>
    </bean>
</beans>
HERE
```

## HTML5 client

### Change the default welcome message

The default welcome message is built from three parameters: two system-wide parameters (see below) and the `welcome` parameter from the BigBlueButton `create` API call.

You'll find the two system-wide welcome parameters `defaultWelcomeMessage` and `defaultWelcomeMessageFooter` in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`.

```properties
defaultWelcomeMessage=<default welcome message>
defaultWelcomeMessageFooter=<default welcome message footer>
```

When a front-end creates a BigBlueButton session, it may also pass a `welcome` parameter in the [create](/dev/api.html#create) API call.

The final welcome message shown to the user (as blue text in the Chat window) is a composite of `welcome` + `defaultWelcomeMessage` + `defaultWelcomeMessageFooter`.

The welcome message is fixed for the duration of a meeting. If you want to see the effect of changing the `welcome` parameter, you must [end](/dev/api.html#end) the current meeting or wait until the BigBlueButton server removes it from memory (which occurs about two minutes after the last person has left). You can overwrite these values in file `/etc/bigbluebutton/bbb-web.properties`, just remember to restart BigBlueButton with `sudo bbb-conf --restart` for the new values to take effect.

### Change the default locale

XXX - Needs updating

By default, the BigBlueButton client should detect the browser's locale and use that default language accordingly. The default language is English, but you can change that by editing `bigbluebutton/client/BigBlueButton.html` and change the value

```javascript
localeChain = 'en_US';
```

You can see the list of languages installed with BigBlueButton in the directory `/usr/share/meteor/bundle/programs/server/assets/app/locales`.

### Change favicon

To change the favicon, overwrite the file `/var/www/bigbluebutton-default/favicon.ico`.

You'll need to update file each time the `bbb-config` package updates.

### Change title in the HTML5 client

The configuration file for the HTML5 client is located in `/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml`. It contains all the settings for the HTML5 client.

To change the title, edit `settings.yml` and change the entry for `public.app.clientTitle`

```yaml
public:
  app:
    ...
    clientTitle: BigBlueButton
```

You'll need to update this entry each time the package `bbb-html5` updates. The following script can help automate the change

```bash
$ TARGET=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml
$ yq w -i $TARGET public.app.clientTitle "New Title"
$ chown meteor:meteor $TARGET
```

### Apply lock settings to restrict webcams

To enable lock settings for `Share webcam` by default (viewers are unable to share their webcam), add the following to `/etc/bigbluebutton/bbb-web.properties`.

```properties
# Prevent viewers from sharing webcams
lockSettingsDisableCam=true
```

After restart, if you open the lock settings you'll see `Share webcam` lock enabled.

<p align="center">
  <img src="/img/html5-lock-webcam.png"/>
</p><br/>

### Change the default path for HTML5 client

The default URL path for the client is `/html5client`, and it can be changed to match your preferences.

Edit nginx configuration file (`/etc/bigbluebutton/nginx/bbb-html5.nginx`), replacing all instances of `/html5client` with the new path;

Do the same in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties` in the following lines:

```
defaultHTML5ClientUrl=${bigbluebutton.web.serverURL}/html5client/join

defaultGuestWaitURL=${bigbluebutton.web.serverURL}/html5client/guestWait
```

In configuration file for the HTML5 client, located in `/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml`, change the entry for `public.app.basename`:

```
public:
  app:
    ...
    basename: '/html5client'
```

Edit `systemd_start.sh` and `systemd_start_frontend.sh` files, located in `/usr/share/meteor/bundle`, replacing `/html5client` with the new path in both files;

Finally, run the following command to reload configuration:

`sudo service nginx reload && sudo bbb-conf --restart`

## Configuration of global settings

The configuration file for the HTML5 client is located in `/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml`. It contains all the settings for the HTML5 client.

### Modify the HTML5 client title

All changes to global HTML5 client settings are done in the file above. So to change the title, edit `settings.yml` and change the entry for `public.app.clientTitle`

### Configure guest policy

The policy for guest management on the server is is set in the properties file for `bbb-web`, which is located at `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`.
You can overwrite the default guest policy in `/etc/bigbluebutton/bbb-web.properties`. Just add the value you prefer, save the file and restart BigBlueButton.

```properties
# Default Guest Policy
# Valid values are ALWAYS_ACCEPT, ALWAYS_DENY, ASK_MODERATOR
#
defaultGuestPolicy=ALWAYS_ACCEPT
```
## Show a custom logo on the client

Ensure that the parameter `displayBrandingArea` is set to `true` in bbb-html5's configuration, restart BigBlueButton server with `sudo bbb-conf --restart` and pass `logo=<image-url>` in Custom parameters when creating the meeting.

## Passing custom parameters to the client on join

The HTML5 client supports a list of parameters that can be added to the `join` API call which modify the look and default behaviour of the client. This list is accurate as of BigBlueButton version 2.2.17 (build 937). These parameters override the global defaults set in `settings.yml`. As the parameters are passed on call to join, it allows for some powerful customization that can vary depending on which user is joining the session.

Useful tools for development:

- A tool like (https://meyerweb.com/eric/tools/dencoder/) is useful in the encoding-decoding process for the fields expecting encoded value passed (see below).
- The [API mate](https://mconf.github.io/api-mate/) allows you to directly experiment with these custom parameters. To use the API mate, run the following command on your BigBlueButton machine: `sudo bbb-conf --secret`. This creates a link for you with your secret as a parameter so you can get started experimenting right away.

### Application parameters

| Parameter                                      | Description                                                                                                                                                                                                                                                                                                                     | Default value |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `userdata-bbb_ask_for_feedback_on_logout=`     | If set to `true`, the client will display the ask for feedback screen on logout                                                                                                                                                                                                                                                 | `false`       |
| `userdata-bbb_auto_join_audio=`                | If set to `true`, the client will start the process of joining the audio bridge automatically upon loading the client                                                                                                                                                                                                           | `false`       |
| `userdata-bbb_client_title=`                   | Specifies a string to set as the HTML5 client title                                                                                                                                                                                                                                                                             | BigBlueButton |
| `userdata-bbb_force_listen_only=`              | If set to `true`, attendees will be not be able to join with a microphone as an option (does not apply to moderators)                                                                                                                                                                                                           | `false`       |
| `userdata-bbb_listen_only_mode=`               | If set to `false`, the user will not be able to join the audio part of the meeting without a microphone (disables listen-only mode)                                                                                                                                                                                             | `true`        |
| `userdata-bbb_skip_check_audio=`               | If set to `true`, the user will not see the "echo test" prompt when sharing audio                                                                                                                                                                                                                                               | `false`       |
| `userdata-bbb_skip_check_audio_on_first_join=` | (Introduced in BigBlueButton 2.3) If set to `true`, the user will not see the "echo test" when sharing audio for the first time in the session. If the user stops sharing, next time they try to share audio the echo test window will be displayed, allowing for configuration changes to be made prior to sharing audio again | `false`       |
| `userdata-bbb_override_default_locale=`        | (Introduced in BigBlueButton 2.3) If set to `de`, the user's browser preference will be ignored - the client will be shown in 'de' (i.e. German) regardless of the otherwise preferred locale 'en' (or other)                                                                                                                   | `null`        |

### Branding parameters

| Parameter                             | Description                                                                               | Default value |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | ------------- |
| `userdata-bbb_display_branding_area=` | If set to `true`, the client will display the branding area in the upper left hand corner | `false`       |

### Shortcut parameters

| Parameter                 | Description                                                                                                                                                    | Default value      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `userdata-bbb_shortcuts=` | The value passed has to be URL encoded. For example if you would like to disable shortcuts, pass `%5B%5D` which is the encoded version of the empty array `[]` | See `settings.yml` |

### Kurento parameters

| Parameter                                        | Description                                                                                                                                                                                                                                                                                                                             | Default value |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `userdata-bbb_auto_share_webcam=`                | If set to `true`, the client will start the process of sharing webcam (if any) automatically upon loading the client                                                                                                                                                                                                                    | `false`       |
| `userdata-bbb_preferred_camera_profile=`         | Specifies a preferred camera profile to use out of those defined in the `settings.yml`                                                                                                                                                                                                                                                  | none          |
| `userdata-bbb_enable_video=`                     | If set to `false`, the client will display the webcam sharing button (in effect disabling/enabling webcams)                                                                                                                                                                                                                             | `true`        |
| `userdata-bbb_record_video=`                     | If set to `false`, the user won't have her/his video stream recorded                                                                                                                                                                                                                                                                    | `true`        |
| `userdata-bbb_skip_video_preview=`               | If set to `true`, the user will not see a preview of their webcam before sharing it                                                                                                                                                                                                                                                     | `false`       |
| `userdata-bbb_skip_video_preview_on_first_join=` | (Introduced in BigBlueButton 2.3) If set to `true`, the user will not see a preview of their webcam before sharing it when sharing for the first time in the session. If the user stops sharing, next time they try to share webcam the video preview will be displayed, allowing for configuration changes to be made prior to sharing | `false`       |
| `userdata-bbb_mirror_own_webcam=`                | If set to `true`, the client will see a mirrored version of their webcam. Doesn't affect the incoming video stream for other users.                                                                                                                                                                                                     | `false`       |

### Presentation parameters

| Parameter                                                | Description                                                                                                                                                                      | Default value |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `userdata-bbb_force_restore_presentation_on_new_events=` | If set to `true`, new events related to the presentation will be pushed to viewers. See [this PR](https://github.com/bigbluebutton/bigbluebutton/pull/9517) for more information | `false`       |

### Whiteboard parameters

| Parameter                           | Description                                                                                                     | Default value |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------- |
| `userdata-bbb_multi_user_pen_only=` | If set to `true`, only the pen tool will be available to non-participants when multi-user whiteboard is enabled | `false`       |
| `userdata-bbb_presenter_tools=`     | Pass in an array of permitted tools from `settings.yml`                                                         | all enabled   |
| `userdata-bbb_multi_user_tools=`    | Pass in an array of permitted tools for non-presenters from `settings.yml`                                      | all enabled   |

### Themeing & styling parameters

| Parameter                        | Description                                                                                                          | Default value |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------- |
| `userdata-bbb_custom_style=`     | URL encoded string with custom CSS                                                                                   | none          |
| `userdata-bbb_custom_style_url=` | This parameter acts the same way as `userdata-bbb_custom_style` except that the CSS content comes from a hosted file | none          |

### Layout parameters

| Parameter                                  | Description                                                                                                             | Default value |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------- |
| `userdata-bbb_auto_swap_layout=`           | If set to `true`, the presentation area will be minimized when a user joins a meeting.                                  | `false`       |
| `userdata-bbb_hide_presentation=`          | If set to `true`, the presentation area will not be displayed.                                                          | `false`       |
| `userdata-bbb_show_participants_on_login=` | If set to `false`, the participants panel (and the chat panel) will not be displayed until opened.                      | `true`        |
| `userdata-bbb_show_public_chat_on_login=`  | If set to `false`, the chat panel will not be visible on page load until opened. Not the same as disabling chat.        | `true`        |
| `userdata-bbb_hide_nav_bar=`               | If set to `true`, the navigation bar (the top portion of the client) will not be displayed. Introduced in BBB 2.4-rc-3. | `false`       |
| `userdata-bbb_hide_actions_bar=`           | If set to `true`, the actions bar (the bottom portion of the client) will not be displayed. Introduced in BBB 2.4-rc-3. | `false`       |

### Examples

#### Changing the background color of the HTML client

You can change the background color of the HTML5 client with the following stylesheet:

```css
:root {
  --loader-bg: #000;
}

.overlay--1aTlbi {
  background-color: #000 !important;
}

body {
  background-color: #000 !important;
}
```

You can add this code to a hosted .css file and pass `userdata-bbb_custom_style_url=https://someservice.com/customStyles.css`

Alternatively (for simple changes) you can achieve the same without hosted file.

You can try this in API-MATE - you need the non-encoded version of the CSS

```
userdata-bbb_custom_style=:root{--loader-bg:#000;}.overlay--1aTlbi{background-color:#000!important;}body{background-color:#000!important;}
```

If you are adding this to a join-url you need to URI encode the string (see a sample encoding tool above)

```
%3Aroot%7B--loader-bg%3A%23000%3B%7D.overlay--1aTlbi%7Bbackground-color%3A%23000!important%3B%7Dbody%7Bbackground-color%3A%23000!important%3B%7D
```

## Send client logs to the server

Step-by-step instructions for how to configure logs from clients to be logged in a server log file are located in [Administration -> Configuration Files](/admin/configuration-files.html#logs-sent-directly-from-the-client)

### Collect feedback from the users

The BigBlueButton client can ask the user for feedback when they leave a session. This feedback gives the administrator insight on a user's experiences within a BigBlueButton sessions.

To enable the feedback and it's logging to your server, run the following script.

```bash
#!/bin/bash

HOST=$(cat /etc/bigbluebutton/bbb-web.properties | grep -v '#' | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
HTML5_CONFIG=/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml
PROTOCOL=$(cat /etc/bigbluebutton/bbb-web.properties | grep -v '#' | grep '^bigbluebutton.web.serverURL' | sed 's/.*\(http[s]*\).*/\1/')

apt-get install -y nginx-full

yq w -i $HTML5_CONFIG public.clientLog.external.enabled true
yq w -i $HTML5_CONFIG public.clientLog.external.url     "$PROTOCOL://$HOST/html5log"
yq w -i $HTML5_CONFIG public.app.askForFeedbackOnLogout true
chown meteor:meteor $HTML5_CONFIG

mkdir -p /etc/bigbluebutton/nginx/

cat > /etc/bigbluebutton/nginx/html5-client-log.nginx << HERE
location /html5log {
        access_log /var/log/nginx/html5-client.log postdata;
        echo_read_request_body;
}
HERE

cat > /etc/nginx/conf.d/html5-client-log.conf << HERE
log_format postdata '\$remote_addr [\$time_iso8601] \$request_body';
HERE

# We need nginx-full to enable postdata log_format
if ! dpkg -l | grep -q nginx-full; then
  apt-get install -y nginx-full
fi

touch /var/log/nginx/html5-client.log
chown bigbluebutton:bigbluebutton /var/log/nginx/html5-client.log
```

The feedback will be written to `/var/log/nginx/html5-client.log`, which you would need to extract and parse. You can also use the following command to monitor the feedback

```bash
tail -f /var/log/nginx/html5-client.log | sed -u 's/\\x22/"/g' | sed -u 's/\\x5C//g'
```

There used to be an incorrect version of the script above on the docs. If you face any issues after updating it, refer to [this issue](https://github.com/bigbluebutton/bigbluebutton/issues/9065) for solutions.

## Other configuration changes

### Extract the shared secret

Any front-end to BigBlueButton needs two pieces of information: the hostname for the BigBlueButton server and its shared secret (for authenticating API calls). To print out the hostname and shared secret for you BigBlueButton server, enter the command `bbb-conf --secret`:

```bash
$ bbb-conf --secret

    URL: https://bigbluebutton.example.com/bigbluebutton/
    Secret: 577fd5f05280c10fb475553d200f3322

    Link to the API-Mate:
    https://mconf.github.io/api-mate/#server=https://10.0.3.132/bigbluebutton/&sharedSecret=577fd5f05280c10fb475553d200f3322
```

The last line gives a link API-Mate, an excellent tool provided by [Mconf Technologies](https://mconf.com/) (a company that has made many contributions to the BigBlueButton project over the years) that makes it easy to create API calls.

### Change the shared secret

To validate incoming API calls, all external applications making API calls must checksum their API call using the same secret as configured in the BigBlueButton server.

You’ll find the shared secret in `/etc/bigbluebutton/bbb-web.properties`

```properties
beans.dynamicConferenceService.securitySalt=<value_of_salt>
```

To change the shared secret, do the following:

1. Generate a new Universal Unique ID (UUID) from a UUID generator such as at [http://www.somacon.com/p113.php](http://www.somacon.com/p113.php). This will give a long string of random numbers that will be impossible to reverse engineer.
2. Run the command `sudo bbb-conf --setsecret new_secret`.

Note: If you have created you own front-end or are using a [third-party plug-in](http://bigbluebutton.org/support) to connect to BigBlueButton, its shared secret; otherwise, if the shared secrets do not match, the checksum for the incoming API calls will not match and the BigBlueButton server will reject the API call with an error.

### Install callback for events (webhooks)

Want to receive callbacks to your application when an event occurs in BigBlueButton? BigBlueButton provides an optional web hooks package that installs a node.js application listens for all events on BigBlueButton and sends POST requests with details about these events to hooks registered via an API. A hook can be any external URL that can receive HTTP POST requests.

To install bbb-webhooks

```bash
$ sudo apt-get install bbb-webhooks
```

For information on configuring bbb-webhooks, see [bbb-webhooks](/dev/webhooks.html).
