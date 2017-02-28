This document contains instructions on how to build your own native libraries, screenshare webstart app, and how to deploy screenshare application.


Building your own native libraries
----------------------------------

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

5. Checkout `https://github.com/bigbluebutton/javacpp-presets` and use branch `min-build-1.2-svc2`

6. cd to `javacpp-presets/ffmpeg`

7. If you want to build SVC2 libraries, you copy `cppbuild.sh.svc2` to `cppbuild.sh`

8. After which the following commands inside the `ffmpeg` dir:

```bash
 bash cppbuild.sh -platform linux-xxx install

 mvn clean install -Djavacpp.platform=linux-xxx
```

where `linux-xxx` is either `linux-x86` or `linux-x86_64`.

If things go well, copy the resulting jar into `native-libs/ffmpeg-linux-xxx` and sign the jar.


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

4. Checkout `https://github.com/bigbluebutton/javacpp-presets` and use branch `min-build-1.2-svc2`

5. cd to `javacpp-presets/ffmpeg`

6. If you want to build SVC2 libraries, you copy `cppbuild.sh.svc2` to `cppbuild.sh`

7. After which the following commands inside the `ffmpeg` dir:

```bash
$ bash cppbuild.sh install
$ mvn clean install
```


If things go well, copy the resulting jar into `native-libs/ffmpeg-macosx-x86_64` and sign the jar.


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

5. Checkout `https://github.com/bigbluebutton/javacpp-presets` and use branch `min-build-1.2-svc2`

6. cd to `javacpp-presets/ffmpeg`

7. If you want to build SVC2 libraries, you copy `cppbuild.sh.svc2` to `cppbuild.sh`

8. After which the following commands inside the `ffmpeg` dir:

```bash
$ bash cppbuild.sh -platform windows-xxx install
$ mvn clean install -Djavacpp.platform=windows-xxx
```
where `windows-xxx` is either `windows-x86` or `windows-x86_64`. Run the builds for `windows-x86` inside the "MINGW32" window, and the ones for `windows-x86_64` in the "MINGW64" one.

If things go well, copy the resulting jar into `native-libs/ffmpeg-windows-xxx` and sign the jar.


Signing the jar files
---------------------

To sign the native libraries, cd to the location of the jar. Copy tour cert into the dir and run `sign-jar.sh`. You will be prompted for
your cert file and password of your cert.

Example:

```
 cd ffmpeg-linux-x86/svc2

 Copy your cert into this directory

 ./sign-jar.sh

 You will be prompted for your cert file and password.

```

The resulting signed jar file will be in `bbb-screenshare/apps/jws/lib`

Aside from the native jar files, you will need to sign the `ffmpeg.jar` found in `jws/signed-jars`. Follow the README doc in that directory.


Building screenshare webstart application
-----------------------------------------

1. Go to `jws/webstart` directory. 

2. Copy your cert into the dir.

3. Run `build.sh` and you will be prompted for your cert file and cert password in order to sign the jar file.


Deploying and testing the screenshare application
-------------------------------------------------

1. Go to `app` directory.

2. Edit `src/main/webapp/WEB-INF/screenshare.properties` to point to your server's IP address.

3. Run `deploy.sh` to build the whole application and deploy to your local red5 server.



