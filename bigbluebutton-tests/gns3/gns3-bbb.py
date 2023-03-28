#!/usr/bin/python3
#
# Script to setup a GNS3 project for testing BigBlueButton.
#
# The project will be centered around a dummy public subnet with both
# the bare metal system and most virtual nodes connected to it using
# virtual NAT gateways.  Servers can be created with the --no-nat
# switch to connect them directly to the dummy public subnet.
#
# "stun.l.google.com" is mimicked with a fake DNS entry so that
# BigBlueButton servers see the dummy public subnet as their public IP
# address.
#
# smallstep.com's step-ca server is used to run an ACME Certificate
# Authority in a manner compatible with certbot, allowing bbb-install
# to run certbot normally.  The CA's root certificate and key are
# expected to be in the script's directory and are created (using
# openssl) if they don't exist.  The root certificate is then
# installed and trusted on all Ubuntu nodes created by this script.
#
# All the Ubuntu nodes will be configured to accept the user's public
# ssh key and entire authorized_keys file for ssh access.
#
# BigBlueButton servers with NAT gateways will be configured to forward
# port 22 to the server, while the NAT gateway listens for ssh
# on port 2222.
#
# The NAT gateway between the bare metal machine and the dummy public
# subnet is given the same name (for ssh access) as the GNS3 project
# (default "BigBlueButton").  This node also operates the step-ca and
# stun.l.google.com servers.
#
# The first time the script is run, the required infrastructure nodes
# are created.  The --public-subnet switch can be specified at this
# time, and the public subnet's CIDR prefix will also be saved.
#
# If the machine running the script is configured to use an APT http
# proxy, that proxy will also be used by the created nodes.
#
# The gns3 library provides "declarative" functions that only create
# nodes if they don't already exist, and we use this feature
# throughout the script.  Running the script on a pre-built network
# should change nothing.  A single node can be rebuilt by deleting it
# and rerunning the script.

# RUNTIME DEPENDENCIES
#
# genisoimage must be installed
# openssl must be installed
#
# USAGE
#
# ./gns3-bbb.py focal-260    (to install a released server)
# ./gns3-bbb.py focal-e41349 (to install a server based on a git commit)
# ./gns3-bbb.py testclient   (to install a test client)
#
# By default, the GNS3 project is called "BigBlueButton".  If the
# project infrastructure (switches and NAT gateways) doesn't exist, it
# will be created.
#
# The '-d' option deletes a single server and its associated subnet and NAT nodes.
#
# The '--delete-everything' switch deletes EVERYTHING in an existing project.
#
# See the comments in NPDC/GNS3/gns3.py for more options and how
# authentication is done.
#
# We use an Ubuntu cloud image and a client image created using the
# GNS3/ubuntu.py script in BrentBaccala's NPDC github repository.

from NPDC.GNS3 import gns3

import sys
import os
import json
import ipaddress
import requests
import argparse

import subprocess

SSH_AUTHORIZED_KEYS_FILES = ['~/.ssh/id_rsa.pub', "~/.ssh/authorized_keys"]

# These are bootable images provided by Canonical, Inc, that have the cloud-init package
# installed.  When booted in a VM, cloud-init will configure them based on configuration
# provided (in our case) on a ISO image attached to a virtual CD-ROM device.
#
# Pick up the latest versions from here:
#
# https://cloud-images.ubuntu.com/releases/bionic/release/ubuntu-18.04-server-cloudimg-amd64.img
# https://cloud-images.ubuntu.com/releases/focal/release/ubuntu-20.04-server-cloudimg-amd64.img
# https://cloud-images.ubuntu.com/releases/jammy/release/ubuntu-22.04-server-cloudimg-amd64.img
#
# Updated versions are released several times a month.  If you don't have the latest version,
# this file's cloud-init configuration will run a package update (if package_upgrade is True).

cloud_images = {
    22: 'ubuntu-22.04-server-cloudimg-amd64.img',
    20: 'ubuntu-20.04-server-cloudimg-amd64.img',
    18: 'ubuntu-18.04-server-cloudimg-amd64.img'
}

ubuntu_release = {
    20: 'focal',
    18: 'bionic'
}

# We currently use Ubuntu 20 for everything
cloud_image = cloud_images[20]

# set to True to immediately upgrade to latest package versions; slows thing down a bit
package_upgrade = False

# Parse the command line options

parser = argparse.ArgumentParser(parents=[gns3.parser('BigBlueButton')],
                                 description='Start an BigBlueButton test network in GNS3',
                                 formatter_class=argparse.RawTextHelpFormatter)
parser.add_argument('--client-image', type=str,
                    help='Ubuntu image to be used for test clients')
parser.add_argument('--public-subnet', type=str,
                    help='public IP subnet to be "stolen" for our use (default 128.8.8.0/24)')
parser.add_argument('--server-subnet', type=str, default='192.168.1.0/24',
                    help='private IP subnet to be used for NAT-ed BBB server (default 192.168.1.0/24)')
parser.add_argument('-r', '--repository', type=str,
                    help='package repository to be used for BigBlueButton server install')
parser.add_argument('-g', '--greenlight', action='store_true',
                    help='install Greenlight')
parser.add_argument('--ubuntu-release', type=int, default=20,
                    help='Ubuntu release (18 or 20; default 20) to be used for BigBlueButton server install')
parser.add_argument('--release', type=str,
                    help='BigBlueButton release to be used for BigBlueButton server install (default is server hostname)')
parser.add_argument('--install-script', type=str,
                    help='install script to be used for BigBlueButton server install\n'
                    + 'can be a local file, a URL, or a filename on https://ubuntu.bigbluebutton.org/')
parser.add_argument('--proxy-server', type=str,
                    help='proxy server to be passed to BigBlueButton server install script')
parser.add_argument('--no-nat', action='store_true',
                    help='install BBB server without a NAT gateway')
parser.add_argument('--no-install', action='store_true',
                    help="don't run bbb-install script on BBB server")
