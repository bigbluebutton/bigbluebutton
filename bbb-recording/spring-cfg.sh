#!/bin/bash
. .env

echo "Generating Spring configuration"

PERSISTENCE_DIR=./bbb-recording-api/src/main/resources
CFG_FILE=application.properties

mkdir -p ${PERSISTENCE_DIR}

#HASH=$(echo -n $POSTGRES_PASSWORD | sha256sum)
#HASH=${HASH:0:64}

CONTENT=`echo 'springfox.documentation.open-api.v3.path=/api-docs
server.servlet.contextPath=/
server.port=8080
spring.jackson.date-format=org.bigbluebutton.api.RFC3339DateFormat
spring.jackson.serialization.WRITE_DATES_AS_TIMESTAMPS=false

spring.datasource.platform=postgres
spring.datasource.url=jdbc:postgresql://localhost:'"$HOST_PORT"'/bbb
spring.datasource.username='"$POSTGRES_USER"'
spring.datasource.password='"$POSTGRES_PASSWORD"'

spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

spring.flyway.baselineOnMigrate=true

spring.datasource.hikari.connection.provider_class=com.zaxxer.hikari.hibernate.HikariConnectionProvider
spring.datasource.hikari.minimumIdle=5
spring.datasource.hikari.minimumPoolSize=10
spring.datasource.hikari.idelTimeout=30000

bbb.web.defaultServerUrl=http://bigbluebutton.example.com
bbb.web.defaultTextTrackUrl=${bbb.web.defaultServerURL}/bigbluebutton

bbb.security.salt=330a8b08c3b4c61533e1d0c5ce1ac88f

bbb.recording.publishedDir=/var/bigbluebutton/published
bbb.recording.unpublishedDir=/var/bigbluebutton/unpublished
bbb.recording.captionsDir=/var/bigbluebutton/captions
bbb.recording.presentationBaseDir=/var/bigbluebutton
'`

echo "$CONTENT" > "${PERSISTENCE_DIR}/${CFG_FILE}"

