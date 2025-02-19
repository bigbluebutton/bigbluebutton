#!/usr/bin/env bash

IFS='_' read -r MEETING_ID PRES_ID PAGE <<< "$1"

PARENT_DIR="/var/bigbluebutton/${MEETING_ID}/${MEETING_ID}/${PRES_ID}"
PDF="${PARENT_DIR}/${PRES_ID}.pdf"
TEXT_DIR="${PARENT_DIR}/textfiles"
THUMB_DIR="${PARENT_DIR}/thumbnails"
PNG_DIR="${PARENT_DIR}/pngs"
SVG_DIR="${PARENT_DIR}/svgs"

/usr/bin/pdftotext -raw -nopgbrk -enc UTF-8 -f "$PAGE" -l "$PAGE" \
	"$PDF" "${TEXT_DIR}/slide-${PAGE}.txt"

/usr/bin/pdftocairo -png -scale-to 150 -f "$PAGE" -l "$PAGE" "$PDF" "${THUMB_DIR}/thumb"

/usr/bin/pdftocairo -png -scale-to 800 -f "$PAGE" -l "$PAGE" "$PDF" "${PNG_DIR}/slide"

PDF_FONTS_CMD="pdffonts -f ${PAGE} -l ${PAGE} ${PDF} | grep -m 1 'Type 3' | wc -l"
PDF_FONTS_TIMEOUT=3
MAX_ATTEMPTS=3
attempt=1
rasterize=0

while [ $attempt -le $MAX_ATTEMPTS ]; do
	echo "Attempt #$attempt to detect Type 3 fonts."

	OUTPUT="$(timeout ${PDF_FONTS_TIMEOUT}s /bin/sh -c "${PDF_FONTS_CMD}")"
	exit_code=$?

	if [ $exit_code -eq 124 ]; then
		echo "Command timeout after ${PDF_FONTS_TIMEOUT} seconds."
       	       	attempt=$((attempt+1))

		if [ $attempt -gt $MAX_ATTEMPTS ]; then
 			echo "Command failed after $MAX_ATTEMPTS attempts due to repeated timeouts."
			exit 1
		fi
	elif [ $exit_code -eq 0 ]; then
		echo "Type 3 fonts found: ${OUTPUT}"
		rasterize=$OUTPUT
		break
	else
		echo "Command failed with exit code $exit_code."
		exit $exit_code
	fi
done

SVG="${SVG_DIR}/slide${PAGE}.svg"
SVG_CONV_TIMEOUT=60

if [ $rasterize -eq 0 ]; then
	echo "Rasterization not requied. Converting PDF to SVG."
	SVG_CONV_CMD="pdftocairo -r 300 -svg -q -f ${PAGE} -l ${PAGE} ${PDF} ${SVG} && cat ${SVG} | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2"
	OUTPUT="$(timeout ${SVG_CONV_TIMEOUT}s /bin/sh -c "${SVG_CONV_CMD}")"
	exit_code=$?
	exit $exit_code
fi
