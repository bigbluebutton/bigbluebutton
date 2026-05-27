#!/bin/bash

# First argument is the role of the container, defaults to "resque_workers"
ROLE=${1:-resque_workers}

if [ "$ROLE" = "resque_workers" ]; then
    # Set env variables for worker HOME=/home/bigbluebutton
    export HOME="/home/bigbluebutton"
    export QUEUE="rap:archive,rap:publish,rap:process,rap:sanity"
    export COUNT="1"

    COMMAND="bundle exec rake -f Rakefile resque:workers"
elif [ "$ROLE" = "rap_starter" ]; then
    export HOME="/home/bigbluebutton"

    COMMAND="bundle exec ruby /usr/local/bigbluebutton/core/scripts/rap-starter.rb"
elif [ "$ROLE" = "rap_caption_inbox" ]; then
    export HOME="/home/bigbluebutton"

    COMMAND="bundle exec ruby /usr/local/bigbluebutton/core/scripts/rap-caption-inbox.rb"
elif [ "$ROLE" = "cleanup" ]; then

    COMMAND="sh -c /cleanup.sh"
else
    echo "Unknown role: $ROLE"
    exit 1
fi

# Print the role for logging purposes
echo "RUNNING AS ROLE: $ROLE"

touch /var/log/bigbluebutton/recording.log
touch /var/log/bigbluebutton/bbb-web.log
touch /var/log/bigbluebutton/sanity.log
touch /var/log/bigbluebutton/post_publish.log
mkdir -p /var/log/bigbluebutton/presentation
chown -R bigbluebutton:bigbluebutton /var/log/bigbluebutton

dockerize \
    -wait tcp://redis:6379 \
    -template /etc/bigbluebutton/recording/recording.yml.tmpl:/etc/bigbluebutton/recording/recording.yml \
    -template /etc/bigbluebutton/bbb-web.properties.tmpl:/etc/bigbluebutton/bbb-web.properties \
    -stdout /var/log/bigbluebutton/recording.log \
    -stdout /var/log/bigbluebutton/post_publish.log \
    -stdout /var/log/bigbluebutton/sanity.log \
    $COMMAND

