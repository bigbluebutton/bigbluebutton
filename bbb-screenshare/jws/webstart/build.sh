if [ -d "lib" ]; then
  rm -rf lib
fi
mkdir lib
cp ../../app/jws/lib/ffmpeg.jar lib
gradle clean
gradle jar
ant sign-jar
cp build/libs/javacv-screenshare-0.0.1.jar ../../app/jws/lib/
rm -rf lib
