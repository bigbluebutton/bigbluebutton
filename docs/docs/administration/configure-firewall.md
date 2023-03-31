---
id: configure-firewall
slug: /administration/firewall-configuration
title: Firewall Configuration
sidebar_position: 4
description: BigBlueButton Firewall Configuration
keywords:
- configuration
- firewall
---

This document covers firewall configuration for BigBlueButton 2.2.

You should configure your firewall before [Installing BigBlueButton](/administration/install); otherwise, you may get errors during the installation and will be unable to test BigBlueButton after the installation completes.

If you are a developer setting up BigBlueButton on a local VM for testing, you can skip this section.

## Overview

The easiest network configuration for installing BigBlueButton is on a server that has a single external IP address and the server is on the public Internet (and thus directly accessible by your users). Port-based access firewalling is implemented using [UFW](/administration/customize#setup-a-firewall). Here is an example of such a setup with the BigBlueButton server having a (fictional) IP address 203.0.113.1 with hostname `bigbluebutton.example.com`.

![Install](/img/11-install-net0.png)

In this simple network configuration, BigBlueButton should work out-of-the-box after installation. This is because the packaging scripts automatically configure BigBlueButton using the first non-loopback IP address, whereas access to sensitive ports is blocked.
A variation of this setup occurs when the server has multiple network interfaces, but the external IP is still the first network interface (such as `eth0`) picked up by the installation scripts.

![Install](/img/11-install-net1.png)

If your server has `eth0` pointing to the external IP address on the internet, and there is no external firewall in place, then the packaging scripts should detect this external IP address and configure BigBlueButton accordingly. You don't need to do any of the changes below.

Don't worry if your server's IP address changes, BigBlueButton comes with a configuration utility called `bbb-conf` that lets you change all of BigBlueButton's configuration files to use any IP address or hostname.

If there is an IPv4 Network Address Translation (NAT) between your users and the BigBlueButton server, then you will need to first configure the firewall to forward specific TCP/UDP connections from external clients to the internal BigBlueButton server; otherwise, users will not be able to access BigBlueButton.

The following diagram gives a typical setup with an external firewall (your setup will, of course, have different IP address and hostnames).

![Install](/img/11-install-net2.png)

In this example, all users must connect to the BigBlueButton server via the uniform resource locator (URL) `https://bigbluebutton.example.com/`. This hostname resolves to the IP address 203.0.113.1 which is the firewall. The firewall must forward specific connections (described below) to the BigBlueButton server running at IP address 10.0.2.12.

## Configure your firewall

When BigBlueButton is protected behind a firewall, you need to configure the firewall to forward the following incoming connections to BigBlueButton:

- TCP/IP port 22 (for SSH)
- TCP/IP ports 80/443 (for HTTP/HTTPS)
- UDP ports in the range 16384 - 32768 (for FreeSWITCH/HTML5 RTP streams)

### EC2

If you are using EC2, you should also assign your server an [Elastic IP address](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html) to prevent it from getting a new IP address on reboot.

### Azure

On Microsot Azure, when you create an instance you need to add the following inbound port rules to enable incomming connections on ports 80, 443, and UDP port range 16384-32768:

![Azure Cloud ](/img/azure-firewall.png?raw=true 'Azure 80, 443, and UDP 16384-32768')

### Google Compute Engine

On Google Compute Engine, when you create an instance you need to enable traffic on port 80 and 443.

![Google Compute Engine 80-443](/img/gce-80-443.png?raw=true 'GCE 80 and 443')

After the instance is created, you need to add a firewall rule to allow incoming UDP traffic on the port range 16384-32768.

![Google Compute Engine Firewall](/img/gce-firewall.png?raw=true 'GCE Firewall')

## Testing the firewall

After you have made the changes to you firewall settings, before proceeding to the installation, take a moment and test that you have configured the firewall to correctly forward the above connections (this will save you time later on if you encounter issues).

To test connections on various ports needed by BigBlueButton, you will use a tool called `netcat` to listen for connections. You'll use `netcat` on the BigBlueButton server and on external server (outside the firewall) to generate connections. If the connections test fail, then the firewall is forwarding the packets.

First, install `netcat` on the BigBlueButton using the following command:

```bash
$ sudo apt-get install netcat
```

Next, stop BigBlueButton with the command `sudo bbb-conf --stop`. This frees up the ports we want to test. We can now run `netcat` to listen on ports and try connecting from an external computer. As root, run the following command:

```bash
$ netcat -l 443
```

`netcat` is now going to echo to the terminal any text it receives on port 443 (you can quit the command later using Ctrl-c).

Next, on a second computer that is external to the firewall -- that is, it must go through the firewall to access the BigBlueButton server -- install `netcat` as well. Replace `EXTERNAL_HOST_NAME` with the hostname of your firewall, run the following command

```bash
$ netcat EXTERNAL_HOST_NAME 443
```

and type type the word 'test' and press ENTER.

If the firewall is forwarding incoming connections on port 443 to the internal BigBlueButton server, you should see the word 'test' appear after the `netcat -l 443` command, as in

```bash
$ netcat -l 443
test
```

If the word `test` does not appear, double-check the firewall configuration to ensure its forwarding connections on port 443 and then test again. You want to see the word `test` appear before proceeding to the installation BigBlueButton.

Repeat these tests with port 80.

That covers the TCP/IP ports. Next, we need to test that UDP connections in the range 16384-32768 are forwarded as well. On your BigBlueButton server, run the following `netcat` command to listen for incoming data via UDP on port 17000 (here, we're picking a port in the range 16384-32768).

```bash
$ netcat -u -l 17000
```

Again, on a computer outside the firewall, replace `EXTERNAL_HOST_NAME` with the hostname of your firewall and run the command

```bash
$ netcat -u EXTERNAL_HOST_NAME 17000
```

Type 'test2' into the terminal and press ENTER. You should see the word 'test2' appear on the terminal of the BigBlueButton server, as in

```bash
$ netcat -u -l 17000
test2
```

As before, it the above test fails, double-check the settings of the firewall to ensure its properly fording UDP packets in the range 16384-32768 and test again.

When BigBlueButton is running on a server, various component of BigBlueButton need to make connections to itself using the external hostname. Programs running within the BigBlueButton server that try to connect to the external hostname should reach BigBlueButton itself.

To enable the BigBlueButton server to connect to itself using the external hostname, edit file `/etc/hosts` and add the line

```
EXTERNAL_IP_ADDRESS EXTERNAL_HOST_NAME
```

where `EXTERNAL_IP_ADDRESS` with the external IP of your firewall and `EXTERNAL_HOST_NAME` with the external hostname of your firewall. For example, using the configuration in the above diagram, the addition to `/etc/hosts` would be

```
172.34.56.78 bigbluebutton.example.com
```

At this point, proceed with the [installation of BigBlueButton](/administration/install) and, after the install is finished, configure BigBlueButton to use your firewall using the steps in the next section.

## Configure BigBlueButton to work with your firewall

### Updating mediasoup

In BigBlueButton 2.5 or later, the HTML5 client uses **mediasoup** to send/receive WebRTC streams. If you are installing on a BigBlueButton server behind a firewall that uses network address translation (NAT), you need to make sure mediasoup has its external addresses properly configured.

Keep in mind the following steps should already be done by bbb-install in an IPv4 environment.

To configure appropriate external addresses, bbb-webrtc-sfu's [override configuration file](/administration/configuration-files) (located in `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`) should be used. If `production.yml` or `/etc/bigbluebutton/bbb-webrtc-sfu/` aren't present, it's sufficient to just create them with appropriate permissions and ownership rules.

For example: in a BigBlueButton server with a public IPv4 address `192.0.2.0`, the configuration responsible for specifying the external addresses in mediasoup should be of the following format (YAML syntax, `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`):

```yaml
mediasoup:
  webrtc:
    listenIps:
      - ip: 0.0.0.0
        announcedIp: 192.0.2.0
```

Notice the `listenIps` key is an **array**. If you need mediasoup to work with **IPv6** as well, don't forget to add another entry to that array with it. For example: in a BigBlueButton server with a public IPv4 `192.0.2.0` and IPv6 `2001:db8::`, the configuration should be of the following format (YAML syntax, `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml`):

```yaml
mediasoup:
  webrtc:
    listenIps:
      - ip: 0.0.0.0
        announcedIp: 192.0.2.0
      - ip: 2001:db8::
```

Restart BigBlueButton to apply the changes.

### Updating Kurento

#### Extra steps when server is behind NAT

In BigBlueButton 2.4 or lower, the HTML5 client uses Kurento Media Server to send/receive WebRTC video streams. If you are installing on a BigBlueButton server behind a firewall that uses network address translation (NAT), you need to make sure Kurento has its external address properly configured.

Keep in mind the following steps should already be done by bbb-install.

To configure an appropriate external address in Kurento, you need to edit `/etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini` and uncomment and assign values for `externalIPv4`. Here's the relevant section in the default configuration.

```ini
# cat /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
[...]
;; External IPv4 and IPv6 addresses of the media server.
;;
;; Forces all local IPv4 and/or IPv6 ICE candidates to have the given address.
;; This is really nothing more than a hack, but it's very effective to force a
;; public IP address when one is known in advance for the media server. In doing
;; so, KMS will not need a STUN or TURN server, but remote peers will still be
;; able to contact it.
;;
;; You can try using these settings if KMS is deployed on a publicly accessible
;; server, without NAT, and with a static public IP address. But if it doesn't
;; work for you, just go back to configuring a STUN or TURN server for ICE.
;;
;; Only set this parameter if you know what you're doing, and you understand
;; 100% WHY you need it. For the majority of cases, you should just prefer to
;; configure a STUN or TURN server.
;;
;; <externalIPv4> is a single IPv4 address.
;; <externalIPv6> is a single IPv6 address.
;;
;externalIPv4=198.51.100.1
;externalIPv6=2001:0db8:85a3:0000:0000:8a2e:0370:7334
[...]
```

For example, in a BigBlueButton server with a public IPv4 address of 192.0.2.0, edit the line with `externalIPv4` as follows:

```ini
externalIPv4=192.0.2.0
```

### Update FreeSWITCH

Let's revist the typical setup for BigBlueButton behind a firewall (yours would have different IP address of course).

![Install](/img/11-install-net2.png)

For WebRTC audio to work, FreeSWITCH needs to listen for connections on the external IP address of the firewall. If you haven't modified your firewall to forward ports to your BigBlueButton server, see [configure a firewall](#configure-your-firewall).

With the firewall configured to forward incoming connections to the BigBlueButton server, the next step is to configure FreeSWITCH to bind to the firewall's external IP address.

Edit the following files and substitute EXTERNAL_IP_ADDRESS for the external IP address (not the external hostname).

Edit `/opt/freeswitch/conf/vars.xml`, and change

```xml
<X-PRE-PROCESS cmd="set" data="external_rtp_ip=stun:stun.freeswitch.org"/>
```

To

```xml
<X-PRE-PROCESS cmd="set" data="external_rtp_ip=EXTERNAL_IP_ADDRESS"/>
```

Change

```xml
<X-PRE-PROCESS cmd="set" data="external_sip_ip=stun:stun.freeswitch.org"/>
```

To

```xml
<X-PRE-PROCESS cmd="set" data="external_sip_ip=EXTERNAL_IP_ADDRESS"/>
```

Next, edit `/opt/freeswitch/conf/sip_profiles/external.xml` and change

```xml
    <param name="ext-rtp-ip" value="$${local_ip_v4}"/>
    <param name="ext-sip-ip" value="$${local_ip_v4}"/>
```

to

```xml
    <param name="ext-rtp-ip" value="$${external_rtp_ip}"/>
    <param name="ext-sip-ip" value="$${external_sip_ip}"/>
```

In the same file make sure to change

```xml
    <param name="local-network-acl" value="localnet.auto"/>
```

to

```xml
    <param name="local-network-acl" value="none"/>
```

so that FreeSWITCH announces the external IP address when a connection is established.

Check `/etc/bigbluebutton/nginx/sip.nginx` to ensure its binding to the external IP address of the firewall.

Check that `enableListenOnly` is set to true in `/etc/bigbluebutton/bbb-html5.yml`, as in

```bash
$ grep enableListenOnly /etc/bigbluebutton/bbb-html5.yml
    enableListenOnly: true
```

Next, edit `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml` change the value to `ip` to match the external IP address of the server.

```yaml
freeswitch:
  ip: 203.0.113.1
  sip_ip: 172.30.1.145
  port: 5066
```

If your runnig 2.2.29 or later, the value of `sip_ip` depends on whether you have `sipjsHackViaWs`
set to true or false in `/etc/bigbluebutton/bbb-html5.yml`.

You also need to [setup Kurento to use a STUN server](#extra-steps-when-server-is-behind-nat).

After making the above changes, restart BigBlueButton.

```bash
$ bbb-conf --restart
```

To test, launch FireFox and try connecting to your BigBlueButton server and join the audio.
If you see the words '[ WebRTC Audio ]' in the lower right-hand corner, it worked.

If it didn't work, there are two likely error messages when you try to connect with audio.

Detected the following WebRTC issue: Error 1002: Could not make a WebSocket connection. Do you want to try Flash instead?

| ErrorDetected the following WebRTC issue    | Probable Cause |
| ------------------------------------------- | -------------- |
| 1002: Could not make a WebSocket connection | Note 1         |
| 1007: ICE negotiation failed                | Note 2         |

For Error 1002, check IP address for `proxy_pass` in `/etc/bigbluebutton/nginx/sip.nginx` is pointing to the external IP address of the firewall. Next, check that FreeSWITCH has started without errors

```
## systemctl status freeswitch
● freeswitch.service - freeswitch
   Loaded: loaded (/lib/systemd/system/freeswitch.service; enabled; vendor preset: enabled)
   Active: <span style="color:#980000;font-weight:bold">active (running)</span> since Fri 2017-03-03 23:13:07 UTC; 48min ago
  Process: 19349 ExecStart=/opt/freeswitch/bin/freeswitch -u freeswitch -g daemon -ncwait $DAEMON_OPTS (code=exited, status=0/SUCCESS)
 Main PID: 19361 (freeswitch)
    Tasks: 36
   Memory: 41.4M
      CPU: 20.744s
   CGroup: /system.slice/freeswitch.service
           └─19361 /opt/freeswitch/bin/freeswitch -u freeswitch -g daemon -ncwait -nonat

Mar 03 23:13:05 t4 systemd[1]: Starting freeswitch...
Mar 03 23:13:05 t4 freeswitch[19349]: 19361 Backgrounding.
Mar 03 23:13:07 t4 freeswitch[19349]: FreeSWITCH[19349] Waiting for background process pid:19361 to be ready.....
Mar 03 23:13:07 t4 freeswitch[19349]: FreeSWITCH[19349] System Ready pid:19361
Mar 03 23:13:07 t4 systemd[1]: Started freeswitch.
```

You should see `active (running)`. If FreeSWITCH is not running, you can check it's output log for clues on why it's not running `journalctl -u freeswitch.service`. If you continue to see the Error 1002, check the diagnostic stops below, under [Configure a dummy NIC](#configure-a-dummy-nic-if-required).

For Error 1007, it means that the web socket connect was successful (FreeSWITCH is running and received the request from the browser to setup a media path), but none of the IP/Port combinations returned by FreeSWITCH enabled the browser to connect and start transmitting media. To diagnose this error, open `about:webrtc` in FireFox and click ‘show details’ for the most recent connection. Look under the column Remote Candidate and check if you see the internal IP address of the BigBlueButton server. If so, you probably have a misconfiguration in the FreeSWITCH settings. Re-check against the examples shown above.

If the correct IP address is shown, you probably have an issue where your firewall isn't allowing UDP packets through in both directions on the required ports. Check your firewall documentation for help, or ask the BigBlueButton community mailing list.

### Configure a dummy NIC (if required)

If you are encountering error 1002 when trying to connect to WebRTC audio, it might be that your firewall does not support "hairpin NAT", which means when the BigBlueButton server connects to the firewall's IP address, the firewall is not sending the connection right back.

You can test if hairpin NAT is working using following command on your BigBlueButton server. Replace `EXTERNAL-IP-ADDRESS` with the external IP address of your firewall.

```bash
$ curl --trace-ascii - -k https://EXTERNAL-IP-ADDRESS:443/bigbluebutton/api
```

Here's the sample output from a success test.

```
~# curl --trace-ascii - -k https://203.0.113.1:443/bigbluebutton/api
== Info:   Trying 203.0.113.1...
== Info: Connected to 203.0.113.1 (203.0.113.1) port 443 (#0)
== Info: found 173 certificates in /etc/ssl/certs/ca-certificates.crt
== Info: found 692 certificates in /etc/ssl/certs
== Info: ALPN, offering http/1.1
== Info: SSL connection using TLS1.2 / ECDHE_RSA_AES_128_GCM_SHA256
== Info:         server certificate verification SKIPPED
== Info:         server certificate status verification SKIPPED
== Info:         common name: HOSTNAME (does not match '203.0.113.1')
== Info:         server certificate expiration date OK
== Info:         server certificate activation date OK
== Info:         certificate public key: RSA
== Info:         certificate version: #3
== Info:         subject: CN=bbb02.monasticeducation.net
== Info:         start date: Fri, 24 Feb 2017 06:20:00 GMT
== Info:         expire date: Thu, 25 May 2017 06:20:00 GMT
== Info:         issuer: C=US,O=Let's Encrypt,CN=Let's Encrypt Authority X3
== Info:         compression: NULL
== Info: ALPN, server accepted to use http/1.1
=> Send header, 93 bytes (0x5d)
0000: GET /bigbluebutton/api HTTP/1.1
0021: Host: 203.0.113.1
0035: User-Agent: curl/7.47.0
004e: Accept: */*
005b:
<= Recv header, 17 bytes (0x11)
...
<response><returncode>SUCCESS</returncode><version>1.0</version></response>== Info: Connection #0 to host 203.0.113.1 left intact
```

You should see the `<response>...</response>` at the end.

If you don't see this, follow the steps below on your BigBlueButton server to setup a dummy NIC that has the same IP address as your firewall. Here's a sample diagram of how it works.

![Install](/img/11-install-net3.png)

In this diagram, we've setup a dummy NIC for 203.0.113.1, which will allow FreeSWITCH to connect back to itself. This way, when FreeSWICH receives an internal connection from other parts of BigBlueButton, it will think that it's on the external interface. This will cause it to use the correct IP address on the response.

To setup a dummy NIC, on your BigBlueButton enter the following command and substitute `EXTERNAL_IP_ADDRESS` with the external IP address of your firewall.

```bash
$ sudo ip addr add EXTERNAL\_IP\_ADDRESS/32 dev lo
```

Next, check that the dummy NIC was created using the command `ip addr`.

```bash
$ ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet EXTERNAL_IP_ADDRESS/32 scope global lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
```

You should see the EXTERNAL_IP_ADDRESS for your firewall listed above.

Next, edit `/opt/freeswitch/conf/sip_profiles/external.xml` and ensure the value for `wss-binding` uses the external IP address

```xml
<param name="wss-binding"  value="EXTERNAL_IP_ADDRESS:7443"/>
```

At this point, restart your BigBlueButton server with `bbb-conf --restart`, then try connecting to the WebRTC media again.

Finally, to ensure this dummy NIC to be automatically created on restart, edit `/etc/network/interfaces` and add the following

```
# The loopback network interface
auto lo
iface lo inet loopback
        post-up ip addr add EXTERNAL_IP_ADDRESS/32 dev lo
        pre-down ip addr del EXTERNAL_IP_ADDRESS/32 dev lo
```

The above will enable users outside the firewall to access your BigBlueButton server.

For users themselves who are behind a firewall, you will want to setup a TURN server (previous section).
