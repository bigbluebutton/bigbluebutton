#!/bin/bash

## Initialize environment
/usr/lib/libreoffice/program/soffice.bin -env:UserInstallation="file:///tmp/"

## Run daemon
/usr/lib/libreoffice/program/soffice.bin --accept="socket,host=0.0.0.0,port=8000,tcpNoDelay=1;urp;StarOffice.ServiceManager" --headless --invisible --nocrashreport --nodefault --nofirststartwizard --nolockcheck --nologo --norestore -env:UserInstallation="file:///tmp/"
