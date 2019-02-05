#!/bin/bash
java -Dgrails.env=prod -cp WEB-INF/lib/*:/:WEB-INF/classes/:. org.springframework.boot.loader.WarLauncher

