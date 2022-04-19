# BBB-Recording-Importer

Imports and parses recording metadata.xml files and stores the data in a Postgresql database


## How to use

1. In bbb-common-web
   - Edit the .env file and set the environment variables
   - Run the hibernate.cfg script to generate the hibernate config file
   - Run "docker-compose up" to start up the docker container containing the Postgresql database
   - Interact with the database using the psql script
2. In bbb-recording-imex
   - Unit tests for parsing and persisting recording metadata can be found in src/test/java/org/bigbluebutton/recording/
   - Edit the "metadataDirectory" variables in the test files to point to where the recording metadata can be found
   - Run the unit tests using the command "mvn test"
   - To use the main program compile it with "mvn package" which will generate two jars in the target directory
   - Run the program with the run.sh script


## Testing the new recording service

1. In bigbluebutton-web
   - Edit the "recordingService" bean in /grails-app/conf/spring/resources.xml to use "org.bigbluebutton.api.service.impl.RecordingServiceDbImpl"
   - Use "org.bigbluebutton.api.service.impl.RecordingServiceFileImpl" if you want to use the traditional file system service
2. In bbb-recording-imex
   - Use the get-recordings.sh script to test the getRecordings endpoint on the recording API
   - Edit the "SALT" variable to have the value of your security salt
   - The script accepts arguments through the use of flags
      - "-i" for the meetingID
      - "-r" for the recordID(s)
      - "-s" for the state(s)
      - "-m" for the metadata 
