# Changelog of Fairblue development
## next
## 01042021
* Buttons for translation feature are visible if languages are avaiable
* Parent room sync languages into breakout rooms
## 10032021
* Fix bug when selecting interpreter language in firefox
## 07032021
* Fix bug, where translator is muted if they change translation language
* changed description of interpreter buttons to more pc words
* workaround for bug in safari, now loads in safari
* used channels are now marked more precise
* we fixed the input device id for hark/speech detection
## 21022021
* we disabled some audio preprocessing of the browser, it seems some of this is going nuts when there are multiple streams
* the input device used in the echo test is now made sure to be used as the translator microphone
* made muted state of translator more obvious
* translation channels already used are now shown but inactivated
* Floor/original now is selected from the start
* there is now visual feedback when connecting to a translation channel

## 10012021
* rename origin volume to floor volume
* replace direct setting of floor volume with central floor volume control
* Add standard values for translation configuration
    * floor volume: 0.4
    * speak detection of translator: on
    * speak detection translator threshold: -70db
    * delay till floor get full volume back after a translator ended speaking: 0ms
    * timeout if translator lost connection with active speaking state: 60,000ms
## 01/2021
* added changelog
* made threshold, delay and timeout of speech detection configurable
* improved audio quality, by removing gain nodes and disabling the media tracks directly
* added fairblue version string
* add setting to enable or disable translator speak detection in the HTML 5 client.
* translation feature components use standard localization mechanics from BigBlueButton
