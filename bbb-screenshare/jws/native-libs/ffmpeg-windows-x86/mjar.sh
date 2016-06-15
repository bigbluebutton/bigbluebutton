cp /home/ubuntu/dev/custom-javacv/ffmpeg-2.8.1-1.1-windows-x86.jar workdir
cd workdir
jar xvf ffmpeg-2.8.1-1.1-windows-x86.jar
cp org/bytedeco/javacpp/windows-x86/*.dll ../src/main/resources
rm -rf META-INF/ org ffmpeg-2.8.1-1.1-windows-x86.jar
cd ..

