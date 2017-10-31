if [ -d "workdir" ]; then
  rm -rf workdir
fi
mkdir workdir
cp javacv-screenshare-0.0.1.jar workdir
ant sign-screenshare-jar
cp workdir/javacv-screenshare-0.0.1.jar ../../../app/jws/lib/
rm -rf workdir

