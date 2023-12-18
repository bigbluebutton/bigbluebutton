#!/bin/bash
JAR_DIR="$HOME/usr/share/recording-imex"
JAR_NAME="bbb-recording-imex-1.0-SNAPSHOT-shaded.jar"
RUN_DIR="$HOME/usr/local/bin"

mkdir -p $JAR_DIR
mkdir -p $RUN_DIR
mvn package -Dmaven.test.skip
cp target/${JAR_NAME} $JAR_DIR
echo '#!/bin/bash
java -jar '${JAR_DIR}'/'${JAR_NAME} '"$@"'> ${RUN_DIR}/recording-imex.sh
chmod +x ${RUN_DIR}/recording-imex.sh
