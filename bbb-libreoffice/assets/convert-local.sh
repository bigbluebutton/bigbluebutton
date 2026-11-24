#!/bin/bash
set -e
set -u
PATH="/bin/:/usr/bin/"
# Seconds since the script started; bbb-web kills it when the timeout (param 4) runs out
SECONDS=0

# Conversion of office files to Pdf using local docker bbb-soffice

# This script receives three params
# Param 1: Input office file path (e.g. "/tmp/test.odt")
# Param 2: Output pdf file path (e.g. "/tmp/test.pdf")
# Param 3: Output format (pdf default)
# Param 4: Timeout (secs) (optional)
# Param 5: Speaker notes output directory (optional, PDF output only). When set,
#          the same LibreOffice run that creates the PDF also saves the notes
#          of every visible slide as <dir>/slide-N.txt. That run stops early
#          enough to leave time for copying the PDF: notes that take too long
#          are dropped, and the PDF is still delivered

if (( $# == 0 )); then
	echo "Missing parameter 1 (Input office file path)";
	exit 1
elif (( $# == 1 )); then
	echo "Missing parameter 2 (Output pdf file path)";
	exit 1
fi;


#Create tmp dir for conversion
mkdir -p "/tmp/bbb-soffice-$(whoami)/"
tempDir="$(mktemp -d -p /tmp/bbb-soffice-$(whoami)/)"
trap 'rm -fr "$tempDir"' EXIT

source="$1"
dest="$2"

#If output format is missing, define PDF
convertTo="${3:-pdf}"
convertToParam="--convert-to $convertTo"

#If timeout is missing, define 60
timeoutSecs="${4:-60}"
#Truncate timeout to max 3 digits (as expected by sudoers)
timeoutSecs="${timeoutSecs:0:3}"

#If output is html, include param --writer to avoid blank page
if [ ${1: -5} == ".html" ]
then
	convertToParam="$convertToParam --writer"
fi

#If the speaker notes directory is missing, do not save notes
speakerNotesDest="${5:-}"

cp "${source}" "$tempDir/file"
plainTimeoutSecs=$timeoutSecs
notesRun=0
if [ -n "$speakerNotesDest" ] && [ "$convertTo" == "pdf" ]
then
	#Leave a quarter of the time (at least 10s) for the copy or the plain conversion below,
	#and stop reading notes at half of it
	reserveSecs=$(( timeoutSecs / 4 > 10 ? timeoutSecs / 4 : 10 ))
	notesTimeoutSecs=$(( timeoutSecs - reserveSecs ))
	notesDeadlineSecs=$(( timeoutSecs / 2 ))
	if (( notesTimeoutSecs >= 10 ))
	then
		#A failure here falls back to the plain conversion below
		sudo /usr/bin/docker run --rm --memory=1g --memory-swap=1g --network none --env="HOME=/tmp/" -w /tmp/ --user=$(printf %05d `id -u`) -v "$tempDir/":/data/ -v /usr/share/fonts/:/usr/share/fonts/:ro -v /usr/share/fontconfig/:/usr/share/fontconfig/:ro -v /etc/fonts/:/etc/fonts/:ro -v /var/cache/fontconfig/:/var/cache/fontconfig/:ro --rm bbb-soffice sh -c "timeout $(printf %03d $notesTimeoutSecs)s /usr/local/bin/bbb-soffice-convert-with-speaker-notes $(printf %03d $notesDeadlineSecs)" || true
		notesRun=1
		plainTimeoutSecs=$(( timeoutSecs - SECONDS - 5 ))
	fi
fi
#The PDF of the notes run is used whenever it was written, even if reading the notes failed
if [ ! -f "$tempDir/file.$convertTo" ]
then
	rm -rf "$tempDir/speakernotes"
	if (( notesRun == 1 && plainTimeoutSecs < 10 ))
	then
		echo "Not enough time left for the plain conversion"
		exit 1
	fi
	sudo /usr/bin/docker run --rm --memory=1g --memory-swap=1g --network none --env="HOME=/tmp/" -w /tmp/ --user=$(printf %05d `id -u`) -v "$tempDir/":/data/ -v /usr/share/fonts/:/usr/share/fonts/:ro -v /usr/share/fontconfig/:/usr/share/fontconfig/:ro -v /etc/fonts/:/etc/fonts/:ro -v /var/cache/fontconfig/:/var/cache/fontconfig/:ro --rm bbb-soffice sh -c "timeout $(printf %03d $plainTimeoutSecs)s /usr/bin/soffice -env:UserInstallation=file:///tmp/ $convertToParam --outdir /data /data/file"
fi
cp "$tempDir/file.$convertTo" "${dest}"
#Notes are copied only when every slide was saved; a failure here keeps the PDF
if [ -n "$speakerNotesDest" ] && [ -f "$tempDir/speakernotes/.complete" ]
then
	rm -f "$tempDir/speakernotes/.complete"
	rm -rf "$speakerNotesDest"
	mkdir -p "$speakerNotesDest" && cp -r "$tempDir/speakernotes/." "$speakerNotesDest/" || rm -rf "$speakerNotesDest"
fi
exit 0
