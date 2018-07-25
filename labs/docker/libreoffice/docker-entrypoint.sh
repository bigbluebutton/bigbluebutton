#!/bin/bash

IP=$(hostname -I | cut -d' ' -f1)

while : ; do
    /usr/lib/libreoffice/program/soffice.bin --headless --nologo --nofirststartwizard "--accept=socket,host=${IP},port=${PORT};urp" --pidfile=/var/run/soffice.pid
    EXIT_CODE=$?
    [[ $EXIT_CODE == 81 ]] || break
    echo "Exit code is $EXIT_CODE, restarting..."
done

    
