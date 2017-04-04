
These are instructions taken from JavaCV website to write the instructions above. We keep a copy here to make sure the instructions we have are compatible with out version of javacpp-presets. 


** NOTE: **
 Taken from https://github.com/bytedeco/javacpp-presets/wiki/Build-Environments

Introduction
------------
This page contains a description of the environments that are used to build the JavaCPP Presets for [Android (ARM and x86)](#android-arm-and-x86), [Linux (x86 and x86_64)](#linux-x86-and-x86_64), [Linux (ARM)](#linux-arm), [Mac OS X (x86_64)](#mac-os-x-x86_64), and [Windows (x86 and x86_64)](#windows-x86-and-x86_64). We also explain our choices given the requirements and provide some recommendations. Furthermore, JavaCPP is by no means limited to these platforms, so if you happen to know how to set up an environment for other platforms, by all means, please do add that information to this page to share with others. Thank you!


Prerequisites for all platforms
-------------------------------
The build process for the modules of `javacpp-presets` usually depends on the same version of the `javacpp` module. To insure that you have the latest matching version of both, please execute the following before starting the build in the `javacpp-presets` directory:
```bash
$ git clone https://github.com/bytedeco/javacpp.git --branch <tag>
$ git clone https://github.com/bytedeco/javacpp-presets.git --branch <tag>
$ cd javacpp
$ mvn clean install
```
For the latest tag please check
https://github.com/bytedeco/javacpp-presets/tags

Android (ARM and x86)
---------------------
To produce native libraries for Android, we basically only need to install the JDK and the NDK, which is available for Linux, Mac OS X, and Windows. However, the build scripts of some libraries only run correctly under Linux, so we recommend using a recent distribution of Linux (such as Fedora or Ubuntu) as build environment for Android.

### Preparations
1. Download the latest version of the [NDK](https://developer.android.com/ndk/downloads/), which is r10e at the time of this writing and contains important fixes for OpenMP, among other things
2. Install the NDK under `~/Android/android-ndk`, where the build scripts will look for it by default
3. Finally, make sure to have installed at least OpenJDK and Maven as per the instructions of your distribution

After which the following commands can be used to start the build inside the `javacpp-presets` directory:
```bash
$ ANDROID_NDK=/path/to/android-ndk/ bash cppbuild.sh -platform android-xxx install
$ mvn clean install -Djavacpp.platform=android-xxx -Djavacpp.platform.root=/path/to/android-ndk/ -Djavacpp.platform.compiler=/path/to/target-g++
```
where `android-xxx` is either `android-arm` or `android-x86`, and where `target-g++` is either `arm-linux-androideabi-g++` or `i686-linux-android-g++`.


Linux (x86 and x86_64)
----------------------
To produce native libraries that can run on the largest possible number of Linux installations out there, it is recommended to build under CentOS 7. This is because it relies on an old enough version of glibc, which nevertheless works for all the libraries found in the JavaCPP Presets, and since newer versions of glibc are backward compatible, all recent distributions of Linux should support the binaries generated. We do not actually need to install CentOS 7 though. Pretty much any recent distribution of Linux comes with a package for [Docker](https://www.docker.com/). It is also possible to map existing directories, for example `/usr/local/lib/bazel` and `/usr/local/cuda` as shown in the steps below, to reuse an existing [Bazel](http://bazel.io/docs/install.html) or [CUDA](https://developer.nvidia.com/cuda-downloads) installation as well as any other set of files for the purpose of the build.

### Preparations
1. Install Docker under, for example, Fedora and Ubuntu, respectively:

    ```bash
    $ sudo yum install docker
    $ sudo apt-get install docker.io
    ```

2. When using SELinux, it might also be necessary to disable temporarily the firewall, for example:

    ```
    $ sudo systemctl stop firewalld
    $ sudo systemctl start docker
    ```

3. Start the container for CentOS 7 (the command might be `docker.io` instead of `docker`):

    ```bash
    $ sudo docker run --privileged -it -v /usr/local/lib/bazel:/usr/local/lib/bazel -v /usr/local/cuda:/usr/local/cuda centos:7 /bin/bash
    ```

4. Finally, inside the container, we need to install a bunch of things:

    ```bash
    $ ln -s /usr/local/lib/bazel/bin/bazel /usr/local/bin/bazel
    $ yum install epel-release
    $ yum install clang gcc-c++ gcc-gfortran java-devel maven python numpy swig git file which wget unzip tar bzip2 gzip xz patch make cmake3 perl nasm yasm alsa-lib-devel freeglut-devel gtk2-devel libusb-devel libusb1-devel zlib-devel
    $ yum install `rpm -qa | sed s/.x86_64$/.i686/`
    ```

After which the following commands can be used to start the build inside the `javacpp-presets` directory:
```bash
$ bash cppbuild.sh -platform linux-xxx install
$ mvn clean install -Djavacpp.platform=linux-xxx
```
where `linux-xxx` is either `linux-x86` or `linux-x86_64`.


Linux (ARM)
-----------
There are a growing number of arm platforms running Linux, though testing of this build has mainly focussed on the Pi family of products. Compiling natively on these platforms can be quite time consuming, and as well to automate the build process, the build setup here relies on cross-compiling for the target arm platform. This has been tested using Ubuntu x64 15.10, but it should be reasonably similar approach for other host OS's. 

You'll need to have setup a build environment with the usual packages (pkgconfig, build-essentials, yasm, nasm, maven3, etc). The major addition you'll need is a set of cross compilers: arm-linux-gnueabihf-gcc, arm-linux-gnueabihf-g++ and arm-linux-gnueabihf-cpp. It's best to get these via your OS's package manager, as there are other dependencies for these. 

Originally a 5.x compiler was used, but this seems to caused problems in creating a dependency on newer glibc functionality which might not be present on your target arm device. The 4.8 or 4.9 version of the compiler seems to work fine, but, in targetting support for the Pi1 and well as Pi2-Pi3 (i.e. arm6 as well as arm7) it seems some compiler flag combinations might not be support by the standard gnueabihf compiler toolchain. 

There are pi specific compilers available, so these have been used in the current setup. 

1. Get the Pi tools: git clone https://github.com/raspberrypi/tools.git
2. From this folder, move out a specific compiler version to a more generic location: sudo cp -r ./tools/arm-bcm2708/arm-bcm2708-linux-gnueabi /opt
3. Setup alternatives of the generic compiler names in /usr/bin to point to this new compiler 

    ```bash
    $ update-alternatives --install /usr/bin/arm-linux-gnueabihf-gcc arm-linux-gnueabihf-gcc /opt/arm-bcm2708hardfp-linux-gnueabi/bin/arm-bcm2708hardfp-linux-gnueabi-gcc 46
    $ update-alternatives --install /usr/bin/arm-linux-gnueabihf-g++ arm-linux-gnueabihf-g++ /opt/arm-bcm2708hardfp-linux-gnueabi/bin/arm-bcm2708hardfp-linux-gnueabi-g++ 46
    $ update-alternatives --install /usr/bin/arm-linux-gnueabihf-cpp arm-linux-gnueabihf-cpp /opt/arm-bcm2708hardfp-linux-gnueabi/bin/arm-bcm2708hardfp-linux-gnueabi-cpp 46
    ```

   (This way if you want to explore using other newer compilers, just add them to alternatives and the same build setup should work fine)

This should now have you setup ready to build for arm. It could be an idea to test at this stage with building a simple hello world executable (save your hello world test code as hello.cpp):

    $ arm-linux-gnueabihf-g++ -O3 -g3 -Wall -fPIC -march=armv6 -mfpu=vfp -mfloat-abi=hard hello.cpp -c -o hello.o 
    $ arm-linux-gnueabihf-g++ -o hello hello.o 
    $ file hello

And you should see in the returned info that hello is built for ARM

With the build environment setup, now its on to building JavaCV. Not all components have been setup with the linux-armhf build configurations, so rather than building the entire project only a subset are built here, but enough to have core functionality (OpenCV, FFmpeg) working with some additional parts (artoolkitplus, flycapture, flandmark, libfreenect, libdc1394) built but not tested. For flycapture, you need to download the arm SDK (currently flycapture.2.9.3.13_armhf) and make these .so libs available, either in your path, or setting up a /usr/include/flycapture directory and moving them there. 

Now all the dependencies are setup, the build can be started (assuming you've done a git clone of javacv, javacpp and javacpp-presets all to the same folder)

    $ cd javacpp
    $ mvn install
    $ cd ..
    $ cd javacpp-presets
    $ ./cppbuild.sh -platform linux-armhf install
    $ mvn install -Djavacpp.platform=linux-armhf -Djavacpp.platform.compiler=arm-linux-gnueabihf-g++
    $ cd platform
    $ mvn install -Djavacpp.platform=linux-armhf

Hopefully that all runs OK, and then in ./javacpp-presets/platform/target/ you should find there are platform specific (opencv-linux-armhf.jar, ffmpeg-linux-armhf.jar, etc) files built.

If you want to try alternative flags, you need to modify in javacpp, ./src/main/resources/org/bytedeco/javacpp/properties/linux-armhf.properties and then in javacpp-presets any project cppbuild.sh file where you want to update too (e.g. ./opencv/cppbuild.sh linux-armhf section). For newer Pis on arm7 it does look like there are potential performance gains in armv7 and neon flags, and using a newer compiler rather than the bcm2708 build used here may further improve things (some earlier builds specific for armv7 did look faster). Also if you are using onboard picam devices, make sure you load the module with "modprobe bcm2835-v4l2 max_video_width=2592 max_video_height=1944" - this way if you test just using OpenCV or FFMPEG grabber you should get at least 30fps as a start point. The more computation you then do on each frame, the more this will drop.


Mac OS X (x86_64)
-----------------
OS X Mavericks (10.9) is the first version of Mac OS X to support C++11 fully and properly, so to preserve your sanity, we do not recommend trying to build or use the JavaCPP Presets on any older versions of Mac OS X.

### Preparations
1. Install [Xcode](https://developer.apple.com/xcode/) and [Homebrew](http://brew.sh/)
2. Ensure the command line tools for Xcode are installed

    ```bash
    $ xcode-select --install
    ```
3. Run the following commands to install the JDK, among other things Apple left out of Xcode:

    ```bash
    $ brew install caskroom/cask/brew-cask
    $ brew cask install cuda java
    $ brew install gcc5 swig bazel cmake libusb maven nasm yasm xz pkg-config
    ```

After which the following commands can be used to start the build inside the `javacpp-presets` directory:
```bash
$ bash cppbuild.sh install
$ mvn clean install
```


Windows (x86 and x86_64)
------------------------
Visual Studio Community 2013 is the first free version to have been decently bundled with support for C++11, OpenMP, the Windows SDK, and everything else from Microsoft, so we recommend installing that version of Visual Studio, which consequently requires Windows 7. Still, to run the bash scripts and compile some things that the Microsoft C/C++ Compiler does not support, we need to install manually a few other things.

### Preparations
1. Install the [Java SE Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/), [Maven](https://maven.apache.org/download.cgi), [MSYS2](https://msys2.github.io/), [Visual Studio Community 2013](https://www.visualstudio.com/en-us/news/vs2013-community-vs.aspx), and [CUDA](https://developer.nvidia.com/cuda-downloads)
2. Under an "MSYS2 Shell", run:

    ```bash
    $ pacman -S base-devel tar patch make git unzip zip nasm yasm pkg-config mingw-w64-x86_64-cmake mingw-w64-x86_64-gcc mingw-w64-i686-gcc mingw-w64-x86_64-gcc-fortran mingw-w64-i686-gcc-fortran mingw-w64-x86_64-libwinpthread-git mingw-w64-i686-libwinpthread-git
    ```

3. From the "Visual Studio Tools" found inside the Start menu, open:
    - "VS2013 x86 Native Tools Command Prompt" and run `c:\msys64\mingw32_shell.bat` inside
    - "VS2013 x64 Native Tools Command Prompt" and run `c:\msys64\mingw64_shell.bat` inside
    - Making sure the `set MSYS2_PATH_TYPE=inherit` line is *not* commented out in either of those batch files.

4. Run the "Prerequisites for all platforms" tasks inside the shell

Afterwards the following commands can be used to start the build inside the `javacpp-presets` directory:
```bash
$ bash cppbuild.sh -platform windows-xxx install
$ mvn clean install -Djavacpp.platform=windows-xxx
```
where `windows-xxx` is either `windows-x86` or `windows-x86_64`. Run the builds for `windows-x86` inside the "MINGW32" window, and the ones for `windows-x86_64` in the "MINGW64" one.


