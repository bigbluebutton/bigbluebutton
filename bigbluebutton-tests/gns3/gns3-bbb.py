#!/usr/bin/python3
#
# Script to setup a GNS3 project for testing BigBlueButton.
#
# It will be configured to accept your ssh keys for ssh access.
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
# 1. Authentication to GNS3 server
#
#    Provide one of the GNS3_CREDENTIAL_FILES in propfile format;
#    minimal entries are host/port/user/password in the Server block:
#
#    [Server]
#    host = localhost
#    port = 3080
#    user = admin
#    password = password
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
# don't worry, this file's cloud-init configuration will run a package update.

cloud_images = {
    22: 'ubuntu-22.04-server-cloudimg-amd64.img',
    20: 'ubuntu-20.04-server-cloudimg-amd64.img',
    18: 'ubuntu-18.04-server-cloudimg-amd64.img'
}

cloud_image = cloud_images[20]

# set to True to immediately upgrade to latest package versions; slows thing down a bit
package_upgrade = False

# Parse the command line options

parser = argparse.ArgumentParser(parents=[gns3.parser('BigBlueButton')], description='Start an BigBlueButton test network in GNS3')
parser.add_argument('--client-image', type=str,
                    help='Ubuntu image to be used for test clients')
parser.add_argument('version', nargs='*',
                    help='version of BigBlueButton server to be installed\n(bionic-240, focal-250, focal-25-dev, focal-260)')
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

if 'testclient' in args.version:
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

generic_NAT_per_boot_script = """#!/bin/bash
iptables -t nat -A POSTROUTING -o ens4 -j MASQUERADE
sysctl net.ipv4.ip_forward=1
"""

# BigBlueButton test clients

client_network_config = {'version': 2,
                         'ethernets': {'ens4': {'dhcp4': 'on' },
                                       'ens5': {'dhcp4': 'on', 'optional': True },
                                       'ens6': {'dhcp4': 'on', 'optional': True },
                         }}

client_user_data = {'hostname': 'client1',
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
    client_user_data['apt'] = {'http_proxy': apt_proxy}
    client_user_data['write_files'].append(
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
        client_user_data['runcmd'].append(f'su ubuntu -c \'git config --global --add user.name "{git_user_name}"\'')
    if git_user_email != '':
        client_user_data['runcmd'].append(f'su ubuntu -c \'git config --global --add user.email "{git_user_email}"\'')
except subprocess.CalledProcessError:
    pass

def create_BBB_client(hostname, x=0, y=0):
    client_user_data['hostname'] = hostname
    # need this many virtual CPUs to run the stress tests, which stress the client perhaps more than the server
    return gns3_project.create_ubuntu_node(client_user_data, image=args.client_image, network_config=client_network_config,
                                           cpus=12, ram=8192, disk=8192, ethernets=3, vnc=True, x=x, y=y)

# NAT gateways

def create_nat_gateway(hostname, x=0, y=0, notification_url=None, nat_interface='192.168.1.1/24'):

    interface = ipaddress.ip_interface(nat_interface)
    hosts = list(interface.network.hosts())
    assert hosts[0] == interface.ip

    network_config = {'version': 2,
                      'ethernets': {'ens4': {'dhcp4': 'on'},
                                    'ens5': {'addresses': [nat_interface], 'optional': True},
                      }}
    user_data = {'hostname': hostname,
                 'packages': ['dnsmasq'],
                 'package_upgrade': package_upgrade,
                 'phone_home': {'url': notification_url, 'tries': 1},
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
                 ],
                 'runcmd': [f'echo listen-address={hosts[0]} >> /etc/dnsmasq.conf',
                            'echo bind-interfaces >> /etc/dnsmasq.conf',
                            f'echo dhcp-range={hosts[1]},{hosts[-1]},12h >> /etc/dnsmasq.conf',
                            # Don't use dhcp-sequential-ip; assign IP addresses based on hash of client MAC
                            # Otherwise, the IP address change around on reboots, and BBB doesn't like that.
                            #'echo dhcp-sequential-ip >> /etc/dnsmasq.conf',
                            'echo dhcp-authoritative >> /etc/dnsmasq.conf',
                            'systemctl start dnsmasq'
                           ],
    }

    # If the system we're running on is configured to use an apt proxy, use it for the NAT instance as well.
    #
    # This will break things if the instance can't reach the proxy.

    if apt_proxy:
        user_data['apt'] = {'http_proxy': apt_proxy}

    return gns3_project.create_ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                           ram=1024, disk=4096, ethernets=2, x=x, y=y)


