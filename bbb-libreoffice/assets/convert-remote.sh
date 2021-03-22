#/bin/bash
# This is a sample script - adjust it per your need
# 1 - setup a server with JOD-CONVERTER-REST ( docker run --memory 512m --rm -p 8080:8080 eugenmayer/jodconverter:rest )
# 2 - replace the HOST information in below command with your server host
#echo "Not configured"
#exit 1
curl -X POST "http://127.0.0.1:8080/lool/convert-to/pdf" -H "accept: application/octet-stream" -H "Content-Type: multipart/form-data" -F "data=@$1" > $2
