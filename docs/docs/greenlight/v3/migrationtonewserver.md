---
id: migrationtonewserver
slug: /greenlight/v3/migrationtonewserver
title: Migration from Old v3 Server to new v3 Server
sidebar_position: 5
description: Greenlight Migration between Old Server to New Server both running v3
keywords:
- greenlight
- migration
- v3
---


### Migrating the Greenlight between Old v3 Server to New v3 Server

Before Installing the BigBlueButton on a new server the migration should be done.

On your old server
```
cd ~/greenlight-v3
docker-compose down
cd ..
tar -cvzf greenlight.tar.gz ./greenlight-v3
```

Transfer the tar file to the new server using scp or rsync
```
rsync -rP greenlight.tar.gz root@new-server:~
```

On the New Server
```
cd ~
tar -xvzf greenlight.tar.gz
```
You can now proceed with the installation of Bigbluebutton using install script passing -g as an argument. All the users, rooms, settings will be restored

