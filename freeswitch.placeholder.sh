mkdir freeswitch
cd freeswitch
git init
git remote add origin https://github.com/signalwire/freeswitch.git
#git fetch --depth 1 origin v1.10.9
#git checkout FETCH_HEAD
git fetch origin master
git checkout 41507363f3fffcdad547b168e55fbe3383a24c3d # branch 'master' on Aug 10, 2023
