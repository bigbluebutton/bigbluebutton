#!/usr/bin/env bash

IFS='_' read -r MEETING_ID PRES_ID FORMAT <<< "$1"

PARENT_DIR="/var/bigbluebutton/${MEETING_ID}/${MEETING_ID}/${PRES_ID}"
IMG="${PARENT_DIR}/${PRES_ID}.${FORMAT}"
TEXT_DIR="${PARENT_DIR}/textfiles"
THUMB_DIR="${PARENT_DIR}/thumbnails"
PNG_DIR="${PARENT_DIR}/pngs"
SVG_DIR="${PARENT_DIR}/svgs"

echo "No text could be retrieved for the slide" > "${TEXT_DIR}/slide-${PAGE}.txt"

/usr/bin/convert -thumbnail 150x150 "$IMG" "${THUMB_DIR}/thumb-1.png"

pdf="${PNG_DIR}/slide-1.pdf"
CONV_TIMEOUT=7
output="$(timeout ${CONV_TIMEOUT}s) /usr/bin/convert $IMG -auto-orient $pdf"
exit_code=$?

if [ $exit_code -eq 0 ]; then
	/usr/bin/pdftocairo -png -scale-to 800 -f "$PAGE" -l "$PAGE" "$pdf" "${PNG_DIR}/slide"
else
	echo "PDF conversion failed with exit code $exit_code"
fi

pdf="${SVG_DIR}/slide-1.pdf"
output="$(timeout ${CONV_TIMEOUT}s) /usr/bin/convert $IMG -auto-orient $pdf"
exit_code=$?

if [ $exit_code -ne 0 ]; then
    	echo "PDF conversion failed with exit code $exit_code"
	exit $exit_code
fi

PDF_FONTS_CMD="pdffonts -f ${PAGE} -l ${PAGE} ${PDF} | grep -m 1 'Type 3' | wc -l"
PDF_FONTS_TIMEOUT=3
MAX_ATTEMPTS=3
attempt=1
rasterize=0

while [ $attempt -le $MAX_ATTEMPTS ]; do
        echo "Attempt #$attempt to detect Type 3 fonts."

        OUTPUT="$(timeout "${PDF_FONTS_TIMEOUT}s" /bin/sh -c "${PDF_FONTS_CMD}")"
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
        echo "Rasterization not required. Converting PDF to SVG."
        SVG_CONV_CMD="pdftocairo -r 300 -svg -q -f ${PAGE} -l ${PAGE} ${PDF} ${SVG} && cat ${SVG} | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2"
        OUTPUT="$(timeout "${SVG_CONV_TIMEOUT}s" /bin/sh -c "${SVG_CONV_CMD}")"
        exit_code=$?
        echo "Conversion command exited with ${exit_code}"
fi

svg_size=$(stat -c%s "$SVG" 2>/dev/null || echo 0)
NUM_PATHS=$(xmlstarlet sel -t -v "count(//svg:path)" "$SVG" 2>/dev/null || echo 0)
NUM_IMAGES=$(xmlstarlet sel -t -v "count(//svg:image)" "$SVG" 2>/dev/null || echo 0)

if [ $svg_size -eq 0 ] || [ $NUM_PATHS -gt 800 ] || [ $NUM_IMAGES -gt 800 ] || [ $rasterize -eq 1 ]; then
	echo "Rasterizing PDF"

   	rm -f "$SVG"

	if [ $rasterize -eq 0 ]; then
		echo "Potential problem with generated SVG"
		exit 1
	fi

	TEMP_PNG=$(mktemp)

	trap 'rm -f "$TEMP_PNG"*' EXIT

	echo "Converting PDF to PNG"

	PNG_CONV_CMD="pdftocairo -r 300 -png -singlefile -scale-to-x 2048 -scale-to-y -1 -q -f ${PAGE} -l ${PAGE} ${PDF} ${TEMP_PNG}"
	OUTPUT="$(timeout "${SVG_CONV_TIMEOUT}s" /bin/sh -c "${PNG_CONV_CMD}")"
  	exit_code=$?

	if [ $exit_code -eq 124 ]; then
		echo "PDF to PNG conversion timed out."
	fi

	PNG_SIZE=$(stat -c%s "${TEMP_PNG}.png" 2>dev/null || echo 0)

	if [ $PNG_SIZE -gt 0 ]; then
		BASE64_ENCODED_PNG="$(base64 -w 0 "${TEMP_PNG}.png")"
		BASE64_SIZE=${#BASE64_ENCODED_PNG}
		BROWSER_LIMIT=$((4 * 1024 * 1024))

		if [ $BASE64_SIZE -gt $BROWSER_LIMIT ]; then
			echo "Encoded PNG is too large for the browser."
		else
			width=500
			height=500

			read PNG_WIDTH PNG_HEIGHT < <(identify -format "%w %h" "${TEMP_PNG}.png")

			if [ $PNG_WIDTH -ne 0 ] && [ $PNG_HEIGHT -ne 0 ]; then
				width=$PNG_WIDTH
				height=$PNG_HEIGHT
			fi

			echo "Writing PNG content to ${SVG}"

			SVG_CONTENT=$(cat <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
	<image href="data:image/png;base64,${BASE64_ENCODED_PNG}" width="${width}" height="${height}"/>
</svg>
EOF
)

			echo "$SVG_CONTENT" > "$SVG"
			svg_size=$(stat -c%s "$SVG")

                	if [ $svg_size -gt 0 ]; then
                        	sed -i '4s|>| xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.2">|' "$SVG"
                	fi
		fi
	fi
fi

exit 0