parser.add_argument('--quiet', default=False, action='store_true',
                    help="don't print console logs to stdout")
parser.add_argument('--delete', type=str,
                    help="delete a BBB server and its associated subnet and NAT nodes")
parser.add_argument('version', nargs='*',
                    help="""version of BigBlueButton server to be installed
(focal-250, focal-25-dev, focal-260, focal-GITREV)
version names starting with 'testclient' install clients""")
args = parser.parse_args()

server_subnet = ipaddress.ip_network(args.server_subnet)
if not server_subnet.is_private:
    print(f"{args.server_subnet} must be a private IP prefix")
    exit(1)

# Various scripts we'll use
#
# How to open files in the same directory as the script, from https://stackoverflow.com/a/4060259/1493790

__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

def file(fn):
    with open(os.path.join(__location__, fn)) as f:
        return f.read()

# Check if our SSL root Certificate Authority key and certificate are available, create them if not

ssl_root_key_fn = os.path.join(__location__, 'bbb-dev-ca.key')
ssl_root_crt_fn = os.path.join(__location__, 'bbb-dev-ca.crt')
try:
    with open(ssl_root_key_fn) as f:
        ssl_root_key = f.read()
except:
    subprocess.run(f'openssl genrsa -out {ssl_root_key_fn} 2048'.split()).check_returncode()
    with open(ssl_root_key_fn) as f:
        ssl_root_key = f.read()

try:
    with open(ssl_root_crt_fn) as f:
        ssl_root_crt = f.read()
except:
    subprocess.run(f'openssl req -x509 -new -nodes -key {ssl_root_key_fn} -sha256 -days 1460 -out {ssl_root_crt_fn} -subj /C=CA/ST=BBB/L=BBB/O=BBB/OU=BBB/CN=BBB-DEV'.split()).check_returncode()
    with open(ssl_root_crt_fn) as f:
        ssl_root_crt = f.read()

# Open the GNS3 server

gns3_server, gns3_project = gns3.open_project_with_standard_options(args)

# Extract and validate project's public subnet

gns3_variables = gns3_project.variables()

if 'public-subnet' in gns3_variables:
    if not args.public_subnet:
        args.public_subnet = gns3_variables['public-subnet']
    elif args.public_subnet != gns3_variables['public-subnet']:
        print(f"Public subnet '{args.public_subnet}' doesn't match project's public subnet '{gns3_variables['public-subnet']}'")
        exit(1)
else:
    if not args.public_subnet:
        args.public_subnet = '128.8.8.0/24'
    gns3_variables['public-subnet'] = args.public_subnet
    gns3_project.set_variables(gns3_variables)

public_subnet = ipaddress.ip_network(args.public_subnet)
if not public_subnet.is_global:
    print(f"{args.public_subnet} must be a public IP prefix")
    exit(1)

# Delete a device (and its associated nodes) if that's what we were requested to do

if args.delete:
    # currently, the project's delete method doesn't complain if nothing matches,
    # so we can just do this, even though some of these devices might not exist
    # (if the device was created without NAT)
    gns3_project.delete(args.delete)
    gns3_project.delete(args.delete + '-NAT')
    # If the server's subnet was named by its CIDR block, we now have an orphan switch
    switches = set(node['node_id'] for node in gns3_project.nodes() if node['node_type'] == 'ethernet_switch')
    linked_switches = set(node['node_id'] for link in gns3_project.links() for node in link['nodes'])
    for orphan in switches.difference(linked_switches):
        gns3_project.delete(orphan)
    exit(0)

# Make sure the cloud and client images exist on the GNS3 server

if not cloud_image in gns3_server.images():
    print(f"{cloud_image} isn't available on GNS3 server {args.host}")
    exit(1)

if not cloud_images[args.ubuntu_release] in gns3_server.images():
    print(f"{cloud_images[args.ubuntu_release]} isn't available on GNS3 server {args.host}")
    exit(1)

# An Ubuntu 20 image created by GNS3/ubuntu.py in Brent Baccala's NPDC github repository
#
# This image comes with the console GUI pre-installed, which cloud_image lacks.
#
# Default is the most recent ubuntu-open-desktop image (last in the sort order)

if any(v.startswith('testclient') for v in args.version):
    if args.client_image:
        assert args.client_image in gns3_server.images()
    else:
        args.client_image = sorted(image for image in gns3_server.images() if image.startswith('ubuntu-open-desktop'))[-1]

# Find out if the system we're running on is configured to use an apt proxy.

