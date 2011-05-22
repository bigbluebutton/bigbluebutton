Feature: Archive raw recordings
  As a presenter
  I want the raw recording to be archived
  So that others can retrieve it later for playback
  
  Scenario: archiving success
    Given the meeting has ended
    When the meeting has been recorded
    Then store the recorded events to the archive
    And store the raw audio recording to the archive
    And store the uploaded presentations to the archive
    And store the raw webcam recordings to the archive
    And store the raw deskshare recordings to the archive
    