#!/usr/bin/env bash

source /app/vagrant/provision/common.sh

#== Provision script ==

info "Provision-script user: $(whoami)"
exit
info "Restart web-stack"
hostnamectl set-hostname bigbluebutton.docs
