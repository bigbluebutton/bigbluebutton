#!/bin/bash
# Run 10.000 connections with 20 parallel clients (each client will disconnect at a random time - see main.js for more details)
seq 1 10000 | xargs -n 1 -P 20 node main.js