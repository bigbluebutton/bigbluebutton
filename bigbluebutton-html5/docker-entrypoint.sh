#!/bin/bash -e

export METEOR_SETTINGS=` jq "${METEOR_SETTINGS_MODIFIER}" ./programs/server/assets/app/config/settings-production.json `

node main.js
