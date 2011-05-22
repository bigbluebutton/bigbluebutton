#!/bin/bash

set -e
set -x

cd /home/firstuser/dev/source/bigbluebutton/record-and-playback/rap/scripts
ruby process/matterhorn.rb -m 2364d22e-b650-40b4-9c7c-e72f66b093ef
ruby publish/matterhorn.rb -m 2364d22e-b650-40b4-9c7c-e72f66b093ef

