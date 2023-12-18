<<<<<<< HEAD
---
id: install
slug: /administration/install
title: Install BigBlueButton
sidebar_position: 1
description: Install BigBlueButton
keywords:
- install
---

We have tools to make it easy for you, a system administrator, to install BigBlueButton on a dedicated Linux server. This document shows you how to install.

# Before you install

We recommend installing BigBlueButton with a 'clean' and dedicated Ubuntu 20.04 64-bit server with no prior software installed. If you want to upgrade from an earlier version of BigBlueButton like 2.3 or 2.4, we recommend setting up a clean server for BigBlueButton 2.5 on Ubuntu 20.04 and, after setup, [migrate over your existing recordings](/administration/customize#transfer-published-recordings-from-another-server).

A 'clean' server does not have any previous web servers installed (such as apache) or web applications (such as plesk or webadmin) that are [binding to port 80/443](/support/faq#we-recommend-running-bigbluebutton-on-port-80443). By 'dedicated' we mean that this server won't be used for anything else besides BigBlueButton (and possibly BigBlueButton-related applications such as [Greenlight](/greenlight/v3/install)).

## Minimum server requirements

For production, we recommend the following minimum requirements

- Ubuntu 20.04 64-bit OS running Linux kernel 5.x
=======

We have tools to make it easy for you, a system administrator, to install BigBlueButton on a dedicated linux server. This document shows you how to install.

## Before you install

We recommend installing BigBlueButton with a 'clean' and dedicated Ubuntu 22.04 64-bit server with no prior software installed. If you want to upgrade from an earlier version of BigBlueButton like 2.7, we recommend setting up a clean server for BigBlueButton 3.0 on Ubuntu 22.04 and, after setup, [migrate over your existing recordings](/administration/customize#transfer-published-recordings-from-another-server).

A 'clean' server does not have any previous web servers installed (such as apache) or web applications (such as plesk or webadmin) that are [binding to port 80/443](/support/faq#we-recommend-running-bigbluebutton-on-port-80443). By 'dedicated' we mean that this server won't be used for anything else besides BigBlueButton (and possibly BigBlueButton-related applications such as [Greenlight](/greenlight/v3/install)).

### Minimum server requirements

For production, we recommend the following minimum requirements

- Ubuntu 22.04 64-bit OS running Linux kernel 5.x
>>>>>>> v2.5.x-release
- Latest version of docker installed
- 16 GB of memory with swap enabled
- 8 CPU cores, with high single-thread performance
- 500 GB of free disk space (or more) for recordings, or 50GB if session recording is disabled on the server.
- TCP ports 80 and 443 are accessible
- UDP ports 16384 - 32768 are accessible
- 250 Mbits/sec bandwidth (symmetrical) or more
- TCP port 80 and 443 are **not** in use by another web server or reverse proxy
- A hostname (such as bbb.example.com) for setup of a SSL certificate
<<<<<<< HEAD
- IPv4 and IPv6 address

If you install BigBlueButton on a virtual machine in the cloud, we recommend you choose an instance type that has dedicated CPU.  These are usually called "compute-intensive" instances.  On Digital Ocean we recommend the c-8 compute intensive instances (or larger). On AWS we recommend c5a.2xlarge (or larger).  On Hetzner we recommend the AX51 servers or CCX32 instances.
=======
- IPV4 and IPV6 address

If you install BigBlueButton on a virtual machine in the cloud, we recommend you choose an instance type that has dedicated CPU.  These are usually called "compute-intensive" instances.  On Digital Ocean we recommend the c-8 compute intensive instances (or larger). On AWS we recommend c5a.2xlarge (or larger).  On Hetzner we recommend the AX52 servers or CCX32 instances.
>>>>>>> v2.5.x-release

If you are setting up BigBlueButton for local development on your workstation, you can relax some of the above requirements as there will only be few users on the server. Starting with the above requirements, you can reduce them as follows

- 4 CPU cores/8 GB of memory
- Installation on a local VM container
- 50G of disk space
<<<<<<< HEAD
- IPv4 address only

Regardless of your environment, the setup steps will include configuring a SSL certificate on the nginx server. Why?  All browsers now require a valid SSL certificate from the web server when a page requests access to the user's webcam or microphone via web real-time communications (WebRTC). If you try to access a BigBlueButton server with an IP address only, the browsers will block BigBlueButton client from accessing your webcam or microhone.

## Pre-installation checks

Got a Ubuntu 20.04 64-bit server ready for installation?  Great! But, before jumping into the installation section below, let's do a few quick configuration checks to make sure your server meets the minimum requirements.
=======
- IPV4 address only

Regardless of your environment, the setup steps will include configuring a SSL certificate on the nginx server. Why?  All browsers now require a valid SSL certificate from the web server when a page requests access to the user's webcam or microphone via web real-time communications (WebRTC). If you try to access a BigBlueButton server with an IP address only, the browsers will block BigBlueButton client from accessing your webcam or microphone.

### Pre-installation checks

Got a Ubuntu 22.04 64-bit server ready for installation?  Great! But, before jumping into the installation section below, let's do a few quick configuration checks to make sure your server meets the minimum requirements.
>>>>>>> v2.5.x-release

Doing these checks will significantly reduce the chances you'll hit a problem during installation.

First, check that the locale of the server is `en_US.UTF-8`.

```bash
$ cat /etc/default/locale
LANG="en_US.UTF-8"
```

If you don't see `LANG="en_US.UTF-8"`, enter the following commands to set the local to `en_US.UTF-8`.

```bash
<<<<<<< HEAD
$ sudo apt-get install -y language-pack-en
$ sudo update-locale LANG=en_US.UTF-8
```

and then logout and login again to your SSH session -- this will reload the locale configuration for your session. Run the above command `cat /etc/default/locale` again. Verify you see only the single line `LANG="en_US.UTF-8"`.
=======
sudo apt-get install -y language-pack-en
sudo update-locale LANG=en_US.UTF-8
```

and then log out and log in again to your SSH session -- this will reload the locale configuration for your session. Run the above command `cat /etc/default/locale` again. Verify you see only the single line `LANG="en_US.UTF-8"`.
>>>>>>> v2.5.x-release

Note: If you see an additional line `LC_ALL=en_US.UTF-8`, then remove the entry for `LC_ALL` from `/etc/default/locale` and logout and then log back in once more.

Next, do `sudo systemctl show-environment` and ensure you see `LANG=en_US.UTF-8` in the output.

```bash
$ sudo systemctl show-environment
LANG=en_US.UTF-8
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

If you don't see this, do `sudo systemctl set-environment LANG=en_US.UTF-8` and run the above `sudo systemctl show-environment` again and confirm you see `LANG=en_US.UTF-8` in the output.

<<<<<<< HEAD
Next, check that your server has (at least) 16G of memory using the command `free -h`. Here's the output from one of our test servers.
=======
Next, check that your server has (at lest) 16G of memory using the command `free -h`. Here's the output from one of our test servers.
>>>>>>> v2.5.x-release

```bash
$ free -h
              total        used        free      shared  buff/cache   available
Mem:            15G        3.1G        1.0G        305M         11G         12G
Swap:            0B          0B          0B
```

Here it shows 15G of memory (that's close enough as the server has 16 gigabytes of memory).

If you see a value for `Mem:` in the `total` column less than 15G, then your server has insufficient memory to run BigBlueButton in production. You need to increase the server's memory to (at least) 16G. (As stated above, if your running this in a development environment, 8G is fine.)

<<<<<<< HEAD
Next, check that the server has Ubuntu is 20.04 as its operating system.
=======
Next, check that the server has Ubuntu is 22.04 as its operating system.
>>>>>>> v2.5.x-release

```bash
$  cat /etc/lsb-release
DISTRIB_ID=Ubuntu
<<<<<<< HEAD
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.4 LTS"
```

Next, check that your server is running the 64-bit version of Ubuntu 20.04.
=======
DISTRIB_RELEASE=22.04
DISTRIB_CODENAME=jammy
DISTRIB_DESCRIPTION="Ubuntu 22.04.3 LTS"
```

Next, check that your server is running the 64-bit version of Ubuntu 22.04.
>>>>>>> v2.5.x-release

```bash
$ uname -m
x86_64
```

<<<<<<< HEAD
Next, check that your server supports IPv6.
=======
Next, check that your server supports IPV6.
>>>>>>> v2.5.x-release

```bash
$ ip addr | grep inet6
inet6 ::1/128 scope host
...
```

<<<<<<< HEAD
If you do not see the line `inet6 ::1/128 scope host` then after you install BigBlueButton you will need to modify the configuration for FreeSWITCH to [disable support for IPv6](/support/troubleshooting#freeswitch-fails-to-bind-to-port-8021).
=======
If you do not see the line `inet6 ::1/128 scope host` then after you install BigBlueButton you will need to modify the configuration for FreeSWITCH to [disable support for IPV6](/support/troubleshooting#freeswitch-fails-to-bind-to-port-8021).
>>>>>>> v2.5.x-release

Next, check that your server is running Linux kernel 5.x.

```bash
$ uname -r
<<<<<<< HEAD
5.4.x-xx-generic
=======
5.15.x-xx-generic
>>>>>>> v2.5.x-release
```

Next, check that your server has (at least) 8 CPU cores

```bash
$ grep -c ^processor /proc/cpuinfo
8
```

<<<<<<< HEAD
Sometimes we get asked "Why are you only supporting Ubuntu 20.04 64-bit?". The answer is based on choosing quality over quantity. Long ago we concluded that its better for the project to have solid, well-tested, well-documented installation for a specific version of Linux that works really, really well than to try and support may variants of Linux and have none of them work well.

At the moment, the requirement for docker may preclude running 2.5 within some virtualized environments; however, it ensures libreoffice runs within a restricted sandbox for document conversion.  We are exploring if we can run libreoffice within systemd (such as systemd-nspawn).

# Install

To install BigBlueButton, use [bbb-install-2.5.sh](https://github.com/bigbluebutton/bbb-install/blob/master/bbb-install-2.5.sh) script.

The above link gives detailed information on using the script. As an example, the following command installs BigBlueButton 2.5 using hostname `bbb.example.com` and email address (for Let's Encrypt) `notice@example.com`. It installs (or upgrades if the command is rerun later) the latest version of BigBlueButton 2.5 using `-v focal-250`. It also installs the API demos (`-a`) and a firewall (`-w`).

```bash
wget -qO- https://ubuntu.bigbluebutton.org/bbb-install-2.5.sh | bash -s -- -v focal-250 -s bbb.example.com -e notice@example.com  -a -w
```

Note: You can install [Greenlight](/greenlight/v3/install#overview) on the same server by also passing the `-g` option to `bbb-install-2.5.sh`.

After the `bbb-install-2.5.sh` script finishes, you can check the status of your server with `bbb-conf --check`. When you run this command, you should see output similar to the following:

```bash
$ sudo bbb-conf --check
BigBlueButton Server 2.5.0-alpha.5 (135)
                      Kernel version: 5.4.0-97-generic
                        Distribution: Ubuntu 20.04.4 LTS (64-bit)
                              Memory: 16392 MB
                           CPU cores: 8

  /etc/bigbluebutton/bbb-web.properties (override for bbb-web)
  /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties (bbb-web)
         bigbluebutton.web.serverURL: https://bbb.example.com
                  defaultGuestPolicy: ALWAYS_ACCEPT
                   svgImagesRequired: true
                defaultMeetingLayout: SMART_LAYOUT

  /etc/nginx/sites-available/bigbluebutton (nginx)
                         server_name: bbb.example.com
                                port: 80, [::]:80
                                port: 443 ssl

  /opt/freeswitch/etc/freeswitch/vars.xml (FreeSWITCH)
                         local_ip_v4: 133.203.31.211
                     external_rtp_ip: 133.203.31.211
                     external_sip_ip: 133.203.31.211

  /opt/freeswitch/etc/freeswitch/sip_profiles/external.xml (FreeSWITCH)
                          ext-rtp-ip: $${local_ip_v4}
                          ext-sip-ip: $${local_ip_v4}
                          ws-binding: 133.203.31.211:5066
                         wss-binding: 133.203.31.211:7443

  /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml (record and playback)
                       playback_host: bbb.example.com
                   playback_protocol: https
                              ffmpeg: 4.2.4-1ubuntu0.1

  /usr/share/bigbluebutton/nginx/sip.nginx (sip.nginx)
                          proxy_pass: 133.203.31.211
                            protocol: http

  /usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml (Kurento SFU)
  /etc/bigbluebutton/bbb-webrtc-sfu/production.yml (Kurento SFU - override)
                          kurento.ip: 133.203.31.211
                         kurento.url: ws://127.0.0.1:8888/kurento
                      kurento.sip_ip: 133.203.31.211
                 recordScreenSharing: true
                       recordWebcams: true
                    codec_video_main: VP8
                 codec_video_content: VP8

  /usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml (HTML5 client)
  /etc/bigbluebutton/bbb-html5.yml (HTML5 client config override)
                               build: 19
                          kurentoUrl: wss://bbb.example.com/bbb-webrtc-sfu
                    enableListenOnly: true
                      sipjsHackViaWs: true

  /usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml (STUN Server)
                                stun: coturn8.example.com


  # Potential problems described below
  # The following properties in /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties have no value:
  #
  ........
  # Warning: The API demos are installed and accessible from:
  #
  #    https://bbb.example.com
  #
  # and
  #
  #    https://bbb.example.com/demo/demo1.jsp
  #
  # These API demos allow anyone to access your server without authentication
  # to create/manage meetings and recordings. They are for testing purposes only.
  # If you are running a production system, remove them by running:
  #
  #    apt-get purge bbb-demo
=======
Next check that your server has the port 80 and 443 open

```bash
$ sudo ufw status
...
80       ALLOW   Anywhere
443      ALLOW   Anywhere
...
80 (v6)  ALLOW   Anywhere
443 (v6) ALLOW   Anywhere
...
```

If you don't see these lines, you need to open them by

```bash
sudo ufw allow 80
sudo ufw allow 443
```

Sometimes we get asked "Why are you only supporting Ubuntu 22.04 64-bit?". The answer is based on choosing quality over quantity. Long ago we concluded that its better for the project to have solid, well-tested, well-documented installation for a specific version of Linux that works really, really well than to try and support may variants of Linux and have none of them work well.

At the moment, the requirement for docker may preclude running 3.0 within some virtualized environments; however, it ensures libreoffice runs within a restricted sandbox for document conversion.  We are exploring if we can run libreoffice within systemd (such as systemd-nspawn).

## Install

To install BigBlueButton, use [bbb-install.sh](https://github.com/bigbluebutton/bbb-install/blob/v3.0.x-release/bbb-install.sh) script. Notice that this command is slightly different than what we recommended in previous versions of BigBlueButton. The script now resides on a branch specifying the version of BigBlueButton, but otherwise the name of the script is identical accross different branches. This makes it more maintainable as patches done to the script in one branch can be easily applied to other branches.

The above link gives detailed information on using the script. As an example, passing several arguments to the script you can easily have both BigBlueButton and Greenlight or LTI installed on the same server. You could specify if you would like a new certificate to be generated. A firewall could be enabled. For the most up-to-date information, please refer to the instructions in the script. Notice that as of BigBlueButton 2.6 we have retired the API demos. We recommend using Greenlight or [API MATE](https://mconf.github.io/api-mate/) instead.

Note: You can [uninstall Greenlight](/greenlight/v3/install#uninstall) if you do not intend on using it on production.

After the `bbb-install.sh` script finishes, you can check the status of your server with `bbb-conf --check`. When you run this command, you should see output similar to the following:

```bash
$ sudo bbb-conf --check

root@test27:~# bbb-conf --check
BigBlueButton Server 3.0.0-alpha.1 (68)
                    Kernel version: 5.15.0-67-generic
                      Distribution: Ubuntu 22.04.3 LTS (64-bit)
                            Memory: 8140 MB
                         CPU cores: 4

/etc/bigbluebutton/bbb-web.properties (override for bbb-web)
/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties (bbb-web)
       bigbluebutton.web.serverURL: https://test30.bigbluebutton.org
                defaultGuestPolicy: ALWAYS_ACCEPT
              defaultMeetingLayout: CUSTOM_LAYOUT

/etc/nginx/sites-available/bigbluebutton (nginx)
                       server_name: dev30.bigbluebutton.org
                              port: 80, [::]:80127.0.0.1:82 http2 proxy_protocol, [::1]:82 http2127.0.0.1:81 proxy_protocol, [::1]:81

/opt/freeswitch/etc/freeswitch/vars.xml (FreeSWITCH)
                       local_ip_v4: 143.198.37.212
                   external_rtp_ip: 143.198.37.212
                   external_sip_ip: 143.198.37.212

/opt/freeswitch/etc/freeswitch/sip_profiles/external.xml (FreeSWITCH)
                        ext-rtp-ip: $${local_ip_v4}
                        ext-sip-ip: $${local_ip_v4}
                        ws-binding: 143.198.37.212:5066
                       wss-binding: 143.198.37.212:7443

UDP port ranges

                        FreeSWITCH: 16384-24576
                    bbb-webrtc-sfu: null-null
                    bbb-webrtc-recorder: null-null

/usr/local/bigbluebutton/core/scripts/bigbluebutton.yml (record and playback)
                     playback_host: dev30.bigbluebutton.org
                 playback_protocol: https
                            ffmpeg: 4.4.2-0ubuntu0.22.04.1

/usr/share/bigbluebutton/nginx/sip.nginx (sip.nginx)
                        proxy_pass: 143.198.37.212
                          protocol: http

/usr/local/bigbluebutton/bbb-webrtc-sfu/config/default.yml (bbb-webrtc-sfu)
/etc/bigbluebutton/bbb-webrtc-sfu/production.yml (bbb-webrtc-sfu - override)
    mediasoup.webrtc.*.announcedIp: 143.198.37.212
  mediasoup.plainRtp.*.announcedIp: 143.198.37.212
                 freeswitch.sip_ip: 143.198.37.212
                  recordingAdapter: Kurento
               recordScreenSharing: true
                     recordWebcams: true
                  codec_video_main: VP8
               codec_video_content: VP8

/etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml (bbb-webrtc-recorder)
/etc/bigbluebutton/bbb-webrtc-recorder.yml (bbb-webrtc-recorder - override)
               debug: false
               recorder.directory: /var/lib/bbb-webrtc-recorder

/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml (HTML5 client)
/etc/bigbluebutton/bbb-html5.yml (HTML5 client config override)
                             build: 13
                        kurentoUrl: wss://test30.bigbluebutton.org/bbb-webrtc-sfu
            defaultFullAudioBridge: fullaudio
           defaultListenOnlyBridge: fullaudio
                    sipjsHackViaWs: true


# Potential problems described below
>>>>>>> v2.5.x-release

```

Any output that followed `Potential problems` **may** indicate configuration errors or installation errors. In many cases, the messages will give you recommendations on how to resolve the issue.

You can also use `sudo bbb-conf --status` to check that all the BigBlueButton processes have started and are running.

```bash
$ sudo bbb-conf --status
<<<<<<< HEAD
nginx —————————————————► [✔ - active]
freeswitch ————————————► [✔ - active]
redis-server ——————————► [✔ - active]
bbb-apps-akka —————————► [✔ - active]
bbb-fsesl-akka ————————► [✔ - active]
tomcat9 ———————————————► [✔ - active]
mongod ————————————————► [✔ - active]
bbb-html5 —————————————► [✔ - active]
bbb-webrtc-sfu ————————► [✔ - active]
kurento-media-server ——► [✔ - active]
bbb-html5-backend@1 ———► [✔ - active]
bbb-html5-backend@2 ———► [✔ - active]
bbb-html5-frontend@1 ——► [✔ - active]
bbb-html5-frontend@2 ——► [✔ - active]
etherpad ——————————————► [✔ - active]
bbb-web ———————————————► [✔ - active]
bbb-pads ——————————————► [✔ - active]
=======
nginx ————————————————————————————————► [✔ - active]
freeswitch ———————————————————————————► [✔ - active]
redis-server —————————————————————————► [✔ - active]
bbb-apps-akka ————————————————————————► [✔ - active]
bbb-fsesl-akka ———————————————————————► [✔ - active]
mongod ———————————————————————————————► [✔ - active]
bbb-html5 ————————————————————————————► [✔ - active]
bbb-html5-backend@1 ——————————————————► [✔ - active]
bbb-html5-backend@2 ——————————————————► [✔ - active]
bbb-html5-frontend@1 —————————————————► [✔ - active]
bbb-html5-frontend@2 —————————————————► [✔ - active]
bbb-graphql-actions-adapter-server ———► [✔ - active]
bbb-graphql-middleware ———————————————► [✔ - active]
bbb-graphql-server ———————————————————► [✔ - active]
bbb-webrtc-sfu ———————————————————————► [✔ - active]
bbb-webrtc-recorder ——————————————————► [✔ - active]
etherpad —————————————————————————————► [✔ - active]
bbb-web ——————————————————————————————► [✔ - active]
bbb-pads —————————————————————————————► [✔ - active]
bbb-export-annotations ———————————————► [✔ - active]
bbb-rap-caption-inbox ————————————————► [✔ - active]
bbb-rap-resque-worker ————————————————► [✔ - active]
bbb-rap-starter ——————————————————————► [✔ - active]
>>>>>>> v2.5.x-release


```

You can also use `dpkg -l | grep bbb-` to list all the core BigBlueButton packages (your version numbers may be slightly different).

```bash
# dpkg -l | grep bbb-
<<<<<<< HEAD
ii  bbb-apps-akka               2.5-12     all    BigBlueButton Apps (Akka)
ii  bbb-config                  1:2.5-25   amd64  BigBlueButton configuration utilities
ii  bbb-demo                    1:2.5-10   amd64  BigBlueButton API demos
ii  bbb-etherpad                1:2.5-6    amd64  The EtherPad Lite components for BigBlueButton
ii  bbb-freeswitch-core         2:2.5-8    amd64  BigBlueButton build of FreeSWITCH
ii  bbb-freeswitch-sounds       1:2.5-5    amd64  FreeSWITCH Sounds
ii  bbb-fsesl-akka              2.5-11     all    BigBlueButton FS-ESL (Akka)
ii  bbb-html5                   1:2.5-19   amd64  The HTML5 components for BigBlueButton
ii  bbb-learning-dashboard      1:2.5-6    amd64  BigBlueButton bbb-learning-dashboard
ii  bbb-libreoffice-docker      1:2.5-4    amd64  BigBlueButton setup for LibreOffice running in docker
ii  bbb-mkclean                 1:2.5-5    amd64  Clean and optimize Matroska and WebM files
ii  bbb-pads                    1:2.5-3    amd64  BigBlueButton Pads
ii  bbb-playback                1:2.5-4    amd64  BigBlueButton playback
ii  bbb-playback-presentation   1:2.5-7    amd64  BigBluebutton playback of presentation
ii  bbb-record-core             1:2.5-8    amd64  BigBlueButton record and playback
ii  bbb-web                     1:2.5-18   amd64  BigBlueButton API
ii  bbb-webrtc-sfu              1:2.5-14   amd64  BigBlueButton WebRTC SFU


```

With the API demos installed (that was the `-a` option), you can open `https://<hostname>/` in a browser (where `<hostname>` is the hostname you specified in the `bbb-install-2.5.sh` command), enter your name, and click 'Join' to join 'Demo Meeting'. The BigBlueButton client should launch in 'Demo Meeting'.

![BigBlueButton Interface](/img/22-first-install.png)

You can remove them with the command `sudo apt-get purge bbb-demo`.
=======
ii  bbb-apps-akka                      1:3.0-7         all          BigBlueButton Apps (Akka)
ii  bbb-config                         1:3.0-8         amd64        BigBlueButton configuration utilities
ii  bbb-etherpad                       1:3.0-1         amd64        The EtherPad Lite components for BigBlueButton
ii  bbb-export-annotations             1:3.0-2         amd64        BigBlueButton Export Annotations
ii  bbb-freeswitch-core                2:3.0-1         amd64        BigBlueButton build of FreeSWITCH
ii  bbb-freeswitch-sounds              1:3.0-1         amd64        FreeSWITCH Sounds
ii  bbb-fsesl-akka                     1:3.0-5         all          BigBlueButton FS-ESL (Akka)
ii  bbb-graphql-actions-adapter-server 1:3.0-4         amd64        BigBlueButton GraphQL Actions Adapter Server
ii  bbb-graphql-middleware             1:3.0-6         amd64        GraphQL middleware component for BigBlueButton
ii  bbb-graphql-server                 1:3.0-5         amd64        GraphQL server component for BigBlueButton
ii  bbb-html5                          1:3.0-10        amd64        The HTML5 components for BigBlueButton
ii  bbb-html5-nodejs                   1:3.0-1         amd64        Include a specific NodeJS version for bbb-html5
ii  bbb-learning-dashboard             1:3.0-1         amd64        BigBlueButton bbb-learning-dashboard
ii  bbb-libreoffice-docker             1:3.0-1         amd64        BigBlueButton setup for LibreOffice running in docker
ii  bbb-mkclean                        1:3.0-1         amd64        Clean and optimize Matroska and WebM files
ii  bbb-pads                           1:3.0-1         amd64        BigBlueButton Pads
ii  bbb-playback                       1:3.0-1         amd64        Player for BigBlueButton presentation format recordings
ii  bbb-playback-presentation          1:3.0-1         amd64        BigBlueButton presentation recording format
ii  bbb-record-core                    1:3.0-1         amd64        BigBlueButton record and playback
ii  bbb-web                            1:3.0-6         amd64        BigBlueButton API
ii  bbb-webrtc-recorder                1:3.0-1         amd64        BigBlueButton WebRTC Recorder
ii  bbb-webrtc-sfu                     1:3.0-1         amd64        BigBlueButton WebRTC SFU



```

With Greenlight installed (that was the `-g` option), you can open `https://<hostname>/b` in a browser (where `<hostname>` is the hostname you specified in the `bbb-install.sh` command), create a local account, create a room and join it.

![BigBlueButton's Greenlight Interface](/img/greenlight_welcome.png)
>>>>>>> v2.5.x-release

You can integrate BigBlueButton with one of the 3rd party integrations by providing the integration of the server's address and shared secret. You can use `bbb-conf` to display this information using `bbb-conf --secret`.

```bash
$ sudo bbb-conf --secret

       URL: https://bbb.example.com/bigbluebutton/
    Secret: 330a8b08c3b4c61533e1d0c334

      Link to the API-Mate:
      https://mconf.github.io/api-mate/#server=https://bbb.example.com/bigbluebutton/&sharedSecret=330a8b08c3b4c61533e1d0c334
```

<<<<<<< HEAD
The link to API-Mate will open a page at [https://mconf.github.io/api-mate/](https://mconf.github.io/api-mate/) and let you send valid API calls to your server. This makes it easy for testing wihthout the API demos.

## Configure the firewall (if required)

Do you have a firewall between you and your users? If so, see [configuring your firewall](/administration/firewall-configuration).

## Upgrading BigBlueButton 2.5

You can upgrade by re-running the `bbb-install-2.5.sh` script again -- it will download and install the latest release of BigBlueButton 2.5. **note - BigBlueButton alpha versions 1 through 4 shipped on Ubuntu 18.04. If you ventured into trying to install one of those, please rebuild your server with a 20.04 image and only then run bbb-install.

## Upgrading from BigBlueButton 2.4

If you are upgrading BigBlueButton 2.4 or 2.3 we recommend you set up a new Ubuntu 20.04 server with BigBlueButton 2.5 and then [copy over your existing recordings from the old server](/administration/customize#transfer-published-recordings-from-another-server).

## Restart your server
=======
The link to API-Mate will open a page at [https://mconf.github.io/api-mate/](https://mconf.github.io/api-mate/) and let you send valid API calls to your server. This makes it easy for testing wihthout any frontend like Greenlight.

### Configure the firewall (if required)

Do you have a firewall between you and your users? If so, see [configuring your firewall](/administration/firewall-configuration).

### Upgrading BigBlueButton 3.0

You can upgrade by re-running the `bbb-install.sh` script again -- it will download and install the latest release of BigBlueButton 3.0.

### Upgrading from BigBlueButton 2.6 or 2.7

If you are upgrading BigBlueButton 2.6 or 2.7 we recommend you set up a new Ubuntu 22.04 server with BigBlueButton 3.0 and then [copy over your existing recordings from the old server](/administration/customize#transfer-published-recordings-from-another-server).

Make sure you read through the "what's new in 3.0" document https://docs.bigbluebutton.org/3.0/new and especifically https://docs.bigbluebutton.org/3.0/new#other-notable-changes

### Restart your server
>>>>>>> v2.5.x-release

You can restart and check your BigBlueButton server at any time using the commands

```bash
<<<<<<< HEAD
$ sudo bbb-conf --restart
$ sudo bbb-conf --check
=======
sudo bbb-conf --restart
sudo bbb-conf --check
>>>>>>> v2.5.x-release
```

The `bbb-conf --check` scans some of the log files for error messages. Again, any output that followed `Potential problems` **may** indicate configuration errors or installation errors. In many cases, the messages will give you recommendations on how to resolve the issue.

If you see other warning messages check out the [troubleshooting installation](/support/troubleshooting).

<<<<<<< HEAD
## Post installation steps
=======
### Post installation steps
>>>>>>> v2.5.x-release

If this server is intended for production, you should also

- [Secure your system -- restrict access to specific ports](/administration/customize#secure-your-system--restrict-access-to-specific-ports)
- [Configure the server to work behind a firewall](/administration/firewall-configuration) (if you have installed behind a firewall or on a server that has a public/private IP address)
<<<<<<< HEAD
- [remove the API demos](/administration/customize#remove-the-api-demos) (if you had them installed for testing)
=======
- [remove Greenlight](/greenlight/v3/install#uninstall) (if you had it installed and is no longer needed)
>>>>>>> v2.5.x-release
- [Set up a TURN server](/administration/turn-server) (if your server is on the Internet and you have users accessing it from behind restrictive firewalls)
- Test your HTTPS configuration. A well-respected site that can do a series of automated tests is [https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/) - simply enter your server's hostname, optionally check the "Do not show results" check box if you would like to keep it private, then Submit. At time of writing, the configuration shown on this page should achieve an "A" ranking in the SSL Labs test page.

We provide publically accessible servers that you can use for testing:

<<<<<<< HEAD
<!-- - [https://demo.bigbluebutton.org](https://demo.bigbluebutton.org/) - Runs the latest stable of build of BigBlueButton with the Greenlight front-end -->
- [https://test25.bigbluebutton.org](https://test25.bigbluebutton.org) - Runs the latest build (usually ahead of the general release by a few days) BigBlueButton 2.5

To learn more about integrating BigBlueButton with your application, check out the [BigBlueButton API documentation](https://docs.bigbluebutton.org/dev/api.html). To see videos of BigBlueButton HTML5 client, see [https://bigbluebutton.org/html5](https://bigbluebutton.org/html5).

# Other installation options

There are members of the community that provide other installation options for BigBlueButton.

## Ansible
=======
- [https://demo.bigbluebutton.org](https://demo.bigbluebutton.org/) - a pool of BigBlueButton servers with the Greenlight front-end (sometimes the pool is a mix of different BigBlueButton releases)
- [https://test30.bigbluebutton.org](https://test30.bigbluebutton.org) - Runs the general build of BigBlueButton 3.0 - usually a few days behind the repository branch `v3.0.x-release`

To learn more about integrating BigBlueButton with your application, check out the [BigBlueButton API documentation](/development/api). To see videos of BigBlueButton HTML5 client, see [https://bigbluebutton.org/html5](https://bigbluebutton.org/html5).

## Other installation options

There are members of the community that provide other installation options for BigBlueButton.

### Ansible
>>>>>>> v2.5.x-release

If you're looking to deploy a large-scale installation of BBB using [Scalelite](https://github.com/blindsidenetworks/scalelite) then your servers are best managed using tools like Ansible. A few reasons you might go with this setup are:

- easily customizable: your custom configurations will get replaced every time you upgrade automatically
- parity across machines: ensure that you deploy the exact same version of BBB on every server
<<<<<<< HEAD
- eliminate human error in setup: using bbb-install-2.5.sh or step-by-step methods are highly prone to human error as you can easily forget if you enabled a setting, chose to do X over Y, etc
=======
- eliminate human error in setup: using bbb-install.sh or step-by-step methods are highly prone to human error as you can easily forget if you enabled a setting, chose to do X over Y, etc
>>>>>>> v2.5.x-release
- automate to the fullest: by automating the process, you inherently save time on nasty troubleshooting and hours lost in manual configuration
- easily scale at large: spin up an identical replica of your BBB server in less than 15 mins with no user input -- preconfigured and ready to go

Choose this method if you are already comfortable with a lot of the technical knowledge behind BigBlueButton, Scalelite and Greenlight/other front-ends. Refer to the following examples to create your installation.

Note: These examples are _not_ maintained or developed by the official BigBlueButton developers. These are entirely community-sourced, use at your own discretion.

<<<<<<< HEAD
These first two install BigBlueButton on your server in a consistent fashion. You can specify variables, such as whether to install Greenlight too, what ports to use for TURN, and others. Functionally quite similar to bbb-install-2.5.sh but highly automated.
=======
These first two install BigBlueButton on your server in a consistent fashion. You can specify variables, such as whether to install Greenlight too, what ports to use for TURN, and others. Functionally quite similar to bbb-install.sh but highly automated.
>>>>>>> v2.5.x-release

- [General Ansible role for BigBlueButton](https://github.com/n0emis/ansible-role-bigbluebutton)
- [Alternative Ansible role for BigBlueButton](https://github.com/juanluisbaptiste/ansible-bigbluebutton)

Large scale deployments must include several other components in addition to the core BigBlueButton packages. These include Scalelite, Greenlight, a database, backups, nginx configurations, and more.

- [Full out-of-the-box setup with wiki, chat, backups](https://github.com/stadtulm/a13-ansible)
- [Full out-of-the-box setup with frontend on one machine](https://github.com/srcf/timeout)
- [Full setup for a university](https://github.com/unistra/bigbluebutton/)
- [Full HA setup with PeerTube, Conferences Streaming, EFK, Prometheus, backups](https://github.com/Worteks/bbb-ansible)

<<<<<<< HEAD
# Customizations

## Increase number of processes for nodejs

See [the HTML5 section on the Architecture page](/development/architecture#scalability-of-html5-server-component)

## Increase number of recording workers

Previous versions of BigBlueButton used a single thread for processing recordings. BigBlueButton 2.5 uses [resque](https://github.com/resque/resque) to spawn multiple recording workers for processing recordings.

By default, `/usr/lib/systemd/system/bbb-rap-resque-worker.service` defines one recording worker `Environment=COUNT=1`.

```
[Unit]
Description=BigBlueButton resque worker for recordings

[Service]
Type=simple
ExecStart=/bin/sh -c '/usr/bin/rake -f ../Rakefile resque:workers >> /var/log/bigbluebutton/bbb-rap-worker.log'
WorkingDirectory=/usr/local/bigbluebutton/core/scripts
Environment=QUEUE=rap:archive,rap:publish,rap:process,rap:sanity,rap:captions
Environment=COUNT=1
# Environment=VVERBOSE=1
User=bigbluebutton
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

If you want 3 recording workers, for example, the steps below show how to add a systemd override file in `/etc/systemd/system/bbb-rap-resque-worker.service.d/override.conf` that sets `Environment=COUNT=3` and restarts the `bbb-rap-resque-worker.service` service.

<!-- TODO remove when 12503 is resolved -->

**Note**: We have discovered an issue with having more than one worker present at a time if `defaultKeepEvents` or `meetingKeepEvents` in bbb-web is enabled. This is being currently addressed. For more information here is a [link to the issue description](https://github.com/bigbluebutton/bigbluebutton/issues/12503).

```
# mkdir -p /etc/systemd/system/bbb-rap-resque-worker.service.d
# cat > override.conf << HERE
[Service]
Environment=COUNT=3
HERE
# systemctl daemon-reload
# systemctl restart bbb-rap-resque-worker.service
# systemctl status bbb-rap-resque-worker.service
● bbb-rap-resque-worker.service - BigBlueButton resque worker for recordings
   Loaded: loaded (/usr/lib/systemd/system/bbb-rap-resque-worker.service; disabled; vendor preset: enabled)
  Drop-In: /etc/systemd/system/bbb-rap-resque-worker.service.d
           └─override.conf
   Active: active (running) since Sat 2021-01-09 12:19:22 UTC; 6s ago
 Main PID: 23630 (sh)
    Tasks: 15 (limit: 4915)
   CGroup: /system.slice/bbb-rap-resque-worker.service
      ├─23630 /bin/sh -c /usr/bin/rake -f ../Rakefile resque:workers >> /var/log/bigbluebutton/bbb-rap-worker.log
      ├─23631 /usr/bin/ruby /usr/bin/rake -f ../Rakefile resque:workers
      ├─23650 resque-2.0.0: Waiting for rap:archive,rap:publish,rap:process,rap:sanity,rap:captions
      ├─23651 resque-2.0.0: Waiting for rap:archive,rap:publish,rap:process,rap:sanity,rap:captions
      └─23652 resque-2.0.0: Waiting for rap:archive,rap:publish,rap:process,rap:sanity,rap:captions

```

`systemctl status bbb-rap-resque-worker.service` shows three resque workers ready to process up to three recordings in parallel.

The processing of recordings is also much faster thanks to the work of [abatu](https://github.com/abautu) in the community (see [#2483](https://github.com/bigbluebutton/bigbluebutton/issues/2483)).

## Run three Kurento servers

Recommend running [three parallel Kurento servers](/administration/customize#run-three-parallel-kurento-media-servers).

## Local overrides for configuration settings

The full description for local overrides for configuration files was moved to [Administration -> Configuration Files](/administration/configuration-files#local-overrides-for-configuration-settings)

## Installing additional recording processing formats

In addition to the `presentation` format that is installed and enabled by default, there are several optional recording formats available for BigBlueButton:

- `notes`: Makes the shared notes from the meeting available as a document.
- `screenshare`: Generate a single video file from the screensharing and meeting audio.
- `podcast`: Generate an audio-only recording.

The processing scripts and playback support files for these recording formats can be installed from the packages named `bbb-playback-formatname` (e.g. `bbb-playback-notes`)

There is currently an issue where the recording formats are not automatically enabled when they are installed - see [#12241](https://github.com/bigbluebutton/bigbluebutton/issues/12241) for details.

In order to enable the recording formats manually, you need to edit the file `/usr/local/bigbluebutton/core/scripts/bigbluebutton.yml`. Look for the section named `steps:`. In this section, the recording processing workflow is defined, including what recording processing steps are performed, and what order they need to be performed in.

To enable a new recording format, you need to add a new step named `process:formatname` that runs after the step named captions, and a new step named `publish:formatname` that runs after `process:formatname`. You may have to convert some of the steps to list format.

For example, here are the stock steps in BigBlueButton 2.5 with the `presentation` format enabled:

```yml
steps:
  archive: 'sanity'
  sanity: 'captions'
  captions: 'process:presentation'
  'process:presentation': 'publish:presentation'
```

If you additionally enable the `notes` recording format, the steps will have to be changed to look like this:

```yml
steps:
  archive: 'sanity'
  sanity: 'captions'
  captions:
    - 'process:presentation'
    - 'process:notes'
  'process:presentation': 'publish:presentation'
  'process:notes': 'publish:notes'
```

This pattern can be repeated for additional recording formats. Note that it's very important to put the step names containing a colon (`:`) in quotes.

After you edit the configuration file, you must restart the recording processing queue: `systemctl restart bbb-rap-resque-worker.service` in order to pick up the changes.

# Troubleshooting

## Package locales-all is not available
=======
## Customizations

See the [Server customization page](/administration/customize) for things you can do to adapt BigBlueButton to your environment or enable optional features after installation. For example

- [Install additional recording processing formats](/administration/customize#install-additional-recording-processing-formats)
- [Enable generating mp4 (H.264) video output](/administration/customize#enable-generating-mp4-h264-video-output)

## Troubleshooting

### Package locales-all is not available
>>>>>>> v2.5.x-release

The package `bbb-libreoffice` needs to build a docker image for libreoffice. If you receive the following error when installing on a network behind a firewall

```
Package locales-all is not available, but is referred to by another package.
This may mean that the package is missing, has been obsoleted, or
is only available from another source

E: Package 'locales-all' has no installation candidate
E: Unable to locate package libxt6
E: Unable to locate package libxrender1
The command '/bin/sh -c apt -y install locales-all fontconfig libxt6 libxrender1' returned a non-zero code: 100
dpkg: error processing package bbb-libreoffice-docker (--configure):
 installed bbb-libreoffice-docker package post-installation script subprocess returned error exit status 100
```

<<<<<<< HEAD
Ubuntu 20.04 uses systemd-resolved, which presents a local caching resolver and registers this at `/etc/resolv.conf`. If you get they above error and have a local name server, such as `10.11.12.13`, then try adding it with the hosts `resolv.conf`.
=======
Ubuntu 22.04 uses systemd-resolved, which presents a local caching resolver and registers this at `/etc/resolv.conf`. If you get they above error and have a local name server, such as `10.11.12.13`, then try adding it with the hosts `resolv.conf`.
>>>>>>> v2.5.x-release

```
echo "nameserver 10.11.12.13" > /etc/resolv.conf
```

For more details see [this issue](https://github.com/bigbluebutton/bbb-install/issues/385).

<<<<<<< HEAD
# Feedback and reporting bugs

If you found a reproducible bug, please report it in the [GitHub Issues section](https://github.com/bigbluebutton/bigbluebutton/issues) with steps to reproduce (this will make it easier for the developers to fix the bug). Indicate in the body of the bug report that this applies to BigBlueButton 2.5 and give us the client build number, which you can find either with `dpkg -l | grep bbb-html5` or within the client in the `Settings -> About` menu..
=======
## Feedback and reporting bugs

If you found a reproducible bug, please report it in the [GitHub Issues section](https://github.com/bigbluebutton/bigbluebutton/issues) with steps to reproduce (this will make it easier for the developers to fix the bug). Indicate in the body of the bug report that this applies to BigBlueButton 3.0 and give us the client build number, which you can find either with `dpkg -l | grep bbb-html5` or within the client in the `Settings -> About` menu..
>>>>>>> v2.5.x-release
