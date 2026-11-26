#!/bin/bash -e

# The config holds the static-auth-secret once configured, so restrict it to the
# turnserver user (the distro package does the same via dpkg-statoverride).
if [ -f /etc/turnserver.conf ]; then
  chown root:turnserver /etc/turnserver.conf
  chmod 0640 /etc/turnserver.conf
fi

# Log directory: bbb-install points the service's --log-file override here and
# expects it to be writable by the turnserver user.
mkdir -p /var/log/turnserver
chown turnserver:turnserver /var/log/turnserver

# /run/systemd/system only exists when systemd is the running init, which
# covers docker/chroot/container environments in one check.
if [ -d /run/systemd/system ]; then
  systemctl daemon-reload
fi

# On upgrade ($2 carries the version we upgraded from), before-remove left the
# service running; restart it so the new binary and unit take over. Fresh
# installs are deliberately left stopped (see below).
if [ -n "$2" ] && [ -d /run/systemd/system ]; then
  systemctl try-restart coturn.service || true
fi

# On fresh installs the service is deliberately left neither enabled nor
# started. The stock /etc/turnserver.conf has every option commented out and
# coturn defaults to anonymous access, so starting it before a real
# configuration is written would expose an open relay. Whoever writes the
# configuration (bbb-install) enables and starts it. On upgrades ($2 set) the
# notice would be wrong — the service is configured and was just restarted.
if [ -z "$2" ]; then
  cat <<'EOT'

bbb-coturn is installed but the coturn service was NOT started: the shipped
/etc/turnserver.conf is the stock, all-commented configuration and coturn
defaults to anonymous access. Configure /etc/turnserver.conf first, then run:

    systemctl enable --now coturn

EOT
fi
