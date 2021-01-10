# Changelog of Fairblue development
## Next
* rename origne volume to floor volume
* replace direct setting of floor volume with central floor volume control
* Add standart values for translation configuration
  * floor volume: 0.4
  * speak detection of translator: on
  * speal detection translator threshold: -70db
  * delay till floor get full volume back after translator ended speaking: 0ms
  * timeout if translator lost connection with aktive speaking state: 60,000ms
## 01/2021
* added changelog
* made threshold, delay and timeout of speech detection configurable   
* improved audio quality, by removing gain nodes and disabling the media tracks directly
* added fairblue version string
* add setting to enable or disable translator speak detection in the HTML 5 client.
* translation feature components use standard localization mechanics from BigBlueButton
