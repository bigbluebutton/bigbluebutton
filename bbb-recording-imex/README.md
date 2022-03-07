# BBB-Recording-Importer

Imports and parses recordings metadata.xml files and stores the data in a Postgresql database


## How to use

1. In bbb-common-web
   - Edit the .env file and set the environment variables
   - Run the hibernate.cfg script the generates the hibernate config file
   - Run "docker-compose up" to start up the docker container containing the Postgresql database
   - Interact with the database using the psql script
2. In bbb-recording-importer
   - Unit tests for parsing and persisting recording metadata can be found in src/test/java/org/bigbluebutton/recording/
   - Edit the "metadataDirectory" variables in the test files to point to where the recording metadata can be found
   - Run the unit tests using the command "mvn test"
   - To use the main program compile it with "mvn package" which will generate two jars in the target directory
   - Run the program with the run.sh script
 
