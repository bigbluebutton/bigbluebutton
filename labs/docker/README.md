IMPORTANT: this is a work in progress!

# Purpose

The purpose of this repo is to get BigBlueButton working in a multi-container Docker configuration over a single port, then to deploy and scale it using Kubernetes

# Launching BBB via Docker

## Prerequisites

Ensure you have the latest version of Docker-CE by following the install steps

Ubuntu: https://docs.docker.com/install/linux/docker-ce/ubuntu/

Fedora: https://docs.docker.com/install/linux/docker-ce/fedora/

Make sure to also do the post install steps

https://docs.docker.com/install/linux/linux-postinstall/

Install docker-compose

Ubuntu: 
```
$ sudo dnf install docker-compose
```

Fedora:
```
$ sudo apt-get install docker-compose
```

## Build all docker images

You should now be able to build all docker images with one command
```
$ cd labs/docker/
$ make release
```

Verify that you have all the necessary images
```
$ docker images
```

You should see:
* sbt
* bbb-common-message
* bbb-common-web
* bbb-fsesl-client
* bbb-akka-apps
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
$ cd labs/docker/sbt/
$ docker build -t 'sbt:0.13.8' .
```

Build libraries
```
$ cd bbb-common-message/
$ docker build -t 'bbb-common-message' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

$ cd bbb-common-web/
$ docker build -t 'bbb-common-web' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

$ cd bbb-fsesl-client/
$ docker build -t 'bbb-fsesl-client' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build akka components
```
$ cd akka-bbb-apps/
$ docker build -t bbb-apps-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

# Not needed since we're setting up HTML5 only
$ cd akka-bbb-transcode/
$ docker build -t bbb-transcode --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

$ cd akka-bbb-fsesl/
$ docker build -t bbb-fsesl-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build bbb-web
```
$ cd bigbluebutton-web/
$ docker build -t bbb-web --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build bbb-html5
```
$ cd bigbluebutton-html5/
$ docker build -t bbb-html5 .
```

Build bbb-webrtc-sfu
```
$ cd labs/bbb-webrtc-sfu/
$ docker build -t bbb-webrtc-sfu .
```

Build bbb-webhooks
```
$ cd bbb-webhooks/
$ docker build -t bbb-webhooks .
```

Build Kurento Media Server
```
$ cd labs/docker/kurento/
$ docker build -t bbb-kurento .
```

Build FreeSWITCH
```
$ cd labs/docker/freeswitch/
$ docker build -t bbb-freeswitch .
```

Build nginx
```
$ cd labs/docker/nginx/
$ docker build -t bbb-nginx .
```

Build nginx-dhp (used to generate the Diffie-Hellman file)
```
$ cd labs/docker/nginx-dhp/
$ docker build -t nginx-dhp .
```

Build coturn
```
$ cd labs/docker/coturn
$ docker build -t bbb-coturn .
```

(Optional) Build bbb-lti
```
$ cd bbb-lti/
$ docker build -t bbb-lti .
```

## Setup

Export your configuration as environment variables, make sure to replace the SERVER_DOMAIN value with your hostname
```
$ export SERVER_DOMAIN=docker.bigbluebutton.org
$ export EXTERNAL_IP=$(dig +short $SERVER_DOMAIN | grep '^[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*$' | head -n 1)
$ export SHARED_SECRET=`openssl rand -hex 16`
$ export COTURN_REST_SECRET=`openssl rand -hex 16`
$ export SECRET_KEY_BASE=`openssl rand -hex 64`
$ export SCREENSHARE_EXTENSION_KEY=akgoaoikmbmhcopjgakkcepdgdgkjfbc
$ export SCREENSHARE_EXTENSION_LINK=https://chrome.google.com/webstore/detail/bigbluebutton-screenshare/akgoaoikmbmhcopjgakkcepdgdgkjfbc
$ export TAG_PREFIX=
$ export TAG_SUFFIX=
```

Create a volume for the static files (optional)
```
$ docker volume create docker_static
$ cd bigbluebutton-config/web/
$ docker run -d --rm --name nginx -v docker_static:/var/www/bigbluebutton-default nginx tail -f /dev/null
$ docker cp . nginx:/var/www/bigbluebutton-default
$ docker exec -it nginx chown -R www-data:www-data /var/www/bigbluebutton-default
$ docker stop nginx
```

## Run

Launch everything with docker compose
```
$ cd labs/docker/
$ docker-compose up
```

You should be able to start using greenlight to access your server and create meetings

https://<your_hostname>/b

To exit
```
CTRL+C
```


# Setting up a Kubernetes Cluster

## Prerequisites

Install kubeadm, kubelet, and kubectl

https://kubernetes.io/docs/setup/independent/install-kubeadm/

To disable swap, comment out the "swap" line in the following file, then do a reboot:
```
$ sudo vi /etc/fstab
$ sudo systemctl reboot
```

Verify swap is disabled
```
$ sudo free -h
```

Install Minikube

https://kubernetes.io/docs/tasks/tools/install-minikube/

Install VirtualBox Manager

Ubuntu:
```
$ sudo dnf install virtualbox
```

Fedora:
```
$ sudo apt-get install virtualbox
```

## Setup

Ensure you have the following kernel modules loaded to avoid preflight errors and warnings when setting up your cluster:
* ip_vs
* ip_vs_rr
* ip_vs_wrr
* ip_vs_sh

You can check if you already have these loaded with
```
$ lsmod | grep ip_vs
```

If the kernel modules aren't loaded, go ahead and add them
```
$ sudo modprobe ip_vs
$ sudo modprobe ip_vs_rr
$ sudo modprobe ip_vs_wrr
$ sudo modprobe ip_vs_sh
```

Create a single master cluster with kubeadm

https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/
