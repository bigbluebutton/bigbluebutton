pushd .

# stop
sudo /etc/init.d/tomcat6 stop

# build
cd ~/dev/source/bigbluebutton/bigbluebutton-web
gradle copyToLib

# run
ant

# return to working dir
popd
