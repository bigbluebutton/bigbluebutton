#!/bin/bash
#
# Install a Big Blue Button testing server on a VM

# if these are running, our apt operations may error out unable to get a lock
sudo systemctl stop unattended-upgrades.service
echo Waiting for apt-daily.service and apt-daily-upgrade.service
sudo systemd-run --property="After=apt-daily.service apt-daily-upgrade.service" --wait /bin/true

sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt -y upgrade

DOMAIN=$(hostname --domain)
FQDN=$(hostname --fqdn)
RELEASE=$(hostname)

EMAIL="root@$FQDN"

# INSTALL_SCRIPT and INSTALL_OPTIONS get passed in the environment from gns3-bbb.py
#
# INSTALL_SCRIPT should be bbb-install.sh (2.4), bbb-install-2.5.sh, or bbb-install-2.6.sh
# INSTALL_OPTIONS can include -w (firewall) -a (api demos; deprecated in 2.6) -r (repository)

wget -qO- https://ubuntu.bigbluebutton.org/$INSTALL_SCRIPT | sudo bash -s -- -v $RELEASE -s $FQDN -e $EMAIL $INSTALL_OPTIONS

sudo bbb-conf --salt bbbci
echo "NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt" | sudo tee -a /usr/share/meteor/bundle/bbb-html5-with-roles.conf

# bbb-conf --salt doesn't set the shared secret on the web demo
sudo sed -i '/salt/s/"[^"]*"/"bbbci"/'  /var/lib/tomcat9/webapps/demo/bbb_api_conf.jsp

# nginx won't start without this change
sudo sed -i '/server_names_hash_bucket_size/s/^\(\s*\)# /\1/' /etc/nginx/nginx.conf

# We can't restart if nginx isn't running.  It'll just complain "nginx.service is not active, cannot reload"
# sudo bbb-conf --restart
sudo bbb-conf --stop
sudo bbb-conf --start
