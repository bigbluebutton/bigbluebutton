#!/bin/bash
# Refactored PDF page processing script with improved error handling

# Exit immediately on errors, unset variables, or pipe failures.
set -euo pipefail

# Source environment variables; these should define settings like THUMBNAIL_SCALE, PNG_SCALE_TO, etc.
#source /etc/systemd/system/doc-process.env

# Ensure exactly one argument is provided.
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <meetingId_presId_page>"
  exit 1
fi

# Parse input argument (expected format: meetingId_presId_page)
IFS='_' read -r MEETING_ID PRESENTATION_ID PAGE_NUMBER <<<"$1"

# Define directories and file paths based on the provided IDs.
BASE_DIR="${PRESENTATIONS_DIR}/${MEETING_ID}/${MEETING_ID}/${PRESENTATION_ID}"
PDF_FILE="${BASE_DIR}/${PRESENTATION_ID}.pdf"
TEXT_DIR="${BASE_DIR}/textfiles"
THUMBNAIL_DIR="${BASE_DIR}/thumbnails"
PNG_DIR="${BASE_DIR}/pngs"
SVG_DIR="${BASE_DIR}/svgs"
SVG_FILE="${SVG_DIR}/slide${PAGE_NUMBER}.svg"

#--------------------------------------------
# Convert a specific page of the PDF to a text file.
#--------------------------------------------
/usr/bin/pdftotext -raw -nopgbrk -enc UTF-8 -f "$PAGE_NUMBER" -l "$PAGE_NUMBER" "$PDF_FILE" "${TEXT_DIR}/slide-${PAGE_NUMBER}.txt"

#--------------------------------------------
# Generate a thumbnail image for the page.
#--------------------------------------------
/usr/bin/pdftocairo -png -scale-to "$THUMBNAIL_SCALE" -f "$PAGE_NUMBER" -l "$PAGE_NUMBER" $PDF_FILE "${THUMBNAIL_DIR}/thumb"
# Pdf cairo saves as thumb-01.png, and BBB expects thumb-1.png, renaming
mv "${THUMBNAIL_DIR}/thumb-0${PAGE_NUMBER}.png" "${THUMBNAIL_DIR}/thumb-${PAGE_NUMBER}.png" 2>/dev/null || true

# --------------------------------------------
#  Optionally generate PNG if enabled.
# --------------------------------------------
if [ "${GENERATE_PNGS}" = "true" ]; then
  echo "generatePngs flag enabled"
  /usr/bin/pdftocairo -png -scale-to "$PNG_SCALE_TO" -f "$PAGE_NUMBER" -l "$PAGE_NUMBER" "$PDF_FILE" "${PNG_DIR}/slide"
  # Pdf cairo saves as slide-01.png, and BBB expects slide-1.png, renaming
  mv "${PNG_DIR}/slide-0${PAGE_NUMBER}.png" "${PNG_DIR}/slide-${PAGE_NUMBER}.png" 2>/dev/null || true
fi

# --------------------------------------------
#  Function: detect_type3_fonts
#  Checks for Type 3 fonts on the given PDF page and returns a numeric flag.
#  Returns 0 if no Type 3 fonts are detected (no rasterization required),
#  or a non-zero value if they are detected.
#  Debug output is sent to stderr.
# --------------------------------------------
detect_type3_fonts() {
  local attempt=1
  local rasterize=0
  local fonts_cmd="pdffonts -f ${PAGE_NUMBER} -l ${PAGE_NUMBER} ${PDF_FILE} | grep -m 1 'Type 3' | wc -l"

  while [ "$attempt" -le "$PDF_FONTS_MAX_ATTEMPTS" ]; do
    echo "Attempt #${attempt} to detect Type 3 fonts." >&2
    # Run the command with a timeout.
    local output
    output=$(timeout "${PDF_FONTS_TIMEOUT}s" /bin/sh -c "${fonts_cmd}") || true
    local exit_code=$?
    if [ "$exit_code" -eq 124 ]; then
      echo "Command timed out after ${PDF_FONTS_TIMEOUT} seconds." >&2
      attempt=$((attempt + 1))
      if [ "$attempt" -gt "$PDF_FONTS_MAX_ATTEMPTS" ]; then
        echo "Command failed after $PDF_FONTS_MAX_ATTEMPTS attempts due to repeated timeouts." >&2
        exit 1
      fi
    elif [ "$exit_code" -eq 0 ]; then
      echo "Type 3 fonts detection output: ${output}" >&2
      # Trim whitespace from output so that arithmetic tests work.
      rasterize=$(echo "$output" | tr -d '[:space:]')
      break
    else
      echo "Type 3 fonts detection command failed with exit code $exit_code." >&2
      exit "$exit_code"
    fi
  done
  echo "$rasterize"
}

