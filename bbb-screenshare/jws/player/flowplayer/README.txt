Version history:

3.2.7
-----

- Loads the new controlbar plugin version 3.2.5. No other functional changes.

3.2.6
-----
- linkUrl should now work better with popup blockers: http://code.google.com/p/flowplayer-core/issues/detail?id=31
- new linkWindow value "_popup" opens the linked page in a popup browser window
- added new onClipResized event
- Added new onUnload event, can be only listened in Flash and not triggered to JS
- API: Added new url property to plugin objects
Fixes:
- it was not possible to call play() in an onFinish listener
- fix to preserve the infoObject for custom netStream and netConnection clients in cases where the infoObject is a
  primitive object without properties
- does not show the error dialog in the debugger player when showErrors: false
- fixed to correctly handle xx.ca subdomains when validating the license key
- a custom logo is now sized correctly according to the configured size
- does not show the buffer animation any more when the player receives the onBufferEmpty message from the netStream.
  The animation was unnecessarily shown in some situations.
- fixed #155. added new urlEncoding property to Clip for url ncoding ut8 urls

3.2.5
-----
- added new scaling option 'crop' that resizes to fill all available space, cropping on top/bottom or left/right
- improvements to RSS file parsing
- Now displays a hand cursor when a linkUrl is used in clips

3.2.4
-----
- new flowplayer.js version, with Apple iDevice fixes

3.2.3
-----
- a new 'type' clip property exposed to JS
- changed the clip type property to better work as a read-write property. Now accepts 'video', 'audio',
  'image' and 'api' as configuration values.
- moved parallel rtmp connection mechanism from the RTMP plugin to Core so other plugins can use it (ie: securestreaming)
Fixes:
- fixed #112, wrong URL computation when using clip with relative URL on a page with a / after a # in its url
- fixed #111, wrong behavior of pre/post roll images with duration 0
- fixed multiple license keys logic
Fixes:
- correct verification of license keys in *.ca domains
- fix to make playback to always reach end of video
- fixed resuming of live streams

3.2.2
-----
Fixes:
- Now recognizes following kind of urls as audio clips: 'mp3:audiostreamname' (ulrs with mp3 prefix and no extension)
- Now ignores the duration from metadata if we already got one. Fix required for pseudostreaming
- Fix to reuse buffered data when replaying a clip

3.2.1
---------
- Support for RTMP redirects (tested with Wowza loadbalancing)
- Fixed video size when no size info available in clip metadata

Fixes:
- Fix to correctly detect if the player SWF name contains a version number and if it does also use the version number
when it automatically loads the controls plugin.

3.2.0
-----
- canvas, controlbar and the content plugin backgound color and border color can be now given with rgb() and rgba() CSS style syntax
- Added onMouseOver() and onMouseOut() listener registration methods to the Flowplayer API
- enhancements to RSS playlist. Converted parsing to E4X, yahoo media and flowplayer namespace support. 
- added feature to obtain bitrate and dimension information to a new clip custom property "bitrates" for future support for bitrate choosing. 
- added getter for playerSwfName config
- if clip.url has the string "mp3:" in it, the clip.type will report 'audio'
- added setKeyboardShortcutsEnabled(), addKeyListener(), removeKeyListener() to FlowplayerBase
Fixes:
- onSeek() was not fired when seeking while paused and when using RTMP. An extra onStart was fired too.
- fireErrorExternal() was not working properly with an error PlayerEvent
- countPlugins() was throwing an error when a plugin was not found
- external swf files were not scaled properly
- the logo was unnecessary shown when going fullscreen if logo.displayTime was being used
- added a loadPluginWithConfig method to FlowplayerBase, accessible from javascript. Fixed double onload callback call.
- now handles cuepoint parameters injected using the Adobe Media Encoder
- showPlugin was not working when config.play was null
- handles 3-part duration values included in FLV metadata, like "500.123.123"
- player wasn't always reaching end of video
- fixed broken buffering: false
- fixed event dispatching when embedding flowplayer without flowplayer.js (=without playlist config field)
- fixed safari crashes when unloading player
- fixed scrubber behaviour with a playlist containing 2 images (or swf) in a row
- fixed errors in logs when using an RSS playlist
- fixed OverlayPlayButton that was showing even if it shouldn't on some cases
- fixed wrong behavior when onBeforeFinish was returning false within playlists
- /!\ Don't use the fadeIn / fadeOut controlbar's API while using autoHide.
- fixed play state button with images
- fixed splash image flickering

