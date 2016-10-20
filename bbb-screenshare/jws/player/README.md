# bbb-video-stream-html-client

Some attempts to show a BigBlueButton video stream in an html with a standalone Flash player.

Just open `index.html` and try it!

![Screenshot](https://raw.github.com/daronco/bbb-video-stream-html-client/master/screenshot.png)

## How to

When you open `index.html` and you will see 3 inputs you need to fill:
* The name of your BBB server: use the name or IP only, without `http`, for example: `myserver.somewhere.com` or `192.168.0.1`
* The internal meeting ID used by Red5, that willbe similar to `183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1328884719999`
* The internal video stream ID used by Red5, that will be similar to `320x2401-1328884730777`

The hard part is to find the internal IDs.
You need to either check the logs in your BBB server or include this
information in BBB's API.
In Mconf we included it in the API, see
http://code.google.com/p/mconf/wiki/MconfLiveApiChanges.
The changes are in this branch: https://github.com/mconf/bigbluebutton/tree/audio-video-on-api-2

## Important!

In Flash Player's security model, Flash applications and SWF files on a local computer cannot access the network.
So first you need disable this security option for the files in your local folder.

To do so, go to the [Flash Security Panel](http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html) and add your local folder to the list.
