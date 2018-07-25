#!/bin/bash -e

export METEOR_SETTINGS=` jq "${METEOR_SETTINGS_MODIFIER}" /source/private/config/settings-production.json `

node main.js
