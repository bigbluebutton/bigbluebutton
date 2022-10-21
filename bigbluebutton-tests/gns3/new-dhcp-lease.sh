#!/bin/bash
#
# This script runs on the main gateway when a new DHCP lease is handed
# out (or when an old one is renewed).  It checks to see if the lease
# is for a server (hostname starting with "focal-") and if so, sets
# everything up to proxy for the server so that users can connect to
# it from outside the virtual network.
#
# This is what it does:
#    - gets an ssl cert to mimic the new server
#    - creates a new dummy network interface
#    - uses it to register with the outside DHCP server using the new
#      server's name (so now we appear as that name to the outside)
#    - creates a new apache2 site file with the reverse proxy configuration,
#      enables the site and restarts apache2
#    - punches a UDP port range through NAT for RTP traffic
#
# TODO:
#    - handle "del" when a lease is dropped
#
# Outside users still have to:
#    - approve the private SSL certificate, either in the browser or
#      in the system root CA store
#    - arrange for routing to the dummy internal "public" network

if [ "$1" = "add" -o "$1" = "old" ]; then
   IPADDR="$3"
   HOSTNAME="$4"
   if echo "$HOSTNAME" | grep -q ^focal- ; then
       if ! ip link list $HOSTNAME &> /dev/null; then
	   # Create a new virtual link that will announce $HOSTNAME into DHCP
	   # MAC address generation from https://serverfault.com/a/299563/495252
	   MACADDR=$(echo $HOSTNAME|md5sum|sed 's/^\(..\)\(..\)\(..\)\(..\)\(..\).*$/02:\1:\2:\3:\4:\5/')
	   ip link add link ens4 address $MACADDR $HOSTNAME type macvlan
	   cat > /run/systemd/network/$HOSTNAME.network <<EOF
[Match]
Name=$HOSTNAME

[Link]
ActivationPolicy=up

[Network]
DHCP=ipv4

[DHCPv4]
Hostname=$HOSTNAME
UseDomains=false
EOF
	   networkctl reload

	   # create /etc/ssl/certs/$HOSTNAME.pem
	   # create /etc/ssl/private/$HOSTNAME.key

	   # Generate a CSR and get it signed by our CA
	   FQDN=$HOSTNAME.test
	   KEYFILE=/etc/ssl/private/$HOSTNAME.key
	   CSRFILE=/tmp/$HOSTNAME.pem
	   CERTFILE=/etc/ssl/certs/$HOSTNAME.pem
	   openssl req -nodes -newkey rsa:2048 -keyout $KEYFILE -out $CSRFILE -subj "/C=CA/ST=BBB/L=BBB/O=BBB/OU=BBB/CN=$FQDN" -addext "subjectAltName = DNS:$FQDN"

	   # Try this five times, because there's a race condition when we're starting up,
	   # we've got a bunch of servers getting leases, we're reloading apache each
	   # time a few lines down in this script, and we depend on apache running
	   # to be able to do this step.  Maybe just re-write getcert.cgi a bit so
	   # that we can call it directly from here.
	   for i in {1..5}; do
	       wget -q -O $CERTFILE --post-file=$CSRFILE http://ca.test/getcert.cgi?$FQDN
	       if [ -s $CERTFILE ] && openssl x509 -in $CERTFILE >& /dev/null; then break; fi
	       sleep 1
	   done

	   # make extra sure CERTFILE is valid X.509, because apache won't start anymore if it's broken
	   if [ -s $CERTFILE ] && openssl x509 -in $CERTFILE >& /dev/null; then
	       cat > /etc/apache2/sites-available/$HOSTNAME.conf <<EOF
<IfModule mod_ssl.c>
	<VirtualHost _default_:80>
		ServerName $HOSTNAME.test
		Redirect permanent / https://$HOSTNAME.test/
	</VirtualHost>
	<VirtualHost _default_:443>
		ServerName $HOSTNAME.test
		ServerAdmin webmaster@localhost

		DocumentRoot /var/www/html

		SSLEngine on

		SSLCertificateFile	/etc/ssl/certs/$HOSTNAME.pem
		SSLCertificateKeyFile /etc/ssl/private/$HOSTNAME.key

		RewriteEngine On
		RewriteCond %{HTTP:Upgrade} =websocket               [NC]
		RewriteRule /(.*)           wss://$HOSTNAME.test/\$1 [P,L]

		SSLProxyEngine on
		ProxyPass "/" "https://$HOSTNAME.test/"
		ProxyPassReverse "/" "https://$HOSTNAME.test/"

	</VirtualHost>
</IfModule>
EOF
	       a2ensite $HOSTNAME
	       systemctl restart apache2
	   else
	       echo $CERTFILE not properly generated
	       exit 1
	   fi
       fi

       # Punch through a UDP port range for RTP traffic
       # Mimics the logic in getportrange.cgi
       # It's outside the previous 'if' block in case we've already got
       #    a dummy link configured, but the address changed

       hostnum=$(echo $IPADDR | cut -d . -f 4)
       portrange=$((100*hostnum + 6384)):$((100*hostnum + 6384 + 99))
       rule="-p udp --dport $portrange -j DNAT --to-destination $IPADDR"

       if ! iptables -t nat -C PREROUTING $rule; then
	   iptables -t nat -A PREROUTING $rule
       fi
   fi
fi
