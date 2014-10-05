Voice Conference Manager
========================

Proxies FS XML_CURL requests to BBB LBs

INSTALLATION
============

## Install Node (0.10.26)

```
1. sudo apt-get install build-essential
2. wget http://nodejs.org/dist/v0.10.26/node-v0.10.26.tar.gz
3. tar zxvf node-v0.10.26.tar.gz
4. cd node-v0.10.26
5. ./configure
6. make
7. sudo make install
```

## Install CoffeeScript (1.7.1)

```
sudo npm install -g coffee-script
```

## Install voice-conf-manager

```
1. Create /usr/local/bigbluebutton dir
2. Copy to /usr/local/bigbluebutton/voice-conf-manager
3. cd /usr/local/bigbluebutton/voice-conf-manager
4. npm install
6. Create /var/log/bigbluebutton/voice-conf-manager.log file
```

STARTING
========

```
1. Install pm2 (https://github.com/Unitech/pm2) 
   sudo npm install pm2 -g
2. pm2 start index.coffee --name voice-conf-manager

2. Create a startup script (NOTE: You might need to reboot. see: https://github.com/Unitech/pm2#startup-script)
    sudo pm2 startup ubuntu
```

## Managing

```
# List the processes
pm2 list

# Stop the process
pm2 stop voice-conf-manager

# Restart
pm2 restart voice-conf-manager

# Remove the process managed by pm2
pm2 delete voice-conf-manager

```


## Monitoring

```
Calling http://ip:3004/
```


When it returns the ff, the service is UP.

```
<?xml version="1.0" encoding="utf-8" standalone="no"?>  
<document type="freeswitch/xml">
  <section name="result" description="Reject Call">
    <result status="Invalid XML CURL URL"/>
  </section>
</document>
```

