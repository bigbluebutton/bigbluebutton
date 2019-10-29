JAR=../../../../app/jws/lib/ffmpeg-linux-x86-svc2.jar
if [ -d "workdir" ]; then
  rm -rf workdir
fi
mkdir workdir
cp $JAR workdir
ant resign-ffmpeg-jar
cp workdir/ffmpeg-linux-x86-svc2.jar ../../../../app/jws/lib/
rm -rf workdir

