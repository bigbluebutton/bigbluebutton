#!/bin/bash -e

BBB_WEB_ETC_CONFIG=/etc/bigbluebutton/bbb-web.properties
BBB_WEB_PACKAGED_CONFIG=/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties
# SHA-256 of the retired default secret that BootStrap.groovy refuses
RETIRED_SECRET_SHA256=f85c8c2934b5a89cea99f26c887ecef1216d900e8652bba4ac9a7982d68ec96a

#
# Older postinsts wrote generated secrets into the packaged
# bigbluebutton.properties, which this upgrade replaces. Copy each one that
# /etc/bigbluebutton/bbb-web.properties does not set there, so the secrets in
# use survive the upgrade. Only essential packages are guaranteed in a
# preinst: use grep, sed and coreutils only.
#
# $1 = key, $2 = placeholder shipped in the packaged file
keep_packaged_secret() {
  key=$1
  placeholder=$2

  if [ -f "$BBB_WEB_ETC_CONFIG" ] && grep -q "^${key}[[:space:]]*=" "$BBB_WEB_ETC_CONFIG"; then
    return 0
  fi
  if [ ! -f "$BBB_WEB_PACKAGED_CONFIG" ]; then
    return 0
  fi

  secret=$(grep "^${key}[[:space:]]*=" "$BBB_WEB_PACKAGED_CONFIG" | tail -n 1 \
    | sed -e "s/^${key}[[:space:]]*=[[:space:]]*//" -e 's/[[:space:]]*$//')
  if [ -z "$secret" ] || [ "$secret" = "$placeholder" ]; then
    return 0
  fi
  if [ "$(printf '%s' "$secret" | sha256sum | cut -d ' ' -f 1)" = "$RETIRED_SECRET_SHA256" ]; then
    return 0
  fi

  mkdir -p /etc/bigbluebutton
  if [ ! -f "$BBB_WEB_ETC_CONFIG" ]; then
    touch "$BBB_WEB_ETC_CONFIG"
    chmod 0644 "$BBB_WEB_ETC_CONFIG"
  elif [ -s "$BBB_WEB_ETC_CONFIG" ] && [ -n "$(tail -c 1 "$BBB_WEB_ETC_CONFIG")" ]; then
    echo >> "$BBB_WEB_ETC_CONFIG"
  fi
  echo "${key}=${secret}" >> "$BBB_WEB_ETC_CONFIG"
  echo "Kept the existing ${key} in $BBB_WEB_ETC_CONFIG"
}

case "$1" in
    upgrade|2)
        keep_packaged_secret securitySalt CHANGE_ME_API_SECRET
        keep_packaged_secret pageTokenSecret CHANGE_ME_PAGE_TOKEN_SECRET
    ;;

    install|1)
    ;;

    abort-upgrade)
    ;;

    *)
        echo "## preinst called with unknown argument \`$1'" >&2
    ;;
esac
