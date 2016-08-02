
This directory contains the difference JavaCV jar files that we need for our web start application.

To build each native library and sign each ffmpeg native libraries:

1. cd to the platform directory you want to build (cd ffmpeg-win-x86)
2. type ```gradle jar``` to build the jar file
3. type ```ant sign-jar``` to sign the jar file with your certificate
4. copy the signed-jar to ```bbb-screenshare/app/jws/lib``` to be included when
   deploying to red5
   
We have included unsigned jars for ```ffmpeg.jar```, ```javacpp.jar```, and ```javacv.jar``` in the 
unsigned-jars directory. You can sign the jar files there with your certificate.


