#!/bin/bash

gradle clean
gradle jar
cp build/libs/*.jar lib
