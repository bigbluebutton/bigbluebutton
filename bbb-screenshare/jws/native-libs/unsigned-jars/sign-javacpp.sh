mkdir workdir
cp javacpp-1.2-SNAPSHOT.jar workdir/javacpp.jar
ant sign-javacpp-jar
cp workdir/javacpp.jar ../../../app/jws/lib/
rm -rf workdir

