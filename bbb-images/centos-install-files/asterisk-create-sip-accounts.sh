#!/bin/bash

for i in {3000..3029}
do
   echo "
[$i]
type=friend
username=$i
insecure=very
qualify=yes
nat=yes
host=dynamic
canreinvite=no
context=bbb-voip
disallow=all
allow=ulaw

   " >>  /etc/asterisk/sip.conf 
done


