Feature: Archive raw audio recordings
  As a presenter
  I want the audio recording to be archived
  So that others can retrieve it later for playback
  
  Scenario: audio archiving success
    Given the meeting has ended
    When the audio has been recorded
    Then copy over the raw recordings to the archive
