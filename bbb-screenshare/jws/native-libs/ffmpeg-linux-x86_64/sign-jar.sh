FFMPEG=ffmpeg-2.8.5-1.2-SNAPSHOT-linux-x86_64.jar
mkdir workdir
rm -rf workdir
cp $FFMPEG build/libs/ffmpeg-linux-x86_64-0.0.1.jar
ant sign-jar
cp build/libs/ffmpeg-linux-x86_64-0.0.1.jar ../../../app/jws/lib/ffmpeg-linux-x86_64.jar
