#!/bin/bash

# Build BBB Recording Persistence library
cd $HOME/src/bbb-recording/bbb-recording-persistence
mvn clean install

# Build BBB Recording API application 
cd $HOME/src/bbb-recording/bbb-recording-api
JAR_DIR="$HOME/usr/share/recording-api"
JAR_NAME="bbb-recording-api-1.0-SNAPSHOT-shaded.jar"
RUN_DIR="$HOME/usr/local/bin"

mkdir -p $JAR_DIR
mkdir -p $RUN_DIR
mvn clean package -Dmaven.test.skip
cp target/${JAR_NAME} $JAR_DIR
echo '#!/bin/bash
java -jar '${JAR_DIR}'/'${JAR_NAME} > ${RUN_DIR}/recording-api.sh
chmod +x ${RUN_DIR}/recording-api.sh


# Build BBB Recording Import/Export application
cd $HOME/src/bbb-recording/bbb-recording-imex
JAR_DIR="$HOME/usr/share/recording-imex"
JAR_NAME="bbb-recording-imex-1.0-SNAPSHOT-shaded.jar"
RUN_DIR="$HOME/usr/local/bin"

mkdir -p $JAR_DIR
mkdir -p $RUN_DIR
mvn clean package -Dmaven.test.skip
cp target/${JAR_NAME} $JAR_DIR
echo '#!/bin/bash
java -jar '${JAR_DIR}'/'${JAR_NAME} '"$@"' > ${RUN_DIR}/recording-imex.sh
chmod +x ${RUN_DIR}/recording-imex.sh

