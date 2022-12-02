mkdir freeswitch
cd freeswitch
git init
git remote add origin https://github.com/signalwire/freeswitch.git
git fetch --depth 1 origin v1.10.7
git checkout FETCH_HEAD
cp -r ../bbb-voice-conference/config .