# BigBlueButton server
#
# Also creates a NAT gateway and a server subnet (if use_nat is True)
#
# We have a depends_on argument, instead of just letting the caller call depends_on(),
# because the dependency might (optionally) involve the NAT gateway, not just the server.

def create_BBB_server(hostname, x=100, notification_url=None, use_nat=True, depends_on=None):

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

    server = gns3_project.create_ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                             cpus=4, ram=8192, disk=16384, x=x, y=300)

    # NAT2: PUBLIC SUBNET TO SERVER PRIVATE SUBNET

    if use_nat:

        per_boot_script=f"""#!/bin/bash
# $(dig +short $FQDN) returns the address this NAT gateway obtained from the NAT1 DHCP server
FQDN={hostname}.test
IP=$(dig +short $FQDN)

# These next statements assume that the server is on 192.168.1.2, and relay web traffic to it
# We ensure that the server is on 192.168.1.2 with a dhcp-host statement in /etc/dnsmasq.conf

# Don't do this anymore; now we accept packets on ens5 as well as ens4 to do hairpin NAT
# iptables -t nat -A PREROUTING -i ens4 -p tcp --dport 80 -j DNAT --to-destination 192.168.1.2
# iptables -t nat -A PREROUTING -i ens4 -p tcp --dport 443 -j DNAT --to-destination 192.168.1.2

iptables -t nat -A PREROUTING -p tcp -d $IP --dport 80 -j DNAT --to-destination 192.168.1.2
iptables -t nat -A PREROUTING -p tcp -d $IP --dport 443 -j DNAT --to-destination 192.168.1.2

# hairpin case - we need to rewrite the source address before sending it back to bbb-ci
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -d 192.168.1.2 -p tcp --dport 80 -j MASQUERADE
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -d 192.168.1.2 -p tcp --dport 443 -j MASQUERADE

iptables -t nat -A PREROUTING -p udp -d $IP --dport 16384:32768 -j DNAT --to-destination 192.168.1.2
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -d 192.168.1.2 -p udp --dport 16384:32768 -j MASQUERADE
"""

        # Note that 'hostname-NAT' announces itself into DHCP as 'hostname'

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
                     ],
                     'runcmd': ['echo listen-address=192.168.1.1 >> /etc/dnsmasq.conf',
                                'echo bind-interfaces >> /etc/dnsmasq.conf',
                                f'echo dhcp-host={hostname},192.168.1.2 >> /etc/dnsmasq.conf',
                                'echo dhcp-range=192.168.1.100,192.168.1.254,12h >> /etc/dnsmasq.conf',
                                # Don't use dhcp-sequential-ip; assign IP addresses based on hash of client MAC
                                # Otherwise, the IP address change around on reboots, and BBB doesn't like that.
                                #'echo dhcp-sequential-ip >> /etc/dnsmasq.conf',
                                'echo dhcp-authoritative >> /etc/dnsmasq.conf',
                                # The server will register itself with DHCP as 'hostname'
                                # Actually, the server is registering itself as 'ubuntu'
                                # This option is causing 'test' to be announced into DHCP as the domain,
                                #    so once 'bbb-ci' is set as the hostname, we get 'bbb-ci.test' as the fqdn
                                #       bbb-ci.test resolves to 128.8.8.101
                                #       ubuntu.test resolves to 192.168.1.2
                                # After a reboot, however,
                                #       bbb-ci.test resolves to 192.168.1.2 (from bbb-ci; we've reassigned the hostname)
                                #                            to 128.8.8.101 (from NAT3, or even NAT2)
                                #       ubuntu.test resolves to 128.8.8.103 (NAT4, the last NAT box to DHCP boot and register with NAT1)
                                # This option will cause it to appear in DNS as 'bbb-ci.test' (and in its hostname --fqdn)
                                'echo domain=test >> /etc/dnsmasq.conf',
                                'systemctl start dnsmasq',
                     ],
        }

        if notification_url:
            user_data['phone_home'] = {'url': notification_url, 'tries': 1}

        # If the system we're running on is configured to use an apt proxy, use it for the NAT instance as well.
        #
        # This will break things if the instance can't reach the proxy.

        if apt_proxy:
            user_data['apt'] = {'http_proxy': apt_proxy}

        nat2 = gns3_project.create_ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                               ram=1024, disk=4096, ethernets=2, x=x, y=100)

        gns3_project.create_link(nat2, 0, PublicIP_switch)

        switch2 = gns3_project.create_switch(hostname + '-subnet', x=x, y=200)

        gns3_project.create_link(nat2, 1, switch2, 0)

        gns3_project.create_link(server, 0, switch2, 1)

        if depends_on:
            gns3_project.depends_on(nat2, depends_on)
        gns3_project.depends_on(server, nat2)

        # Management link for ssh access to NAT2
        # create_link(nat2, 2, internet, 2)

