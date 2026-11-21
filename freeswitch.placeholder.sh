#!/bin/bash

mkdir freeswitch
cd freeswitch
git init
git remote add origin https://github.com/signalwire/freeswitch.git
git fetch --depth 1 origin v1.11.4
git checkout FETCH_HEAD
