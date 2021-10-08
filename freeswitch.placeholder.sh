mkdir freeswitch
cd freeswitch
git init
git remote add origin https://github.com/signalwire/freeswitch.git
git fetch --depth 1 origin 5c6fd51c115f4029926197095d436d527277c0e2
git checkout FETCH_HEAD
cp -r ../bbb-voice-conference/config .