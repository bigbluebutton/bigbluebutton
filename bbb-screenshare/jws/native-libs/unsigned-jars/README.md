=== Signing jars ===

In this version of screenshare, you only need to sign `ffmpeg.jar`.

Copy your certificate in this directory and run `sign-ffmpeg.sh`. It will prompt for
your cert file as well as password of your cert file.

The resulting signed jar file will be found in `bbb-screenshare/apps/jws/lib`

To verify that the jar has been signed, run

```
   jarsigner -verify ffmpeg.jar
```   

