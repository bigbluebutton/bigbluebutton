---
id: guide
slug: /development/guide
title: Development Guide
sidebar_position: 2
description: BigBlueButton Development Guide
keywords:
- development
- developer
---

Welcome to the BigBlueButton Developer's Guide for BigBlueButton 2.6.

This document gives you an overview of how to set up a development environment for BigBlueButton 2.6.

## Before you begin

You first need to set up a BigBlueButton 2.6 server. See the instructions at [Install BigBlueButton 2.6](/administration/install).

## Overview

A BigBlueButton server is built from a number of components that correspond to Ubuntu packages. Some of these components are

- bbb-web -- Implements the BigBlueButton API and conversion of documents for presentation
- akka-bbb-apps -- Server side application that handles the state of meetings on the server
- bbb-html5 -- HTML5 client that loads in the browser. The client server-side Meteor application that leverages MongoDB and React.js
- bbb-learning-dashboard -- a live dashboard available to moderators, which displays user activity information that can be useful for instructors
- bbb-fsesl-akka -- Component to send commands to FreeSWITCH
- bbb-playback-presentation -- Record and playback script to create presentation layout
- bbb-export-annotations -- Handles capture of breakout content and annotated presentation download
- bbb-webrtc-sfu -- Server that bridges incoming requests from client to Kurento
- kurento-media-server -- WebRTC media server for sending/receiving/recording video (webcam and screen share)
- bbb-freeswitch-core -- WebRTC media server for sending/receiving/recording audio

This document describes how to set up a development environment using an existing BigBlueButton 2.6 server. Once the environment is set up, you will be able to make custom changes to BigBlueButton source, compile the source, and replace the corresponding components on the server (such as updating the BigBlueButton client).

The instructions in this guide are step-by-step so you can understand each step needed to modify a component. If you encounter problems or errors at any section, don't ignore the errors. Stop and double-check that you have done the step correctly. If you are unable to determine the cause of the error, do the following