### DECLARE NODES: CREATE THEM, BUT ONLY IF THEY DON'T ALREADY EXIST

def nat_gateway(name, *args, **kwargs):
    if name not in gns3_project.node_names():
        return create_nat_gateway(name, *args, notification_url=notification_url, **kwargs)
    else:
        print(name, "exists")
        return gns3_project.node(name)

def BBB_server(name, *args, **kwargs):
    if name not in gns3_project.node_names():
        return create_BBB_server(name, *args, **kwargs)
    else:
        print(name, "exists")
        server = gns3_project.node(name)
        server_NAT = gns3_project.node(name + '-NAT')
        gsn3_project.depends_on(server, server_NAT)
        if 'depends_on' in kwargs:
            gns3_project.depends_on(server_NAT, kwargs['depends_on'])
        return server

def BBB_client(name, *args, **kwargs):
    if name not in gns3_project.node_names():
        return create_BBB_client(name, *args, **kwargs)
    else:
        print(name, "exists")
        return gns3_project.node(name)

# CREATE NEW VIRTUAL NETWORK

# Create a GNS3 "cloud" for Internet access.
#
# It's done early in the script like this so that the gns3 library
# knows which interface we're using, because it might need that
# information to construct a notification URL.

cloud = gns3_project.cloud('Internet', args.interface, x=-500, y=0)
internet = gns3_project.switch('InternetSwitch', x=-300, y=0)
gns3_project.link(cloud, 0, internet)

notification_url = gns3_project.notification_url()

# CREATE A NAT GATEWAY BETWEEN OUR PUBLIC INTERNET AND THE ACTUAL INTERNET

# BBB's default STUN server is stun.l.google.com:19302, so we configure
# NAT1 to mimic it.

network_config = {'version': 2,
                  'ethernets': {'ens4': {'dhcp4': 'on', 'dhcp-identifier': 'mac'},
                                'ens5': {'addresses': ['128.8.8.254/24']},
                  }}

