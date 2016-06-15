JAVACV=javacv-1.2.jar
mkdir workdir
cp $JAVACV workdir/javacv.jar
ant sign-javacv-jar
cp workdir/javacv.jar ../../../app/jws/lib/
rm -rf workdir
