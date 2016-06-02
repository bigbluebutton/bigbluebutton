mkdir lib
cp ../../app/jws/lib/*.jar lib
rm lib/javacv.jar
gradle clean
gradle jar
ant sign-jar
cp build/libs/javacv-screenshare-0.0.1.jar ../../app/jws/lib/
rm -rf lib

