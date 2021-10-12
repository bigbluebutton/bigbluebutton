BigBlueButton
=============
BigBlueButton is an open source web conferencing system.  

BigBlueButton supports real-time sharing of audio, video, slides (with whiteboard controls), chat, and the screen.  Instructors can engage remote students with polling, emojis, multi-user whiteboard, and breakout rooms.  

Presenters can record and playback content for later sharing with others.

We designed BigBlueButton for online learning (though it can be used for many [other applications](http://www.c4isrnet.com/story/military-tech/disa/2015/02/11/disa-to-save-12m-defense-collaboration-services/23238997/)).  The educational use cases for BigBlueButton are

  * Online tutoring (one-to-one)
  * Flipped classrooms (recording content ahead of your session)
  * Group collaboration (many-to-many)
  * Online classes (one-to-many)

You can install on a Ubuntu 18.04 64-bit server.  We provide [bbb-install.sh](https://github.com/bigbluebutton/bbb-install) to let you have a server up and running within 30 minutes (or your money back 😉).

For full technical documentation BigBlueButton -- including architecture, features, API, and GreenLight (the default front-end) -- see [https://docs.bigbluebutton.org/](https://docs.bigbluebutton.org/).

BigBlueButton and the BigBlueButton Logo are trademarks of [BigBlueButton Inc](https://bigbluebutton.org) .


Translation Feature Settings
============================

When using the translation feature, the system will periodically check if the interpreter is speaking (determined by the setting 'speech detection threshold') and then lower the volume of the original voice channel ('original volume') to make the interpreter more audible.

### Speech detection threshold

Speech input volume at which the system will detect that the interpreter is speaking. Change this setting from -100 (most sensitive / always on) to 0 (least sensitive / disabled). 

### Original Volume

The volume to which the original voice channel is attenuated to whenever an interpreter is speaking. Lower numbers mean lower volume. This is saved per-session for each channel separately.

Working with a custom HTML 5 client
==========================================================

After installing BBB 2.3 using [this tutorial](https://docs.bigbluebutton.org/2.3/install.html),
follow these steps to set a development environment:

* Install meteor.js: ```curl https://install.meteor.com/ | sh```
* Clone the [fairblue repository](https://git.fairkom.net/chat/fairblue.git):
    ```git clone https://git.fairkom.net/chat/fairblue.git```  

* Navigate to the fairblue directory that was created
* Checkout the desired branch (e.g. feature/translation-2.3.x when working on the translation feature):
  
    ```git checkout feature/translation-2.3.x```
* navigate to ```<fairblue>/bigbluebutton-html5```
* set meteor version to 1.10.2

    ```meteor update --allow-superuser --release 1.10.2```

* get the web socket url from the BBB installation and insert it into the config

    * ```grep "wsUrl" /usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml```
    * open ```<fairblue>/bigbluebutton-html5/private/config/settings.yml```
    * set the "wsUrl" value to the url that was retrieved before

* ```meteor npm install```


* Now you can set up a development environment by running the html5 client using ```npm start```. [Screen](https://www.gnu.org/software/screen/) can be used to keep the session open when the shell is closed.
  

* or build a bundle which can be run as a service:
    * Build the html5 client bundle
    ```METEOR_ALLOW_SUPERUSER=1 meteor build --server-only /some/dir```
      This will create a tar archive of the built client in /some/dir

    * if you have not removed the built-in client service, according to [this page](https://docs.bigbluebutton.org/2.3/dev.html#developing-the-html5-client), stop the service:
    ```sudo systemctl stop bbb-html5```

    * unpack the bundle
    ```sudo tar -xzvf /some/dir/<bundle>.tar.gz -C /usr/share/meteor```

    * and Start the html5 client
    ```sudo systemctl start bbb-html5```


