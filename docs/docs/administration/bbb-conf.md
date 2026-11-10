---
id: bbb-conf
slug: /administration/bbb-conf
title: bbb-conf tool
sidebar_position: 3
description: BigBlueButton bbb-conf tool
keywords:
- bbb-conf
---

## Introduction

`bbb-conf` is BigBlueButton's configuration tool.  It makes it easy for you to modify parts of BigBlueButton's configuration, manage the BigBlueButton system (start/stop/reset), and troubleshoot potential problems with your setup.

As a historical note, this tool was created early in the development of BigBlueButton. The core developers wrote this tool to quickly update BigBlueButton's configuration files for setup and testing.

`bbb-conf` is located in `/usr/bin/bbb-conf`.  If you are a developer, we recommend taking a look through the source code for `bbb-conf` (it's a shell script) as it will help you understand the various components of BigBlueButton and how they work together (see also [Architecture Overview](/development/architecture)).

## Options

If you type `bbb-conf` with no parameters it will print out the list of available options.

```bash
$ bbb-conf
BigBlueButton Configuration Utility - Version <release>

   bbb-conf [options]

Configuration:
   --version                        Display BigBlueButton version (packages)
   --setip <IP/hostname>            Set IP/hostname for BigBlueButton
   --setsecret <secret>             Change the shared secret in /etc/bigbluebutton/bbb-web.properties
   --set-port-range MIN-MAX         Change UDP port range used for audio/video/screenshare

Monitoring:
   --check                          Check configuration files and processes for problems
   --debug                          Scan the log files for error messages
   --watch                          Scan the log files for error messages every 2 seconds
   --network                        View network connections on 80, 443 and 1935 by IP address. 1935 is deprecated. You will need to modify bbb-conf if you have custom ports.
   --secret                         View the URL and shared secret for the server

Administration:
   --restart                        Restart BigBlueButton
   --stop                           Stop BigBlueButton
   --start                          Start BigBlueButton
   --clean                          Restart and clean all log files
   --status                         Display running status of components
   --zip                            Zip up log files for reporting an error
```

You run `bbb-conf` as a normal user.  If a particular command requires you to run BigBlueButton as root, it will output a message saying `you need to run this command as root`.  Below is an outline of the various commands.

### `--version`

Shows the version of BigBlueButton installed on the server and the versions of the components of BigBlueButton.

### `--setip <hostname_or_ip>`

Sets the IP/Hostname for BigBlueButton's configuration.  For example, if your BigBlueButton server has the IP address of 192.168.0.211, you can change BigBlueButton's configuration files to use this IP address with the command

```bash
$ sudo bbb-conf --setip 192.168.0.211
```

or, if you want to use the hostname bbb.mybbbserver.com, then use the command

```bash
$ sudo bbb-conf --setip bbb.mybbbserver.com
```

### `--set-port-range <min>-<max>`

Changes the UDP port range used for media to `<min>`-`<max>` in FreeSWITCH (`rtp-start-port`/`rtp-end-port` in `switch.conf.xml`), mediasoup (`mediasoup.worker.rtcMinPort`/`rtcMaxPort` in `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`), bbb-webrtc-recorder (`webrtc.rtcMinPort`/`rtcMaxPort` in `/etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml`) and LiveKit (`rtc.port_range_start`/`port_range_end` in `/etc/bigbluebutton/livekit.yaml`). It also sets livekit-sip's `rtp_port` in `/etc/bigbluebutton/livekit-sip.yaml`. Restart BigBlueButton afterwards and open the new range in your firewall.

See [Change UDP ports](/administration/customize#change-udp-ports) for the default ranges and the caveats: `switch.conf.xml` is reset by `bbb-freeswitch-core` upgrades, and an existing `/etc/bigbluebutton/bbb-webrtc-recorder.yml` shadows the file the command edits.

### `--clean`

Restarts BigBlueButton and clears all the log files during the restart.  This is good for debugging as it clears away previous errors in the log files.

### `--check`

Runs a series of checks on your current setup and reports any potential problems.  Not all reported problems are actual issues.  For example, if you use `--setip <hostname_or_IP>`, then `bbb-conf` will complain that the hostname does not match the server's IP, but that's fine as you configured the BigBlueButton server to listen on a hostname instead of IP address.

### `--debug`

Greps through the various log files for errors (such as exceptions in the Java log files for Tomcat).

### `--network`

This command shows you the number of active connections for port 80 (HTTP) and 443 (HTTPS) for each remote IP address.

### `--secret`

Displays the URL and the shared secret of the BigBlueButton API, and a link that opens [API-Mate](https://mconf.github.io/api-mate/) with them filled in.  For example:

```bash
$ sudo bbb-conf --secret

    URL: https://bbb.example.com/bigbluebutton/
    Secret: 330a8b08c3b4c61533e1d0c334

    Link to the API-Mate:
    https://mconf.github.io/api-mate/#server=https://bbb.example.com/bigbluebutton/&sharedSecret=330a8b08c3b4c61533e1d0c334
```

### `--setsecret <new_secret>`

Assigns a new security secret for the BigBlueButton API.

### `--start`

Starts all the BigBlueButton processes.

### `--stop`

Stops all the BigBlueButton processes.

### `--watch`

Watches log files for error messages every 2 seconds.  Use this command after `sudo bbb-conf --clean` to clean out all the log files.

### `--zip`

Zips up log files for reporting an error.  This option is rarely used as it's often easier to use pastebin to share the log of the error message if you are, for example, posting to the bigbluebutton-dev mailing list.