3.1.5
-----
Fixes:
- The player went to a locked state when resuming playback after a period that was long enought to send the
netConnection to an invalid state. Now when resuming playback on an invalid connection the clip starts again from
the beginning. This is only when using RTMP connections and does not affect progressive download playback.
- Custom netConnect and netStream events did not pass the info object to JS listeners

3.1.4
-----
Fixes:
- player did not initialize if the controlbar plugin was disabled and if the play button overlay was disabled with play: null
- works properly without cachebusting on IE
- RSS playlist parsing now respects the isDefault attribute used in mRSS media group items
- Fixed passing of connection arguments

3.1.3
-----
- enhancements to RSS playlist parsing: Now skips all media:content that have unsupported types. Now the type attribute
of the media:content element is mandatory and has to be present in the RSS file
- Possibility to pass a RSS file name with playFeed("playlist.rss") and setPlaylist("playlist.rss") calls.
- changes to the ConnectionProvider and URLResolver APIs
- Now automatically uses a plugin that is called 'rtmp' for all clips that have the rtmp-protocol in their URLs.
- Added possibility to specify all clip properties in an RSS playlist

Fixes:
- the result of URL resolvers in now cached, and the resolvers will not be used again when a clip is replayed
- some style properties like 'backgroundGradient' had no effect in config
- video goes tiny on Firefox: http://flowplayer.org/forum/8/23226
- RSS playlists: The 'type' attribute value 'audio/mp3' in the media:content element caused an error.
- Dispatches onMetadata() if an URL resolver changes the clip URL (changes to a different file)
- error codes and error message were not properly passed to onEvent JS listeners

3.1.2
-----
- The domain of the logo url must the same domain from where the player SWF is loaded from.
- Fullscreen can be toggled by doublclick on the video area.
Fixes:
- Player was not initialized correctly when instream playlists were used and the provider used in the instream clips was defined in the common clip.
- A separator in the Context Menu made the callbacks in the following menu items out of order. Related forum post: http://flowplayer.org/forum/8/22541
- the width and height settings of a logo were ignored if the logo was a sWF file
- volume control and mute/unmute were not working after an instream clip had been played
- now possible to use RTMP for mp3 files
- Issue 12: cuepointMultiplier was undefined in the clip object set to JS event listeners
- Issue 14: onBeforeStop was unnecessarily fired when calling setPlaylist() and the player was not playing,
            additionally onStop was never fired even if onBeforeStop was
- fixed screen vertical placement problems that reappeared with 3.1.1
- The rotating animation now has the same size and position as it has after initialized

3.1.1
-----
- External configuration files
- Instream playback
- Added toggleFullscreen() the API
- Possibility to specify controls configuration in clips
- Seek target position is now sent in the onBeforeSeek event
Fixes:
- The screen size was initially too small on Firefox (Mac)
- Did not persist a zero volume value: http://www.flowplayer.org/forum/8/18413

3.1.0
-----
New features:
- clip's can have urlResolvers and connectionProviders
- Added new configuration options 'connectionCallbacks' and 'streamCallbacks'. Both accept an Array of event names as a value.
  When these events get fired on the connection or stream object, corresponding Clip events will be fired by the player.
  This can be used for example when firing custom events from RTMP server apps
- Added new clip event types: 'onConnectionEvent' and 'onStreamEvent' these get fired when the predefined events happen on the connection and stream objects.
- Added Security.allowDomain() to allow loaded plugins to script the player
- Added addClip(clip, index) to the API, index is optional
- Possibility to view videos without metadata, using clip.metaData: false
- Now the player's preloader uses the rotating animation instead of a percent text to indicate the progress
  of loading the player SWF. You can disable the aninamtion by setting buffering: false
- calling close() now does not send the onStop event
- Clip's custom properties are now present in the root of the clip argument in all clip events that are sent to JS.

Bug fixes:
- The preloader sometimes failed to initialize the player
- Allow seeking while in buffering state: http://flowplayer.org/forum/8/16505
- Replay of a RTMP stream was failing after the connection had expired
- Security error when clicking on the screen if there is an image in the playlist loaded from a foreign domain
- loadPlugin() was not working
- now fullscreen works with Flash versions older than 9.0.115, in versions that do not support hardware scaling
- replaying a RTMP stream with an image in front of the stream in the playlist was not working (video stayed hidden). Happened
  because the server does not send metadata if replaying the same stream.
