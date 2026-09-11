#!/bin/sh
src="$8"
dest="$(echo $8 | sed -E -e 's/html|odt/'$7'/')"
convertTo="$7"


curl -v -F "data=@${src}" -k https://collabora:9980/cool/convert-to/$convertTo > "${dest}"

exit 0
