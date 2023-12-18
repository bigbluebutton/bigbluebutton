mkdir freeswitch
cd freeswitch
git init
git remote add origin https://github.com/signalwire/freeswitch.git
<<<<<<< HEAD
git fetch --depth 1 origin v1.10.9
=======
git fetch --depth 1 origin v1.10.10
>>>>>>> v2.5.x-release
git checkout FETCH_HEAD
