#!/bin/bash -e

echo "Now executing audio.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest audio.test.js --detectOpenHandles
echo "Now executing breakout.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest breakout.test.js --detectOpenHandles
echo "Now executing chat.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest chat.test.js --detectOpenHandles
echo "Now executing customparameters.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest customparameters.test.js --detectOpenHandles
echo "Now executing notifications.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest notifications.test.js --detectOpenHandles
echo "Now executing presentation.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest presentation.test.js --detectOpenHandles
echo "Now executing screenshare.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest screenshare.test.js --detectOpenHandles
echo "Now executing sharednotes.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest sharednotes.test.js --detectOpenHandles
echo "Now executing user.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest user.test.js --detectOpenHandles
echo "Now executing virtualizedlist.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest virtualizedlist.test.js --detectOpenHandles
echo "Now executing webcam.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest webcam.test.js --detectOpenHandles
echo "Now executing whiteboard.test.js autotest:";env $(cat ./tests/puppeteer/.env | xargs)  jest whiteboard.test.js --detectOpenHandles
