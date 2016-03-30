FFMPEG=ffmpeg-3.0-1.2-SNAPSHOT.jar
mkdir workdir
cp $FFMPEG workdir/ffmpeg.jar
ant sign-ffmpeg-jar
cp workdir/ffmpeg.jar ../../../app/jws/lib/
rm -rf workdir

