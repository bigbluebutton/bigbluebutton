#!/bin/sh
# Converts /data/file to /data/file.pdf and saves the speaker notes of its
# visible slides to /data/speakernotes/slide-N.txt, in a single LibreOffice run.
#
# Runs inside the LibreOffice container, where convert-local.sh mounts this
# directory read-only at /opt/bbb-speaker-notes/.
#
# Usage: convert-with-speaker-notes.sh <notes deadline in seconds>
# Reading the notes stops at the deadline; the PDF is kept and the notes dropped.
set -u

notes_deadline="$1"

program_dir="$(dirname "$(readlink -f /usr/bin/soffice)")"
pipe_name="bbb-speaker-notes"

"$program_dir/soffice" -env:UserInstallation=file:///tmp/ --headless --invisible --nologo --norestore --nodefault "--accept=pipe,name=$pipe_name;urp;" &
office_pid=$!

"$program_dir/python" /opt/bbb-speaker-notes/speaker-notes.py "$pipe_name" /data/file "$notes_deadline"
status=$?
if [ "$status" -ne 0 ]; then
	kill "$office_pid" 2>/dev/null
fi
wait "$office_pid" 2>/dev/null

[ "$status" -eq 0 ] && [ -f /data/file.pdf ]
