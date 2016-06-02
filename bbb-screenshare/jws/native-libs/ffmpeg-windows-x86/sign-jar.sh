FFMPEG=ffmpeg-3.0.2-1.2-windows-x86.jar
mkdir workdir
cp $FFMPEG workdir/ffmpeg-windows-x86.jar
rm -rf src
mkdir -p src/main/resources
mkdir -p src/main/java
cd workdir
jar xvf ffmpeg-windows-x86.jar
cp org/bytedeco/javacpp/windows-x86/*.dll ../src/main/resources
cd ..
rm -rf workdir
gradle jar
ant sign-jar
cp build/libs/ffmpeg-windows-x86-0.0.1.jar ../../../app/jws/lib/ffmpeg-windows-x86.jar
rm -rf src

