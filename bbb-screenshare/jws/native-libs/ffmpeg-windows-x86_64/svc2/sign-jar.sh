FFMPEG=ffmpeg-3.0.2-1.2-windows-x86_64-svc2.jar
mkdir workdir
cp $FFMPEG workdir/ffmpeg-windows-x86_64.jar
rm -rf src
mkdir -p src/main/resources
mkdir -p src/main/java
cd workdir
jar xvf ffmpeg-windows-x86_64.jar
cp org/bytedeco/javacpp/windows-x86_64/*.dll ../src/main/resources
cd ..
rm -rf workdir
gradle jar
cp build/libs/ffmpeg-windows-x86_64-0.0.1.jar ../../unsigned-jars/ffmpeg-win-x86_64-svc2-unsigned.jar
ant sign-jar
cp build/libs/ffmpeg-windows-x86_64-0.0.1.jar ../../../../app/jws/lib/ffmpeg-win-x86_64-svc2.jar
rm -rf src