apt_proxy = None
apt_config_command = ['apt-config', '--format', '%f %v%n', 'dump']
apt_config_proc = subprocess.Popen(apt_config_command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
for config_line in apt_config_proc.stdout.read().decode().split('\n'):
    if ' ' in config_line:
        key,value = config_line.split(' ', 1)
        if key == 'Acquire::http::Proxy':
            apt_proxy = value

# Obtain any credentials to authenticate ourself to the VM

ssh_authorized_keys = []
for keyfilename in SSH_AUTHORIZED_KEYS_FILES:
    keyfilename = os.path.expanduser(keyfilename)
    if os.path.exists(keyfilename):
        with open(keyfilename) as f:
            for l in f.read().split('\n'):
                if l.startswith('ssh-'):
                    ssh_authorized_keys.append(l)

### FUNCTIONS TO CREATE VARIOUS KINDS OF GNS3 OBJECTS

def master_gateway(hostname, public_subnet=None, x=0, y=0):
    # A NAT gateway between our public "Internet" and the actual Internet
    #
    # BBB's default STUN server is stun.l.google.com:19302, so we run
    # coturn and configure the master gateway to mimic it.
    #
    # It also operates an ACME server and mimics acme-v02.api.letsencrypt.org,
    # so our test servers can run certbot to get their SSL certificates.

    if not isinstance(public_subnet, ipaddress.IPv4Network):
        raise TypeError("master_gateway() requires public_subnet to be an ipaddress.IPv4Network")

    # Use the first host address on the subnet for our master gateway
    # The rest of them will be available for assignment with DHCP
    public_subnet_hosts = list(public_subnet.hosts())
    master_gateway_address = str(public_subnet_hosts[0])

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on', 'dhcp-identifier': 'mac' },
                                    'ens5': {'addresses': [f'{master_gateway_address}/{public_subnet.prefixlen}'] }
                      }}

    # resolver1.opendns.com is used by bbb-install to determine external IP address
    # stun.l.google.com is used by clients to determine their external IP address (and maybe the servers too)
    # I'd like {acme_server} to be a cname, too, but that isn't good enough (see below)

    acme_server="acme-v02.api.letsencrypt.org"

    dnsmasq_conf = f"""
listen-address={master_gateway_address}
bind-dynamic
interface-name=resolver1.opendns.com,ens5
interface-name=stun.l.google.com,ens5
"""

    # 120 second DHCP lease times because I change things around so
    # much in the virtual network.  I tried 10 second lease times,
    # but had problems with OSPF route flaps for 10 seconds lease
    # time on the bare metal system, so it's probably best to
    # use 120 second leases throughout.

    dhcpd_conf = f"""
ddns-updates on;
ddns-update-style standard;
update-optimization off;
authoritative;
# double curlies because it's a Python f-string
zone {args.domain}. {{ }}

# Update conflict detection prevents a DHCP server from changing
# a DNS entry that it didn't create.  Since I often delete the
# virtual network devices and recreate them, it's best to keep
# this turned off.
update-conflict-detection off;

allow unknown-clients;
default-lease-time 120;
max-lease-time 120;
log-facility local7;

subnet {str(public_subnet.network_address)} netmask {str(public_subnet.netmask)} {{
 range {str(public_subnet_hosts[1])} {str(public_subnet_hosts[-1])};
 option subnet-mask {str(public_subnet.netmask)};
 option domain-name-servers {master_gateway_address};
 option domain-name "{args.domain}";
 option routers {master_gateway_address};
 option broadcast-address {str(public_subnet.broadcast_address)};
}}

"""

    # step-ca's JSON configuration file
    ca = {
	"root": "/opt/ca/bbb-dev-ca.crt",
	"crt": "/opt/ca/bbb-dev-ca.crt",
	"key": "/opt/ca/bbb-dev-ca.key",
	"address": ":8000",
	"dnsNames": [ acme_server, hostname, f'{hostname}.{args.domain}', 'localhost' ],
	"logger": {
	    "format": "text"
	},
	"db": {
	    "type": "badgerv2",
	    "dataSource": "/opt/ca/db"
	},
	"authority": {
	    "provisioners": [
		{
		    "type": "ACME",
		    "name": "acme"
		}
	    ]
	}
    }

    # nginx is used to redirect /directory to /acme/acme/directory, so that certbot can be used
    # without a server argument.  It's configured to mimic {acme_server}

    nginx_site=f"""
server {{
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name {acme_server};

  ssl_certificate /etc/letsencrypt/live/{acme_server}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/{acme_server}/privkey.pem;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
  ssl_dhparam /etc/nginx/ssl/dhp-4096.pem;

  access_log  /var/log/nginx/access.log;

  return 301 https://{acme_server}:8000/acme/acme$request_uri;
}}
"""

    # The master gateway's name is the name of the project, and that's
    # what it announces itself as to DHCP and DNS.

    user_data = {'hostname': hostname,
                 'packages': ['dnsmasq', 'isc-dhcp-server', 'coturn', 'bird', 'iptables-persistent',
                              'nginx', 'python3-certbot-nginx'],
                 'package_upgrade': package_upgrade,
                 'users': [{'name': 'ubuntu',
                            'plain_text_passwd': 'ubuntu',
                            'ssh_authorized_keys': ssh_authorized_keys,
                            'lock_passwd': False,
                            'shell': '/bin/bash',
                            'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                 }],
                 'write_files': [
                     {'path': '/etc/dhcp/dhcpd.conf',
                      'permissions': '0644',
                      'content': dhcpd_conf
                     },
                     {'path': '/etc/dnsmasq.d/gns3-bbb',
                      'permissions': '0644',
                      'content': dnsmasq_conf
                     },
                     {'path': '/etc/bird/bird.conf',
                      'permissions': '0644',
                      'content': file('bird.conf')
                     },
                     {'path': '/etc/systemd/system/step-ca.service',
                      'permissions': '0644',
                      'content': file('step-ca.service')
                     },
                     {'path': '/etc/nginx/sites-available/redirect-ca',
                      'permissions': '0644',
                      'content': nginx_site
                     },
                     {'path': '/opt/ca/ca.json',
                      'permissions': '0755',
                      'content': json.dumps(ca)
                     },
                     {'path': '/opt/ca/bbb-dev-ca.key',
                      'permissions': '0400',
                      'content': ssl_root_key
                     },
                     {'path': '/opt/ca/bbb-dev-ca.crt',
                      'permissions': '0444',
                      'content': ssl_root_crt
                     },
                     {'path': '/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt',
                      'permissions': '0444',
                      'content': ssl_root_crt
                     },
                     # /var/www/html/bbb-dev-ca.crt should no longer be used for anything
                     {'path': '/var/www/html/bbb-dev-ca.crt',
                      'permissions': '0444',
                      'content': ssl_root_crt
                     },
                 ],
                 'runcmd': [
                     # configure coturn to listen on 19302, like stun.l.google.com
                     f'echo aux-server={master_gateway_address}:19302 >> /etc/turnserver.conf',
                     'systemctl restart coturn',
                     # add CA root certificate from /usr/local/share/ca-certificates
                     'update-ca-certificates',
                     # now everything we need to operate a certificate authority
                     "wget -q https://dl.step.sm/gh-release/certificates/docs-ca-install/v0.21.0/step-ca_0.21.0_amd64.deb",
                     "dpkg -i step-ca_0.21.0_amd64.deb",
                     "rm step-ca_0.21.0_amd64.deb",
                     # putting {acme_server} in dnsmasq as a cname isn't enough,
                     # because the local step-ca server doesn't do hostname lookups using dnsmasq,
                     # and it will contact {acme_server} to do verification for certbot below
                     f'echo {master_gateway_address} {acme_server} >> /etc/hosts',
                     "systemctl enable step-ca",
                     "systemctl start step-ca",
                     "bash -c 'while ! nc -z localhost 8000; do sleep 1; done'",
                     # get a certificate for nginx
                     f"certbot --server https://localhost:8000/acme/acme/directory certonly --nginx --non-interactive --agree-tos -d {acme_server} -m root@localhost",
                     # complete nginx ssl configuration and restart nginx
                     "mkdir -p /etc/nginx/ssl",
                     "openssl dhparam -dsaparam  -out /etc/nginx/ssl/dhp-4096.pem 4096",
                     "ln -s /etc/nginx/sites-available/redirect-ca /etc/nginx/sites-enabled/",
                     "systemctl restart nginx",
                     # enable packet forwarding
                     'sysctl net.ipv4.ip_forward=1',
                     'sed -i /net.ipv4.ip_forward=1/s/^#// /etc/sysctl.conf',
                     # enable NAT (both directions)
                     # Connections into the testing network should appear to come from this gateway
                     #    on our public "Internet" to allow outside clients to connect to the servers
                     # Connections out of the testing network should appear to come from this gateway
                     #    on its bare metal facing virtual subnet for things like package installs
                     'iptables -t nat -A POSTROUTING -o ens4 -j MASQUERADE',
                     'iptables -t nat -A POSTROUTING -o ens5 -j MASQUERADE',
                     'netfilter-persistent save',
                 ],
    }

    if notification_url:
        user_data['phone_home'] = {'url': notification_url, 'tries': 1}

    # If the system we're running on is configured to use an apt proxy, use it for the NAT instance as well.
    #
    # This will break things if the instance can't reach the proxy.

    if apt_proxy:
        user_data['apt'] = {'http_proxy': apt_proxy}

    return gns3_project.ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                    ram=1024, disk=4096, ethernets=2, x=x, y=y)

# Initialization server - only used once when project starts to discover project's DNS name
#
# This server has almost no configuration at all.  Once it boots, we can ssh in to find the DNS domain,
# which will be used to build the master gateway node, since we need the DNS domain to build its config files.
#
# Issues:
#   - if we couldn't find a notification URL, probably will hang.  Should at least warn.  Improve to fallback on polling
#   - assumes that this script has access to at least one of the authorized keys

def initialization_server(hostname, x=0, y=0):

    # Use dhcp-identifier: mac because I'm still having problems with
    # cloned GNS3 ubuntu nodes using the same client identifiers; it's
    # a cloud-init issue.

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on', 'dhcp-identifier': 'mac' },
                      }}

    user_data = {'hostname': hostname,
                 'ssh_authorized_keys': ssh_authorized_keys
    }

    if notification_url:
        user_data['phone_home'] = {'url': notification_url, 'tries': 1}

    return gns3_project.ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                    ram=512, x=x, y=y)

