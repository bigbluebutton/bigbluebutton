FFMPEG=ffmpeg-3.0.2-1.2.jar
mkdir workdir
cp $FFMPEG workdir/ffmpeg.jar
ant sign-ffmpeg-jar
cp workdir/ffmpeg.jar ../../../app/jws/lib/
rm -rf workdir

