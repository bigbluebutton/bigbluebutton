JAR=../../../../app/jws/lib/ffmpeg-macosx-x86_64-svc2.jar
if [ -d "workdir" ]; then
  rm -rf workdir
fi
mkdir workdir
cp $JAR workdir
ant resign-ffmpeg-jar
cp workdir/ffmpeg-macosx-x86_64-svc2.jar ../../../../app/jws/lib/
rm -rf workdir

