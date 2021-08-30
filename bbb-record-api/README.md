# BBB Record API

## Creating the Database

Install MySQL and run the create.sql script found in the databse directory.

## Importing the Recordings

Run the RecordingsApp application found in the util directory. This application will read and parse all the metadata.xml files and store the information the created database.

## Running the API

Run the ApiApplication to start Spring. The API will start on port 8080 with a context path of '2.0'.
