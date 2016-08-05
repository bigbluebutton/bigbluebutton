FFMPEG=ffmpeg-3.0.2-1.2-linux-x86_64.jar
mkdir workdir
rm -rf workdir
cp $FFMPEG build/libs/ffmpeg-linux-x86_64-0.0.1.jar
cp build/libs/ffmpeg-linux-x86_64-0.0.1.jar ../unsigned-jars/ffmpeg-linux-x86_64-unsigned.jar
ant sign-jar
cp build/libs/ffmpeg-linux-x86_64-0.0.1.jar ../../../app/jws/lib/ffmpeg-linux-x86_64.jar
