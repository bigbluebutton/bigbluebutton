#!/bin/bash

#
# Setup the locale for BigBlueButton
#
NEW_LANG=$(cat ./src/org/bigbluebutton/util/i18n/ResourceUtil.as | tr -d '\r' | sed -n "/localeChain:Array/{s/.*\[ //g;s/\];//g;s/\"//g;s/,//g;p}")
echo "Checking languages: $NEW_LANG"

CUR_DIR=$(pwd)

cd "${FLEX_HOME}/frameworks/locale"

for v in $NEW_LANG; do
        if [ ! -d ${v} ]; then
                echo "Creating locale for: ${v}"
                copylocale en_US ${v}
        fi
done

cd $CUR_DIR