- the scrubber is disabled if the clip is not seekable in the first frame: http://flowplayer.org/forum/8/16526
  By default if the clip has one of following extensions (the typical flash video extensions) it is seekable
  in the first frame: 'f4b', 'f4p', 'f4v', 'flv'. Added new clip property seekableOnBegin that can be used to override the default.  

3.0.6
-----
- added possibility to associate a linkUrl and linkWindow to the canvas
Fixes:
- fix for entering fullscreen for Flash versions that don't support the hardware scaled fullscreen-mode
- when showing images the duration tracking starts only after the image has been completely loaded: http://flowplayer.org/forum/2/15301
- fix for verifying license keys for domains that have more than 4 labels in them
- if plugin loading failis because of a IO error, the plugin will be discarded and the player initialization continues:

3.0.4
-----
- The "play" pseudo-plugin now supports fadeIn(), fadeOut(), showPlugin(), hidePlugin() and
  additionally you can configure it like this:
  // make only the play button invisible (buffering animation is still used)
  play: { display: 'none' }
  // disable the play button and the buffering animation
  play: null
  // disable the buffering animation
  buffering: null 
- Added possibility to seek when in the buffering state: http://flowplayer.org/forum/3/13896
- Added copyright notices and other GPL required entries to the user interface

Fixes:
- clip urls were not resolved correctly if the HTML page URL had a query string starting with a question mark (http://flowplayer.org/forum/8/14016#post-14016)
- Fixed context menu for with IE (commercial version)
- a cuepoint at time zero was fired several times
- screen is now arranged correctly even when only bottom or top is defined for it in the configuration
- Fixed context menu for with IE (commercial version)
- a cuepoint at time zero was fired several times
- screen is now arranged correctly even when only bottom or top is defined for it in the configuration
- Now possible to call play() in an onError handler: http://flowplayer.org/forum/8/12939
- Does not throw an error if the player cannot persist the volume on the client computer: http://flowplayer.org/forum/8/13286#post-13495
- Triggering fullscreen does not pause the player in IE
- The play button overlay no longer has a gap between it's pieces when a label is used: http://flowplayer.org/forum/8/14250
- clip.update() JS call now resets the duration
- a label configured for the play button overlay did not work in the commercial version

3.0.3
-----
- fixed cuepoint firing: Does not skip cuepoints any more
- Plugins can now be loaded from a different domain to the flowplayer.swf
- Specifying a clip to play by just using the 'clip' node in the configuration was not working, a playlist definition was required. This is now fixed.
- Fixed: A playlist with different providers caused the onMetadata event to fire events with metadata from the previous clip in the playlist. Occurred when moving in the playlist with next() and prev()
- the opacity setting now works with the logo
- fadeOut() call to the "screen" plugin was sending the listenerId and pluginName arguments in wrong order
- stop(), pause(), resume(), close() no longer return the flowplayer object to JS
- changing the size of the screen in a onFullscreen listener now always works, there was a bug that caused this to fail occasionally
- fixed using arbitrary SWFs as plugins
- the API method setPlaylist() no longer starts playing if autoPlay: true, neither it starts buffering if autoBuffering: true
- the API method play() now accepts an array of clip objects as an argument, the playlist is replaced with the specified clips and playback starts from the 1st clip

3.0.2
-----
- setting play: null now works again
- pressing the play again button overlay does not open a linkUrl associated with a clip
- now displays a live feed even when the RTMP server does not send any metadata and the onStart method is not therefore dispatched
- added onMetaData clip event
- fixed 'orig' scaling: the player went to 'fit' scaling after coming back from fullscreen. This is now fixed and the original dimensions are preserved in non-fullscreen mode.
- cuepoint times are now given in milliseconds, the firing precision is 100 ms. All cuepoint times are rounded to the nearest 100 ms value (for example 1120 rounds to 1100) 
- backgroundGradient was drawn over the background image in the canvas and in the content and controlbar plugins. Now it's drawn below the image.
- added cuepointMultiplier property to clips. This can be used to multiply the time values read from cuepoint metadata embedded into video files.
- the player's framerate was increased to 24 FPS, makes all animations smoother

3.0.1
-----
- Fixed negative cuepoints from common clip. Now these are properly propagated to the clips in playlist.
- buffering animation is now the same size as the play button overlay
- commercial version now supports license keys that allows the use of subdomains
- error messages are now automatically hidden after a 4 second delay. They are also hidden when a new clips
  starts playing (when onBeforeBegin is fired)
- added possibility to disable the buffering animation like so: buffering: false
- pressing the play button overlay does not open a linkUrl associated with a clip
- license key verification failed if a port number was used in the URL (like in this url: http://mydomain.com:8080/video.html)
- added audio support, clip has a new "image" property
- workaround for missing "NetStream.Play.Start" notfication that was happending with Red5. Because of this issue the video was not shown.
- commercial version has the possibility to change the zIndex of the logo

3.0.0
-----
- Removed security errors that happened when loading images from foreign domains (domains other than the domain of the core SWF).
  Using a backgroundImage on canvas, in the content plugin, and for the controls is also possible to be loaded
  from a foreign domain - BUT backgroundRepeat cannot be used for foreign images.
- Now allows the embedding HTML to script the player even if the player is loaded from another domain.
- Added a 'live' property to Clips, used for live streams.
- A player embedded to a foreign domain now loads images, css files and other resources from the domain where the palyer SWF was loaded from. This is to generate shorter embed-codes.
- Added linkUrl and linkWindow properties to the logo, in commercial version you can set these to point to a linked page. The linked page gets opened
  when the logo is clicked.  Possible values for linkWindow:
    * "_self" specifies the current frame in the current window.
    * "_blank" specifies a new window.
    * "_parent" specifies the parent of the current frame.
    * "_top" specifies the top-level frame in the current window.
- Added linkUrl and linkWindow properties to clips. The linked page is opened when the video are is clicked and the corresponding clip has a linkUrl specified.
- Made the play button overlay and the "Play again" button slightly bigger.

RC4
---
- Now shows a "Play again" button at the end of the video/playlist
- Commercial version shows a Flowplayer logo if invalidKey was supplied, but the otherwise the player works
- setting play: null in configuration will disable the play button overlay
- setting opacity for "play" also sets it for the buffering animation
- Fixed firing of cuepoints too early. Cuepoint firing is now based on stream time and does not rely on timers
- added onXMPData event listener
- Should not stop playback too early before the clip is really completed
- The START event is now delayed so that the metadata is available when the event is fired, METADATA event was removed,
  new event BEGIN that is dispatched when the playback has been successfully started. Metadata is not normally
  available when BEGIN is fired. 

RC3
---
- stopBuffering() now dispatches the onStop event first if the player is playing/paused/buffering at the time of calling it
- fixed detection of images based on file extensions
- fixed some issues with having images in the playlist
- made it possible to autoBuffer next video while showing an image (image without a duration)

RC2
---
- fixed: setting the screen height in configuration did not have any effect

RC1
-----
- better error message if plugin loading fails, shows the URL used
- validates our redesigned multidomain license key correctly
- fix to prevent the play button going visible when the onBufferEmpty event occurs
- the commercial swf now correctly loads the controls using version information
- fixed: the play button overlay became invisible with long fadeOutSpeeds

beta6
-----
- removed the onFirstFramePause event
- playing a clip for the second time caused a doubled sound
- pausing on first frame did not work on some FLV files

beta5
-----
- logo only uses percentage scaling if it's a SWF file (there is ".swf" in it's url)
- context menu now correctly builds up from string entries in configuration
-always closes the previous connection before starting a new clip

beta4
-----
- now it's possible to load a plugin into the panel without specifying any position/dimensions
 information, the plugin is placed to left: "50%", top: "50%" and using the plugin DisplayObject's width & height
- The Flowplayer API was not fully initialized when onLoad was invoked on Flash plugins

beta3
-----
- tweaking logo placement
- "play" did not show up after repeated pause/resume
- player now loads the latest controls SWF version, right now the latest SWF is called 'flowplayer.controls-3.0.0-beta2.swf'

beta2
-----
- fixed support for RTMP stream groups
- changed to loop through available fonts in order to find a suitable font also in IE
- Preloader was broken on IE: When the player SWf was in browser's cache it did not initialize properly
- Context menu now correctly handles menu items that are configured by their string labels only (not using json objects)
- fixed custom logo positioning (was moved to the left edge of screen in fullscreen)
- "play" now always follows the position and size of the screen
- video was stretched below the controls in fullscreen when autoHide: 'never'
- logo now takes 6.5% of the screen height, width is scaled so that the aspect ratio is preserved

beta1
-----
- First public beta release
