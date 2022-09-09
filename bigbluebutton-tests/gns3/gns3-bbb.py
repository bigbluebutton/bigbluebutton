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
# ./gns3-bbb.py
#
# Can be passed a '-d' option to delete EVERYTHING in an existing project.
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

import sys
import requests
from requests.auth import HTTPBasicAuth
import json
import yaml
import os
import time
import shutil
import tempfile
import pprint
import urllib.parse
import datetime
import hashlib
import ipaddress

import socket
import threading
from http.server import BaseHTTPRequestHandler,HTTPServer

import argparse

import subprocess

import configparser

GNS3_CREDENTIAL_FILES = ["~/gns3_server.conf", "~/.config/GNS3/2.2/gns3_server.conf"]
SSH_AUTHORIZED_KEYS_FILES = ['~/.ssh/id_rsa.pub', "~/.ssh/authorized_keys"]

# Which interface on the bare metal system is used to access the Internet from GNS3?
#
# It should be either a routed virtual link to the bare metal system, or
# a bridged interface to a physical network device.

INTERNET_INTERFACE = 'veth1'

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

parser = argparse.ArgumentParser(description='Start an BigBlueButton test network in GNS3')
parser.add_argument('-d', '--delete', action="store_true",
                    help='delete everything in the project instead of creating it')
parser.add_argument('-p', '--project', default='BigBlueButton',
                    help='name of the GNS3 project (default "BigBlueButton")')
parser.add_argument('-n', '--server-name',
                    help='name of the BigBlueButton server (defaults to the specified version name)')
parser.add_argument('--ls', action="store_true",
                    help='list running nodes')
parser.add_argument('--create-test-client', action="store_true",
                    help='create a test client and add it to an existing network')
parser.add_argument('--create-test-server', action="store_true",
                    help='create a test server and add it to an existing network')
