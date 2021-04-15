#!/bin/bash
# Conversion of office files to Pdf using local docker bbb-soffice

# This script receives three params
# Param 1: Input office file path (e.g. "/tmp/test.odt")
# Param 2: Output pdf file path (e.g. "/tmp/test.pdf")
# Param 3: Output format (pdf default)

while [ -z "$randomDirectoryName" -o -d "/tmp/bbb-libreoffice-conversion/$randomDirectoryName" ]; do
        randomDirectoryName=$(shuf -i 100000000-999999999 -n 1)
done

#If output format is missing, define PDF
convertTo="${3:-pdf}"
convertToParam="--convert-to $convertTo"

#If output is html, include param --writer to avoid blank page
if [ ${1: -5} == ".html" ]
then
	convertToParam="$convertToParam --writer"
fi

mkdir -p "/tmp/bbb-libreoffice-conversion/"
chmod 777 "/tmp/bbb-libreoffice-conversion/"
mkdir "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/"
cp "$1" "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/file"
sudo /usr/bin/docker run --rm --network none --env="HOME=/tmp/" -w /tmp/ --user=$(printf %05d `id -u`) -v "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/":/data/ --rm bbb-soffice sh -c "/usr/bin/soffice -env:UserInstallation=file:///tmp/ $convertToParam --outdir /data /data/file"
cp "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/file.$convertTo" "$2"
rm -r "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/"

exit 0
