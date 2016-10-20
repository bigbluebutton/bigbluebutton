
To sign the ffmpeg.jar and javacpp.jar, copy them to the ```workdir``` directory and
run "```ant sign-ffmpeg-jar```" or "```ant sign-javacpp-jar```".

The resulting jar files will now be signed. To verify, run

```
   jarsigner -verify ffmpeg.jar
   jarsigner -verify javacpp.jar
```   

