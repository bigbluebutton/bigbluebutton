#!/bin/bash
# This script processes a presentation slide by generating a thumbnail, PDF,
# and converting it to SVG (or rasterizing it via PNG when needed).
# It expects a single argument in the format: meetingId_presId_format

# Exit immediately if a command exits with a non-zero status, if a variable is undefined,
# or if any command in a pipeline fails.
set -euo pipefail
# set -x # debug mode

# Load environment variables (e.g. PNG_X_SCALE, PNG_SCALE_TO, timeouts, etc.)
#source /etc/systemd/system/doc-process.env

# Validate input arguments
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <meetingId_presId_format>"
  exit 1
fi

# Extract meeting ID, presentation ID, and image format from the input argument
IFS='_' read -r MEETING_ID PRES_ID PAGE_NUMBER IMG_FORMAT <<<"$1"

echo "Starting bbb-process-image"

PAGE_NUMBER=${PAGE_NUMBER-1}

# Define directory paths and file locations
BASE_DIR="${PRESENTATIONS_DIR}/${MEETING_ID}/${MEETING_ID}/${PRES_ID}"
IMAGE_FILE="${BASE_DIR}/${PRES_ID}_${PAGE_NUMBER}.${IMG_FORMAT}"
TEXT_DIR="${BASE_DIR}/textfiles"
THUMBNAIL_DIR="${BASE_DIR}/thumbnails"
PNG_DIR="${BASE_DIR}/pngs"
SVG_DIR="${BASE_DIR}/svgs"

THUMBNAIL_OUTPUT="${THUMBNAIL_DIR}/thumb-${PAGE_NUMBER}.png"
TEXT_OUTPUT="${TEXT_DIR}/slide-${PAGE_NUMBER}.txt"

# Write default text for the slide
echo "No text could be retrieved for the slide" >"${TEXT_OUTPUT}"

# echo ${IMAGE_FILE}
# ls ${IMAGE_FILE} -l

# Check image width and height
IFS=' ' read IMAGE_WIDTH IMAGE_HEIGHT <<<"$(identify -format "%w %h" "${IMAGE_FILE}")" || {
  echo "Error extracting image dimensions"
  exit 1
}

if [ "$IMAGE_WIDTH" -gt "$MAX_IMAGE_WIDTH" ] || [ "$IMAGE_HEIGHT" -gt "$MAX_IMAGE_HEIGHT" ]; then
  echo "The image exceeds max dimension allowed, it will be resized"
  convert -resize "${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}" "${IMAGE_FILE}" "${IMAGE_FILE}"
fi

# Create a thumbnail using ImageMagick
/usr/bin/convert -thumbnail "${THUMBNAIL_SCALE}x${THUMBNAIL_SCALE}" "${IMAGE_FILE}" "${THUMBNAIL_OUTPUT}"

# Convert image to PDF for SVG conversion (and perhaps for png)
PDF_FOR_SVG_OR_PNG="${BASE_DIR}/slide-${PAGE_NUMBER}.png.pdf"
if ! /usr/bin/convert "$IMAGE_FILE" -auto-orient "$PDF_FOR_SVG_OR_PNG"; then
  echo "PDF conversion for SVG generation failed."
  exit 1
fi

# If PNG generation is enabled, convert the image to PDF then to PNG
if [ "${GENERATE_PNGS}" = "true" ]; then
  echo "generatePngs flag enabled"
  /usr/bin/pdftocairo -png -scale-to "${PNG_SCALE_TO}" -f 1 -l 1 "$PDF_FOR_SVG_OR_PNG" "${PNG_DIR}/slide"
  # Pdf cairo saves as slide-01.png, and BBB expects slide-1.png, renaming
  mv "${PNG_DIR}/slide-0${PAGE_NUMBER}.png" "${PNG_DIR}/slide-${PAGE_NUMBER}.png" 2>/dev/null || true
fi

# Define output SVG file
SVG_OUTPUT="${SVG_DIR}/slide${PAGE_NUMBER}.svg"

# Create a temporary file for PNG conversion and ensure cleanup on exit
TEMP_PNG=$(mktemp)
trap 'rm -f "${TEMP_PNG}"*' EXIT

echo "Converting PDF to PNG for rasterized SVG creation."
# PAGE=1 # Define the page number for conversion
# PAGE=$PAGE_NUMBER
pdftocairo -r ${SVG_RESOLUTION_PPI} -png -singlefile -scale-to-x ${RASTERIZE_PNG_WIDTH} -scale-to-y -1 -q -f 1 -l 1 ${PDF_FOR_SVG_OR_PNG} ${TEMP_PNG}

PNG_FILE="${TEMP_PNG}.png"
png_size=$(stat -c%s "${PNG_FILE}" 2>/dev/null || echo 0)

if [ "$png_size" -gt 0 ]; then
  base64_png=$(base64 -w 0 "${PNG_FILE}")
  base64_size=${#base64_png}
  browser_limit=$((4 * 1024 * 1024))

  if [ "$base64_size" -gt $browser_limit ]; then
    echo "Encoded PNG exceeds the browser size limit." >&2
    exit 1
  else
    # Set default dimensions and update if the PNG file contains valid size information
    IFS=' ' read png_width png_height <<<"$(identify -format "%w %h" "${PNG_FILE}")" || {
      echo "Error extracting Png dimensions, using default values instead"
      png_width="${PNG_DEFAULT_WIDTH}"
      png_height="${PNG_DEFAULT_HEIGHT}"
    }

    echo "Embedding PNG data into SVG container."
    SVG_CONTENT=$(
      cat <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${png_width}" height="${png_height}">
    <image href="data:image/png;base64,${base64_png}" width="${png_width}" height="${png_height}"/>
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

exit 0
