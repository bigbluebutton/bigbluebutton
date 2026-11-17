#!/bin/sh
# Converts /data/file to /data/file.pdf and saves the speaker notes of its
# visible slides to /data/speakernotes/slide-N.txt, in a single LibreOffice run.
set -u

program_dir="$(dirname "$(readlink -f /usr/bin/soffice)")"
pipe_name="bbb-speaker-notes"

"$program_dir/soffice" -env:UserInstallation=file:///tmp/ --headless --invisible --nologo --norestore --nodefault "--accept=pipe,name=$pipe_name;urp;" &
office_pid=$!

"$program_dir/python" /usr/local/lib/bbb-soffice/speaker-notes.py "$pipe_name" /data/file
status=$?
if [ "$status" -ne 0 ]; then
	kill "$office_pid" 2>/dev/null
fi
wait "$office_pid" 2>/dev/null

[ "$status" -eq 0 ] && [ -f /data/file.pdf ]
