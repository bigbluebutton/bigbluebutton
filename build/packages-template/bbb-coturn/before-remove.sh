#!/bin/bash -e

stopService coturn || echo "coturn could not be unregistered or stopped"
