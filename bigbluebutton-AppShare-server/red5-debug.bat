@echo off

set JAVA_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,address=8787,server=y,suspend=y

if not "%JAVA_HOME%" == "" goto launchRed5

:launchRed5
"%JAVA_HOME%/bin/java" -Djava.security.manager -Djava.security.policy=conf/red5.policy %JAVA_OPTS% -cp red5.jar;conf;bin;%CLASSPATH% org.red5.server.Standalone
goto finaly

:err
echo JAVA_HOME environment variable not set! Take a look at the readme.
pause

:finaly
pause
