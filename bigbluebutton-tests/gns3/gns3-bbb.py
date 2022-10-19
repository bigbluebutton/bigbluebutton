#!/usr/bin/python3
#
# Script to setup a GNS3 project for testing BigBlueButton.
#
# All the Ubuntu nodes will be configured to accept the user's public
# ssh key and entire authorized_keys file for ssh access.
#
# RUNTIME DEPENDENCIES
#
# genisoimage must be installed
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
import ipaddress

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
parser.add_argument('version', nargs='*',
                    help="""version of BigBlueButton server to be installed
(focal-250, focal-25-dev, focal-260, focal-GITREV)
version names starting with 'testclient' install clients""")
args = parser.parse_args()

# Various scripts we'll use
#
# How to open files in the same directory as the script, from https://stackoverflow.com/a/4060259/1493790

__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

with open(os.path.join(__location__, 'testclient.sh')) as f:
    testclient_script = f.read()

with open(os.path.join(__location__, 'testserver.sh')) as f:
    testserver_script = f.read()

with open(os.path.join(__location__, 'generateCA.sh')) as f:
    generateCA_script = f.read()

with open(os.path.join(__location__, 'getcert.cgi')) as f:
    getcert_script = f.read()

# This lets me pull scripts from the github automated tests, but
# I don't use it anymore, because I wanted to change the scripts around too much

#with open(os.path.join(__location__, '../../.github/workflows/automated-tests.yml')) as f:
#    automated_tests=yaml.load(f)
#def add_step_to_runcmd(user_data, stepname):
#    user_data['runcmd'].extend([i['run'] for i in automated_tests['jobs']['build-install-and-test']['steps'] if i.get('name', '') == stepname])

# Open the GNS3 server

gns3_server, gns3_project = gns3.open_project_with_standard_options(args)

# Make sure the cloud and client images exist on the GNS3 server

if not cloud_image in gns3_server.images():
    print(f"{cloud_image} isn't available on GNS3 server {args.host}")
    exit(1)

# An Ubuntu 20 image created by GNS3/ubuntu.py in Brent Baccala's NPDC github repository
#
# This image comes with the console GUI pre-installed, which cloud_image lacks.

if any(v.startswith('testclient') for v in args.version):
    if args.client_image:
        assert args.client_image in gns3_server.images()
    else:
        args.client_image = next(image for image in gns3_server.images() if image.startswith('ubuntu-open-desktop'))

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

# The gns3 library provides "declarative" functions that only create
# nodes if they don't already exist, and we use this feature
# throughout the script.  Running the script on a pre-built network
# should change nothing.  A single node can be rebuilt by deleting it
# and rerunning the script.

generic_NAT_per_boot_script = """#!/bin/bash
iptables -t nat -A POSTROUTING -o ens4 -j MASQUERADE
sysctl net.ipv4.ip_forward=1
"""

