#!/bin/bash

#echo "First arg: $1"
#echo "Second arg: $2"

#foldername=$(date +"%Y%m%d-%H%M%S")
#filename=$(basename $1)

#foldername="/tmp/bbb-libreoffice-conversion/$(cat /proc/sys/kernel/random/uuid)"


#tmpDirectory="/tmp/bbb-libreoffice-conversion/$(cat /proc/sys/kernel/random/uuid)"

while [ -z "$randomDirectoryName" -o -d "/tmp/bbb-libreoffice-conversion/$randomDirectoryName" ]; do
        randomDirectoryName=$(shuf -i 100000000-999999999 -n 1)
done

#randomDirectoryName=001

mkdir -p "/tmp/bbb-libreoffice-conversion/"
mkdir "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/"
cp "$1" "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/file"
sudo /usr/bin/docker run --rm --network none --env="HOME=/tmp/" -w /tmp/ --user=$(printf %05d `id -u`) -v "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/":/data/ --rm bbb-soffice sh -c "/usr/bin/soffice -env:UserInstallation=file:///tmp/ --convert-to pdf --outdir /data /data/file"
cp "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/file.pdf" "$2"
rm -r "/tmp/bbb-libreoffice-conversion/$randomDirectoryName/"

exit 0