# BigBlueButton TURN server

def turn_server(hostname, x=0, y=0):

    # Use dhcp-identifier: mac because I'm still having problems with
    # cloned GNS3 ubuntu nodes using the same client identifiers; it's
    # a cloud-init issue.

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on', 'dhcp-identifier': 'mac' },
                      }}

    user_data = {'hostname': hostname,
                 'package_upgrade': package_upgrade,
                 'users': [{'name': 'ubuntu',
                            'plain_text_passwd': 'ubuntu',
                            'ssh_authorized_keys': ssh_authorized_keys,
                            'lock_passwd': False,
                            'shell': '/bin/bash',
                            'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                 }],
                 'write_files': [
                     {'path': '/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt',
                      'permissions': '0444',
                      'content': ssl_root_crt
                     },
                 ],
                 'runcmd': [
                     'update-ca-certificates',
                 ]
    }

    if not args.no_install:
        user_data['runcmd'].append(f'wget -qO- https://ubuntu.bigbluebutton.org/bbb-install.sh | sudo bash -s -- -c {hostname}.{args.domain}:secret -e root@{hostname}.{args.domain}')

    # If the system we're running on is configured to use an apt proxy, use it for the clients as well.
    #
    # This will break things if the instance can't reach the proxy.

    if apt_proxy:
        user_data['apt'] = {'http_proxy': apt_proxy}
        user_data['write_files'].append(
            {'path': '/etc/apt/apt.conf.d/proxy.conf',
             'permissions': '0644',
             'content': f'Acquire::http::Proxy "{apt_proxy}";\n'
            }
        )

    return gns3_project.ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                    ram=1024, disk=4096, x=x, y=y)

# BigBlueButton test clients

def BBB_client(hostname, x=0, y=0):

    # Use dhcp-identifier: mac because I'm still having problems with
    # cloned GNS3 ubuntu nodes using the same client identifiers; it's
    # a cloud-init issue.

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on', 'dhcp-identifier': 'mac', 'optional': True },
                                    'ens5': {'dhcp4': 'on', 'dhcp-identifier': 'mac', 'optional': True },
                                    'ens6': {'dhcp4': 'on', 'dhcp-identifier': 'mac', 'optional': True },
                      }}

    user_data = {'hostname': hostname,
                 'package_upgrade': package_upgrade,
                 # We can safely writing files into /home/ubuntu without worrying about its permissions changing
                 # because this is a chained cloud-init that has already booted once and created /home/ubuntu.
                 # If this were an initial boot of a cloud image from Canonical, putting files into /home/ubuntu
                 # would cause that directory's permissions to change to root.root, which would be a problem.
                 'write_files': [
                     {'path': '/home/ubuntu/testclient.sh',
                      'permissions': '0755',
                      'content': file('testclient.sh')
                     },
                     {'path': '/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt',
                      'permissions': '0444',
                      'content': ssl_root_crt
                     },
                 ],
                 'runcmd': [
                     'update-ca-certificates',
                     'su ubuntu -c /home/ubuntu/testclient.sh',
                 ],
    }

    # If the system we're running on is configured to use an apt proxy, use it for the clients as well.
    #
    # This will break things if the instance can't reach the proxy.

    if apt_proxy:
        user_data['apt'] = {'http_proxy': apt_proxy}
        user_data['write_files'].append(
            {'path': '/etc/apt/apt.conf.d/proxy.conf',
             'permissions': '0644',
             'content': f'Acquire::http::Proxy "{apt_proxy}";\n'
            }
        )

    # If git user name/email has been set on the current system, it's convenient to set them on the client, too.

    try:
        git_user_name = subprocess.check_output('git config --get user.name'.split()).strip().decode()
        git_user_email = subprocess.check_output('git config --get user.email'.split()).strip().decode()
        if git_user_name != '':
            user_data['runcmd'].append(f'su ubuntu -c \'git config --global --add user.name "{git_user_name}"\'')
        if git_user_email != '':
            user_data['runcmd'].append(f'su ubuntu -c \'git config --global --add user.email "{git_user_email}"\'')
    except subprocess.CalledProcessError:
        pass

    # need this many virtual CPUs to run the stress tests, which stress the client perhaps more than the server
    return gns3_project.ubuntu_node(user_data, image=args.client_image, network_config=network_config,
                                    cpus=12, ram=8192, disk=8192, ethernets=3, vnc=True, x=x, y=y)

