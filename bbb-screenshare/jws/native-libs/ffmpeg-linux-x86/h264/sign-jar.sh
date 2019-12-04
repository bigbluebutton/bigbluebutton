FFMPEG=ffmpeg-3.0.2-1.2-linux-x86-h264.jar
mkdir workdir
cp $FFMPEG workdir/ffmpeg-linux-x86.jar
rm -rf src
mkdir -p src/main/resources
mkdir -p src/main/java
cd workdir
jar xvf ffmpeg-linux-x86.jar
cp org/bytedeco/javacpp/linux-x86/*.so* ../src/main/resources
cd ..
gradle jar
cp build/libs/ffmpeg-linux-x86-0.0.1.jar ../../unsigned-jars/ffmpeg-linux-x86-h264-unsigned.jar
ant sign-jar
cp build/libs/ffmpeg-linux-x86-0.0.1.jar ../../../../app/jws/lib/ffmpeg-linux-x86-h264.jar
rm -rf workdir
rm -rf src
