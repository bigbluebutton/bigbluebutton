pushd .

#stop current
sudo /etc/init.d/red5 stop

# build
cd ~/dev/source/bigbluebutton/bigbluebutton-apps
gradle resolveDeps war deploy

# run
cd /usr/share/red5/
sudo -u red5 ./red5.sh 

#return to working dir
popd