- First, use Google to search for the error. There is a wealth of information in [bigbluebutton-dev](https://groups.google.com/forum/?fromgroups=#!forum/bigbluebutton-dev) that has been indexed by Google.
- Try doing the same steps on a different BigBlueButton server.
- Post a question to bigbluebutton-dev with a description of the problem and the steps to reproduce. Post logs and error messages to [Pastebin](https://pastebin.com) link them in your post.

#### You Have a Working BigBlueButton Server

Before you can start developing on BigBlueButton, you must install BigBlueButton (see [installation steps](/administration/install)) and ensure it's working correctly. Make sure there were no errors during the installation and that you can join a session successfully.

We emphasize that your BigBlueButton server must be working **before** you start setting up the development environment. Be sure that you can log in, start sessions, join the audio bridge, share your webcam, and record and play back sessions -- you can verify this if you install [Greenlight](/greenlight/v2/install) or navigate to [API MATE](https://mconf.github.io/api-mate/) using your server's secret and url.

By starting with a working BigBlueButton server, you have the ability to switch back-and-forth between the default-packaged components and any modifications you make.

For example, suppose you modify the BigBlueButton client and something isn't working (such as the client is not fully loading), you can easily switch back to the default-packaged client and check that it's working correctly (thus ruling out any environment issues that may also be preventing your modified client from loading).

**Another Note:** These instructions assume you have Greenlight installed so you can create and join meetings to test your setup.

#### Developing on Windows

To develop BigBlueButton from within Windows, you have two options:

- use Windows Subsystem for Linux
- use VMWare Player or VirtualBox to create a virtual machine (VM).

Choose the OS to be Ubuntu 20.04 64-bit. The associated documentation for VMWare Player and VirtualBox or WSL will guide you on setting up a new 20.04 64-bit VM.

**Note:** When setting up the VM, it does not matter to BigBlueButton if you set up Ubuntu 20.04 server or desktop. If you install desktop, you'll have the option of using a graphical interface to edit files. When running the VM, you will need a host operating system capable of running a [64-bit virtual machine](https://stackoverflow.com/questions/56124/can-i-run-a-64-bit-vmware-image-on-a-32-bit-machine).

#### Developing on Linux host via container

Consider using a Docker setup for a development environment - [https://github.com/bigbluebutton/docker-dev](https://github.com/bigbluebutton/docker-dev).

#### Root Privileges

**Important:** The setup is **much** easier if you develop as user 'bigbluebutton' and just add a home directory via

```
usermod -a -G sudo bigbluebutton
mkhomedir_helper bigbluebutton # to add homedir to existing user
chown -R bigbluebutton:bigbluebutton /home/bigbluebutton/
sudo su - bigbluebutton
# if you cannot switch to user bigbluebutton, you may need to switch /bin/false to /bin/bash for user bigbluebutton in /etc/passwd
# and then retry "sudo su - bigbluebutton"
# Note that you may want to disable terminal sessions for user bigbluebutton if you will later use the server in production
```

```bash
sudo ls
```

#### wget

You'll need to download some files throughout these instructions using wget. If it's not installed on your server, you can install the package using the following command

```bash
sudo apt-get install wget
```

#### Have a GitHub Account

The BigBlueButton [source is hosted on GitHub](https://github.com/bigbluebutton/bigbluebutton). You need a GitHub account. In addition, you need to be very familiar with how git works. Specifically, you need to know how to

- clone a repository
- create a branch
- push changes back to a repository

If you have not used git before, or if the terms **_clone_**, **_branch_**, and **_commit_** are unfamiliar to you, stop now. These are fundamental concepts to git that you need to become competent with before trying to develop on BigBlueButton. To become competent, a good place to start is this [free book](https://git-scm.com/book) and [GitHub Help pages](https://help.github.com/).

Using GitHub makes it easy for you to work on your own copy of the BigBlueButton source, store your updates to the source to your GitHub account, and make it easy for you to [contribute to BigBlueButton](/support/faq#contributing-to-bigbluebutton).

#### Subscribe to bigbluebutton-dev

We recommend you subscribe to the [bigbluebutton-dev](https://groups.google.com/group/bigbluebutton-dev/topics?gvc=2) mailing list to follow updates to the development of BigBlueButton and to collaborate with other developers.

## Set up a Development Environment

#### (Recommended) On Linux host we highly recommend using 'docker-dev'

Consider using a Docker setup for a development environment - [https://github.com/bigbluebutton/docker-dev](https://github.com/bigbluebutton/docker-dev)
It includes all you need to be able to run a local BigBlueButton development environment

#### Alternative - add a development environment to a [locally running] working BigBlueButton server

First, you need to install the core development tools.

```bash
sudo apt-get install git-core openjdk-11-jdk-headless
```

With the JDK installed, you need to set the JAVA_HOME variable. Edit `~/.profile` (here we are using vim to edit the file)

```bash
vi ~/.profile
```

Add the following line at the end of the file

```bash
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
```

Reload your profile (this will happen automatically when you next login, but we'll do it explicitly here to load the new environment variable).

```bash
source ~/.profile
```

Do a quick test to ensure JAVA_HOME is set.

```bash
$ echo $JAVA_HOME
/usr/lib/jvm/java-11-openjdk-amd64
```

In the next step, you need to install a number of tools using sdkman.

```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

sdk install gradle 7.3.1
sdk install grails 5.0.1
sdk install sbt 1.6.2
sdk install maven 3.5.0
```

### Checking out the Source

With the development tools installed, we'll next clone the source in the following directory:

```
/home/bigbluebutton/dev
```

Using your GitHub account, do the following

1. [Fork](https://help.github.com/fork-a-repo/) the BigBlueButton repository into your GitHub account
2. Clone your repository into your `~/dev` folder

After cloning, you'll have the following directory (make sure the `bigbluebutton` directory is within your `dev` directory).

```
/home/bigbluebutton/dev/bigbluebutton
```

Confirm that you are working on the `v2.6.x-release` branch.

```bash
cd /home/bigbluebutton/dev/bigbluebutton
git status
```

BigBlueButton 2.6 source code lives on branch `v2.6.x-release`. This is where any patches to 2.6 will be merged. If you are looking to customize your BigBlueButton 2.6 clone to fit your needs, this is the branch to use.

For the purpose of these instructions we'll assume you are only tweaking your clone of BigBlueButton. Thus we recommend you checkout branch `v2.6.x-release`.

```
On branch v2.6.x-release
Your branch is up-to-date with 'origin/v2.6.x-release'.
nothing to commit, working directory clean
```

The first thing we need to do is to add the remote repository to our local clone.

```bash
git remote add upstream https://github.com/bigbluebutton/bigbluebutton.git
```

You can now check your local list of tracked repositories to verify that the addition worked. You should see at least two results (origin and upstream). The one named "origin" should link to your personal fork and is the repository that you cloned. The second result "upstream" should link to the main BigBlueButton repository.

```bash
git remote -v
```

After, we need to fetch the most up to date version of the remote repository.

```bash
git fetch upstream
```

You are now ready to create a new branch to start your work and base the `v2.6.x-release` release branch

```bash
git checkout -b my-changes-branch upstream/v2.6.x-release
```

"checkout" switches branches

"-b" is an option to create a new branch before switching

"my-changes-branch" will be the name of the new branch

"upstream/v2.6.x-release" is where you want to start your new branch

You should now confirm that you are in the correct branch.

```bash
git status

# On branch my-changes-branch
nothing to commit (working directory clean)
```

<!--

TODO: Add high-view diagrams
# Production Environment

Okay. Let's pause for a minute.

You have set up the necessary tools and cloned the source, but if you are going to start making changes to BigBlueButton code you need to understand how the parts interact.

Below is an overview of the different components in a production set-up. When developing you want to change your configuration settings to load new changes instead of the ones deployed for production.
-->

### (Optional) Install Greenlight

Note that at this point we recommend installing and using [Greenlight](/greenlight/v2/install) or using API-MATE (link can be found when you run `$ bbb-conf --salt`).

You can access https://BBB_DOMAIN , and you will be able to join meetings.

## Developing the HTML5 client

Before starting development on the HTML5 client, make sure you have cloned the [BigBlueButton repository](https://github.com/bigbluebutton/bigbluebutton)
and switched to the `bigbluebutton-html5` directory:

```bash
$ git clone git@github.com:bigbluebutton/bigbluebutton.git
$ cd bigbluebutton/bigbluebutton-html5/
```

### Background

A bit of context is needed to fully explain what the HTML5 client is, why it has server component, what the architecture is, and only then how to make a change and re-deploy.

The HTML5 client in BigBlueButton is build using the framework [Meteor](https://meteor.com). Meteor wraps around a NodeJS server component, MongoDB server database, React frontend user interface library and MiniMongo frontend instance of MongoDB storing a subset of MongoDB's data. When deployed, these same components are split into independently running pieces - NodeJS instance, MongoDB database and a browser optimized client files served by NGINX. There is no "Meteor" in a production deployment, but rather separate components.

<!--
TODO: add diagram
-->

Make sure to check the HTML5 portion of the [Architecture page](/development/architecture#html5-client).

Install Meteor.js.

```bash
$ curl https://install.meteor.com/ | sh
```

There is one change required to settings.yml to get webcam and screenshare working in the client (assuming you're using HTTPS already). The first step is to find the value for `kurento.wsUrl` packaged settings.yml.

<!-- TODO recommend /etc/bigbluebutton/bbb-html5.yml change instead -->

```bash
grep "wsUrl" /usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml
```

Next, edit the development settings.yml and change `wsUrl` to match what was retrieved before.

```bash
$ vi private/config/settings.yml
```

You're now ready to run the HTML5 code. First shut down the packaged version of the HTML5 client so you are not running two copies in parallel.

```
$ sudo systemctl stop bbb-html5
```

Install the npm dependencies.

```bash
$ meteor npm install
```

Finally, run the HTML5 code.

```bash
$ npm start
```

By default, the client will run in `development` mode with only one instance of `NodeJS` handling both "backend" and "frontend" roles.

```bash
$ NODE_ENV=production npm start
```

In certain cases when making changes that span multiple BigBlueButton components you would want to ensure that the changes work well with the multiple different `NodeJS` processes.

You can deploy locally your modified version of the HTML5 client source using the script [bigbluebutton-html5/deploy_to_usr_share.sh](https://github.com/bigbluebutton/bigbluebutton/blob/v2.6.x-release/bigbluebutton-html5/deploy_to_usr_share.sh) - which deploys your [customized] bigbluebutton-html5/\* code as locally running `bbb-html5` package (production mode, requiring the `poolhtml5servers` NGINX rule). Make sure to read through the script to understand what it does prior to using it.

### Switch NGINX to redirect requests to Meteor

When you are running bbb-html5 from package (i.e. in production mode) NGINX needs to be able to point client sessions to a bbb-html5-frontend instance from the pool. However, in development mode (i.e. running Meteor via `npm start`), we only have one process, rather than a pool. We need to tweak the NGINX configuration so that client sessions are only pointed to port `4100` where Meteor is running.

You would want to make a change in `/usr/share/bigbluebutton/nginx/bbb-html5.nginx` to use 4100 port rather than the pool.

The default - used for production mode:

```
location ~ ^/html5client/ {
  # proxy_pass http://127.0.0.1:4100; # use for development
  proxy_pass http://poolhtml5servers; # use for production
  ...
```

Development mode, only port 4100 is used.

```
location ~ ^/html5client/ {
  proxy_pass http://127.0.0.1:4100; # use for development
  # proxy_pass http://poolhtml5servers; # use for production
  ...
```

After this change, reload NGINX's configuration with `sudo systemctl reload nginx`

A symptom of running `npm start` with the incompatible `poolhtml5servers` NGINX configuration is seeing `It looks like you are trying to access MongoDB over HTTP on the native driver port.` and `Uncaught SyntaxError: Unexpected Identifier`

When you switch back to running the `bbb-html5` packaged version you would want to revert your change so the `poolhtml5servers` are used for spreading the load of the client sessions.

#### Switch NGINX static resource requests to Meteor

Locales requests are served by NGINX by default, but you may want to disable that feature in development mode (if you want to be able to edit the files located in `/public/locales` and see the changes being applied).

You would want to make a change in `/usr/share/bigbluebutton/nginx/bbb-html5.nginx` in the lines related to locales.

The default - used for production mode (locales files will be served by NGINX):

```
  location /html5client/locales {
    alias /usr/share/meteor/bundle/programs/web.browser/app/locales;
  }
```

Development mode (locales files will be served by Meteor):

```
  #location /html5client/locales {
  #  alias /usr/share/meteor/bundle/programs/web.browser/app/locales;
  #}
```

After this change, reload NGINX's configuration with `sudo systemctl reload nginx`

### Audio configuration for development environment

You may see the error "Call timeout (Error 1006)" during the microphone echo test after starting the developing HTML5 client by "npm start". A misconfiguration of Freeswitch may account for it, especially when BigBlueButton is set up with bbb-install.sh script. Try changing "sipjsHackViaWs" true in bigbluebutton-html5/private/config/settings.yml.

### Production

Using NODE_ENV=production is not meant to be actually used in production, see [here](https://guide.meteor.com/deployment.html#never-use-production-flag) for more information. Instead, you should build the meteor app so that the `bbb-html5` service can work with it.

First, ensure that you're in the `bigbluebutton-html5` directory. If you follow the instructions above and have `bigbluebutton` as your user, you can run the following:

```bash
meteor build --server-only /home/bigbluebutton/dev/bigbluebutton/bigbluebutton-html5/meteorbundle
```

Meteor will build your customized version into a `.tar.gz` so we need to unpack it and place it in the right directory for `bbb-html5` to use it. Run:

```bash
sudo tar -xzvf /home/bigbluebutton/dev/bigbluebutton/bigbluebutton-html5/meteorbundle/*.tar.gz -C /usr/share/meteor
```

Finally, start the HTML5 client with `sudo systemctl start bbb-html5`.

There we go! Remember that this will be overwritten every time you upgrade, so you may want to have some mechanism put in place to replace it, or if your changes add new functionality/solve a bug, consider upstreaming them. To avoid having to uninstall and reinstall the `bbb-html5` package to restore a working version, you may want to make a copy of the original `bundle` folder.

<!--
TODO
## HTML5 Coding Practices

For coding conventions related to the HTML5 code refer to [this document](/html5-best-practices.html).
-->

### `/private/config`

All configurations are located in **/private/config/settings.yml**. If you make any changes to the YAML configuration you will need to restart the meteor process.

During Meteor.startup() the configuration file is loaded and can be accessed through the Meteor.settings.public object.
Note that individual configuration settings are overridden with their values (if defined) from file `/etc/bigbluebutton/bbb-html5.yml` (if the file exists).

## Build bbb-common-message

The bbb-common-message is required by a few components of BigBlueButton. So it is required to build this
first. Otherwise, you will run into compile errors.

```bash
cd ~/dev/bigbluebutton/bbb-common-message
./deploy.sh
```

## Developing BBB-Web

Give your user account access to upload slides to the presentation directory and also access to write log files.

```bash
sudo chmod -R ugo+rwx /var/bigbluebutton
sudo chmod -R ugo+rwx /var/log/bigbluebutton
```

Open the file `~/.sbt/1.0/global.sbt` using your editor

```bash
mkdir -p ~/.sbt/1.0
vi ~/.sbt/1.0/global.sbt
```

Add the following into it

```scala
resolvers += "Artima Maven Repository" at "https://repo.artima.com/releases"
updateOptions := updateOptions.value.withCachedResolution(true)
```

Build bbb-common-web

```bash
cd ~/dev/bigbluebutton/bbb-common-web
./deploy.sh
```

Now let's start building bbb-web

```bash
cd ~/dev/bigbluebutton/bigbluebutton-web/
```

We need to stop the bbb-web service

```bash
sudo service bbb-web stop
```

Download the necessary libraries.

```bash
./build.sh
```

Start grails and tell to listen on port 8090

```bash
./run.sh
```

or

```bash
grails -reloading -Dserver.port=8090 run-app
```

If you get an error `Could not resolve placeholder 'apiVersion'`, just run `grails -Dserver.port=8090 run-app` again. The error is grails not picking up the "bigbluebutton.properties" the first time.

Now test again if you can create and join a meeting.

The command above will run a development version of bbb-web, but if you want to deploy your custom-built bbb-web you need to package a war file.

**Instructions for deploying bbb-web**

First we need to compile all the project in a single war file.

```bash
grails assemble
```

The `war` application is generated under `build/libs/bigbluebutton-0.10.0.war`.

Create a new directory and open it.

```bash
mkdir exploded && cd exploded
```

Extract the war content in the newly create directory

```bash
jar -xvf ../build/libs/bigbluebutton-0.10.0.war
```

Then copy the `run-prod.sh` after checking all the jar dependencies are listed in

```bash
cp ../run-prod.sh .
```

In the next step we will make a copy of the current production directory for `bbb-web`

```bash
sudo cp -R /usr/share/bbb-web /usr/share/bbb-web-old
```

Then we will delete all the files we need to be copied for production

```bash
sudo rm -rf /usr/share/bbb-web/assets/ /usr/share/bbb-web/META-INF/ /usr/share/bbb-web/org/ /usr/share/bbb-web/run-prod.sh  /usr/share/bbb-web/WEB-INF/
```

Next, let's copy the complied files into the production directory

```bash
sudo cp -R . /usr/share/bbb-web/
```

Make sure the copied files have the right user ownership.

```bash
$ sudo chown bigbluebutton:bigbluebutton /usr/share/bbb-web
$ sudo chown -R bigbluebutton:bigbluebutton /usr/share/bbb-web/assets/ /usr/share/bbb-web/META-INF/ /usr/share/bbb-web/org/ /usr/share/bbb-web/run-prod.sh /usr/share/bbb-web/WEB-INF/
```

And finally we run the service.

```bash
sudo service bbb-web start
```

If you need to revert back your original production `bbb-web` just run the following command. (Don't forget to stop bbb-web service before doing it)

```bash
sudo mv /usr/share/bbb-web /usr/share/bbb-web-dev && mv /usr/share/bbb-web-old /usr/share/bbb-web
```

Your compiled code will be under the `/usr/share/bbb-web-dev` directory and you can safely run the original production ``bbb-web`.

## Developing Akka-Apps

You can manually run the application.

```bash
cd ~/dev/bigbluebutton/akka-bbb-apps
./run.sh
```

Don't forget to modify service-bbbWebAPI, service-sharedSecret in ~/dev/bigbluebutton/akka-bbb-apps/src/universal/conf/application.conf, to get it work properly. For instance, these are necessary for starting the breakout rooms.

You can deploy locally akka-apps by building a simple .deb package using `sbt` and deploying it right away:

```
sbt debian:packageBin
dpkg -i ./target/bbb-apps-akka_<tab>.deb
```

## Developing Akka-FSESL

You need to build the FS ESL library

```bash
cd ~/dev/bigbluebutton/bbb-fsesl-client
./deploy.sh
```

Then you can run the application.

```bash
cd ~/dev/bigbluebutton/akka-bbb-fsesl
./run.sh
```

You can deploy locally akka-fsesl by building a simple .deb package using `sbt` and deploying it right away:

```
sbt debian:packageBin
dpkg -i ./target/bbb-fsesl-akka_<tab>.deb
```
## Developing bbb-export-annotations

You can manually run the service.
When running, it'll process export jobs stored in Redis containing the state of the whiteboard at the time of the request.

First, stop the component so that you're not running two copies in parallel:

```
sudo systemctl stop bbb-export-annotations
```

To install the npm dependencies, run:

```
cd ~/dev/bigbluebutton/bbb-export-annotations
npm install
```

followed by

```
npm start
```

to begin exporting presentations with annotations. If you run into permission issues, change `presAnnDropboxDir` in `config/settings.json` to a folder in your home directory
and make sure your user account has access to the presentation directory (see "Developing BBB-Web").

Use `journalctl -u bbb-export-annotations -e` to see recent logs.

## Troubleshooting

### Welcome to NGINX page

If you get the "Welcome to NGINX" page. Check if bigbluebutton is enabled in nginx. You should see **bigbluebutton** in `/etc/nginx/sites-enabled`.

If not, enable it.

```bash
sudo ln -s /etc/nginx/sites-available/bigbluebutton /etc/nginx/sites-enabled/bigbluebutton

sudo /etc/init.d/nginx restart
```

### Pausing/Restarting VM gives wrong date in commit

If you are developing using a VM and you've paused the VM and later restart it, the time on the VM will be incorrect. The incorrect time will affect any commits you do in GitHub.

To ensure your VM has the correct time, you can install ntp with

```bash
sudo apt-get install ntp
sudo /etc/init.d/ntp restart
```

and then do the following after starting the VM from a paused state

```bash
sudo /etc/init.d/ntp restart
```

The above will re-sync your clock.

## Set up HTTPS

See the [installation instructions](/administration/install) on how to configure ssl on your BigBlueButton server.
