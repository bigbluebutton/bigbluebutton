Post Scripts
============

_Post scripts_ allow you to manage your media files after each phase of Record and Playback (Archive, Process, Publish).
For more info about record and playback phases see [record and playback documentation](https://code.google.com/p/bigbluebutton/wiki/081RecordAndPlayback "Record and Playback").


You may want to use _post scripts_ to:

* Send you an email *after* a recording is published.
* Make a backup in other server *after* your recording is archived or published.
* Send a text message *after* a recording is published.
* Compress media files and make them public available for download *after* it is archived.

Each _post script_ has access to:
* The directory of the [archived | processed | published] files.
* The meeting ID via the string "meeting_id"
* The metadata sent via the hash "post_metadata". See [how to send metadata](https://code.google.com/p/bigbluebutton/wiki/API#create).


Example
========
You want to receive an email after a recording is published.

1. Open *post_publish.rb* and get the metadata you sent
	email = post_metadata["email"]

2. Send the email using the metadata you retrieved and the meeting ID
	message = "The recording #{meeting_id} has been published"
	send_email(message, email)

3. Create a recorded meeting sending your email as metadata:
	meta_postpublishemail="johndoe@example.com"