parser.add_argument('version', nargs=1,
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

# An Ubuntu 20 image created by GNS3/ubuntu.py in Brent Baccala's NPDC github repository
client_image = 'ubuntu-open-desktop-08-Aug-1616.qcow2'

# Obtain the credentials needed to authenticate ourself to the GNS3 server

config = configparser.ConfigParser()
for propfilename in GNS3_CREDENTIAL_FILES:
    propfilename = os.path.expanduser(propfilename)
    if os.path.exists(propfilename):
        config.read(propfilename)
        break
try:
    gns3_server = config['Server']['host'] + ":" + config['Server']['port']
except:
    print('No GNS3 server/host/port configuration found')
    exit(1)

auth = HTTPBasicAuth(config['Server']['user'], config['Server']['password'])

# Make sure the cloud and client images exist on the GNS3 server
#
# GNS3 doesn't seem to support a HEAD method on its images, so we get
# a directory of all of them and search for the ones we want

url = "http://{}/v2/compute/qemu/images".format(gns3_server)
if not any (f for f in requests.get(url, auth=auth).json() if f['filename'] == cloud_image):
    print(f"{cloud_image} isn't available on GNS3 server {gns3_server}")
    exit(1)
if not any (f for f in requests.get(url, auth=auth).json() if f['filename'] == client_image):
    print(f"{client_image} isn't available on GNS3 server {gns3_server}")
    exit(1)

# Find the GNS3 project called project_name

print("Finding project...")

url = "http://{}/v2/projects".format(gns3_server)

result = requests.get(url, auth=auth)
result.raise_for_status()

project_id = None

for project in result.json():
    if project['name'] == args.project:
        project_id = project['project_id']
        project_status = project['status']

if not project_id:
    print("Couldn't find project '{}'".format(args.project))
    exit(1)

print("'{}' is {}".format(args.project, project_id))

# Open the project, if needed

if project_status != 'opened':
    print("Opening project...")

    url = "http://{}/v2/projects/{}/open".format(gns3_server, project_id)

    result = requests.post(url, auth=auth, data=json.dumps({}))
    result.raise_for_status()

# Get the existing nodes and links in the project.
#
# We'll need this information to find a free port on a switch
# to connect our new gadget to.

url = "http://{}/v2/projects/{}/nodes".format(gns3_server, project_id)

result = requests.get(url, auth=auth)
result.raise_for_status()

nodes = result.json()

if args.ls:
    for node in nodes:
        #print(node['name'])
        print(json.dumps(node, indent=4))
    exit(0)

if args.delete:
    for node in nodes:
        print("deleting {}...".format(node['name']))
        node_url = "http://{}/v2/projects/{}/nodes/{}".format(gns3_server, project_id, node['node_id'])
        result = requests.delete(node_url, auth=auth)
        result.raise_for_status()
    exit(0)

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

# This will return the local IP address that the script uses to
# connect to the GNS3 server.  We need this to tell the instance
# how to connect back to the script, and if we've got multiple
# interfaces, multiple DNS names, and multiple IP addresses, it's a
# bit unclear which one to use.
#
# from https://stackoverflow.com/a/28950776/1493790

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # doesn't even have to be reachable
    s.connect((gns3_server.split(':')[0], 1))
    IP = s.getsockname()[0]
    s.close()
    return IP

script_ip = get_ip()

# Start an HTTP server running that will receive notifications from
# the instance after its completes its boot.
#
# This assumes that the virtual topology will have connectivity with
# the host running this script.
#
# We keep a set of which instances have reported in, and a condition
# variable is used to signal our main thread when they report.

instances_reported = set()
instance_content = {}
instance_report_cv = threading.Condition()

class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = self.headers['Content-Length']
        self.send_response_only(100)
        self.end_headers()

        content = urllib.parse.parse_qs(self.rfile.read(int(length)))
        hostname = content[b'hostname'][0]
        print(hostname.decode(), 'running')

        with instance_report_cv:
            if not hostname in instances_reported:
                instances_reported.add(hostname)
                instance_content[hostname] = content
                instance_report_cv.notify()

        self.send_response(200)
        self.end_headers()

def start_listening_for_notifications():
    global httpd, notification_url
    server_address = ('', 0)
    httpd = HTTPServer(server_address, RequestHandler)
    threading.Thread(target=httpd.serve_forever).start()
    return "http://{}:{}/".format(script_ip, httpd.server_port)

### Start nodes running
###
### We can't start everything at once, because not having network connectivity during boot is a problem
### for things like package installs and upgrades, so we need to make sure the gateways come up first
### before we try to boot nodes deeper in the topology.

def start_nodes_running():

    ubuntu_names_by_node_id = {v:k for k,v in ubuntu_node_ids_by_name.items()}

    all_dependent_nodes = set()
    for value in node_dependencies.values():
        for node in value:
            all_dependent_nodes.update((node['node_id'], ))

    waiting_for_things_to_start = all_dependent_nodes.difference(node_dependencies.keys())

    for start_node in waiting_for_things_to_start:
        print(f"Starting {ubuntu_names_by_node_id[start_node]}...")

        project_start_url = "http://{}/v2/projects/{}/nodes/{}/start".format(gns3_server, project_id, start_node)
        result = requests.post(project_start_url, auth=auth)
        result.raise_for_status()

    with instance_report_cv:

        while waiting_for_things_to_start.intersection(all_dependent_nodes):

            print('Waiting for', [ubuntu_names_by_node_id[nodeid] for nodeid in waiting_for_things_to_start.intersection(all_dependent_nodes)])
            instance_report_cv.wait()

            running_nodes = set(ubuntu_node_ids_by_name[inst.decode()] for inst in instances_reported)

            waiting_for_things_to_start.difference_update(running_nodes)

            candidate_nodes = set()

            for key, value in node_dependencies.items():
                if key not in waiting_for_things_to_start and key not in running_nodes:
                    if running_nodes.issuperset([v['node_id'] for v in value]):
                        candidate_nodes.add(key)

            for start_node in candidate_nodes:
                print(f"Starting {ubuntu_names_by_node_id[start_node]}...")

                project_start_url = "http://{}/v2/projects/{}/nodes/{}/start".format(gns3_server, project_id, start_node)
                result = requests.post(project_start_url, auth=auth)
                result.raise_for_status()

                waiting_for_things_to_start.add(start_node)

    httpd.shutdown()

### TRACK WHICH OBJECTS DEPEND ON WHICH OTHERS

node_dependencies = dict()
ubuntu_node_ids_by_name = dict()

### FUNCTIONS TO CREATE VARIOUS KINDS OF GNS3 OBJECTS

generic_NAT_per_boot_script = """#!/bin/bash
iptables -t nat -A POSTROUTING -o ens4 -j MASQUERADE
sysctl net.ipv4.ip_forward=1
"""

def create_ubuntu_node(user_data, x=0, y=0, image=cloud_image, cpus=None, ram=None, disk=None, ethernets=None, vnc=None):
    r"""create_ubuntu_node(user_data, x=0, y=0, cpus=None, ram=None, disk=None)
    ram and disk are both in MB; ram defaults to 256 MB; disk defaults to 2 GB
    """
    # Create an ISO image containing the boot configuration and upload it
    # to the GNS3 project.  We write the config to a temporary file,
    # convert it to ISO image, then post the ISO image to GNS3.

    print(f"Building cloud-init configuration for {user_data['hostname']}...")

    # Putting local-hostname in meta-data ensures that any initial DHCP will be done with hostname, not 'ubuntu'
    meta_data = {'local-hostname': user_data['hostname']}

    # Generate the ISO image that will be used as a virtual CD-ROM to pass all this initialization data to cloud-init.

    meta_data_file = tempfile.NamedTemporaryFile(delete = False)
    meta_data_file.write(yaml.dump(meta_data).encode('utf-8'))
    meta_data_file.close()

    user_data_file = tempfile.NamedTemporaryFile(delete = False)
    user_data_file.write(("#cloud-config\n" + yaml.dump(user_data)).encode('utf-8'))
    user_data_file.close()

    network_config_file = tempfile.NamedTemporaryFile(delete = False)
    network_config_file.write(yaml.dump(user_data['network']).encode('utf-8'))
    network_config_file.close()

    genisoimage_command = ["genisoimage", "-input-charset", "utf-8", "-o", "-", "-l",
                           "-relaxed-filenames", "-V", "cidata", "-graft-points",
                           "meta-data={}".format(meta_data_file.name),
                           "network-config={}".format(network_config_file.name),
                           "user-data={}".format(user_data_file.name)]

    genisoimage_proc = subprocess.Popen(genisoimage_command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

    isoimage = genisoimage_proc.stdout.read()

    debug_isoimage = False
    if debug_isoimage:
        with open('isoimage-debug.iso', 'wb') as f:
            f.write(isoimage)

    os.remove(meta_data_file.name)
    os.remove(user_data_file.name)
    os.remove(network_config_file.name)

    print(f"Uploading cloud-init configuration for {user_data['hostname']}...")

    # files in the GNS3 directory take precedence over these project files,
    # so we need to make these file names unique
    cdrom_image = project_id + '_' + user_data['hostname'] + '.iso'
    file_url = "http://{}/v2/projects/{}/files/{}".format(gns3_server, project_id, cdrom_image)
    result = requests.post(file_url, auth=auth, data=isoimage)
    result.raise_for_status()

    # Configure an Ubuntu cloud node

    print(f"Configuring {user_data['hostname']} node...")

    url = "http://{}/v2/projects/{}/nodes".format(gns3_server, project_id)

    # It's important to use the scsi disk interface, because the IDE interface in qemu
    # has some kind of bug, probably in its handling of DISCARD operations, that
    # causes a thin provisioned disk to balloon up with garbage.
    #
    # See https://unix.stackexchange.com/questions/700050
    # and https://bugs.launchpad.net/ubuntu/+source/qemu/+bug/1974100

    ubuntu_node = {
            "compute_id": "local",
            "name": user_data['hostname'],
            "node_type": "qemu",
            "properties": {
                "adapter_type" : "virtio-net-pci",
                "hda_disk_image": image,
                "hda_disk_interface": "scsi",
                "cdrom_image" : cdrom_image,
                "qemu_path": "/usr/bin/qemu-system-x86_64",
                "process_priority": "very high",
            },

            "symbol": ":/symbols/qemu_guest.svg",
            "x" : x,
            "y" : y
        }

    if cpus:
        ubuntu_node['properties']['cpus'] = cpus
    if ram:
        ubuntu_node['properties']['ram'] = ram
    if ethernets:
        ubuntu_node['properties']['adapters'] = ethernets
    if vnc:
        ubuntu_node['console_type'] = 'vnc'

    result = requests.post(url, auth=auth, data=json.dumps(ubuntu_node))
    result.raise_for_status()
    ubuntu = result.json()

    if disk and disk > 2048:
        url = "http://{}/v2/compute/projects/{}/qemu/nodes/{}/resize_disk".format(gns3_server, project_id, ubuntu['node_id'])
        resize_obj = {'drive_name' : 'hda', 'extend' : disk - 2048}
        result = requests.post(url, auth=auth, data=json.dumps(resize_obj))
        result.raise_for_status()

    ubuntu_node_ids_by_name[ubuntu['name']] = ubuntu['node_id']
    return ubuntu

def start_ubuntu_node(ubuntu):

    print(f"Starting {ubuntu['name']}...")

    project_start_url = "http://{}/v2/projects/{}/nodes/{}/start".format(gns3_server, project_id, ubuntu['node_id'])
    result = requests.post(project_start_url, auth=auth)
    result.raise_for_status()

def create_cloud(name, interface, x=0, y=0):

    print(f"Configuring cloud {name} for access to interface {interface}...")

    cloud_node = {
            "compute_id": "local",
            "name": name,
            "node_type": "cloud",

            "properties" : {
            "ports_mapping": [
                {
                    "interface": interface,
                    "name": interface,
                    "port_number": 0,
                    "type": "ethernet"
                }
            ],
            },

            "symbol": ":/symbols/cloud.svg",
            "x" : x,
            "y" : y,
        }

    result = requests.post(url, auth=auth, data=json.dumps(cloud_node))
    result.raise_for_status()
    return result.json()

def create_switch(name, x=0, y=0):

    print(f"Configuring Ethernet switch {name}...")

    switch_node = {
        "compute_id": "local",
        "name": name,
        "node_type": "ethernet_switch",

        "symbol": ":/symbols/ethernet_switch.svg",
        "x" : x,
        "y" : y
    }

    url = "http://{}/v2/projects/{}/nodes".format(gns3_server, project_id)

    result = requests.post(url, auth=auth, data=json.dumps(switch_node))
    result.raise_for_status()
    return result.json()

def create_link(node1, port1, node2, port2=None):
    r"""
    Creates a virtual network link from node1/port1 to node2/port2.

    'port2' is optional; the first available port on 'node2' will be used if it is not specified.
    """
    url = "http://{}/v2/projects/{}/links".format(gns3_server, project_id)

    if not port2:
        result = requests.get(url, auth=auth)
        result.raise_for_status()
        links = result.json()
        ports_in_use = set((node['adapter_number'], node['port_number']) for link in links for node in link['nodes'] if node['node_id'] == node2['node_id'])
        available_ports = (port for port in node2['ports'] if (port['adapter_number'], port['port_number']) not in ports_in_use)
        next_available_port = next(available_ports)
    else:
        next_available_port = node2['ports'][port2]

    link_obj = {'nodes' : [{'adapter_number' : node1['ports'][port1]['adapter_number'],
                            'port_number' : node1['ports'][port1]['port_number'],
                            'node_id' : node1['node_id']},
                           {'adapter_number' : next_available_port['adapter_number'],
                            'port_number' : next_available_port['port_number'],
                            'node_id' : node2['node_id']}]}

    result = requests.post(url, auth=auth, data=json.dumps(link_obj))
    result.raise_for_status()

# BigBlueButton test clients

client_user_data = {'hostname': 'client1',
                    'network': {'version': 2, 'ethernets': {'ens4': {'dhcp4': 'on' }}},
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

def create_test_client(hostname, x=0, y=0):
    client_user_data['hostname'] = hostname
    # need this many virtual CPUs to run the stress tests, which stress the client perhaps more than the server
    return create_ubuntu_node(client_user_data, image=client_image, cpus=12, ram=8192, disk=8192, vnc=True, x=x, y=y)

# NAT gateways

def create_nat_gateway(hostname, x=0, y=0, nat_interface='192.168.1.1/24'):

    interface = ipaddress.ip_interface(nat_interface)
    hosts = list(interface.network.hosts())
    assert hosts[0] == interface.ip

    user_data = {'hostname': hostname,
                 'network': {'version': 2, 'ethernets': {'ens4': {'dhcp4': 'on'},
                                                         'ens5': {'addresses': [nat_interface], 'optional': True},
                 }},
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

    return create_ubuntu_node(user_data, ram=1024, disk=4096, ethernets=2, x=x, y=y)


# BigBlueButton server

def create_server(hostname, x=100, notification_url=None, use_nat=True, depends_on=None):

    user_data = {'hostname': hostname,
                 'network': {'version': 2, 'ethernets': {'ens4': {'dhcp4': 'on' }}},
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

    server = create_ubuntu_node(user_data, cpus=4, ram=8192, disk=16384, x=x, y=300)

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

        user_data = {'hostname': hostname + '-NAT',
                     'network': {'version': 2, 'ethernets': {'ens4': {'dhcp4': 'on',
                                                                      'dhcp4-overrides' : {'hostname' : hostname}},
                                                             'ens5': {'addresses': ['192.168.1.1/24']},
                     }},
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

        nat2 = create_ubuntu_node(user_data, ram=1024, disk=4096, ethernets=2, x=x, y=100)

        create_link(nat2, 0, PublicIP_switch)

        switch2 = create_switch(hostname + '-subnet', x=x, y=200)

        create_link(nat2, 1, switch2, 0)

        create_link(server, 0, switch2, 1)

        if depends_on:
            node_dependencies[nat2['node_id']] = (depends_on,)
        node_dependencies[server['node_id']] = (nat2,)

        # Management link for ssh access to NAT2
        # create_link(nat2, 2, internet, 2)

### CREATE NEW NODES (IF REQUESTED)

if args.create_test_client:
    create_test_client('client')
    exit(0)

if args.create_test_server:
    global PublicIP_switch
    PublicIP_switch = next(n for n in nodes if n['name'] == 'PublicIP' and n['node_type'] == 'ethernet_switch')
    notification_url = start_listening_for_notifications()
    # find an unoccupied x coordinate on the GUI
    for x in (100, 200, 0, 300, -100):
        try:
            next(n for n in nodes if n['x'] == x and n['y'] == 100)
        except StopIteration:
            break
    create_server(args.version[0], notification_url=notification_url, x=x)
    start_nodes_running()
    exit(0)

# Check to see if we have an existing network, and abort if so

existing_nodes = set(n['name'] for n in nodes)
potential_nodes = set('Internet InternetSwitch PublicIP NAT1 NAT2 NAT3 NAT4 ServerSubnet bbb-ci.test'.split())

if existing_nodes.intersection(potential_nodes):
    print('Not creating network because of existing nodes:', existing_nodes)
    exit(1)

# CREATE NEW VIRTUAL NETWORK

notification_url = start_listening_for_notifications()

# CREATE A NAT GATEWAY BETWEEN OUR PUBLIC INTERNET AND THE ACTUAL INTERNET

# BBB's default STUN server is stun.l.google.com:19302, so we configure
# NAT1 to mimic it.

user_data = {'hostname': 'NAT1',
             'network': {'version': 2, 'ethernets': {'ens4': {'dhcp4': 'on', 'dhcp-identifier': 'mac'},
                                                     'ens5': {'addresses': ['128.8.8.254/24']}}},
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
                 {'path': '/generateCA.sh',
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
                        'su ubuntu -c /generateCA.sh',
                       ],
}

# If the system we're running on is configured to use an apt proxy, use it for the NAT instance as well.
#
# This will break things if the instance can't reach the proxy.

if apt_proxy:
    user_data['apt'] = {'http_proxy': apt_proxy}

nat1 = create_ubuntu_node(user_data, ram=1024, disk=4096, ethernets=2)

# CREATE CLOUD

cloud = create_cloud('Internet', INTERNET_INTERFACE, x=-400, y=0)

internet = create_switch('InternetSwitch', x=-200, y=0)

create_link(cloud, 0, internet, 0)

# CREATE A NEW ETHERNET SWITCH

PublicIP_switch = create_switch('PublicIP', x=100, y=0)

# LINK TO SWITCH

print("Configuring link from Internet to NAT...")

create_link(nat1, 0, internet, 1)

# SECOND LINK TO SWITCH

print("Configuring link from NAT to Public IP switch...")

create_link(nat1, 1, PublicIP_switch, 0)

# NAT3: PUBLIC SUBNET TO PRIVATE CLIENT SUBNET, OVERLAPPING SERVER ADDRESS SPACE

nat3 = create_nat_gateway('NAT3', x=200, y=0, nat_interface='192.168.1.1/24')

create_link(nat3, 0, PublicIP_switch)

node_dependencies[nat3['node_id']] = (nat1,)

# NAT4: PUBLIC SUBNET TO PRIVATE CLIENT SUBNET, NOT OVERLAPPING SERVER ADDRESS SPACE

nat4 = create_nat_gateway('NAT4', x=200, y=-100, nat_interface='192.168.128.1/24')

create_link(nat4, 0, PublicIP_switch)

node_dependencies[nat4['node_id']] = (nat1,)

# THE BIG BLUE BUTTON SERVER

create_server(args.version[0], notification_url=notification_url, depends_on=nat1)

# THE TEST CLIENT

client = create_test_client('testclient', x=300, y=-100)
create_link(client, 0, nat4, 1)

node_dependencies[client['node_id']] = (nat4,)

start_nodes_running()
