#!/bin/bash

# JMX options
JMX_OPTS="-Djavax.net.ssl.keyStore=conf/keystore.jmx -Djavax.net.ssl.keyStorePassword=password"

# port, username, password
SHUTDOWN_OPTS="9999 red5user changeme"

for JAVA in "$JAVA_HOME/bin/java" "/usr/bin/java" "/usr/local/bin/java"
do
  if [ -x $JAVA ]
  then
    break
  fi
done

if [ ! -x $JAVA ]
then
  echo "Unable to locate java. Please set JAVA_HOME environment variable."
  exit
fi

# stop red5
exec $JAVA $JMX_OPTS -Djava.security.manager -Djava.security.policy=conf/red5.policy -cp red5.jar:conf:$CLASSPATH org.red5.server.Shutdown $SHUTDOWN_OPTS