# TWO KINDS OF NAT GATEWAYS

# A NAT gateway configured for test clients.

def client_NAT_gateway(hostname, x=0, y=0, nat_interface='192.168.1.1/24'):

    interface = ipaddress.ip_interface(nat_interface)
    hosts = list(interface.network.hosts())
    assert hosts[0] == interface.ip

    # We want DNS service on the NAT gateways so that when we proxy ssh through
    # them, they can resolve testclient addresses.

    # This is really broken, but we have to make dnsmasq authoritative
    # for its DNS domain, or it will hang indefinitely on AAAA
    # lookups.  See the stackexchange link below.  We make it
    # authoritative for the test-client domain (so we can lookup
    # testclient), but set testclient's domain search path to test,
    # so it can lookup names like focal-250.
    #
    # If we didn't set anything authoritative, AAAA lookups would
    # hang.  If we set the test domain authoritative, server lookups
    # like focal-250 would return nothing, because they're registered
    # with the master gateway, not this one.

    dnsmasq_conf = f"""
listen-address={hosts[0]}
bind-interfaces
dhcp-range={hosts[1]},{hosts[-1]},2m
# Don't use dhcp-sequential-ip; assign IP addresses based on hash of client MAC
# Otherwise, the IP address change around on reboots, and BBB doesn't like that.
# dhcp-sequential-ip
dhcp-authoritative
# The testclient will register itself with DHCP as 'testclient'
# This option will cause dnsmasq to announce it in DNS as 'testclient.test-client'
domain=test-client
# Make the DNS server authoritative for these domains, or else it will hang
# See https://unix.stackexchange.com/questions/720570
auth-zone=test-client
auth-zone=in-addr.arpa
# auth-server is required when auth-zone is defined; use a non-existent dummy server
auth-server=dns.test-client
# tell the test clients to search args.domain and not test-client
dhcp-option = option:domain-search,{args.domain}
"""

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on'},
                                    'ens5': {'addresses': [nat_interface],
                                             'nameservers': {'search' : ['test-client'], 'addresses' : [str(interface.ip)]}},
                      }}
    user_data = {'hostname': hostname,
                 'packages': ['dnsmasq', 'iptables-persistent'],
                 'package_upgrade': package_upgrade,
                 'users': [{'name': 'ubuntu',
                            'plain_text_passwd': 'ubuntu',
                            'ssh_authorized_keys': ssh_authorized_keys,
                            'lock_passwd': False,
                            'shell': '/bin/bash',
                            'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                          }],
                 'write_files': [
                     {'path': '/etc/dnsmasq.d/gns3-bbb',
                      'permissions': '0644',
                      'content': dnsmasq_conf
                     },
                     {'path': '/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt',
                      'permissions': '0444',
                      'content': ssl_root_crt
                     },
                 ],
                 'runcmd': [
                     'update-ca-certificates',
                     # enable packet forwarding
                     'sysctl net.ipv4.ip_forward=1',
                     'sed -i /net.ipv4.ip_forward=1/s/^#// /etc/sysctl.conf',
                     # enable NAT
                     'iptables -t nat -A POSTROUTING -o ens4 -j MASQUERADE',
                     'netfilter-persistent save',
                 ],
    }

    if notification_url:
        user_data['phone_home'] = {'url': notification_url, 'tries': 1}

    # If the system we're running on is configured to use an apt proxy, use it for the NAT instance as well.
    #
    # This will break things if the instance can't reach the proxy.

    if apt_proxy:
        user_data['apt'] = {'http_proxy': apt_proxy}

    return gns3_project.ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                    ram=1024, disk=4096, ethernets=2, x=x, y=y)


# A NAT gateway for some kind of server (either BigBlueButton or natturn)
# between our public "Internet" and a server's private subnet
#
# 'hostname' should be of the form 'server-NAT', and the NAT gateway will
# present itself in DHCP/DNS using the server's name

def server_NAT_gateway(hostname, public_subnet=None, x=100, y=100):

    assert(hostname.endswith('-NAT'))
    hostname = hostname[:-4]

    if not isinstance(public_subnet, ipaddress.IPv4Network):
        raise TypeError("server_NAT_gateway() requires public_subnet to be an ipaddress.IPv4Network")

    # Use the first host address on the subnet for our master gateway
    # The rest of them will be available for assignment with DHCP
    public_subnet_hosts = list(public_subnet.hosts())
    master_gateway_address = str(public_subnet_hosts[0])

    server_subnet_hosts = list(server_subnet.hosts())
    server_nat_address = str(server_subnet_hosts[0])
    server_address = str(server_subnet_hosts[1])
    first_dhcp_address = str(server_subnet_hosts[2])
    last_dhcp_address = str(server_subnet_hosts[-1])

    dnsmasq_conf = f"""
listen-address={server_nat_address}
bind-interfaces
dhcp-host={hostname},{server_address}
dhcp-range={first_dhcp_address},{last_dhcp_address},2m
# Don't use dhcp-sequential-ip; assign IP addresses based on hash of client MAC
# Otherwise, the IP address change around on reboots, and BBB doesn't like that.
# dhcp-sequential-ip
dhcp-authoritative
# tell the test servers to search args.domain
dhcp-option = option:domain-search,{args.domain}
"""

    # Note that 'hostname-NAT' announces itself into DHCP as 'hostname'
    #
    # This is so that the testclients will connect to the NAT gateway to reach the server.

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on',
                                             'dhcp4-overrides' : {'hostname' : hostname}},
                                    'ens5': {'addresses': [f'{server_nat_address}/{server_subnet.prefixlen}']},
                      }}

    user_data = {'hostname': hostname + '-NAT',
                 'packages': ['dnsmasq', 'iptables-persistent'],
                 'package_upgrade': package_upgrade,
                 'users': [{'name': 'ubuntu',
                            'plain_text_passwd': 'ubuntu',
                            'ssh_authorized_keys': ssh_authorized_keys,
                            'lock_passwd': False,
                            'shell': '/bin/bash',
                            'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                 }],
                 'write_files': [
                     {'path': '/etc/dnsmasq.d/gns3-bbb',
                      'permissions': '0644',
                      'content': dnsmasq_conf
                     },
                     {'path': '/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt',
                      'permissions': '0444',
                      'content': ssl_root_crt
                     },
                     # Our NAT configuration tunnels port 22 through to the BigBlueButton server
                     # Use port 2222 for ssh connections to the server's NAT gateway
                     {'path': '/etc/ssh/sshd_config.d/port.conf',
                      'permissions': '0644',
                      'content': "Port 2222"
                     },
                 ],
                 'runcmd': [
                     'update-ca-certificates',
                     # enable packet forwarding
                     'sysctl net.ipv4.ip_forward=1',
                     'sed -i /net.ipv4.ip_forward=1/s/^#// /etc/sysctl.conf',
                     # enable NAT
                     'iptables -t nat -A POSTROUTING -o ens4 -j MASQUERADE',
                     # These NAT statements assume that the server is on server_address, and relay ssh, web and UDP traffic to it
                     # We ensure that the server is on server_address with a dhcp-host statement in /etc/dnsmasq.conf
                     f'iptables -t nat -A PREROUTING -p tcp -i ens4 --dport 22 -j DNAT --to-destination {server_address}',
                     f'iptables -t nat -A PREROUTING -p tcp -i ens4 --dport 80 -j DNAT --to-destination {server_address}',
                     f'iptables -t nat -A PREROUTING -p tcp -i ens4 --dport 443 -j DNAT --to-destination {server_address}',
                     # port 3478 is TURN; this rule is for NAT gateways fronting TURN servers
                     f'iptables -t nat -A PREROUTING -p tcp -i ens4 --dport 3478 -j DNAT --to-destination {server_address}',
                     f'iptables -t nat -A PREROUTING -p udp -i ens4 --dport 16384:32768 -j DNAT --to-destination {server_address}',
                     # Also, bbb-install requires the server to have the ability to connect to itself using its DNS name,
                     #    - we don't know our own IP address at this point
                     #    - rule has to be on PREROUTING, else we can't use DNAT
                     #    - since it's on PREROUTING, we can't use -o lo
                     #    - so grab traffic bound for everything on the public subnet except the master gateway,
                     #      which we need to connect to for certbot to work
                     f'iptables -t nat -A PREROUTING -p tcp -d {master_gateway_address} --dport 80 -j ACCEPT',
                     f'iptables -t nat -A PREROUTING -p tcp -d {master_gateway_address} --dport 443 -j ACCEPT',
                     f'iptables -t nat -A PREROUTING -p tcp -d {public_subnet.with_prefixlen} --dport 80 -j DNAT --to-destination {server_address}',
                     f'iptables -t nat -A PREROUTING -p tcp -d {public_subnet.with_prefixlen} --dport 443 -j DNAT --to-destination {server_address}',
                     # hairpin case - we need to rewrite the source address before sending the packets back to the server
                     # no hairpin on port 22; we can ssh into the server, then ssh back to the NAT gateway if needed
                     f'iptables -t nat -A POSTROUTING -s {server_subnet.with_prefixlen} -d {server_address} -p tcp --dport 80 -j MASQUERADE',
                     f'iptables -t nat -A POSTROUTING -s {server_subnet.with_prefixlen} -d {server_address} -p tcp --dport 443 -j MASQUERADE',
                     f'iptables -t nat -A POSTROUTING -s {server_subnet.with_prefixlen} -d {server_address} -p udp --dport 16384:32768 -j MASQUERADE',
                     'netfilter-persistent save',
                 ],
    }

    if notification_url:
        user_data['phone_home'] = {'url': notification_url, 'tries': 1}

    # If the system we're running on is configured to use an apt proxy, use it for the NAT instance as well.
    #
    # This will break things if the instance can't reach the proxy.

    if apt_proxy:
        user_data['apt'] = {'http_proxy': apt_proxy}

    return gns3_project.ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                    ram=1024, disk=4096, ethernets=2, x=x, y=y)

# BIG BLUE BUTTON SERVERS

def BBB_server_standalone(hostname, x=100, y=300):

    # A BigBlueButton server without an associated NAT gateway

    network_config = {'version': 2, 'ethernets': {'ens4': {'dhcp4': 'on' }}}

    if not args.release:
        args.release = hostname

    if not args.install_script:
        if '25' in args.release:
            args.install_script = 'bbb-install-2.5.sh'
        elif '26' in args.release:
            args.install_script = 'bbb-install-2.6.sh'
        else:
            print("Can't guess which install script version to use")
            exit(1)

    if args.install_script.startswith('http:') or args.install_script.startswith('https:'):
        install_script_request = requests.get(args.install_script)
        install_script_request.raise_for_status()
        install_script = install_script_request.text
    elif '/' in args.install_script:
        install_script = file(args.install_script)
    else:
        install_script_request = requests.get(f"https://ubuntu.bigbluebutton.org/{args.install_script}")
        install_script_request.raise_for_status()
        install_script = install_script_request.text

    user_data = {'hostname': hostname,
                 'package_upgrade': package_upgrade,
                 'users': [{'name': 'ubuntu',
                            'plain_text_passwd': 'ubuntu',
                            'ssh_authorized_keys': ssh_authorized_keys,
                            'lock_passwd': False,
                            'shell': '/bin/bash',
                            'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                 }],
                 # I'd like to put these files in /home/ubuntu, but then /home/ubuntu will be owned by root
                 # Alternately, I'd put this in /root, but then user ubuntu can't read it
                 'write_files': [
                     {'path': '/testserver.sh',
                      'permissions': '0755',
                      'content': file('testserver.sh')
                     },
                     {'path': '/bbb-install.sh',
                      'permissions': '0755',
                      'content': install_script
                     },
                     {'path': '/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt',
                      'permissions': '0444',
                      'content': ssl_root_crt
                     },
                 ],
                 'runcmd': [
                     # add CA root certificate from /usr/local/share/ca-certificates
                     'update-ca-certificates',
                 ],
    }

    if not args.no_install:
        install_options = []
        if args.repository:
            install_options.append(f'-r {args.repository}')
            repo = args.repository
        else:
            repo = 'ubuntu.bigbluebutton.org'

        distro = ubuntu_release[args.ubuntu_release]
        try:
            requests.head(f'https://{repo}/{args.release}/dists/bigbluebutton-{distro}/Release.gpg').raise_for_status()
        except requests.exceptions.HTTPError:
            print(f'Release {args.release} does not exist on {repo} for distribution {distro}')
            exit(1)

        if args.proxy_server:
            install_options.append(f'-p {args.proxy_server}')

        if args.greenlight:
            install_options.append('-g')

        install_options_str = ' '.join(install_options)
        user_data['runcmd'].append(f'sudo -u ubuntu RELEASE="{args.release}" INSTALL_OPTIONS="{install_options_str}" /testserver.sh')

    if notification_url:
        user_data['phone_home'] = {'url': notification_url, 'tries': 1}

    # If the system we're running on is configured to use an apt proxy, use it for the server as well.
    #
    # This will break things if the instance can't reach the proxy.

    if apt_proxy:
        user_data['apt'] = {'http_proxy': apt_proxy}
        user_data['write_files'].append(
            {'path': '/etc/apt/apt.conf.d/proxy.conf',
             'permissions': '0644',
             'content': f'Acquire::http::Proxy "{apt_proxy}";\n'
            }
        )

    return gns3_project.ubuntu_node(user_data, image=cloud_images[args.ubuntu_release], network_config=network_config,
                                    cpus=4, ram=8192, disk=16384, x=x, y=y)

# BBB server with optional attached NAT gateway

def BBB_server(name, x=100, public_subnet=None, depends_on=None):
    server = BBB_server_standalone(name, x=x, y=300)
    if args.no_nat:
        gns3_project.link(server, 0, PublicIP_switch)
        if depends_on:
            gns3_project.depends_on(server, depends_on)
    else:
        if server_subnet.with_prefixlen not in gns3_project.node_names():
            switch = gns3_project.switch(server_subnet.with_prefixlen, x=x, y=200)
        else:
            # can't have two gns3 nodes with the same name, so do this instead
            switch = gns3_project.switch(name + '-subnet', x=x, y=200)
        server_nat = server_NAT_gateway(name + '-NAT', public_subnet=public_subnet, x=x, y=100)

        gns3_project.link(server_nat, 0, PublicIP_switch)
        gns3_project.link(server_nat, 1, switch)
        gns3_project.link(server, 0, switch)

        gns3_project.depends_on(server, server_nat)
        if depends_on:
            gns3_project.depends_on(server_nat, depends_on)
    return server

# THE VIRTUAL NETWORK

# Create a GNS3 "cloud" for Internet access.
#
# It's done early in the script like this so that the gns3 library
# knows which interface we're using, because it might need that
# information to construct a notification URL (a global variable).

internet = gns3_project.cloud(gns3_variables.get('subnet', args.interface), args.interface, x=-500, y=0)

notification_url = gns3_project.notification_url()

# Either extract DNS domain from GNS3 variables, or use an init server
# to determine the DNS domain and then set it in the project variables
# for future reference.

if 'domain' in gns3_variables:
    args.domain = gns3_variables['domain']

if 'domain' not in gns3_variables or 'initsrv' in args.version:
    init_server = initialization_server('initsrv', x=-200, y=-100)
    gns3_project.link(init_server, 0, internet)
    gns3_project.start_nodes(init_server, wait_for_everything=True)
    # We could ssh to 'ubuntu@initsrv', but that would requiring waiting for the DNS entry to appear,
    # so let's ssh directly to the IP address
    ipaddr = gns3_project.httpd.instances_reported['initsrv']
    stdout = subprocess.check_output(['ssh', f'ubuntu@{ipaddr}',
                                      '-o', 'UserKnownHostsFile=/dev/null', '-o', 'StrictHostKeyChecking=no',
                                      'netplan ip leases ens4 | grep ^DOMAINNAME= | cut -d = -f 2'],
                                     stderr = subprocess.DEVNULL)
    args.domain = stdout.strip().decode()
    stdout = subprocess.check_output(['ssh', f'ubuntu@{ipaddr}',
                                      '-o', 'UserKnownHostsFile=/dev/null', '-o', 'StrictHostKeyChecking=no',
                                      'netplan ip leases ens4 | grep ^NETMASK= | cut -d = -f 2'],
                                     stderr = subprocess.DEVNULL)
    veth_netmask = stdout.strip().decode()
    stdout = subprocess.check_output(['ssh', f'ubuntu@{ipaddr}',
                                      '-o', 'UserKnownHostsFile=/dev/null', '-o', 'StrictHostKeyChecking=no',
                                      'netplan ip leases ens4 | grep ^ADDRESS= | cut -d = -f 2'],
                                     stderr = subprocess.DEVNULL)
    veth_address = stdout.strip().decode()
    veth_subnet = ipaddress.ip_network(veth_address + "/" + veth_netmask, strict=False)
    # This isn't atomic; we're using the copy of gns3_variables that we got a minute or so ago
    gns3_variables['domain'] = args.domain
    gns3_variables['subnet'] = str(veth_subnet)
    gns3_project.set_variables(gns3_variables)
    # If user asked to create just an initsrv, do nothing else
    if args.version == ['initsrv']:
        exit(1)
    # improve delete method so that it can take init_server directly as an arg
    gns3_project.delete(init_server['node_id'])

# Create the master gateway

master = master_gateway(args.project, public_subnet=public_subnet, x=-200, y=0)

# An Ethernet switch for our public "Internet"

PublicIP_switch = gns3_project.switch(public_subnet.with_prefixlen, x=0, y=0, ethernets=16)
gns3_project.link(master, 0, internet)
gns3_project.link(master, 1, PublicIP_switch)

# The BigBlueButton servers and/or test clients

for v in args.version:
    if v == 'turn':
        # A standard BigBlueButton TURN server
        turn_node = turn_server('turn', x=-200, y=-200)
        gns3_project.link(turn_node, 0, PublicIP_switch)
        gns3_project.depends_on(turn_node, master)
    elif v == 'natturn':
        # A BigBlueButton TURN server behind a NAT gateway (like AWS or Azure)

        if 'natturn' not in gns3_project.node_names():
            natturn_nat = server_NAT_gateway('natturn-NAT', public_subnet=public_subnet, x=0, y=-100)
            if server_subnet.with_prefixlen not in gns3_project.node_names():
                natturn_switch = gns3_project.switch(server_subnet.with_prefixlen, x=0, y=-200)
            else:
                # can't have two gns3 nodes with the same name, so do this instead
                natturn_switch = gns3_project.switch('natturn-subnet', x=0, y=-200)
            natturn_node = turn_server('natturn', x=0, y=-300)

            gns3_project.link(natturn_nat, 0, PublicIP_switch)
            gns3_project.link(natturn_nat, 1, natturn_switch)
            gns3_project.link(natturn_node, 0, natturn_switch)

            gns3_project.depends_on(natturn_node, natturn_nat)
            gns3_project.depends_on(natturn_nat, master)
    elif v.startswith('testclient'):
        # Create client NAT gateways first
        # Remember, they won't be created if they already exist
        #
        # NAT4: public subnet to carrier grade NAT subnet
        #
        # We put a switch on here to ensure that NAT6's interface will be up when it boots.
        # Otherwise, if the interface is down, it won't start its DHCP server (ever).
        #
        # NAT4, NAT5, and NAT6 are numbered to match the corresponding 'ens[456]'
        # interface names on 'testclient'.

        subnet = '100.64.1.1/24'
        nat4 = client_NAT_gateway('NAT4', x=150, y=-200, nat_interface=subnet)
        gns3_project.link(nat4, 0, PublicIP_switch)
        nat4_switch = gns3_project.switch(subnet, x=350, y=-200)
        gns3_project.link(nat4, 1, nat4_switch)
        gns3_project.depends_on(nat4, master)

        # NAT5: public subnet to private client subnet, not overlapping server address space
        #
        # Put a switch on here for the same reason as NAT4.

        subnet = '192.168.128.1/24'
        nat5 = client_NAT_gateway('NAT5', x=150, y=-100, nat_interface=subnet)
        gns3_project.link(nat5, 0, PublicIP_switch)
        nat5_switch = gns3_project.switch(subnet, x=350, y=-100)
        gns3_project.link(nat5, 1, nat5_switch)
        gns3_project.depends_on(nat5, master)

        # NAT6: public subnet to private client subnet, overlapping server address space
        #
        # Put a switch on here for the same reason as NAT4.

        subnet = '192.168.1.1/24'
        nat6 = client_NAT_gateway('NAT6', x=150, y=0, nat_interface=subnet)
        gns3_project.link(nat6, 0, PublicIP_switch)
        nat6_switch = gns3_project.switch(subnet, x=350, y=0)
        gns3_project.link(nat6, 1, nat6_switch)
        gns3_project.depends_on(nat6, master)

        # Create actual test client, now
        # find an unoccupied y coordinate on the GUI
        for y in (-200, -100, 0, 100, 200):
            try:
                next(n for n in gns3_project.nodes() if n['x'] == 550 and n['y'] == y)
            except StopIteration:
                break
        client = BBB_client(v, x=550, y=y)
        gns3_project.link(client, 0, nat4_switch)
        gns3_project.depends_on(client, nat4)
        gns3_project.link(client, 1, nat5_switch)
        gns3_project.depends_on(client, nat5)
        gns3_project.link(client, 2, nat6_switch)
        gns3_project.depends_on(client, nat6)
    else:
        # Create a server
        # find an spot on the GUI
        if args.no_nat:
            y_coordinates_needed = [300]
        else:
            y_coordinates_needed = [100, 200, 300]
        for x in (0, 200, -200, 400, -400):
            try:
                next(n for n in gns3_project.nodes() if n['x'] == x and n['y'] in y_coordinates_needed)
            except StopIteration:
                break
        BBB_server(v, x=x, public_subnet=public_subnet, depends_on=master)

# The difference between these two is that start_nodes waits for notification that
# the nodes booted, while start_node does not.
#
# The project might not have a notification_url if the script couldn't figure out
# a local IP address suitable for a callback.

if notification_url:
    gns3_project.start_nodes(quiet=args.quiet)
else:
    for node in args.version:
        gns3_project.start_node(node, quiet=args.quiet)
