#!/bin/bash -e


if [ $1 == 0 ]; then
  rm -rf /etc/sudoers.d/zzz-bbb-docker-libreoffice
fi
