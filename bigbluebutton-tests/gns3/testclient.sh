#!/bin/bash
#
# Install Big Blue Button testing client
#
# This script runs once as 'ubuntu'

# Make some changes to .bashrc, but they won't affect the shell that is already
# running in the GUI, so the user will need to '. ~/.bashrc' there.
#
# We need NODE_EXTRA_CA_CERTS so that the playwright tests can make API calls
# without getting certificate errors.

cat >> ~/.bashrc <<EOF
export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt
export ACTIONS_RUNNER_DEBUG=true
export BBB_URL=https://bbb-ci.test/bigbluebutton/api
export BBB_SECRET=bbbci
EOF

# Which version of the repository should we use for the client test cases

BRANCH=v2.5.x-release

# if these are running, our apt operations may error out unable to get a lock
sudo systemctl stop unattended-upgrades.service
echo Waiting for apt-daily.service and apt-daily-upgrade.service
sudo systemd-run --property="After=apt-daily.service apt-daily-upgrade.service" --wait /bin/true

sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt -y upgrade

# git, since we're about to use it
# linux-image-extra-virtual to get snd-aloop module for dummy audio
# v4l2loopback-dkms to get video loopback for dummy webcam
# sudo apt -y install git-core ant ant-contrib openjdk-8-jdk-headless zip unzip linux-image-extra-virtual
sudo apt -y install git-core linux-image-extra-virtual v4l2loopback-dkms

# We don't need the whole git history, like this command would do:
#    git clone https://github.com/bigbluebutton/bigbluebutton.git
# so instead we do this to pick up a single revision:
cd
mkdir bigbluebutton-$BRANCH
cd bigbluebutton-$BRANCH
git init
git remote add origin https://github.com/bigbluebutton/bigbluebutton.git
git fetch --depth 1 origin $BRANCH
git checkout FETCH_HEAD

# Focal distributes nodejs 10, which is too old for our playwright test suite.  Use nodejs 16.
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

cd ~/bigbluebutton-$BRANCH/bigbluebutton-tests/playwright
npm install
npx --yes playwright install

# patch playwright's firefox so that it uses the system's root certificate authority
find /home/ubuntu/.cache/ms-playwright -name libnssckbi.so -exec mv {} {}.distrib \; -exec ln -s /usr/lib/x86_64-linux-gnu/pkcs11/p11-kit-trust.so {} \;

# playwright webkit doesn't have a fake audio device, but Linux does
#   no point in enabling this since playwright can't grant permissions to use microphone on webkit (playwright issue #2973)
# sudo modprobe snd-aloop
# echo snd-aloop | sudo tee -a /etc/modules

# this is required to run webkit tests, but conflicts with BBB server dependencies,
# so can't be installed on the same machine as a BBB server
sudo npx playwright install-deps

# still need to either install an .env file or set environment variables in ~/.bashrc

# In addition to the system root CA store in /usr/local/share/ca-certificates (used by curl and others),
# we need to deal with two common browsers that don't use the system store.

# Get Firefox (already installed) to use system's root certificate authority
# Method suggested by https://askubuntu.com/a/1036637/71866
# Earlier this this script, we did something similar to modify playwright's version of firefox.
# This handles the standard system firefox.

sudo mv /usr/lib/firefox/libnssckbi.so /usr/lib/firefox/libnssckbi.so.distrib
sudo dpkg-divert --no-rename --add /usr/lib/firefox/libnssckbi.so
sudo ln -s /usr/lib/x86_64-linux-gnu/pkcs11/p11-kit-trust.so /usr/lib/firefox/libnssckbi.so

# Install chromium and the tools we need to install our certificate into Chromium's private store
sudo DEBIAN_FRONTEND=noninteractive apt -y install chromium-browser libnss3-tools jq

# chromium snap - we now need to install nssdb in ~/snap/chromium/2051/.pki instead of ~/.pki
# NSSDB=/home/ubuntu/.pki/nssdb
for CHROMIUM_SNAP in $(find /home/ubuntu/snap/chromium/ -mindepth 1 -maxdepth 1 -type d); do
    NSSDB=$CHROMIUM_SNAP/.pki/nssdb
    if [ ! -r $NSSDB ]; then
	mkdir --parents $NSSDB
	certutil -d sql:$NSSDB -N --empty-password
    fi
    certutil -d sql:$NSSDB -A -t 'C,,' -n bbb-dev-ca -i /usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt
done
