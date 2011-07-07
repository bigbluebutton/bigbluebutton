Feature: Combine all audio recordings in one audio file
  When I play a recording
  I want the audio to be in sync with other media 

  Scenario: 
    Given a set of audio recordings in the archive
    And the list of events in the recording
    When an audio is processed for playback
    Then all raw audio files should be combined to create one audio file
    And converted from wav to ogg
    
    