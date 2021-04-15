#!/bin/bash

#This script is used to enable Etherpad to export to PDF/ODT
# 1- Edit /usr/share/etherpad-lite/settings.json
# 2- Set "soffice" config to this script path (default "/usr/share/bbb-libreoffice-conversion/etherpad-export.sh")

/usr/share/bbb-libreoffice-conversion/convert.sh "$8" "$(echo $8 | sed -E -e 's/html|odt/'$7'/')" $7

exit 0