user_data = {'hostname': 'NAT1',
             'packages': ['dnsmasq', 'coturn', 'apache2'],
             'package_upgrade': package_upgrade,
             'phone_home': {'url': notification_url, 'tries': 1},
             'users': [{'name': 'ubuntu',
                        'plain_text_passwd': 'ubuntu',
                        'ssh_authorized_keys': ssh_authorized_keys,
                        'lock_passwd': False,
                        'shell': '/bin/bash',
                        'sudo': 'ALL=(ALL) NOPASSWD:ALL',
                      }],
             'write_files': [
                 {'path': '/ca/generateCA.sh',
                  'permissions': '0755',
                  'content': generateCA_script
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
             'runcmd': ['echo listen-address=128.8.8.254 >> /etc/dnsmasq.conf',
                        'echo bind-interfaces >> /etc/dnsmasq.conf',
                        'echo dhcp-range=128.8.8.101,128.8.8.200,12h >> /etc/dnsmasq.conf',
                        # Don't use dhcp-sequential-ip; assign IP addresses based on hash of client MAC
                        # Otherwise, the IP address change around on reboots, and BBB doesn't like that.
                        #'echo dhcp-sequential-ip >> /etc/dnsmasq.conf',
                        'echo dhcp-authoritative >> /etc/dnsmasq.conf',
                        # The server's NAT router will register itself with DHCP as 'bbb-ci'
                        # This option will cause dnsmasq to announce it in DNS as 'bbb-ci.test'
                        'echo domain=test >> /etc/dnsmasq.conf',
                        # dnsmasq injects /etc/hosts into its DNS service
                        # don't this I need this anymore
                        #'echo 128.8.8.1 bbb-ci.test >> /etc/hosts',
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
                        '/ca/generateCA.sh',
                       ],
}

# If we have a key and certificate for the certificate authority, copy them into /ca
#
# Otherwise, the generateCA.sh script will generate them when the instance boots.

try:
    for fn in ('bbb-dev-ca.key', 'bbb-dev-ca.crt'):
        with open(os.path.join(__location__, fn)) as f:
            user_data['write_files'].append({'path': f'/ca/{fn}', 'permissions': '0444', 'content': f.read()})
except Exception as ex:
    print(ex)

# If the system we're running on is configured to use an apt proxy, use it for the NAT instance as well.
#
# This will break things if the instance can't reach the proxy.

if apt_proxy:
    user_data['apt'] = {'http_proxy': apt_proxy}

nat1 = gns3_project.ubuntu_node(user_data, image=cloud_image, network_config=network_config,
                                ram=1024, disk=4096, ethernets=2, x=-100, y=0)

# CREATE A NEW ETHERNET SWITCH

PublicIP_switch = gns3_project.switch('PublicIP', x=0, y=0, ethernets=16)
gns3_project.link(nat1, 0, internet)
gns3_project.link(nat1, 1, PublicIP_switch)

# NAT3: PUBLIC SUBNET TO PRIVATE CLIENT SUBNET, OVERLAPPING SERVER ADDRESS SPACE
#
# We put a switch on here to ensure that NAT3's interface will be up when it boots.
#
# Otherwise, if the interface is down, it won't start its DHCP server (ever).

nat3 = nat_gateway('NAT3', x=100, y=0, nat_interface='192.168.1.1/24')
gns3_project.link(nat3, 0, PublicIP_switch)
nat3_switch = gns3_project.switch('NAT3-subnet', x=200, y=0)
gns3_project.link(nat3, 1, nat3_switch)
gns3_project.depends_on(nat3, nat1)

# NAT4: PUBLIC SUBNET TO PRIVATE CLIENT SUBNET, NOT OVERLAPPING SERVER ADDRESS SPACE
#
# Put a switch on here for the same reason as NAT3.

nat4 = nat_gateway('NAT4', x=100, y=-100, nat_interface='192.168.128.1/24')
gns3_project.link(nat4, 0, PublicIP_switch)
nat4_switch = gns3_project.switch('NAT4-subnet', x=200, y=-100)
gns3_project.link(nat4, 1, nat4_switch)
gns3_project.depends_on(nat4, nat1)

# NAT5: PUBLIC SUBNET TO CARRIER GRADE NAT SUBNET
#
# Put a switch on here for the same reason as NAT3.

nat5 = nat_gateway('NAT5', x=100, y=-200, nat_interface='100.64.1.1/24')
gns3_project.link(nat5, 0, PublicIP_switch)
nat5_switch = gns3_project.switch('NAT5-subnet', x=200, y=-200)
gns3_project.link(nat5, 1, nat5_switch)
gns3_project.depends_on(nat5, nat1)

# THE BIG BLUE BUTTON SERVER and/or TEST CLIENT

for v in args.version:
    if v == 'testclient':
        client = BBB_client('testclient', x=300, y=-100)
        gns3_project.link(client, 0, nat5_switch)
        gns3_project.depends_on(client, nat5)
        gns3_project.link(client, 1, nat4_switch)
        gns3_project.depends_on(client, nat4)
        gns3_project.link(client, 2, nat3_switch)
        gns3_project.depends_on(client, nat3)
    else:
        # find an unoccupied x coordinate on the GUI
        for x in (0, 200, -200, 400, -400):
            try:
                next(n for n in gns3_project.nodes() if n['x'] == x and n['y'] == 100)
            except StopIteration:
                break
        BBB_server(v, notification_url=notification_url, x=x, depends_on=nat1)

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
