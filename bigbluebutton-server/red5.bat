@echo off

if not "%JAVA_HOME%" == "" goto launchRed5

:launchRed5
"%JAVA_HOME%/bin/java" -Djava.security.manager -Dred5.root=. -Djava.security.policy=conf/red5.policy -cp red5.jar;conf;bin org.red5.server.Standalone
goto finaly

:err
echo JAVA_HOME environment variable not set! Take a look at the readme.
pause

:finaly
pause
