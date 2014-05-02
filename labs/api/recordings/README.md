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

