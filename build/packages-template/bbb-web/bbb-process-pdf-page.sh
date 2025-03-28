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
# NOTE: Pdf cairo save as thumb-01.png, and BBB expects thumb-1.png, renaming
mv "${THUMBNAIL_DIR}/thumb-0${PAGE_NUMBER}.png" "${THUMBNAIL_DIR}/thumb-${PAGE_NUMBER}.png" 2>/dev/null || true

# --------------------------------------------
#  Optionally generate a higher resolution PNG if enabled.
# --------------------------------------------
if [ "${GENERATE_PNGS}" = "true" ]; then
  /usr/bin/pdftocairo -png -scale-to "$PNG_SCALE_TO" -f "$PAGE_NUMBER" -l "$PAGE_NUMBER" "$PDF_FILE" "${PNG_DIR}/slide"
  #Pdf cairo save as slide-01.png, and BBB expects slide-1.png, renaming
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
  REQUIRES_RASTERIZE=1
else
  REQUIRES_RASTERIZE=$(detect_type3_fonts)
fi

#--------------------------------------------
# If no Type 3 fonts are found, try converting PDF to SVG.
#--------------------------------------------
if [ "$REQUIRES_RASTERIZE" -eq 0 ]; then
  echo "No Type 3 fonts detected. Converting PDF page ${PAGE_NUMBER} to SVG."
  pdftocairo -r $SVG_RESOLUTION_PPI -svg -q -f ${PAGE_NUMBER} -l ${PAGE_NUMBER} ${PDF_FILE} ${SVG_FILE} &&
    cat ${SVG_FILE} | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2
fi

# TODO convert -resize ratio

#--------------------------------------------
# Validate the generated SVG file.
#--------------------------------------------
svg_size=$(stat -c%s "$SVG_FILE" 2>/dev/null || echo 0)
num_paths=$(xmlstarlet sel -t -v "count(//svg:path)" "$SVG_FILE" 2>/dev/null || echo 0)
num_imgs=$(xmlstarlet sel -t -v "count(//svg:image)" "$SVG_FILE" 2>/dev/null || echo 0)

# If the SVG file is empty, or contains too many paths/images, or if rasterization is flagged,
# then perform rasterization.
if [ "$svg_size" -eq 0 ] || [ "$num_paths" -gt "$MAX_SVG_PATHS" ] || [ "$num_imgs" -gt "$MAX_SVG_IMGS" ] || [ "$REQUIRES_RASTERIZE" -eq 1 ]; then
  echo "Rasterizing PDF because of empty SVG, excessive paths/images, or rasterization flag." >&2
  rm -f "$SVG_FILE"

  # If no Type 3 fonts were detected but we reached here, exit with an error.
  if [ "$REQUIRES_RASTERIZE" -eq 0 ]; then
    echo "Potential issue with generated SVG. Exiting." >&2
    exit 1
  fi

  # Create a temporary PNG file and ensure it is removed on exit.
  temp_png=$(mktemp)
  trap 'rm -f "${temp_png}"*' EXIT

  echo "Converting PDF page ${PAGE_NUMBER} to PNG." >&2

  pdftocairo -r "$SVG_RESOLUTION_PPI" -png -singlefile -scale-to-x "$RASTERIZE_PNG_WIDTH" -scale-to-y -1 -q \
    -f "${PAGE_NUMBER}" -l "${PAGE_NUMBER}" "${PDF_FILE}" "${temp_png}"
  conv_exit_code=$?
  if [ "$conv_exit_code" -ne 0 ]; then
    echo "PDF to PNG conversion failed with exit code $conv_exit_code." >&2
    exit "$conv_exit_code"
  else
    echo "PDF converted to PNG successfully." >&2
  fi

  # Verify the PNG file exists and is non-empty.
  if [ ! -e "${temp_png}.png" ]; then
    echo "Converted PNG file not found. Exiting." >&2
    exit 1
  fi

  png_size=$(stat -c%s "${temp_png}.png" 2>/dev/null || echo 0)
  if [ "$png_size" -eq 0 ]; then
    echo "PNG file is empty. Exiting." >&2
    exit 1
  fi
  echo "PNG file generated with size ${png_size} bytes." >&2

  # Encode the PNG image in base64 and check its size against browser limits.
  base64_png=$(base64 -w 0 "${temp_png}.png")
  base64_size=${#base64_png}
  browser_limit=$((4 * 1024 * 1024))
  if [ "$base64_size" -gt "$browser_limit" ]; then
    echo "Encoded PNG is too large for browser display." >&2
  else
    # Determine image dimensions (defaulting if detection fails).
    width=$PNG_DEFAULT_WIDTH
    height=$PNG_DEFAULT_HEIGHT
    IFS=' ' read png_width png_height <<<"$(identify -format "%w %h" "${temp_png}.png" 2>/dev/null || echo "$PNG_DEFAULT_WIDTH $PNG_DEFAULT_HEIGHT")"

    if [ "$png_width" -ne 0 ] && [ "$png_height" -ne 0 ]; then
      width=$png_width
      height=$png_height
    fi

    echo "Writing PNG data as inline image to SVG file." >&2
    cat <<EOF >"$SVG_FILE"
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <image href="data:image/png;base64,${base64_png}" width="${width}" height="${height}"/>
</svg>
EOF
    # Optionally, adjust the SVG file to include additional namespace attributes.
    svg_size=$(stat -c%s "$SVG_FILE" 2>/dev/null || echo 0)
    if [ "$svg_size" -gt 0 ]; then
      sed -i '4s|>| xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.2">|' "$SVG_FILE"
    fi
  fi
fi

exit 0
