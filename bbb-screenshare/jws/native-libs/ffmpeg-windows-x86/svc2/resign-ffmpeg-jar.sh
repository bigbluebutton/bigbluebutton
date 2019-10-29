JAR=../../../../app/jws/lib/ffmpeg-win-x86-svc2.jar
if [ -d "workdir" ]; then
  rm -rf workdir
fi
mkdir workdir
cp $JAR workdir
ant resign-ffmpeg-jar
cp workdir/ffmpeg-win-x86-svc2.jar ../../../../app/jws/lib/
rm -rf workdir

