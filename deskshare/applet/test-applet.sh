cd ../common
gradle clean
cd ../applet
gradle jar
ant sign-certificate-jar
cp /home/firstuser/dev/bigbluebutton/deskshare/applet/build/libs/bbb-deskshare-applet-0.8.1.jar /home/firstuser/dev/bigbluebutton/bigbluebutton-client/client/

