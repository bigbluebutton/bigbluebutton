#!/bin/bash

#This script is used to enable Etherpad to export to PDF/ODT
# 1- Edit /usr/share/etherpad-lite/settings.json
# 2- Set "soffice" config to this script path

/usr/share/bbb-libreoffice-conversion/convert.sh "$8" "$(echo $8 | sed 's/html/'$7'/')" $7

exit 0