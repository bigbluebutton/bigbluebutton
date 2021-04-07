#!/bin/bash
# Conversion of office files to Pdf using local docker bbb-soffice

# This script receives two params
# Param 1: Input office file path (e.g. "/tmp/test.odt")
# Param 2: Output pdf file path (e.g. "/tmp/test.pdf")

while [ -z "$randomDirectoryName" -o -d "/tmp/bbb-libreoffice-conversion/$randomDirectoryName" ]; do
        randomDirectoryName=$(shuf -i 100000000-999999999 -n 1)
done

mkdir -p "/tmp/bbb-libreoffice-conversion/"
mkdir "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/"
cp "$1" "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/file"
sudo /usr/bin/docker run --rm --network none --env="HOME=/tmp/" -w /tmp/ --user=$(printf %05d `id -u`) -v "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/":/data/ --rm bbb-soffice sh -c "/usr/bin/soffice -env:UserInstallation=file:///tmp/ --convert-to pdf --outdir /data /data/file"
cp "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/file.pdf" "$2"
rm -r "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/"

exit 0
