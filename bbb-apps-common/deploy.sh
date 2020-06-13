#!/usr/bin/env bash
set -e
sbt clean publish publishLocal
