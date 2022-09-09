
# GNS3-BBB

Scripts to build a virtual BigBlueButton network in a gns3 project (for testing purposes).

**Prerequisites:** a Ubuntu server with enough CPU and RAM to support the virtual machines in the virtual network

**Note**: gns3 is very picky about matching GUI client and server versions.  I typically put dpkg holds
on the gns3 packages, since otherwise an apt upgrade on my laptop requires both an apt upgrade on my
gns3 server *and* restarting the gns3 server, which implies stopping and restarting all of the running VMs.

**Note:** Once the script has been used to build the virtual network (takes about an hour), the virtual network can be stopped
and restarted without having to re-run the script.

## Design

The script will build a gns3 project that looks like this:

![network diagram](README.png)

The `PublicIP` switch operates using the 128.8.8.0/24 subnet, so it simulates public IP address space.

The `NAT1` device, in addition to providing DNS and DHCP service for the 128.8.8.0/24 subnet, also
operates a STUN server on 128.8.8.254 that presents itself in DNS as `stun.l.google.com`, so that
STUN operations, on both the BigBlueButton clients and servers, yield the 128.8.8.0/24 addresses
as public addresses.  `NAT1` also operates an SSL CA signing service via HTTP CGI.

The `focal-25-dev-NAT` device announces itself into NAT1's DHCP/DNS as `focal-25-dev.test` and forwards
ports 80 and 443 (along with UDP ports) through to `focal-25-dev` itself.
Clients can therefore connect to `focal-25-dev.test`, just as they would to a typical BBB server.

Current server options are `bionic-240`, `focal-250`, `focal-25-dev`, and `focal-260`.

The `testclient` can be moved around the network.  Connect to either NAT3 (overlapping server address space),
NAT4 (private address not overlapping server address space), directly to PublicIP (client with a public IP address),
or directly to `focal-25-dev-subnet` (client on same private network as server).

## Usage

1. gns3 is not in the standard Ubuntu distribution, but the gns3 team maintains an Ubuntu Personal Package Archive (PPA),
   which can be added like this:

   `sudo add-apt-repository ppa:gns3`

1. On the server, `sudo apt install gns3-server`

1. Configure gns3-server to start on boot (if desired) by adding a `gns3` user.  The virtual machine images
   and disk files (which can grow quite large) are then stored in `/home/gns3/GNS3`.
   - `sudo adduser gns3`
   - gns3 requires permission to use Kernel Virtual Machines and ubridge

      ```
     sudo adduser gns3 kvm
     sudo adduser gns3 ubridge
      ```
   - Enable gns3's systemd user services to start on boot

      `sudo loginctl enable-linger gns3`

   - Append to gns3/.bashrc (so that systemctl works even if you don't login with the GUI):
      ```
      export XDG_RUNTIME_DIR=/run/user/$(id -u)
      ```
   - Add the following file as `/home/gns3/.config/systemd/user/gns3.service`:
      ```
      [Unit]
      Description=GNS3 server

      [Service]
      Type=simple
      ExecStart=/usr/bin/gns3server

      [Install]
      WantedBy=default.target
      ```
   - Configure authentication into gns3 with `/home/gns3/.config/GNS3/2.2/gns3_server.conf`:
      ```
      [Server]
      auth = True
      user = gns3
      password = PASSWORD
      ```
   - While su'ed to `gns3`, enable and start the gns3 server:
     ```
     systemctl --user enable gns3
     systemctl --user start gns3
     ```

3. Configure network access to gns3.  How to do this exactly is beyond the scope of this README.
   Can be either routed or bridged.  For a routed configuration, add the following file as `/etc/systemd/system/veth.service`:
   ```
   [Unit]
   Description=Configure virtual ethernet for GNS3
   After=network.target
   Before=isc-dhcp-server.service

   [Service]
   Type=oneshot
   ExecStart=/sbin/ip link add dev veth type veth peer name veth-host
   ExecStart=/sbin/ip link set dev veth up
   ExecStart=/sbin/ip link set dev veth-host up
   ExecStart=/sbin/ip addr add 192.168.8.1/24 broadcast 192.168.8.255 dev veth-host
   ExecStart=/sbin/ethtool -K veth-host tx off

   [Install]
   WantedBy=multi-user.target
   ```
   - `sudo systemctl enable veth`
   - `sudo systemctl start veth`
   - `sudo apt install isc-dhcp-server`
   - Add something like the following snippet to `/etc/dhcp/dhcpd.conf` to enable DHCP
     service on the virtual subnet, and don't forget to set `domain-name` and `domain-name-servers`
     in that same file:
      ```
      subnet 192.168.8.0 netmask 255.255.255.0 {
        range 192.168.8.129 192.168.8.199;
        option routers 192.168.8.1;
      }
      ```
   - `sudo systemctl enable isc-dhcp-server`
   - `sudo systemctl start isc-dhcp-server`
   - Modify `/etc/sysctl.conf` to enable packet forwarding:
      ```
      # Uncomment the next line to enable packet forwarding for IPv4
      net.ipv4.ip_forward=1
      ```
   - Adjust your network configuration to route traffic for the virtual subnet to the server
1. Configure authentication to gns3-server in either `~/gns3_server.conf` or `~/.config/GNS3/2.2/gns3_server.conf`:
   ```
   host = localhost
   port = 3080
   ```
1. You'll need several tools from Brent Baccala's NPDC repository on github
   ```
   git clone https://github.com/BrentBaccala/NPDC
   ```
1. Download a current Ubuntu 20 cloud image from Canonical and upload to the gns3 server using NPDC's `GNS3/upload-image.py`

   `https://cloud-images.ubuntu.com/releases/focal/release/ubuntu-20.04-server-cloudimg-amd64.img`

1. Build a GUI image using NPDC's `GNS3/ubuntu.py`

   This step adds the GUI packages to the Ubuntu 20 cloud image and creates a new cloud image used for the test clients.

1. Upload the GUI image to the gns3 server using NPDC's `GNS3/upload-image.py`
1. Set network interface name and GUI image name in `gns3-bbb.py`
1. Finally, build the BigBlueButton project in gns3 with `./gns3-bbb.py focal-25-dev`

   This script will pause to trigger each gateway device booting in sequence,
   and terminate once the BigBlueButton server and the test client have begun their install sequences.

1. Add another server with `./gns3-bbb.py --create-test-server focal-260`

1. `ssh` into these devices using the `-J` or `ProxyJump` option, like this (in `.ssh/config`):

```
Host focal-25-dev
  Hostname 192.168.1.2
  User ubuntu
  ProxyJump ubuntu@192.168.4.165, ubuntu@128.8.8.150
```
