mkdir freeswitch
cd freeswitch
git init
git remote add origin https://github.com/signalwire/freeswitch.git
#git fetch --depth 1 origin v1.10.9
#git checkout FETCH_HEAD
git fetch origin master
git checkout 67840823c178153cb013014c4fa780fe233612cb # branch 'master' on Aug 10, 2023
