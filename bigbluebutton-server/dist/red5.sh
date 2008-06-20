#!/bin/bash

for JAVA in "$JAVA_HOME/bin/java" "/usr/bin/java" "/usr/local/bin/java"
do
  if [ -x $JAVA ]
  then
    break
  fi
done

if [ ! -x $JAVA ]
then
  echo "Unable to locate Java. Please set JAVA_HOME environment variable."
  exit
fi

# start Red5
echo "Starting Red5..."
exec $JAVA -Djava.security.manager -Djava.security.policy=conf/red5.policy -cp red5.jar:conf:$CLASSPATH org.red5.server.Standalone
