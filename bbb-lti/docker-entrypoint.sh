#!/bin/bash -xe

export JAVA_OPTS="$JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -DbigbluebuttonSalt=$BIGBLUEBUTTON_SHARED_SECRET -DbigbluebuttonURL=$BIGBLUEBUTTON_URL -DltiEndPoint=$LTI_ENDPOINT -DltiConsumers=$LTI_CONSUMERS -DltiAllRecordedByDefault=$RECORDED_BY_DEFAULT"
sed -i "s|^securerandom\.source=.*|securerandom.source=file:/dev/./urandom|g" $JAVA_HOME/lib/security/java.security

if [ -f webapps/lti.war ]; then
  mkdir -p webapps/$LTI_CONTEXT_PATH
  unzip -q webapps/lti.war -d webapps/$LTI_CONTEXT_PATH
  rm webapps/lti.war
fi

catalina.sh run

