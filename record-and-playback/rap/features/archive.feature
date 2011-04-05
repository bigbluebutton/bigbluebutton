Feature: Archive raw recordings
  As a user
  I want the audio recording to be archived
  So that I can retrieve it later for playback
  
  Scenario: audio archiving success
    Given the meeting has ended
    And the audio has been recorded
    When the audio is archived
    Then I should see the audio files in the archive
    And I should not see the audio files from where it was recorded
    And it should report success
    
    
      