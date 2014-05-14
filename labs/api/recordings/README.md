recordingsWatcher
=============
This app is used to watch the file tree for recording files changes
in the directories
/var/bigbluebutton/published
and
/var/bigbluebutton/unpublished


For each recording modified, we push into Redis:
key = bbb:recordings:<meetingID>
value = a set of JSON strings
{"format": "<format>", "timestamp": "<timestamp>"}


For example:

bbb:recordings:fbdbde6fd7b6499723a101c4c962f03843b4879c
[{"format": "presentation", "timestamp": "1396623833035"}, {"format": "capture", "timestamp": "1396623833045"}]


Instructions:
=============
from Terminal:
$ coffee index.coffee

in another Terminal:
$ curl localhost:4000/recordings?meetingid=fbdbde6fd7b6499723a101c4c962f03843b48
returns an array of stringified json recordings (see above for the structure of the JSON)

if there are no recordings for the given meetingID, the message 
"No recordings for meetingid=some_random_string" appears


Running Tests
=============
while the application is running // $ coffee index.coffee
open another console and enter:
$ cake test

or
$ ./node_modules/.bin/mocha --require coffee-script/register --compilers coffee:coffee-script/register --require should --colors --ignore-leaks --timeout 15000 --reporter spec test/routetests.coffee
(where test/routetests.coffee is the collecion of tests you want to execute)