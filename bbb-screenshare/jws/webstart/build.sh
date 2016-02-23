mkdir lib
cp ../../app/jws/lib/*.jar lib
gradle jar
ant sign-jar
cp build/libs/javacv-screenshare-0.0.1.jar ../../app/jws/lib/
rm -rf lib

