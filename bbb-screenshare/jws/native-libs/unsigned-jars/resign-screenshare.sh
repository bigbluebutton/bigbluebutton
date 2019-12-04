JAR=javacv-screenshare-0.0.1.jar
if [ -d "workdir" ]; then
  rm -rf workdir
fi
mkdir workdir
cp $JAR workdir
cd workdir
cd ..
ant sign-screenshare-jar
cp workdir/javacv-screenshare-0.0.1.jar ../../../app/jws/lib/
rm -rf workdir

