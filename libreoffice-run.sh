#!/bin/bash -e

CONTAINER_IP=$(hostname -I)
echo "Listening to $CONTAINER_IP"

/usr/lib/libreoffice/program/soffice.bin --headless --nologo --nofirststartwizard "--accept=socket,host=$CONTAINER_IP,port=8100;urp" --pidfile=/var/run/soffice.pid

