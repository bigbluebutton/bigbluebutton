#!/bin/bash
# This script processes a presentation slide by generating a thumbnail, PDF,
# and converting it to SVG (or rasterizing it via PNG when needed).
# It expects a single argument in the format: meetingId_presId_format

# Exit immediately if a command exits with a non-zero status, if a variable is undefined,
# or if any command in a pipeline fails.
set -euo pipefail

# Load environment variables (e.g. PNG_X_SCALE, PNG_SCALE_TO, timeouts, etc.)
#source /etc/systemd/system/doc-process.env

# Validate input arguments
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <meetingId_presId_format>"
  exit 1
fi

# Extract meeting ID, presentation ID, and image format from the input argument
IFS='_' read -r MEETING_ID PRES_ID IMG_FORMAT <<<"$1"

# Define directory paths and file locations
BASE_DIR="${PRESENTATIONS_DIR}/${MEETING_ID}/${MEETING_ID}/${PRES_ID}"
IMAGE_FILE="${BASE_DIR}/${PRES_ID}.${IMG_FORMAT}"
TEXT_DIR="${BASE_DIR}/textfiles"
THUMBNAIL_DIR="${BASE_DIR}/thumbnails"
PNG_DIR="${BASE_DIR}/pngs"
SVG_DIR="${BASE_DIR}/svgs"

THUMBNAIL_OUTPUT="${THUMBNAIL_DIR}/thumb-1.png"
TEXT_OUTPUT="${TEXT_DIR}/slide-1.txt"

# Write default text for the slide
echo "No text could be retrieved for the slide" >"${TEXT_OUTPUT}"

# Create a thumbnail using ImageMagick
/usr/bin/convert -thumbnail "${IMG_THUMB_DIM}" "$IMAGE_FILE" "${THUMBNAIL_OUTPUT}"

# Convert image to PDF for SVG conversion (and perhaps for png)
PDF_FOR_SVG_OR_PNG="${BASE_DIR}/slide-1.pdf"
if ! timeout "${IMG_CONV_TIMEOUT}s" /usr/bin/convert "$IMAGE_FILE" -auto-orient "$PDF_FOR_SVG_OR_PNG"; then
  echo "PDF conversion for SVG generation failed."
  exit 1
fi

# If PNG generation is enabled, convert the image to PDF then to PNG
if [ "${GENERATE_PNGS}" = "true" ]; then
  /usr/bin/pdftocairo -png -scale-to "${PNG_SCALE_TO}" -f 1 -l 1 "$PDF_FOR_SVG_OR_PNG" "${PNG_DIR}/slide"
fi

# Define output SVG file
SVG_OUTPUT="${SVG_DIR}/slide1.svg"

echo "Converting PDF to SVG."
SVG_CONV_CMD="pdftocairo -r ${SVG_RESOLUTION_PPI} -svg -q -f 1 -l 1 ${PDF_FOR_SVG_OR_PNG} ${SVG_OUTPUT} && \
               cat ${SVG_OUTPUT} | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2"
svg_conv_output=$(timeout "${SVG_CONV_TIMEOUT}s" /bin/sh -c "${SVG_CONV_CMD}")
conv_exit_code=$?
echo "SVG conversion command exited with code ${conv_exit_code}"

# Validate the generated SVG file by checking its size and element counts
svg_size=$(stat -c%s "$SVG_OUTPUT" 2>/dev/null || echo 0)
num_paths=$(xmlstarlet sel -t -v "count(//svg:path)" "$SVG_OUTPUT" 2>/dev/null || echo 0)
num_images=$(xmlstarlet sel -t -v "count(//svg:image)" "$SVG_OUTPUT" 2>/dev/null || echo 0)

if [ "$svg_size" -eq 0 ] || [ "$num_paths" -gt "${MAX_SVG_PATHS}" ] || [ "$num_images" -gt "${MAX_SVG_IMGS}" ]; then
  echo "SVG file is invalid or contains too many elements; proceeding with rasterization."
  rm -f "$SVG_OUTPUT"

  # Create a temporary file for PNG conversion and ensure cleanup on exit
  TEMP_PNG=$(mktemp)
  trap 'rm -f "${TEMP_PNG}"*' EXIT

  echo "Converting PDF to PNG for rasterized SVG creation."
  PAGE=1 # Define the page number for conversion
  PNG_CONV_CMD="pdftocairo -r ${SVG_RESOLUTION_PPI} -png -singlefile -scale-to-x ${PNG_X_SCALE} -scale-to-y ${PNG_Y_SCALE} -q -f ${PAGE} -l ${PAGE} ${PDF_FOR_SVG_OR_PNG} ${TEMP_PNG}"
  png_conv_output=$(timeout "${SVG_CONV_TIMEOUT}s" /bin/sh -c "${PNG_CONV_CMD}")
  conv_exit_code=$?
  if [ $conv_exit_code -eq 124 ]; then
    echo "PDF to PNG conversion timed out."
  fi

  PNG_FILE="${TEMP_PNG}.png"
  png_size=$(stat -c%s "${PNG_FILE}" 2>/dev/null || echo 0)

  if [ "$png_size" -gt 0 ]; then
    base64_png=$(base64 -w 0 "${PNG_FILE}")
    base64_size=${#base64_png}
    browser_limit=$((4 * 1024 * 1024))

    if [ "$base64_size" -gt $browser_limit ]; then
      echo "Encoded PNG exceeds the browser size limit."
    else
      # Set default dimensions and update if the PNG file contains valid size information
      width="${PNG_DEFAULT_WIDTH}"
      height="${PNG_DEFAULT_HEIGHT}"
      read actual_width actual_height < <(identify -format "%w %h" "${PNG_FILE}" 2>/dev/null || echo "0 0")
      if [ "$actual_width" -ne 0 ] && [ "$actual_height" -ne 0 ]; then
        width="$actual_width"
        height="$actual_height"
      fi

      echo "Embedding PNG data into SVG container."
      SVG_CONTENT=$(
        cat <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <image href="data:image/png;base64,${base64_png}" width="${width}" height="${height}"/>
</svg>
EOF
      )
      echo "$SVG_CONTENT" >"$SVG_OUTPUT"
      svg_size=$(stat -c%s "$SVG_OUTPUT")

      # If the SVG file was successfully written, add additional namespace attributes
      if [ "$svg_size" -gt 0 ]; then
        sed -i '4s|>| xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.2">|' "$SVG_OUTPUT"
      fi
    fi
  else
    echo "PNG conversion did not produce a valid file."
    exit 1
  fi
fi

exit 0
