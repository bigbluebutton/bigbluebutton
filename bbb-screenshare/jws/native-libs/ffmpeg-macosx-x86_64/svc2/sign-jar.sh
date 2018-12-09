FFMPEG=ffmpeg-3.0.2-1.2-macosx-x86_64-svc2.jar
mkdir workdir
cp $FFMPEG workdir/ffmpeg-macosx-x86_64.jar
rm -rf src
mkdir -p src/main/resources
cd workdir
jar xvf ffmpeg-macosx-x86_64.jar
cp org/bytedeco/javacpp/macosx-x86_64/* ../src/main/resources
cd ..
rm -rf workdir
gradle jar
cp build/libs/ffmpeg-macosx-x86_64-0.0.1.jar ../../unsigned-jars/ffmpeg-macosx-x86_64-svc2-unsigned.jar
ant sign-jar
cp build/libs/ffmpeg-macosx-x86_64-0.0.1.jar ../../../../app/jws/lib/ffmpeg-macosx-x86_64-svc2.jar
rm -rf src
