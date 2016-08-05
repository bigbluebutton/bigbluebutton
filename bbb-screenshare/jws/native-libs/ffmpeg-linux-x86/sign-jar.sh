FFMPEG=ffmpeg-3.0.2-1.2-linux-x86.jar
cp $FFMPEG build/libs/ffmpeg-linux-x86-0.0.1.jar
mkdir workdir
rm -rf src
rm -rf workdir
cp build/libs/ffmpeg-linux-x86-0.0.1.jar ../unsigned-jars/ffmpeg-linux-x86-unsigned.jar
ant sign-jar
cp build/libs/ffmpeg-linux-x86-0.0.1.jar ../../../app/jws/lib/ffmpeg-linux-x86.jar
