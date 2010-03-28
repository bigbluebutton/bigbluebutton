#!/bin/bash

# Create 100 users.
for i in {34380..34479}
do
  echo "

[$i]
type=friend
username=$i
insecure=very
qualify=no
nat=yes
host=dynamic
canreinvite=no
context=bbb-voip
disallow=all
allow=ulaw
" >>  bbb_sip.conf
done


