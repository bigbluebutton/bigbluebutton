mkdir workdir
cp ffmpeg-linux-x86.jar workdir
rm -rf src
mkdir -p src/main/resources
cd workdir
jar xvf ffmpeg-linux-x86.jar
cp org/bytedeco/javacpp/linux-x86/* ../src/main/resources
cd ..
rm -rf workdir
gradle jar
ant sign-jar
cp build/libs/ffmpeg-linux-x86-0.0.1.jar ../../../app/jws/lib/ffmpeg-linux-x86.jar
