# Fixture recordings

Recordings for the getRecordings, publishRecordings, deleteRecordings,
updateRecordings and text-track cases, laid out like `/var/bigbluebutton`.
`make-tree.sh` writes them; run it again after changing it, and commit
what it writes. The tap (`bbb-conform tap --recordings`) installs them
into the server's data directory when it starts, and puts them back for
`restore` steps (the main README, "Fixture recordings").

Each metadata.xml follows what record-and-playback 4.0 writes (see
`make-tree.sh`). A record ID is `sha1(meeting ID)-<start time>`, so
getRecordings finds a recording by its meeting's ID.

| Meeting ID | Record ID | State, formats | For |
|---|---|---|---|
| `conform-rec-a` | `e633b943…-1700000000000` (A1) | published: presentation, video | everything a recording can have: preview images, `<data>`, two formats, caption tracks (en, fr-CA); blue, large |
| `conform-rec-a` | `e633b943…-1700003600000` (A2) | unpublished: presentation | a second session of one meeting; green |
| `conform-rec-b` | `e449065b…-1700007200000` (B1) | published: presentation | meta wildcards (`conform-tag` alpha-beta-gamma); a captions directory without captions.json |
| `conform-rec-c` | `eb226ead…-1700010800000` | deleted: presentation | the deleted state |
| `conform-rec-d` | `dbebceff…-1700014400000` | processed (`recording/process`) | processing and processed |
| `conform-rec-parent` | `18e5f907…-1700018000000` | published: presentation | a parent with two breakout rooms |
| Room 1, Room 2 | `aaf64661…-1700018011301`, `e628f5f9…-1700018011301` | published: presentation | breakout rooms |
| `conform-rec-mut-unpub` | `db0c52cb…-1700021600000` | unpublished: presentation, video | publishing and deleting |
| `conform-rec-mut-pub` | `4d64ff98…-1700025200000` | published: presentation, video | unpublishing and deleting |
| `conform-rec-mut-meta` | `13ed80f2…-1700028800000` | published: presentation | updateRecordings; blue, large |
| `conform-rec-mut-captions` | `52388302…-1700032400000` | published: presentation | putRecordingTextTrack |

The last four are changed by the cases that use them: each such case
restores them before and after it runs, and is tagged `serial`. No other
case may change a recording. A case that adds a recording here changes
what getRecordings with no filter lists (`getRecordings.all.*`).

Nothing here is real: the names, IDs, host (`recordings.test`, which no
server is reached at) and caption text were made up for the suite.
