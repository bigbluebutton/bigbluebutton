#!/bin/bash

# This script runs a few commands as root (via sudo). Some commands may be slow,
# depending on your network speed. This can cause sudo to prompt for your password
# a couple of times.
#
# If you want to run this script in unattended mode, then make sure you run it as root.

# add PPA
sudo apt-get install --assume-yes python-software-properties
sudo add-apt-repository ppa:ralf-sippl/bbb

# add BBB repo
wget http://ubuntu.bigbluebutton.org/bigbluebutton.asc -O- | sudo apt-key add -
echo "deb http://ubuntu.bigbluebutton.org/lucid_dev_08/ bigbluebutton-lucid main" | sudo tee /etc/apt/sources.list.d/bigbluebutton.list

sudo apt-get update --assume-yes
sudo apt-get dist-upgrade --assume-yes

sudo apt-get install --assume-yes zlib1g-dev libssl-dev libreadline5-dev libyaml-dev build-essential bison checkinstall libffi5 gcc checkinstall libreadline5 libyaml-0-2

# install ruby 1.9.2
cd /tmp
rm -f ruby-1.9.2-p290.tar.gz
wget http://ftp.ruby-lang.org/pub/ruby/1.9/ruby-1.9.2-p290.tar.gz
tar xvzf ruby-1.9.2-p290.tar.gz
cd ruby-1.9.2-p290
./configure --prefix=/usr\
            --program-suffix=1.9.2\
            --with-ruby-version=1.9.2\
            --disable-install-doc
make
sudo checkinstall -D -y\
                  --fstrans=no\
                  --nodoc\
                  --pkgname='ruby1.9.2'\
                  --pkgversion='1.9.2-p290'\
                  --provides='ruby'\
                  --requires='libc6,libffi5,libgdbm3,libncurses5,libreadline5,openssl,libyaml-0-2,zlib1g'\
                  --maintainer=brendan.ribera@gmail.com
sudo update-alternatives --install /usr/bin/ruby ruby /usr/bin/ruby1.9.2 500 \
                         --slave /usr/bin/ri ri /usr/bin/ri1.9.2 \
                         --slave /usr/bin/irb irb /usr/bin/irb1.9.2 \
                         --slave /usr/bin/erb erb /usr/bin/erb1.9.2 \
                         --slave /usr/bin/rdoc rdoc /usr/bin/rdoc1.9.2
sudo update-alternatives --install /usr/bin/gem gem /usr/bin/gem1.9.2 500

# auto-accept MS EULA
echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | sudo debconf-set-selections

# install BBB!
sudo apt-get install --assume-yes sl-bigbluebutton
sudo apt-get install --assume-yes bbb-demo

# start BBB, check installation
sudo bbb-conf --clean
sudo bbb-conf --check

echo "You may want to run 'sudo bbb-conf --setip <ip/hostname>'"
