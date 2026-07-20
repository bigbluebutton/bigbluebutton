#!/bin/bash

../gradlew clean
../gradlew jar
cp build/libs/*.jar lib
