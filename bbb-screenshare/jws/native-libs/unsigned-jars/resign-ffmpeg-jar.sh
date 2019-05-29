JAR=../../../app/jws/lib/ffmpeg.jar
if [ -d "workdir" ]; then
  rm -rf workdir
fi
mkdir workdir
cp $JAR workdir
cd workdir
cd ..
ant sign-ffmpeg-jar
cp workdir/ffmpeg.jar ../../../app/jws/lib/
rm -rf workdir

