---
id: turn-server
slug: /administration/turn-server
title: Turn Server Configuration
sidebar_position: 7
description: BigBlueButton Turn Server Configuration
keywords:
- coturn
- turn server
---

## TURN in BigBlueButton

BigBlueButton normally requires a wide range of UDP ports to be available for WebRTC communication. In some network restricted sites or development environments, such as those behind NAT or a firewall that restricts outgoing UDP connections, users may be unable to make outgoing UDP connections to your BigBlueButton server.

The [TURN protocol](https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT) is designed to allow UDP-based communication flows like WebRTC to bypass NAT or firewalls by having the client connect to the TURN server, and then have the TURN server connect to the destination on their behalf. The TURN server also implements the STUN protocol, used to allow direct UDP connections through certain types of firewalls which otherwise might not work.

Using a TURN server under your control improves the success of connections to BigBlueButton and also improves user privacy, since the clients no longer send their IP addresses to a public STUN server.

### The TURN server installed by bbb-install.sh

`bbb-install.sh` installs a TURN server on the BigBlueButton server itself unless you pass `-c` (see [below](#configure-bigbluebutton-to-use-your-turn-server)). You don't need any additional configuration for it. It sets up:

- the `bbb-coturn` package (coturn 4.16.0, see [Using the bbb-coturn package](#using-the-bbb-coturn-package)), configured in `/etc/turnserver.conf` with a random shared secret, listening on port 3478 (TCP and UDP) and relaying only to the server's own IP address, with relay ports 32769-65535;
- HAProxy on port 443: it terminates TLS and hands connections that negotiate the `stun.turn` ALPN protocol to coturn on port 3478, and everything else to nginx. This is how TURN over TLS on port 443 and the web client share one port;
- `/usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml` with two entries, `turn:<hostname>:3478` and `turns:<hostname>:443?transport=tcp`, and the shared secret. The `bbb-web` package overwrites this file on upgrades; re-running `bbb-install.sh`, which is how BigBlueButton is upgraded, writes it again;
- the firewall rule for port 3478 (`bbb-conf --setip` opens it while HAProxy is running) and the log in `/var/log/turnserver/turnserver.log`, rotated daily.

### When to set up a separate TURN server

The rest of this page covers a TURN server on its own host, for example when several BigBlueButton servers should share one TURN server, or when the relayed media should not use the BigBlueButton server's bandwidth. The TURN protocol is not CPU or memory intensive. Since it's only used during connection setup (for STUN) and as a fallback for users who would otherwise be unable to connect, the bandwidth requirements aren't particularly high. For a moderate number of BigBlueButton servers, a single small VPS is usually sufficient.

Having multiple IP addresses may improve the results when using STUN with certain types of firewalls, but is not usually necessary.

Having the server behind NAT (for example, on Amazon EC2) is OK, but all incoming UDP and TCP connections on any port must be forwarded and not firewalled.

## Set up a dedicated TURN server

### Required software

We recommend using a minimal server installation of Ubuntu 24.04. In the configuration recommended below, [coturn](https://github.com/coturn/coturn) listens on port 443 itself, which means the server cannot have any dashboard software or other web applications running on that port.

Ubuntu 24.04 ships coturn 4.6.1, which can be installed with apt-get:

```bash
$ sudo apt-get update
$ sudo apt-get install coturn
```

Note: coturn will not start until a configuration is applied (see below).

#### Using the bbb-coturn package

The `bbb-coturn` package provides a newer coturn (4.16.0) built by the BigBlueButton project. It is what `bbb-install.sh` installs on the BigBlueButton server; it is not a dependency of the `bigbluebutton` package, so it is not pulled in when you install BigBlueButton by other means.

`bbb-coturn` is a drop-in replacement for the distro `coturn` package. It declares `Provides`/`Conflicts`/`Replaces` on `coturn`, so apt removes the distro package when you install it, and it keeps the same `/usr/bin/turnserver` binary, `/etc/turnserver.conf` config file, and `coturn.service` unit name (a `turnserver.service` alias is included). Everything else on this page applies unchanged, including the systemd override below.

To install it on a dedicated TURN server, add the BigBlueButton package repository for the release you are running, then install the package. Replace `<version>` with the value you pass to `bbb-install.sh -v`; it is also in `/etc/apt/sources.list.d/bigbluebutton.list` on your BigBlueButton server:

```bash
$ sudo mkdir -p /etc/apt/keyrings
$ sudo wget https://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc -O /etc/apt/keyrings/bigbluebutton.asc
$ echo "deb [signed-by=/etc/apt/keyrings/bigbluebutton.asc] https://ubuntu.bigbluebutton.org/<version> bigbluebutton-noble main" | sudo tee /etc/apt/sources.list.d/bigbluebutton.list
$ sudo apt-get update
$ sudo apt-get install bbb-coturn
```

Note: like the distro package on a fresh install, `bbb-coturn` does not start coturn for you, and it does not enable the service either. The `/etc/turnserver.conf` it ships is the stock upstream example with every option commented out, and coturn defaults to anonymous access in that state, which would be an open relay. Configure `/etc/turnserver.conf` as described below, then enable and start it:

```bash
$ sudo systemctl enable --now coturn
```

`bbb-coturn` also creates the log directory `/var/log/turnserver` and installs the log rotation described below, so with this package you can skip those two steps.

##### Upgrading a server that already runs a configured coturn

Installing `bbb-coturn` on a server whose `/etc/turnserver.conf` is already configured (by `bbb-install.sh` or by hand) triggers a dpkg configuration file prompt, because the package ships a different (pristine) copy of that file. Answer `N` (the default) to keep your working configuration; the packaged copy is saved alongside as `/etc/turnserver.conf.dpkg-dist` for reference.

Replacing the distro package also leaves the service stopped: apt stops coturn while removing the old package, and `bbb-coturn` does not start services on install. Start it again with:

```bash
$ sudo systemctl enable --now coturn
```

coturn 4.16.0 no longer recognizes some options that 4.6.1-era configurations carry, and it logs a warning for each of them on every start. The following lines are safe to delete from `/etc/turnserver.conf`:

- `no-tlsv1` and `no-tlsv1_1`: TLS 1.0/1.1 support was removed entirely
- `no-loopback-peers`: loopback peers are now denied by default (the opposite opt-in is `allow-loopback-peers`)
- `no-cli`: deprecated in favour of the `cli` option; coturn logs an error for it on start

### Required DNS entry

You need to set up a fully qualified domain name that resolves to the external IP address of your TURN server. You'll use this domain name to generate a TLS certificate using Let's Encrypt (next section).

### Required ports

On the TURN server, you need to have the following ports (in addition to port 22) open. The first two are used by the BigBlueButton clients, and the relay ports by the TURN server to reach your BigBlueButton servers.

| Ports       | Protocol | Description                                           |
| ----------- | -------- | ----------------------------------------------------- |
| 3478        | TCP/UDP  | coturn listening port                                 |
| 443         | TCP/UDP  | TLS (TCP) and DTLS (UDP) listening port               |
| 32769-65535 | UDP      | relay ports range, reachable from your BigBlueButton servers |

Port 80 (TCP) must also be open while the TLS certificate is requested or renewed (next section).

### Generating TLS certificates

You can use `certbot` from [Let's Encrypt](https://letsencrypt.org/) to easily generate free TLS certificates. Install it on your TURN server (not your BigBlueButton server):

```bash
$ sudo apt-get update
$ sudo apt-get install certbot
```

You can then run a `certbot` command like the following to generate the certificate, replacing `<turn.example.com>` with the domain name of your TURN server:

```bash
$ sudo certbot certonly --standalone --preferred-challenges http \
    -d <turn.example.com>
```

Be aware that TCP 80 needs to be open for this to work, also for the automatic renewals.

`certbot` sets up automatic renewal by default. To ensure that the certificates are readable by `coturn`, which runs as the `turnserver` user, add the following renewal hook. First, create the directories.

```bash
$ sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy /etc/turnserver
```

Next, create the file `/etc/letsencrypt/renewal-hooks/deploy/coturn` with the following contents. Replace `<turn.example.com>` with the hostname of your TURN server.

```
#!/bin/bash -e
for certfile in fullchain.pem privkey.pem ; do
	cp -L /etc/letsencrypt/live/<turn.example.com>/"${certfile}" /etc/turnserver/"${certfile}".new
	chown turnserver:turnserver /etc/turnserver/"${certfile}".new
	mv /etc/turnserver/"${certfile}".new /etc/turnserver/"${certfile}"
done
systemctl kill -sUSR2 coturn.service
```

Make this file executable.

```
$ sudo chmod 0755 /etc/letsencrypt/renewal-hooks/deploy/coturn
```

### Configure coturn

`coturn` configuration is stored in the file `/etc/turnserver.conf`. There are a lot of options available, all documented in comments in the default configuration file. We include a sample configuration below with the recommended settings (refer to the default configuration file for more information on the settings).

Use the file below for `/etc/turnserver.conf` and make the following changes:

- Replace `<turn.example.com>` with the hostname of your TURN server (it is also used as the realm), and
- Replace `<secret_value>` with a random value for the shared secret (you can generate one by running `openssl rand -hex 16`), and
- Replace `<IP>` with the external IP of your TURN server, and
- Replace `<bbb-server-ip>` with the external IP address of your BigBlueButton server; add one `allowed-peer-ip` line per BigBlueButton server that uses this TURN server.

This configuration file assumes your TURN server is not behind NAT and has a public IP address.

```ini
listening-port=3478
tls-listening-port=443

listening-ip=<IP>
relay-ip=<IP>

# If the server is behind NAT, you need to specify the external IP address.
# If there is only one external address, specify it like this:
#external-ip=172.17.19.120
# If you have multiple external addresses, you have to specify which
# internal address each corresponds to, like this. The first address is the
# external ip, and the second address is the corresponding internal IP.
#external-ip=172.17.19.131/10.0.0.11
#external-ip=172.17.18.132/10.0.0.12

min-port=32769
max-port=65535
verbose

fingerprint
lt-cred-mech
use-auth-secret
static-auth-secret=<secret_value>
realm=<turn.example.com>

cert=/etc/turnserver/fullchain.pem
pkey=/etc/turnserver/privkey.pem
# From https://ssl-config.mozilla.org/ Intermediate, openssl 1.1.0g, 2020-01
cipher-list="ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384"
dh-file=/etc/turnserver/dhp.pem

keep-address-family
no-multicast-peers

# The TURN server only needs to relay to your BigBlueButton servers, where the
# media servers (LiveKit, FreeSWITCH, mediasoup) run. Deny every other peer.
denied-peer-ip=0.0.0.0-255.255.255.255
denied-peer-ip=::-ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
allowed-peer-ip=<bbb-server-ip>
```

If a BigBlueButton server is behind NAT, also add its internal address as an `allowed-peer-ip`. With the distro coturn 4.6.1 you can add `no-cli`, `no-tlsv1`, `no-tlsv1_1` and `no-loopback-peers` as well; `bbb-coturn` (4.16.0) behaves that way by default and warns about those options.

We need to create the `dhp.pem` file:

```bash
$ sudo mkdir -p /etc/turnserver
$ sudo openssl dhparam -dsaparam -out /etc/turnserver/dhp.pem 2048
```

To increase the file handle limit for the TURN server, give it the ability to bind to port 443, and write its log to a file, add a systemd override. First, create the directory.

```bash
$ sudo mkdir -p /etc/systemd/system/coturn.service.d
```

and then create `/etc/systemd/system/coturn.service.d/override.conf` with the following contents

```
[Service]
LimitNOFILE=1048576
AmbientCapabilities=CAP_NET_BIND_SERVICE
ExecStart=
ExecStart=/usr/bin/turnserver -c /etc/turnserver.conf --pidfile= --no-stdout-log --simple-log --log-file /var/log/turnserver/turnserver.log
Restart=always
```

Both the distro unit and the `bbb-coturn` unit run coturn in the foreground (`Type=notify`), so do not add `--daemon` here.

### Configure log rotation

`bbb-coturn` installs this file and creates the log directory; with the distro package, do it yourself. To rotate the logs for `coturn`, install the following configuration file to `/etc/logrotate.d/coturn`

```
/var/log/turnserver/*.log
{
	rotate 7
	daily
	missingok
	notifempty
	compress
	postrotate
		/bin/systemctl kill -s HUP coturn.service
	endscript
}
```

And create the associated log directory

```
$ sudo mkdir -p /var/log/turnserver
$ sudo chown turnserver:turnserver /var/log/turnserver
```

### Start coturn

With the above steps completed, start the TURN server

```bash
$ sudo /etc/letsencrypt/renewal-hooks/deploy/coturn    # Initial copy of certificates
$ sudo systemctl daemon-reload                         # Ensure the override file is loaded
$ sudo systemctl enable --now coturn                   # Start now and on every boot
$ sudo systemctl restart coturn                        # If it was already running
```

Ensure that `coturn` has bound to ports 443 and 3478 with `ss -tlnp | grep turnserver`. Also reboot your TURN server and ensure that `coturn` is running (and binding to port 443 after the reboot).

## Configure BigBlueButton to use your TURN server

`bbb-web` hands the list of STUN and TURN servers to the web client, which uses it for every WebRTC connection: with the default LiveKit media server as well as with FreeSWITCH and mediasoup. The client fetches the list from `/bigbluebutton/api/stuns`; for each TURN server, `bbb-web` generates time-limited credentials from the shared secret.

### With bbb-install.sh

Add `-c <hostname>:<secret>` to the `bbb-install.sh` command from [Install BigBlueButton](/administration/install#install) when you install or upgrade the BigBlueButton server, for example `-c turn.example.com:<secret_value>`.

`bbb-install.sh` then writes `/etc/bigbluebutton/turn-stun-servers.xml` (the file shown below) and does not install the local coturn and HAProxy; nginx listens on port 443 itself. Pass the same `-c` option every time you re-run the script.

### By hand

Create `/etc/bigbluebutton/turn-stun-servers.xml` with the contents below. It replaces `/usr/share/bbb-web/WEB-INF/classes/spring/turn-stun-servers.xml`, which is overwritten on upgrades. Make these edits:

- replace every instance of `<turn.example.com>` with the hostname of the TURN server, and
- replace `<secret_value>` with the secret you configured in `turnserver.conf`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="stun0" class="org.bigbluebutton.web.services.turn.StunServer">
        <constructor-arg index="0" value="stun:<turn.example.com>"/>
    </bean>

    <!-- TURN over UDP on port 3478 -->
    <bean id="turn0" class="org.bigbluebutton.web.services.turn.TurnServer">
        <constructor-arg index="0" value="<secret_value>"/>
        <constructor-arg index="1" value="turn:<turn.example.com>:3478"/>
        <constructor-arg index="2" value="86400"/>
    </bean>

    <!-- TURN over TLS on port 443, for users whose firewall only allows HTTPS -->
    <bean id="turn1" class="org.bigbluebutton.web.services.turn.TurnServer">
        <constructor-arg index="0" value="<secret_value>"/>
        <constructor-arg index="1" value="turns:<turn.example.com>:443?transport=tcp"/>
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
                <ref bean="turn1"/>
            </set>
        </property>
    </bean>
</beans>
```

The third constructor argument is the lifetime of the generated credentials in seconds.

Restart `bbb-web` to apply the change, for example with `sudo bbb-conf --restart`. `sudo bbb-conf --check` then verifies that every configured STUN server answers.

If you prefer to keep the configuration in `apply-config.sh`, see [Apply custom settings for TURN server](/administration/customize#apply-custom-settings-for-turn-server).

Going forward, when users connect behind a restrictive firewall that prevents outgoing UDP connections, the TURN server relays their media to the BigBlueButton server through port 443 on their firewall.

## Test your TURN server

By default, the browser tries to connect directly to the media server (LiveKit, or FreeSWITCH and mediasoup where those are used). If it is unable to make a direct connection, it falls back to the TURN server as one of the ICE candidates to relay the media.

To make every client use the TURN server, so that you can verify it works, set the following in `/etc/bigbluebutton/bbb-html5.yml` and run `sudo bbb-conf --restart`:

```yaml
public:
  media:
    # FreeSWITCH and mediasoup connections
    forceRelay: true
    livekit:
      # LiveKit connections (the default media server)
      forceRelay: true
```

Both are `false` by default; remove them again after the test. Alternatively, use Firefox, which allows you to disable direct connections and require fallback to your TURN server: open `about:config`, search for `relay`, and set `media.peerconnection.ice.relay_only` to `true`.

Then join a BigBlueButton session and share your webcam. If your webcam appears, you can verify that the browser is using your TURN server: in Firefox, open a new tab with `about:webrtc`, click `show details`, and look at the ICE Stats table. The successful connection, shown at the top of the table, should have `(relay-tcp)` or `(relay-udp)` in the Local Candidate column. In Chrome, `chrome://webrtc-internals` shows the selected candidate pair for each connection.

If, however, you received error 1020 ("Media could not reach the server") when sharing a webcam, the browser may not be able to connect to the TURN server, or the TURN server is not running or configured correctly. Check the browser console in Firefox. If you see

```
WebRTC: ICE failed, your TURN server appears to be broken, see about:webrtc for more details
```

then Firefox was unable to communicate with your TURN server, or your TURN server was not running or configured correctly.

To ensure that your own firewall is not blocking the connection, open a new tab and visit [https://demo.bigbluebutton.org/](https://demo.bigbluebutton.org/), launch a test session, and try sharing your webcam.

The TURN server also acts as a STUN server, so you can first check that the STUN portion is working. On the BigBlueButton server, `turnutils_stunclient` is installed with `bbb-coturn`; on other machines, install the `stun-client` package. Replace `<your-turn-server-host>` with the hostname of your TURN server.

```
$ turnutils_stunclient <your-turn-server-host>
```

or

```
$ sudo apt-get install -y stun-client
$ stun <your-turn-server-host>
```

If successful, `turnutils_stunclient` prints the address the TURN server saw you at, and `stun` prints the detected NAT type (a line starting with `Primary:`). This is the same check that `bbb-conf --check` runs for every STUN server in `turn-stun-servers.xml`.

If you get an error, check that `coturn` is running on the TURN server using `systemctl status coturn.service`. Check the logs by doing `tail -f /var/log/turnserver/turnserver.log`. The sample configuration already logs with `verbose`; for even more detail, replace it with `Verbose` in `/etc/turnserver.conf` and restart the TURN server with `systemctl restart coturn.service`.

You can test your TURN server using the [trickle ICE](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) page. This gives you a log of the relay candidates as they are returned from ICE gathering. To test using this page, you need to generate some test credentials. The following BASH script generates them from `/etc/turnserver.conf` on the TURN server (the sample configuration uses the hostname as the realm). Alternatively, set `HOST=<HOSTNAME>` and `SECRET=<SECRET>` to your TURN server's credentials.

```bash
#!/bin/bash

HOST=$(grep '^realm=' /etc/turnserver.conf | sed 's/realm=//')
SECRET=$(grep '^static-auth-secret=' /etc/turnserver.conf | sed 's/static-auth-secret=//')

time=$(date +%s)
expiry=8400
username=$(( $time + $expiry ))

echo
echo "          https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/"
echo
echo      URI : turn:$HOST:3478 or turns:$HOST:443?transport=tcp
echo username : $username
echo password : $(echo -n $username | openssl dgst -binary -sha1 -hmac $SECRET | openssl base64)
echo

```

Enter the values into URI, username, and password on the trickle ICE page and click 'Gather candidates'. You should see a list of relay candidates. If you don't, again check that your TURN server is running and tail its logs via `tail -f /var/log/turnserver/turnserver.log` or `journalctl -f -u coturn.service`.
