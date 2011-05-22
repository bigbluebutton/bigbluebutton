Feature: Process matterhorn recording
  To playback the recording in Matterhorn
  The system should package the recordings that Matterhorn can ingest and process

  Scenario: 
    Given recordings in the archive
    When asked to create playback for Matterhorn
    Then all media files should be converted to formats supported by Matterhorn
    And packaged in a zip file
    And uploaded to Matterhorn for ingestion
    