#--------------------------------------------
# Determine if rasterization is required based on font detection.
#--------------------------------------------
if [ "$RASTERIZE_SLIDE_FORCE" = "true" ]; then
  echo "forceRasterizeSlides flag enabled"
  REQUIRES_RASTERIZE=1
else
  FONT_TYPE3_DETECTED=$(detect_type3_fonts)

  #--------------------------------------------
  # If no Type 3 fonts are found, try converting PDF to SVG.
  #--------------------------------------------
  if [ "$FONT_TYPE3_DETECTED" -eq 0 ]; then
    echo "No Type 3 fonts detected. Converting PDF page ${PAGE_NUMBER} to SVG."
    pdftocairo -r $SVG_RESOLUTION_PPI -svg -q -f ${PAGE_NUMBER} -l ${PAGE_NUMBER} ${PDF_FILE} ${SVG_FILE}

    set +e
    svg_size=$(stat -c%s "$SVG_OUTPUT" 2>/dev/null)
    svg_size=${svg_size:-0}
    num_paths=$(grep -o "<path\b" "$SVG_OUTPUT" | wc -l)
    num_images=$(grep -o 'xlink:href="data:image/png;base64' "$SVG_OUTPUT" | wc -l) # count imbedded images
    set -e

    if [ "$svg_size" -eq 0 ]; then
      echo "Empty SVG"
      REQUIRES_RASTERIZE=1
    elif [ "$num_paths" -gt "$MAX_SVG_PATHS" ]; then
      echo "Excessive Paths in the generated SVG"
      REQUIRES_RASTERIZE=1
    elif [ "$num_imgs" -gt "$MAX_SVG_IMGS" ]; then
      echo "Excessive Images in the generated SVG"
      REQUIRES_RASTERIZE=1
    fi

  else
    REQUIRES_RASTERIZE=1
  fi

fi

# TODO convert -resize ratio
# # talvez nao se um chamar o outro

#--------------------------------------------
# Validate the generated SVG file.
#--------------------------------------------
# svg_size=$(stat -c%s "$SVG_FILE" 2>/dev/null || echo 0)
# num_paths=$(xmlstarlet sel -t -v "count(//svg:path)" "$SVG_FILE" 2>/dev/null || echo 0)
# num_imgs=$(xmlstarlet sel -t -v "count(//svg:image)" "$SVG_FILE" 2>/dev/null || echo 0)

# If the SVG file is empty, or contains too many paths/images, or if rasterization is flagged,
# then perform rasterization.
if [ "$REQUIRES_RASTERIZE" -eq 1 ]; then
  echo "proceeding with Rasterization."
  rm -f "$SVG_FILE"

  # Create a temporary PNG file and ensure it is removed on exit.
  temp_png=$(mktemp)
  trap 'rm -f "${temp_png}"*' EXIT

  PNG_FILE="${BASE_DIR}/${PRESENTATION_ID}_${PAGE_NUMBER}"

  echo "Converting PDF page ${PAGE_NUMBER} to PNG."

  pdftocairo -r "$SVG_RESOLUTION_PPI" -png -singlefile -scale-to-x "$RASTERIZE_PNG_WIDTH" -scale-to-y -1 -q \
    -f "${PAGE_NUMBER}" -l "${PAGE_NUMBER}" "${PDF_FILE}" "${PNG_FILE}"
  conv_exit_code=$?
  if [ "$conv_exit_code" -ne 0 ]; then
    echo "PDF to PNG conversion failed with exit code $conv_exit_code." >&2
    exit "$conv_exit_code"
  else
    echo "PDF converted to PNG successfully."
  fi

  PNG_FILE="${PNG_FILE}.png"

  # Verify the PNG file exists and is non-empty.
  if [ ! -e "${PNG_FILE}" ]; then
    echo "Converted PNG file not found. Exiting." >&2
    exit 1
  fi

  png_size=$(stat -c%s "${PNG_FILE}" 2>/dev/null || echo 0)
  if [ "$png_size" -eq 0 ]; then
    echo "PNG file is empty. Exiting." >&2
    exit 1
  fi
  echo "PNG file generated with size ${png_size} bytes." >&2

  /usr/local/bin/bbb-process-image.sh "${MEETING_ID}_${PRESENTATION_ID}_${PAGE_NUMBER}_png"
  exit 0

fi

exit 0
