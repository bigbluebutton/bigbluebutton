if [ -d "workdir" ]; then
  rm -rf workdir
fi
mkdir workdir

# Sign linux x86 jar
cp ffmpeg-linux-x86-svc2-unsigned.jar workdir/ffmpeg-linux-x86-svc2.jar
ant sign-lin-x86-jar
cp workdir/ffmpeg-linux-x86-svc2.jar ../../../app/jws/lib/

# Sign linux x86_64 jar
cp ffmpeg-linux-x86_64-svc2-unsigned.jar workdir/ffmpeg-linux-x86_64-svc2.jar
ant sign-lin-x86_64-jar
cp workdir/ffmpeg-linux-x86_64-svc2.jar ../../../app/jws/lib/

# Sign Windows x86 jar
cp ffmpeg-win-x86-svc2-unsigned.jar workdir/ffmpeg-win-x86-svc2.jar
ant sign-win-x86-jar
cp workdir/ffmpeg-win-x86-svc2.jar ../../../app/jws/lib/

# Sign windows x86_64 jar
cp ffmpeg-win-x86_64-svc2-unsigned.jar workdir/ffmpeg-win-x86_64-svc2.jar
ant sign-win-x86_64-jar
cp workdir/ffmpeg-win-x86_64-svc2.jar ../../../app/jws/lib/

# Sign macox x86_64 jar
cp ffmpeg-macosx-x86_64-svc2-unsigned.jar workdir/ffmpeg-macosx-x86_64-svc2.jar
ant sign-macosx-x86_64-jar
cp workdir/ffmpeg-macosx-x86_64-svc2.jar ../../../app/jws/lib/

