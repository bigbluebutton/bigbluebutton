#!/bin/bash
#
# Install a Big Blue Button testing server on a VM
#
# We expect a web-based SSL CA service to be available on ca.test
# that will sign SSL certificates for us.

# if these are running, our apt operations may error out unable to get a lock
sudo systemctl stop unattended-upgrades.service
echo Waiting for apt-daily.service and apt-daily-upgrade.service
sudo systemd-run --property="After=apt-daily.service apt-daily-upgrade.service" --wait /bin/true

sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt -y upgrade

cd /home/ubuntu

FQDN=$(hostname --fqdn)
RELEASE=$(hostname)

if [[ ! -r $FQDN.key ]]; then

    # Get the CA root certificate and install it
    wget -q http://ca.test/bbb-dev-ca.crt

    sudo mkdir /usr/local/share/ca-certificates/bbb-dev/
    sudo cp bbb-dev-ca.crt /usr/local/share/ca-certificates/bbb-dev/
    sudo update-ca-certificates

    # Generate a CSR and get it signed by our CA
    openssl req -nodes -newkey rsa:2048 -keyout $FQDN.key -out $FQDN.csr -subj "/C=CA/ST=BBB/L=BBB/O=BBB/OU=BBB/CN=$FQDN" -addext "subjectAltName = DNS:$FQDN"
    wget -q -O $FQDN.crt --post-file=$FQDN.csr http://ca.test/getcert.cgi?$FQDN

    # Install the certificates where the BBB install scripts wants them

    sudo mkdir -p /local/certs/
    sudo cp bbb-dev-ca.crt /local/certs/
    sudo cp $FQDN.crt /local/certs/fullchain.pem
    cat bbb-dev-ca.crt | sudo tee -a /local/certs/fullchain.pem >/dev/null
    sudo cp $FQDN.key /local/certs/privkey.pem

fi

# Currently assumes that hostname is the same as the release name
#
# Options include -w (firewall) -a (api demos; deprecated in 2.6)

case $RELEASE in
   bionic-240)
      INSTALL_SCRIPT=bbb-install.sh
      INSTALL_OPTIONS=-a
      ;;
   focal-250 | focal-25-dev)
      INSTALL_SCRIPT=bbb-install-2.5.sh
      INSTALL_OPTIONS=-a
      ;;
   focal-260)
      INSTALL_SCRIPT=bbb-install-2.6.sh
      INSTALL_OPTIONS=
      ;;
   bionic-*)
      # Git builds, with names like bionic-e41349, for BigBlueButton 2.4
      # osito.freesoft.org is my development server, which is the repository for git builds
      # We expect to have a directory named like bionic-e41349 available on this host's web server
      #    containing a valid Debian package repository
      INSTALL_OPTIONS="-r osito.freesoft.org"
      INSTALL_SCRIPT=bbb-install.sh
      ;;
   focal-*)
      # Git builds for BigBlueButton 2.5 or 2.6
      INSTALL_OPTIONS="-r osito.freesoft.org"

      # We can't tell from the name of the release if this is 2.5 or 2.6,
      # so look at the bigbluebutton package to figure this out
      MAIN_PACKAGE_NAME=$(wget -qO- https://osito.freesoft.org/$RELEASE/dists/bigbluebutton-focal/main/binary-amd64/Packages | grep pool/main/b/bigbluebutton)
      if echo $MAIN_PACKAGE_NAME | grep -q 2\\.6; then
         INSTALL_SCRIPT=bbb-install-2.6.sh
      elif echo $MAIN_PACKAGE_NAME | grep -q 2\\.5; then
         INSTALL_SCRIPT=bbb-install-2.5.sh
      else
         echo Unknown bigbluebutton version
         exit 1
      fi
      ;;
   *)
      echo "Unknown release: $RELEASE"
      exit 1
      ;;
esac

wget -qO- https://ubuntu.bigbluebutton.org/$INSTALL_SCRIPT | sudo bash -s -- -v $RELEASE -s $FQDN -d $INSTALL_OPTIONS

sudo bbb-conf --salt bbbci
echo "NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt" | sudo tee -a /usr/share/meteor/bundle/bbb-html5-with-roles.conf

# bbb-conf --salt doesn't set the shared secret on the web demo
sudo sed -i '/salt/s/"[^"]*"/"bbbci"/'  /var/lib/tomcat9/webapps/demo/bbb_api_conf.jsp

# nginx won't start without this change
sudo sed -i '/server_names_hash_bucket_size/s/^\(\s*\)# /\1/' /etc/nginx/nginx.conf

sudo bbb-conf --restart
