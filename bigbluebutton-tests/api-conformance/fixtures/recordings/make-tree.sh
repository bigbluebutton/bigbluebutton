#!/bin/sh
# Writes the fixture recordings next to this script: a tree laid out like
# /var/bigbluebutton, which the tap (bbb-conform tap --recordings) installs
# into the server's data directory when it starts and puts back on request.
# See README.md here for what each recording is for.
#
# The metadata.xml files follow what record-and-playback 4.0 wrote for a
# meeting with breakout rooms, recorded headless on a full install: the
# presentation format's playback element, the breakout element of a room
# and of a parent, and a processed recording's empty playback element.
# Nothing in this tree writes the video format's playback element or
# <data> the same way, so those follow bbb-web's parser (Recording.scala).
#
# Record IDs are sha1(external meeting ID)-<start time>, as on a server, so
# getRecordings finds a recording by its meeting's ID.
set -eu

# sha1 runs in command substitutions, where a missing sha1sum would leave
# an empty hash rather than stop the script.
command -v sha1sum >/dev/null || {
	echo "make-tree.sh: needs sha1sum" >&2
	exit 1
}

here=$(cd "$(dirname "$0")" && pwd)
host=https://localhost:8443

sha1() {
	printf %s "$1" | sha1sum | cut -c1-40
}

rm -rf "$here/published" "$here/unpublished" "$here/deleted" "$here/recording" "$here/captions"

# The recording being written: set these, then call write.
id='' ext='' name='' state='' start='' end='' participants='' meta='' breakout='' rooms='' raw_size='' data=''

# preview IMAGES...: the presentation format's extensions element, with
# a thumbnail per alt text.
preview() {
	printf '    <extensions>\n      <preview>\n        <images>\n'
	n=1
	for alt in "$@"; do
		printf '          <image width="176" height="136" alt="%s">%s/presentation/%s/presentation/%s/thumbnails/thumb-%d.png</image>\n' \
			"$alt" "$host" "$id" "$(sha1 "$id-slides")-$start" "$n"
		n=$((n + 1))
	done
	printf '        </images>\n      </preview>\n    </extensions>\n'
}

# write DIR FORMAT DURATION SIZE [EXTENSIONS]: DIR/metadata.xml for a
# recording with a playback format.
write() {
	dir=$here/$1/$2/$id
	mkdir -p "$dir"
	case $2 in
		presentation) link=$host/playback/presentation/2.3/$id processing=6980 ;;
		*) link=$host/playback/$2/$id/ processing=51320 ;;
	esac
	{
		printf '<?xml version="1.0"?>\n<recording>\n'
		printf '  <id>%s</id>\n  <state>%s</state>\n  <published>%s</published>\n' "$id" "$state" "$([ "$state" = published ] && echo true || echo false)"
		printf '  <start_time>%s</start_time>\n  <end_time>%s</end_time>\n  <participants>%s</participants>\n' "$start" "$end" "$participants"
		printf '  <meeting id="%s" externalId="%s" name="%s" breakout="%s"/>\n' "$id" "$ext" "$name" "$([ -n "$breakout" ] && echo true || echo false)"
		if [ -n "$breakout" ]; then printf '  %s\n' "$breakout"; else printf '  <breakout/>\n'; fi
		if [ -n "$rooms" ]; then
			printf '  <breakoutRooms>\n'
			for r in $rooms; do printf '    <breakoutRoom>%s</breakoutRoom>\n' "$r"; done
			printf '  </breakoutRooms>\n'
		else
			printf '  <breakoutRooms/>\n'
		fi
		printf '  <meta>\n%s  </meta>\n' "$meta"
		printf '  <playback>\n    <format>%s</format>\n    <link>%s</link>\n' "$2" "$link"
		printf '    <processing_time>%s</processing_time>\n    <duration>%s</duration>\n' "$processing" "$3"
		if [ $# -gt 4 ]; then printf '%s\n' "$5"; fi
		printf '    <size>%s</size>\n  </playback>\n  <raw_size>%s</raw_size>\n' "$4" "$raw_size"
		if [ -n "$data" ]; then printf '  %s\n' "$data"; fi
		printf '</recording>\n'
	} >"$dir/metadata.xml"
}

