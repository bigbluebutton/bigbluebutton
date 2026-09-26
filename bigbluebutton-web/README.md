# BigBlueButton Web (bbb-web)

Grails application implementing the BigBlueButton HTTP API (create/join/end,
recordings, presentation upload).

Stack: Grails 8.x / Spring Boot 4.1 / Groovy 5 on Java 21. The build uses the
Gradle wrapper (`./gradlew`), so only a JDK is required:

```
sudo apt-get install openjdk-21-jdk-headless
```

`bbb-common-message` and `bbb-common-web` are built with sbt (the projects pin
sbt 1.10.7 in project/build.properties). If you don't have sbt, install it e.g.
via SDKMAN:

```
curl -s "https://get.sdkman.io" | bash
sdk install sbt 1.10.7
```

### Development

Build `bbb-common-message`

```
cd bigbluebutton/bbb-common-message

./deploy.sh
```

Build `bbb-common-web` (resolves `bbb-common-message` from the local repos —
keep this order)

```
cd bigbluebutton/bbb-common-web

./deploy.sh
```

Build and run `bbb-web`

```
cd bigbluebutton/bigbluebutton-web

# Make sure you don't have old libs lying around. Might cause issues.
# You need to do this only once to cleanup lib dir.

rm lib/*

./build.sh

# This will listen on port 8090.
# If you've setup your nginx config to bbb-web dev, you don't need to do anything.

./run.sh

```

To run unit tests: `./gradlew test`

### Production

To package the application for production:

1. Compile the application and package it using `./gradlew assemble`
2. You now have the file `build/libs/bigbluebutton-0.10.0.war`
3. Create a new directory `mkdir exploded`
4. Navigate to that directory `cd exploded`
5. Extract the war content `jar -xvf ../build/libs/bigbluebutton-0.10.0.war`
6. Package the content of the new directory in a debian package then add service configuration. Install into `/usr/share/bbb-web`.
7. Use the systemd service file provided in build/packages-template/bbb-web. App will be listening on port 8080
8. To do custom config, edit `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`
Don't forget to use full directories path and replace the dot before the org with the full path to the exploded war.
