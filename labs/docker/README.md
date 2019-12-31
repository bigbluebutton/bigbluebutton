IMPORTANT: this is a work in progress!

# Purpose

The purpose of this repo is to get BigBlueButton working in a multi-container Docker configuration over a single port, then to deploy and scale it using Kubernetes

# Launching BBB via Docker

## Prerequisites

#### Ensure you have the latest version of Docker-CE by following the install steps

Ubuntu: https://docs.docker.com/install/linux/docker-ce/ubuntu/

Fedora: https://docs.docker.com/install/linux/docker-ce/fedora/

#### Make sure to also do the post install steps

https://docs.docker.com/install/linux/linux-postinstall/

#### Install docker-compose

Ubuntu: 
```
sudo apt-get install docker-compose
```

Fedora:
```
sudo dnf install docker-compose
```

## Build all docker images

#### Build all docker images with one command
```
cd labs/docker/
make release
```

#### Verify that you have all the necessary images
```
docker images
```

You should see:
* sbt
* bbb-common-message
* bbb-common-web
* bbb-fsesl-client
* bbb-apps-akka
* bbb-fsesl-akka
* bbb-web
* bbb-html5
* bbb-webrtc-sfu
* bbb-webhooks
* bbb-kurento
* bbb-freeswitch
* bbb-nginx
* bbb-coturn
* bbb-lti


In the event that any of the above images are missing, you'll need to build them individually

## Build images individually

sbt is needed to build the Scala components
```
cd labs/docker/sbt/
docker build -t 'sbt:0.13.8' .
```

Build libraries
```
cd bbb-common-message/
docker build -t 'bbb-common-message' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

cd bbb-common-web/
docker build -t 'bbb-common-web' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

cd bbb-fsesl-client/
docker build -t 'bbb-fsesl-client' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build akka components
```
cd akka-bbb-apps/
docker build -t bbb-apps-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

# Not needed since we're setting up HTML5 only
cd akka-bbb-transcode/
docker build -t bbb-transcode --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

cd akka-bbb-fsesl/
docker build -t bbb-fsesl-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build bbb-web
```
cd bigbluebutton-web/
docker build -t bbb-web --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build bbb-html5
```
cd bigbluebutton-html5/
docker build -t bbb-html5 .
```

Build bbb-webrtc-sfu
```
cd labs/bbb-webrtc-sfu/
docker build -t bbb-webrtc-sfu .
```

Build bbb-webhooks
```
cd bbb-webhooks/
docker build -t bbb-webhooks .
```

Build Kurento Media Server
```
cd labs/docker/kurento/
docker build -t bbb-kurento .
```

Build FreeSWITCH
```
cd labs/docker/freeswitch/
docker build -t bbb-freeswitch .
```

Build nginx
```
cd labs/docker/nginx/
docker build -t bbb-nginx .
```

Build coturn
```
cd labs/docker/coturn
docker build -t bbb-coturn .
```

(Optional) Build bbb-lti
```
cd bbb-lti/
docker build -t bbb-lti .
```

## Setup

#### Create environment variables

Inside the docker folder create a file called ".env". In this file include the following variables:

```
TURN_DOMAIN=<turn domain>
TURN_PORT=8443
TURN_SECRET=41eac2b93d3e224ffcffa5c2ae189026
SERVER_DOMAIN=<server domain>
SHARED_SECRET=330a8b08c3b4c61533e1d0c5ce1ac88f
EXTERNAL_IP=127.0.0.1
SCREENSHARE_EXTENSION_KEY=akgoaoikmbmhcopjgakkcepdgdgkjfbc
SCREENSHARE_EXTENSION_LINK=https://chrome.google.com/webstore/detail/bigbluebutton-screenshare/akgoaoikmbmhcopjgakkcepdgdgkjfbc
```

#### SSL files

Inside bbb-nginx folder, create a folder called ssl and put all the necessary files needed for setting a secure connection.
Inside coturn folder, create a folder called ssl and put all the necessary files needed for setting a secure connection.


#### Create a volume for the static files (optional)
```
docker volume create docker_static
cd bigbluebutton-config/web/
docker run -d --rm --name nginx -v docker_static:/var/www/bigbluebutton-default nginx tail -f /dev/null
docker cp . nginx:/var/www/bigbluebutton-default
docker exec -it nginx chown -R www-data:www-data /var/www/bigbluebutton-default
docker stop nginx
```

#### Ensure the following ports are open
* TCP/UDP 3478
* TCP 80
* TCP 443

## Run

#### Launch everything with docker compose
```
cd labs/docker/
docker-compose up
```

#### Access your server via greenlight and create meetings

https://<your_fqdn_here>/b

#### To shut down and exit gracefully
```
CTRL+C
```


# Setting up a Kubernetes Cluster

## Prerequisites

#### Install kubeadm, kubelet, and kubectl

https://kubernetes.io/docs/setup/independent/install-kubeadm/

#### Disable swap by commenting out the "swap" line in /etc/fstab, then do a reboot
```
sudo vi /etc/fstab
sudo systemctl reboot
```

#### Verify swap is disabled
```
sudo free -h
```

#### Install Minikube

https://kubernetes.io/docs/tasks/tools/install-minikube/

#### Install VirtualBox Manager

Ubuntu:
```
sudo apt-get install virtualbox
```

Fedora:
```
sudo dnf install virtualbox
```

## Setup

#### The following kernel modules are required to avoid preflight errors and warnings during cluster setup
* ip_vs
* ip_vs_rr
* ip_vs_wrr
* ip_vs_sh

#### Check if kernel modules are already loaded
```
lsmod | grep ip_vs
```

#### Add the kernel modules (if not already loaded)
```
sudo modprobe ip_vs
sudo modprobe ip_vs_rr
sudo modprobe ip_vs_wrr
sudo modprobe ip_vs_sh
```

#### Create a single master cluster with kubeadm

https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/