def master_gateway(hostname, x=0, y=0):
    # A NAT gateway between our public "Internet" and the actual Internet

    # BBB's default STUN server is stun.l.google.com:19302, so we configure
    # NAT1 to mimic it.

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on', 'dhcp-identifier': 'mac'},
                                    'ens5': {'addresses': ['128.8.8.254/24'],
                                             'nameservers': {'search' : ['test'], 'addresses' : ['128.8.8.254']}},
                      }}

    dnsmasq_conf = """
listen-address=128.8.8.254
bind-interfaces
dhcp-range=128.8.8.101,128.8.8.200,12h
# Don't use dhcp-sequential-ip; assign IP addresses based on hash of client MAC
# Otherwise, the IP address change around on reboots, and BBB doesn't like that.
# dhcp-sequential-ip
dhcp-authoritative
# The server's NAT router will register itself with DHCP as 'bbb-ci'
# This option will cause dnsmasq to announce it in DNS as 'bbb-ci.test'
domain=test
# Make the DNS server authoritative for these domains, or else it will hang
# See https://unix.stackexchange.com/questions/720570
auth-zone=test
auth-zone=in-addr.arpa
# auth-server is required when auth-zone is defined; use a non-existent dummy server
auth-server=dns.test
# This has to be here and not in /etc/hosts because we're authoritative for test
host-record=ca.test,128.8.8.254
"""

    # I used to call this device "NAT1", and it's still referred to in
    # that way in the comments, but the name it announces itself as to
    # DHCP is the name of the project, because it's the outward-facing
    # device that ssh users connect to.

    user_data = {'hostname': hostname,
                 'packages': ['dnsmasq', 'coturn', 'apache2'],
                 'package_upgrade': package_upgrade,
                 'users': [{'name': 'ubuntu',
                            'plain_text_passwd': 'ubuntu',
                            'ssh_authorized_keys': ssh_authorized_keys,
                            'lock_passwd': False,
                            'shell': '/bin/bash',
                            'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                 }],
                 'write_files': [
                     {'path': '/opt/ca/generateCA.sh',
                      'permissions': '0755',
                      'content': generateCA_script
                     },
                     {'path': '/etc/dnsmasq.d/gns3-bbb',
                      'permissions': '0644',
                      'content': dnsmasq_conf
                     },
                     {'path': '/var/www/html/getcert.cgi',
                      'permissions': '0755',
                      'content': getcert_script
                     },
                     {'path': '/var/lib/cloud/scripts/per-boot/generic-NAT',
                      'permissions': '0755',
                      'content': generic_NAT_per_boot_script
                     },
                 ],
                 'runcmd': [
                     # resolver1.opendns.com is used by bbb-install to determine external IP address
                     'echo 128.8.8.254 resolver1.opendns.com >> /etc/hosts',
                     # configure coturn to listen on 19302, like stun.l.google.com
                     # 'echo listening-port=19302 >> /etc/turnserver.conf',
                     'echo aux-server=128.8.8.254:19302 >> /etc/turnserver.conf',
                     'echo 128.8.8.254 stun.l.google.com >> /etc/hosts',
                     'systemctl restart coturn',
                     'systemctl start dnsmasq',
                     # now everything we need to operate a certificate authority
                     # enable cgi scripts
                     'a2enmod cgi',
                     "sed -i '\|Directory /var/www/|,\|/Directory|s/Options/#Options/' /etc/apache2/apache2.conf",
                     "sed -i '\|Directory /var/www/|aAddHandler cgi-script .cgi' /etc/apache2/apache2.conf",
                     "sed -i '\|Directory /var/www/|aOptions ExecCGI Indexes FollowSymLinks' /etc/apache2/apache2.conf",
                     'systemctl restart apache2',
                     # we accept CSRs via POST to http://ca.test/getcert.cgi
                     'echo 128.8.8.254 ca.test >> /etc/hosts',
                     '/opt/ca/generateCA.sh',
                 ],
    }

    if notification_url:
        user_data['phone_home'] = {'url': notification_url, 'tries': 1}

    # If we have a key and certificate for the certificate authority, copy them into /ca
    #
    # Otherwise, the generateCA.sh script will generate them when the instance boots.

    try:
        for fn in ('bbb-dev-ca.key', 'bbb-dev-ca.crt'):
            with open(os.path.join(__location__, fn)) as f:
                user_data['write_files'].append({'path': f'/opt/ca/{fn}', 'permissions': '0444', 'content': f.read()})
    except Exception as ex:
        print(ex)

    # If the system we're running on is configured to use an apt proxy, use it for the NAT instance as well.
    #
    # This will break things if the instance can't reach the proxy.

    if apt_proxy:
        user_data['apt'] = {'http_proxy': apt_proxy}

    return gns3_project.ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                    ram=1024, disk=4096, ethernets=2, x=-200, y=0)

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
                      'content': testclient_script
                     },
                 ],
                 'runcmd': ['su ubuntu -c /home/ubuntu/testclient.sh'],
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

# NAT gateways

