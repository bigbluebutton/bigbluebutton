mkdir workdir
cp ffmpeg-windows-x86_64.jar workdir/ffmpeg-windows-x86_64.jar
rm -rf src
mkdir -p src/main/resources
mkdir -p src/main/java
cd workdir
jar xvf ffmpeg-windows-x86_64.jar
cp org/bytedeco/javacpp/windows-x86_64/*.dll ../src/main/resources
cd ..
rm -rf workdir
gradle jar
ant sign-jar
cp build/libs/ffmpeg-windows-x86_64-0.0.1.jar ../../../app/jws/lib/ffmpeg-windows-x86_64.jar
rm -rf src

