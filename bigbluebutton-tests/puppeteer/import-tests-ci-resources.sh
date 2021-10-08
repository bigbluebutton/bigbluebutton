#!/bin/bash -e

testDir=$PWD/bigbluebutton-tests/puppeteer/;

echo "Cloning bbb-ci-tests-resources repo...";
git clone https://github.com/bigbluebutton/bbb-ci-test-resources.git;
echo "bbb-ci-tests-resources has been imported.";

sleep 2;
echo "Importing browser media files...";
mv -f bbb-ci-test-resources/2.3/media $testDir;

if [[ $REGRESSION_TESTING = true ]]; then
    echo "Importing Visual Regressions Testing Files...";
    sleep 1;
    mv -f bbb-ci-test-resources/2.3/__image_snapshots__ $testDir;
    echo "Visual Regressions Testing Files has been imported."
fi
rm -rf bbb-ci-test-resources;