# meta EXT NAME BREAKOUT [KEY VALUE]...: the meta element's children, as
# bbb-web writes them: its own keys and the create call's meta_ params,
# whose names it lower-cases.
meta() {
	m_ext=$1 m_name=$2 m_breakout=$3
	shift 3
	meta=
	while [ $# -ge 2 ]; do
		meta="$meta    <$1>$2</$1>
"
		shift 2
	done
	meta="$meta    <isBreakout>$m_breakout</isBreakout>
    <meetingId>$m_ext</meetingId>
    <meetingName>$m_name</meetingName>
"
}

# A: two sessions of one meeting. A1, published in two formats, has
# everything a recording can have; A2 is unpublished.
ext=conform-rec-a name="Conform Recordings A"
id=$(sha1 "$ext")-1700000000000 start=1700000000000 end=1700001800000 participants=3 raw_size=839551
state=published breakout='' rooms=''
meta "$ext" "$name" false conform-color blue conform-size large
data="<data><format>conform-data</format><link>$host/conform-data/$id</link></data>"
write published presentation 1795000 1087707 "$(preview 'Welcome To BigBlueButton' 'This slide left blank for whiteboard' 'Second slide')"
data=''
write published video 1795000 23488102
a1=$id
id=$(sha1 "$ext")-1700003600000 start=1700003600000 end=1700004200000 participants=2 raw_size=412204
state=unpublished
meta "$ext" "$name" false conform-color green
write unpublished presentation 595000 500113

# B: published, with a value for the meta wildcard filters.
ext=conform-rec-b name="Conform Recordings B"
id=$(sha1 "$ext")-1700007200000 start=1700007200000 end=1700007325000 participants=1 raw_size=102400
state=published
meta "$ext" "$name" false conform-color red conform-tag alpha-beta-gamma
write published presentation 120000 245760
b1=$id

# C: deleted.
ext=conform-rec-c name="Conform Recordings C"
id=$(sha1 "$ext")-1700010800000 start=1700010800000 end=1700010900000 participants=1 raw_size=102400
state=deleted
meta "$ext" "$name" false conform-color red
write deleted presentation 95000 204800

# D: processed, not yet published: what record-and-playback leaves in
# recording/process, with an empty playback element and no sizes.
ext=conform-rec-d name="Conform Recordings D"
id=$(sha1 "$ext")-1700014400000 start=1700014400000 end=1700014460000
meta "$ext" "$name" false conform-color red
mkdir -p "$here/recording/process/presentation/$id"
cat >"$here/recording/process/presentation/$id/metadata.xml" <<EOF
<recording>
  <id>$id</id>
  <state>processed</state>
  <published>false</published>
  <start_time>$start</start_time>
  <end_time>$end</end_time>
  <participants>1</participants>
  <playback/>
  <meeting id="$id" externalId="$ext" name="$name" breakout="false"/>
  <breakout/>
  <breakoutRooms/>
  <meta>
$meta  </meta>
</recording>
EOF

# A parent meeting and its two breakout rooms, all published. A room's
# external ID is another sha1 and the room's start time.
parent_ext=conform-rec-parent parent_name="Conform Recordings Parent"
parent=$(sha1 "$parent_ext")-1700018000000
room_start=1700018011301
room_ids=
for seq in 1 2; do
	ext=$(sha1 "$parent_ext-room-$seq")-$room_start name="Room $seq"
	id=$(sha1 "$ext")-$room_start start=$room_start end=1700018300000 participants=1 raw_size=839652
	state=published rooms=
	free=true
	if [ $seq = 2 ]; then free=false; fi
	breakout="<breakout captureNotes=\"false\" captureSlides=\"false\" freeJoin=\"$free\" meetingId=\"$ext\" parentMeetingId=\"$parent\" sequence=\"$seq\"/>"
	meta "$ext" "$name" true conform-color blue
	write published presentation 288000 1067051 "$(preview 'Welcome To BigBlueButton')"
	room_ids="$room_ids $id"
done
ext=$parent_ext name=$parent_name
id=$parent start=1700018000000 end=1700018400000 participants=3 raw_size=839551
state=published breakout='' rooms=$room_ids
meta "$ext" "$name" false conform-color blue
write published presentation 399000 1087707
rooms=

# Recordings that publish, unpublish, delete and update cases change.
# Each case puts back the ones it uses before and after it runs.
ext=conform-rec-mut-unpub name="Conform Recordings Unpublished"
id=$(sha1 "$ext")-1700021600000 start=1700021600000 end=1700021700000 participants=1 raw_size=102400
state=unpublished
meta "$ext" "$name" false conform-color red
write unpublished presentation 95000 204800
write unpublished video 95000 3145728

ext=conform-rec-mut-pub name="Conform Recordings Published"
id=$(sha1 "$ext")-1700025200000 start=1700025200000 end=1700025300000 participants=1 raw_size=102400
state=published
meta "$ext" "$name" false conform-color red
write published presentation 95000 204800
write published video 95000 3145728

ext=conform-rec-mut-meta name="Conform Recordings Meta"
id=$(sha1 "$ext")-1700028800000 start=1700028800000 end=1700028900000 participants=1 raw_size=102400
state=published
meta "$ext" "$name" false conform-color blue conform-size large
write published presentation 95000 204800

ext=conform-rec-mut-captions name="Conform Recordings Captions"
id=$(sha1 "$ext")-1700032400000 start=1700032400000 end=1700032500000 participants=1 raw_size=102400
state=published
meta "$ext" "$name" false conform-color red
write published presentation 95000 204800
mc=$id

# Caption tracks: A1 has two; B has the directory but no captions.json;
# the captions recording has one, which an upload adds to.
mkdir -p "$here/captions/$a1" "$here/captions/$b1" "$here/captions/$mc"
printf '%s\n' '[{"kind":"subtitles","label":"English","lang":"en","source":"upload"},{"kind":"captions","label":"Français (Canada)","lang":"fr-CA","source":"live"}]' >"$here/captions/$a1/captions.json"
printf 'WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nWelcome to the recording.\n' >"$here/captions/$a1/subtitles_en.vtt"
printf 'WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nBienvenue dans l'\''enregistrement.\n' >"$here/captions/$a1/captions_fr-CA.vtt"
printf '%s\n' 'This recording has a captions directory but no captions.json.' >"$here/captions/$b1/README"
printf '%s\n' '[{"kind":"subtitles","label":"English","lang":"en","source":"upload"}]' >"$here/captions/$mc/captions.json"
printf 'WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nBefore the upload.\n' >"$here/captions/$mc/subtitles_en.vtt"