def BBB_client_nat(hostname, x=0, y=0, nat_interface='192.168.1.1/24'):

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
    # with the NAT1 gateway, not this one.

    dnsmasq_conf = f"""
listen-address={hosts[0]}
bind-interfaces
dhcp-range={hosts[1]},{hosts[-1]},12h
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
# tell the test clients to search test and not test-client
dhcp-option = option:domain-search,test
"""

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on'},
                                    'ens5': {'addresses': [nat_interface],
                                             'nameservers': {'search' : ['test-client'], 'addresses' : [str(interface.ip)]}},
                      }}
    user_data = {'hostname': hostname,
                 'packages': ['dnsmasq'],
                 'package_upgrade': package_upgrade,
                 'users': [{'name': 'ubuntu',
                            'plain_text_passwd': 'ubuntu',
                            'ssh_authorized_keys': ssh_authorized_keys,
                            'lock_passwd': False,
                            'shell': '/bin/bash',
                            'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                          }],
                 'write_files': [
                     {'path': '/var/lib/cloud/scripts/per-boot/generic-NAT',
                      'permissions': '0755',
                      'content': generic_NAT_per_boot_script
                     },
                     {'path': '/etc/dnsmasq.d/gns3-bbb',
                      'permissions': '0644',
                      'content': dnsmasq_conf
                     },
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


# BigBlueButton server and server NAT gateway

def BBB_server_nat(hostname, x=100, y=100):
    # A NAT gateway between our public "Internet" and a server's private subnet

    # This is done because the NAT gateway presents itself in DHCP/DNS using the server's name
    assert(hostname.endswith('-NAT'))
    hostname = hostname[:-4]

    per_boot_script=f"""#!/bin/bash
# $(dig +short $FQDN) returns the address this NAT gateway obtained from the NAT1 DHCP server
FQDN={hostname}.test
IP=$(dig +short $FQDN)

# These next statements assume that the server is on 192.168.1.2, and relay ssh and web traffic to it
# We ensure that the server is on 192.168.1.2 with a dhcp-host statement in /etc/dnsmasq.conf

iptables -t nat -A PREROUTING -p tcp -d $IP --dport 22 -j DNAT --to-destination 192.168.1.2
iptables -t nat -A PREROUTING -p tcp -d $IP --dport 80 -j DNAT --to-destination 192.168.1.2
iptables -t nat -A PREROUTING -p tcp -d $IP --dport 443 -j DNAT --to-destination 192.168.1.2

# hairpin case - we need to rewrite the source address before sending it back to bbb-ci
# no hairpin on port 22; we can ssh into the server, then ssh back to the NAT gateway if needed
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -d 192.168.1.2 -p tcp --dport 80 -j MASQUERADE
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -d 192.168.1.2 -p tcp --dport 443 -j MASQUERADE

iptables -t nat -A PREROUTING -p udp -d $IP --dport 16384:32768 -j DNAT --to-destination 192.168.1.2
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -d 192.168.1.2 -p udp --dport 16384:32768 -j MASQUERADE
"""

    dnsmasq_conf = f"""
listen-address=192.168.1.1
bind-interfaces
dhcp-host={hostname},192.168.1.2
dhcp-range=192.168.1.100,192.168.1.254,12h
# Don't use dhcp-sequential-ip; assign IP addresses based on hash of client MAC
# Otherwise, the IP address change around on reboots, and BBB doesn't like that.
# dhcp-sequential-ip
dhcp-authoritative
"""

    # Note that 'hostname-NAT' announces itself into DHCP as 'hostname'
    #
    # This is so that the testclients will connect to the NAT gateway to reach the server.

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on',
                                             'dhcp4-overrides' : {'hostname' : hostname}},
                                    'ens5': {'addresses': ['192.168.1.1/24']},
                      }}

    user_data = {'hostname': hostname + '-NAT',
                 'packages': ['dnsmasq'],
                 'package_upgrade': package_upgrade,
                 'users': [{'name': 'ubuntu',
                            'plain_text_passwd': 'ubuntu',
                            'ssh_authorized_keys': ssh_authorized_keys,
                            'lock_passwd': False,
                            'shell': '/bin/bash',
                            'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                 }],
                 'write_files': [
                     {'path': '/var/lib/cloud/scripts/per-boot/generic-NAT',
                      'permissions': '0755',
                      'content': generic_NAT_per_boot_script
                     },
                     {'path': '/var/lib/cloud/scripts/per-boot/NAT',
                      'permissions': '0755',
                      'content': per_boot_script
                     },
                     {'path': '/etc/dnsmasq.d/gns3-bbb',
                      'permissions': '0644',
                      'content': dnsmasq_conf
                     },
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

def BBB_server_standalone(hostname, x=100, y=300):

    # A BigBlueButton server without an associated NAT gateway

    network_config = {'version': 2, 'ethernets': {'ens4': {'dhcp4': 'on' }}}

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
                     {'path': '/testserver.sh',
                      'permissions': '0755',
                      'content': testserver_script
                     },
                 ],
                 'runcmd': ['su ubuntu -c /testserver.sh']
    }

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

    return gns3_project.ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                    cpus=4, ram=8192, disk=16384, x=x, y=y)

# BBB server with attached NAT gateway

def BBB_server(name, x=100, depends_on=None):
    server = BBB_server_standalone(name, x=x, y=300)
    switch = gns3_project.switch(name + '-subnet', x=x, y=200)
    server_nat = BBB_server_nat(name + '-NAT', x=x, y=100)

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

internet = gns3_project.cloud(args.interface, args.interface, x=-500, y=0)

notification_url = gns3_project.notification_url()

nat1 = master_gateway(args.project, x=-200, y=0)

# An Ethernet switch for our public "Internet"

PublicIP_switch = gns3_project.switch('128.8.8.0/24', x=0, y=0, ethernets=16)
gns3_project.link(nat1, 0, internet)
gns3_project.link(nat1, 1, PublicIP_switch)

# NAT4: public subnet to carrier grade NAT subnet
#
# We put a switch on here to ensure that NAT6's interface will be up when it boots.
# Otherwise, if the interface is down, it won't start its DHCP server (ever).
#
# NAT4, NAT5, and NAT6 are numbered to match the corresponding 'ens[456]'
# interface names on 'testclient'.

subnet = '100.64.1.1/24'
nat4 = BBB_client_nat('NAT4', x=100, y=-200, nat_interface=subnet)
gns3_project.link(nat4, 0, PublicIP_switch)
nat4_switch = gns3_project.switch(subnet, x=250, y=-200)
gns3_project.link(nat4, 1, nat4_switch)
gns3_project.depends_on(nat4, nat1)

# NAT5: public subnet to private client subnet, not overlapping server address space
#
# Put a switch on here for the same reason as NAT4.

subnet = '192.168.128.1/24'
nat5 = BBB_client_nat('NAT5', x=100, y=-100, nat_interface=subnet)
gns3_project.link(nat5, 0, PublicIP_switch)
nat5_switch = gns3_project.switch(subnet, x=250, y=-100)
gns3_project.link(nat5, 1, nat5_switch)
gns3_project.depends_on(nat5, nat1)

# NAT6: public subnet to private client subnet, overlapping server address space
#
# Put a switch on here for the same reason as NAT4.

subnet = '192.168.1.1/24'
nat6 = BBB_client_nat('NAT6', x=100, y=0, nat_interface=subnet)
gns3_project.link(nat6, 0, PublicIP_switch)
nat6_switch = gns3_project.switch(subnet, x=250, y=0)
gns3_project.link(nat6, 1, nat6_switch)
gns3_project.depends_on(nat6, nat1)

# The BigBlueButton servers and/or test clients

for v in args.version:
    if v.startswith('testclient'):
        # find an unoccupied y coordinate on the GUI
        for y in (-200, -100, 0, 100, 200):
            try:
                next(n for n in gns3_project.nodes() if n['x'] == 450 and n['y'] == y)
            except StopIteration:
                break
        client = BBB_client(v, x=450, y=y)
        gns3_project.link(client, 0, nat4_switch)
        gns3_project.depends_on(client, nat4)
        gns3_project.link(client, 1, nat5_switch)
        gns3_project.depends_on(client, nat5)
        gns3_project.link(client, 2, nat6_switch)
        gns3_project.depends_on(client, nat6)
    else:
        # find an unoccupied x coordinate on the GUI
        for x in (0, 200, -200, 400, -400):
            try:
                next(n for n in gns3_project.nodes() if n['x'] == x and n['y'] == 100)
            except StopIteration:
                break
        BBB_server(v, x=x, depends_on=nat1)

# The difference between these two is that start_nodes waits for notification that
# the nodes booted, while start_node does not.
#
# The project might not have a notification_url if the script couldn't figure out
# a local IP address suitable for a callback.

if notification_url:
    gns3_project.start_nodes(*args.version)
else:
    for node in args.version:
        gns3_project.start_node(node)
