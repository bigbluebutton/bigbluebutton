JAVACV=javacv-1.2-20160211.041753-1.jar
mkdir workdir
cp $JAVACV workdir/javacv.jar
ant sign-javacv-jar
cp workdir/javacv.jar ../../../app/jws/lib/
rm -rf workdir
