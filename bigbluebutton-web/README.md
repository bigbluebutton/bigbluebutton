# BigBlueButton Web Grails 3 Deployment Procedure

To run the application from its source code : `grails prod run-app`

To run the application on a different port use : `grails -port=8989 prod run-app`

To run unit tests: `grails test-app --stacktrace`

To package the application for production:

1. Compile the application and package it use `grails assemble`
2. You now have the file `build/libs/bigbluebutton-0.10.0.war`
3. Create a new directory `mkdir exploded`
4. Navigate to that directory `cd exploded`
5. Extract the war content `jar -xvf ../build/libs/bigbluebutton-0.10.0.war`
6. Package the content of the new directory in a debian package then add service configuration.
7. The application is after that runnable using the following command `java -cp WEB-INF/lib/*:/:WEB-INF/classes/:. org.springframe work.boot.loader.WarLauncher`
Don't forget to use full directories path and replace the dot before the org with the full path to the exploded war.