
# GNS3-BBB

Scripts to build a virtual BigBlueButton network in a gns3 project (for testing purposes).

**Prerequisites:** a Ubuntu server with KVM (Kernel Virtual Machine) support
and enough CPU and RAM to support the virtual machines in the virtual network

**Note**: gns3 is very picky about matching GUI client and server versions.  I typically put dpkg holds
on the gns3 packages, since otherwise an apt upgrade on my laptop requires both an apt upgrade on my
gns3 server *and* restarting the gns3 server, which implies stopping and restarting all of the running VMs.

**Note**: gns3 uses qemu, which	can not	run concurrently with VirtualBox.  If VirtualBox virtual machines
are running. gns3 virtual machines will not start, and vice versa.

**Note:** Once the script has been used to build the virtual network (takes about an hour), the virtual network can be stopped
and restarted without having to re-run the script.

## Design

The script will build a gns3 project that looks like this:

![network diagram](README.png)

The network "highjacks" the 128.8.8.0/24 subnet, so it simulates public IP address space.

The `BigBlueButton` device, in addition to providing DNS and DHCP service for the 128.8.8.0/24 subnet, also
operates a STUN server that presents itself in DNS as `stun.l.google.com`, so that
STUN operations, on both the BigBlueButton clients and servers, yield the 128.8.8.0/24 addresses
as public addresses.  `NAT1` also operates an ACME CA signing service via HTTP CGI, and mimics
`resolver1.opendns.com` (used by `bbb-install` to check that the server can reach itself).

`BigBlueButton` also announces the 128.8.8.0/24 subnet to the bare metal machine using OSPF,
and implements a proxy server, so that the bare metal machine can connect to the virtual servers.

The `focal-260-NAT` device announces itself into DHCP/DNS as `focal-250.test` and forwards
ports 80 and 443 (along with UDP ports) through to `focal-250` itself.
Clients can therefore connect to `focal-250.test`, just as they would to a typical BBB server.

Current server options are `bionic-240`, `focal-250`, `focal-25-dev`, and `focal-260`, along
with `focal-GITREV` if you have a repository built from a specific git commit.

The `testclient` connects to NAT4 (overlapping server address space),
NAT5 (private address not overlapping server address space), and NAT6 (carrier grade NAT).

## Usage

1. You'll need several tools from Brent Baccala's NPDC repository on github, which is a submodule in the NPDC directory

   `git submodule update`

1. Read, understand, and run the `install-gns3.sh` script in `NPDC/GNS3`

1. Upload a current Ubuntu 20 cloud image to the gns3 server using NPDC's `GNS3/upload-image.py`:

   `./upload-image.py https://cloud-images.ubuntu.com/releases/focal/release/ubuntu-20.04-server-cloudimg-amd64.img`

   The most uncommon Python3 package that this script uses is `python3-requests-toolbelt`.  `python3-clint` is also recommended, to get a progress bar.

   If this step works, then you have REST API access to the GNS3 server.

1. You should now be able to boot an Ubuntu instance like this:

   `./ubuntu.py -r 20 -m 1024 --debug`

   Double-click on the icon that appears in the GUI to access the instance's console.

   The `--debug` option adds a login with username `ubuntu` and password `ubuntu`.

   Login and verify, in particular, that networking is working properly.  You should have Internet access.

1. Build a GUI image using NPDC's `GNS3/ubuntu.py`:

   `./ubuntu.py -r 20 -s $((1024*1024)) -m 1024 --boot-script opendesktop.sh --gns3-appliance`

   This step adds the GUI packages to the Ubuntu 20 cloud image and creates a new cloud image used for the test clients.
   It takes about half an hour.

1. Upload the resulting GUI image to the gns3 server using NPDC's `GNS3/upload-image.py`

1. Finally, build the BigBlueButton project in gns3 with `./gns3-bbb.py focal-260`

   This script will pause to trigger each gateway device booting in sequence,
   and terminate once the BigBlueButton server and the test client have begun their install sequences.

1. Add a test client with `./gns3-bbb.py testclient`
1. Add another server with `./gns3-bbb.py focal-250`

1. `ssh` into the server devices directly.

1. You can `ssh` into a server's NAT gateway with `ssh -p 2222 focal-260`.

1. You can `ssh` into a testclient by specifying its NAT gateway as a jump host (`-J`) option to ssh: `ssh -J NAT4 testclient`
