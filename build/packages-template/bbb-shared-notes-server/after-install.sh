#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  # make sure postgres can read this directory
  chmod 755 /usr/share/bbb-shared-notes-server/ -R


  # Create user blocknote_app@blocknote_app (for blocknote metadata)
  runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='blocknote_app'" | grep -q 1 || \
    runuser -u postgres -- psql -c "CREATE USER blocknote_app WITH PASSWORD 'blocknote_app'"

  HASURA_DATABASE_NAME="blocknote_app"
  runuser -u postgres -- psql -q -c "DROP DATABASE IF EXISTS $HASURA_DATABASE_NAME WITH (FORCE);"
  runuser -u postgres -- psql -q -c "CREATE DATABASE $HASURA_DATABASE_NAME OWNER blocknote_app;"

runuser -u postgres -- psql -U postgres -d blocknote_app -q -f /usr/share/bbb-shared-notes-server/blocknote_schema.sql --set ON_ERROR_STOP=on

  # Setup Docker image for HTML to PDF conversion
  if which docker > /dev/null; then
    echo "#"
    echo "# Pulling zenika/alpine-chrome docker image for PDF conversion"
    echo "#"
    docker pull zenika/alpine-chrome || echo "Warning: Failed to pull zenika/alpine-chrome image"

    # Configure sudoers to allow bigbluebutton user to run docker without password
    # for the specific HTML to PDF conversion command
    echo "Configuring sudoers for HTML to PDF conversion..."
    cat > /etc/sudoers.d/zzz-bbb-docker-chrome <<'SUDOERS_EOF'
bigbluebutton ALL=(ALL) NOPASSWD: /usr/bin/docker run --rm --memory=1g --memory-swap=1g --network none --user=[0-9][0-9][0-9][0-9][0-9] -e HOME=/tmp -e XDG_RUNTIME_DIR=/tmp/runtime --tmpfs /tmp\:rw\,exec\,nosuid\,size=256m --tmpfs /tmp/runtime\:rw\,exec\,nosuid\,size=64m -v /tmp/bbb-chrome-bigbluebutton/tmp.[0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z][0-9a-zA-Z]/\:/workspace/ --security-opt seccomp=unconfined --entrypoint /usr/bin/chromium-browser zenika/alpine-chrome --headless=new --user-data-dir=/tmp/chrome-data --no-pdf-header-footer --run-all-compositor-stages-before-draw --disable-dev-shm-usage --no-sandbox --disable-setuid-sandbox --no-first-run --no-default-browser-check --disable-breakpad --disable-gpu --disable-software-rasterizer --disable-extensions --print-to-pdf=/workspace/output.pdf file\:///workspace/input.html
SUDOERS_EOF

    chmod 440 /etc/sudoers.d/zzz-bbb-docker-chrome

    # Ensure conversion script is executable
    chmod +x /usr/share/bbb-conversion-shared-notes/convert.sh
  else
    echo "Warning: Docker not found. HTML to PDF conversion will not work."
  fi

  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-shared-notes-server.service
    systemctl daemon-reload
    reloadService nginx
    startService bbb-shared-notes-server.service || echo "bbb-shared-notes-server service could not be registered or started"
  fi

  echo "Shared-Notes-Server after-install finished"

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
