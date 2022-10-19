#!/bin/bash
#
# CGI script to accept POSTs with a hostname in the query string and an X.509 CSR as post data.
#
# Returns a signed certificate.  Expects our pre-configured CA data to be in /opt/ca.
#
# Basic outline of a bash CGI script https://sodocumentation.net/bash/topic/9603/cgi-scripts
# (Stack Overflow documentation)

exec 2>/dev/null    # We dont want any error messages be printed to stdout
trap "response_with_html && exit 0" ERR    # response with an html message when an error occurred and close the script

function response_with_html(){    
    echo "Content-type: text/html"
    echo ""
    echo "<!DOCTYPE html>"
    echo "<html><head>"
    echo "<title>456</title>"
    echo "</head><body>"
    echo "<h1>456</h1>"
    echo "<p>Attempt to communicate with the server went wrong.</p>"
    echo "<hr>"
    echo "$SERVER_SIGNATURE"
    echo "</body></html>"
}
        
if [ "$REQUEST_METHOD" = "POST" ]; then
   
    # The environment variable $CONTENT_LENGTH describes the size of the data
    read -d '' -n "$CONTENT_LENGTH" QUERY_STRING_POST        # read datastream 

    HOSTNAME="$QUERY_STRING"

    # Generate certificate
    cd /tmp
    echo "$QUERY_STRING_POST" > $HOSTNAME.csr
    cat > $HOSTNAME.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = $HOSTNAME
EOF
    TIMESTAMP=$(date +%s%N)
    openssl x509 -req -in $HOSTNAME.csr -CA /opt/ca/bbb-dev-ca.crt -CAkey /opt/ca/bbb-dev-ca.key \
        -set_serial $TIMESTAMP -out $HOSTNAME.crt -days 825 -sha256 \
        -extfile $HOSTNAME.ext

    echo "Content-type: application/x-x509-user-cert"
    echo ""
    cat $HOSTNAME.crt

else
    response_with_html
    exit 0
fi

exit 0
