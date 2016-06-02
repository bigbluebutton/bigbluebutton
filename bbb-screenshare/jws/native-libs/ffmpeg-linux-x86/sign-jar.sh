FFMPEG=ffmpeg-2.8.5-1.2-SNAPSHOT-linux-x86.jar
cp ffmpeg-2.8.5-1.2-SNAPSHOT-linux-x86.jar build/libs/ffmpeg-linux-x86-0.0.1.jar
mkdir workdir
rm -rf src
rm -rf workdir
ant sign-jar
cp build/libs/ffmpeg-linux-x86-0.0.1.jar ../../../app/jws/lib/ffmpeg-linux-x86.jar
