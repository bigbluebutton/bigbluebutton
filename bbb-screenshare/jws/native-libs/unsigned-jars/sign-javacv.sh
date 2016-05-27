JAVACV=javacv-1.2-20160319.154745-3.jar
mkdir workdir
cp $JAVACV workdir/javacv.jar
ant sign-javacv-jar
cp workdir/javacv.jar ../../../app/jws/lib/
rm -rf workdir
