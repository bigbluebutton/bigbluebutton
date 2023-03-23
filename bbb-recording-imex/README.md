# BBB-Recording-Importer

Imports and parses recording metadata.xml files and stores the data in a Postgresql database


## How to use

0. Ensure the required software is installed
  - Install `docker` (if you're using `docker-dev` development environment for BBB this is already installed)
    - You would either need to add your user to the docker group or you might have to prepend your docker-compose command with `sudo `
   ```
   sudo usermod -aG docker `whoami`
   sudo reboot
   ```
  - Install `docker compose` - a sample set of steps are listed below but could likely be installed in a different way too:
    - `sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`
    - `sudo chmod +x /usr/local/bin/docker-compose`
    - `docker-compose --version`
   - Note that you do _not_ need to install Postgres DB on your own

1. In bbb-common-web
   - `cd bbb-common-web`
   - Edit the `./.env` file and set the environment variables (the default values should work fine)
   - Run the `./hibernate.cfg.sh` script to generate the hibernate config file
   - Run `docker-compose up` to start up the docker container containing the Postgresql database
   - Interact with the database using the psql script
2. In bbb-recording-imex
   - Unit tests for parsing and persisting recording metadata can be found in src/test/java/org/bigbluebutton/recording/
   - Edit the `metadataDirectory` variables in the test files to point to where the recording metadata can be found. The default value "metadata" refers to `./src/metadata` and should work too.
   - Run the unit tests using the command `mvn test`
   - Use the `deploy.sh` script to compile the program
   - Run the program with the recording-imex.sh script found in ~/usr/local/bin
   - Use the --help option to see the usage
   
   Usage: {-e|-i <persist>} [-s <id>] [PATH]
   Import/export recording(s) to/from PATH. The default PATH is
   /var/bigbluebutton/published/presentation
   -e                  export recording(s)
   -i <persist>        import recording(s) and indicate if they should be persisted [true|false]
   -s <id>             ID of single recording to be imported/exported


   Examples
   
   ~/usr/local/bin/recording-imex.sh -i true -s random-7739095 /var/bigbluebutton/published/presentation/1abbc41a2f2faf1d754dbd130fba9ae072c6e742-1652301432519/metadata.xml

   ~/usr/local/bin/recording-imex.sh -i true /var/bigbluebutton/published/presentation/


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
