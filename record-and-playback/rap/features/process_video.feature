Feature: Sync audio webcam recording for matterhorn
  To sync the playback of audio and video
  The system should make the audio and video the same length padding the gaps in between

  Scenario: 
    Given the raw recorded events
    And the processed recorded audio
    And the raw recorded video
    When processing the audio and video for playback
    Then the audio must be stripped from the raw video 
    And the video must be made the same length as the processed audio
    And the processed audio multiplexed into the video
    