@echo off

if not "%JAVA_HOME%" == "" goto launchRed5

:launchRed5
"%JAVA_HOME%/bin/java" -Djavax.net.ssl.keyStore=conf/truststore.jmx -Djavax.net.ssl.keyStorePassword=trustword -Djava.security.manager -Djava.security.policy=conf/red5.policy -cp red5.jar;conf;bin org.red5.server.Shutdown 9999 red5user changeme
goto finaly

:err
echo JAVA_HOME environment variable not set! Take a look at the readme.
pause

:finaly

