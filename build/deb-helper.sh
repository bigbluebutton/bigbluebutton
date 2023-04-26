#!/bin/bash -e

############################
### BEGIN DEB-HELPERS.SH ###
############################

#
# Adding service to autostart
# $1 = service name
#
startService() {
  app_name=$1
  if hash systemctl > /dev/null 2>&1 && [ ! -f /.dockerenv ]; then
    # if there no .service or .timer (or any other suffix), it will add .service suffix
    if [[ ! $app_name =~ ^.*\.[a-z]*$ ]]; then
      app_name="$app_name.service"
    fi
    echo "Adding $app_name to autostart using systemd"
    systemctl enable $app_name
    systemctl start $app_name
  elif hash update-rc.d > /dev/null 2>&1 && [ ! -f /.dockerenv ]; then
    echo "Adding $app_name to autostart using update-rc.d"
    update-rc.d $app_name defaults
    service $app_name start
  elif hash chkconfig > /dev/null 2>&1; then
    echo "Adding $app_name to autostart using chkconfig"
    chkconfig --add $app_name
    chkconfig $app_name on
    service $app_name start
  else
    echo "WARNING: Could not add $app_name to autostart: neither update-rc nor chkconfig found!"
  fi
}

#
# Removing service from autostart
# $1 = service name
#
stopService() {
  app_name=$1
  if hash systemctl > /dev/null 2>&1 && [ ! -f /.dockerenv ]; then
    # if there no .service or .timer (or any other suffix), it will add .service suffix
    if [[ ! $app_name =~ ^.*\.[a-z]*$ ]]; then
      app_name="$app_name.service"
    fi
    echo "Removing $app_name from autostart using systemd"
    if systemctl -q is-active $app_name; then
      systemctl stop $app_name
    fi
    if systemctl is-enabled $app_name > /dev/null 2>&1; then
      systemctl disable $app_name
    fi
  elif hash update-rc.d > /dev/null 2>&1 && [ ! -f /.dockerenv ]; then
    echo "Removing $app_name from autostart using update-rc.d"
    update-rc.d -f $app_name remove
    service $app_name stop
  elif hash chkconfig > /dev/null 2>&1; then
    echo "Removing $app_name from autostart using chkconfig"
    chkconfig $app_name off
    chkconfig --del $app_name
    service $app_name stop
  else
    echo "WARNING: Could not remove $app_name from autostart: neither update-rc nor chkconfig found!"
  fi
}

#
# Reload service
# $1 = service name
#
reloadService() {
  app_name=$1
  if hash systemctl > /dev/null 2>&1 && [ ! -f /.dockerenv ]; then
  # if there no .service or .timer (or any other suffix), it will add .service suffix
    if [[ ! $app_name =~ ^.*\.[a-z]*$ ]]; then
      app_name="$app_name.service"
    fi
    echo "Reloading $app_name using systemd"
    if systemctl status $app_name > /dev/null 2>&1; then
      systemctl reload-or-restart $app_name
    else
      startService $app_name
    fi
  elif hash service > /dev/null 2>&1; then
    echo "Reloading $app_name using service"
    service $app_name reload
  else
    echo "WARNING: Could not reload $app_name: neither update-rc nor chkconfig found!"
  fi
}

#
# Restart service
# $1 = service name
#
restartService() {
  app_name=$1
  if hash systemctl > /dev/null 2>&1 && [ ! -f /.dockerenv ]; then
    # if there no .service or .timer (or any other suffix), it will add .service suffix
    if [[ ! $app_name =~ ^.*\.[a-z]*$ ]]; then
      app_name="$app_name.service"
    fi
    echo "Restart $app_name using systemd"
    if systemctl status $app_name > /dev/null 2>&1; then
      systemctl restart $app_name
    else
      startService $app_name
    fi
  elif hash service > /dev/null 2>&1; then
    echo "Restart $app_name using service"
    service $app_name restart
  else
    echo "WARNING: Could not restart $app_name: neither update-rc nor chkconfig found!"
  fi
}

#
# Adapted from SBT scripts.  See 
#  https://github.com/sbt/sbt-native-packager/blob/master/src/main/resources/com/typesafe/sbt/packager/linux/control-functions
#

# Adding system user
# $1 = user
# $2 = uid
# $3 = group
# $4 = home directory
# $5 = description
# $6 = shell (defaults to /bin/false)
addUser() {
  user="$1"
  if [ -z "$user" ]; then
    # echo "usage: addUser user [group] [description] [shell]"
    exit 1
  fi
  uid="$2"
  if [ -z "$uid" ]; then
    uid_flags=""
  else
    uid_flags="--uid $uid"
  fi
  if [ -z "$4" ]; then
    home_flags="--no-create-home"
  else
    home_flags="-d $4"
  fi
  group=${3:-$user}
  descr=${5:-No description}
  shell=${6:-/bin/false}
  if ! getent passwd | grep -q "^$user:";
  then
    # echo "Creating system user: $user in $group with $descr and shell $shell"
    useradd $uid_flags --gid $group $home_flags --system --shell $shell -c "$descr" $user
  fi
}


# Adding system group
# $1 = group
# $2 = gid
addGroup() {
  group="$1"
  gid="$2"
  if [ -z "$gid" ]; then
    gid_flags=""
  else
    gid_flags="--gid $gid"
  fi
  if ! getent group | grep -q "^$group:" ;
  then
    # echo "Creating system group: $group"
    groupadd $gid_flags --system $group
  fi
}

# Will return true even if deletion fails
# $1 = user
deleteUser() {
  if hash deluser 2>/dev/null; then
    deluser --quiet --system $1 > /dev/null || true
  elif hash userdel 2>/dev/null; then
    userdel $1
  else
    echo "WARNING: Could not delete user $1 . No suitable program (deluser, userdel) found"
  fi
}

# Will return true even if deletion fails
# $1 = group
deleteGroup() {
  if hash delgroup 2>/dev/null; then
    delgroup --quiet --system $1 > /dev/null || true
  elif hash groupdel 2>/dev/null; then
    groupdel $1
  else
    echo "WARNING: Could not delete user $1 . No suitable program (delgroup, groupdel) found"
  fi
}

### duplicated code: see bbb-conf and apply-lib.sh
if [ -e "/sys/class/net/venet0:0" ]; then
    # IP detection for OpenVZ environment
    _dev="venet0:0"
else
    _dev=$(awk '$2 == 00000000 { print $1 }' /proc/net/route | head -1)
fi
_ips=$(LANG=C ip -4 -br address show dev "$_dev" | awk '{ $1=$2=""; print $0 }')
_ips=${_ips/127.0.0.1\/8/}
read -r IP _ <<< "$_ips"
IP=${IP/\/*} # strip subnet provided by ip address
if [ -z "$IP" ]; then
  read -r IP _ <<< "$(hostname -I)"
fi

if [ -f /etc/redhat-release ]; then
  TOMCAT_SERVICE=tomcat
else
  if grep -q jammy /etc/lsb-release; then
    TOMCAT_SERVICE=tomcat9
  fi
fi

if [ -f /var/lib/$TOMCAT_SERVICE/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties ]; then
  SERVLET_DIR=/var/lib/$TOMCAT_SERVICE/webapps/bigbluebutton
else 
  SERVLET_DIR=/usr/share/bbb-web
fi

PROTOCOL=http
if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
  SERVER_URL=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
  if cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | grep bigbluebutton.web.serverURL | grep -q https; then
    PROTOCOL=https
  fi
fi


##########################
### END DEB-HELPERS.SH ###
##########################
