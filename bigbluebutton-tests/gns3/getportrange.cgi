#!/bin/bash
#
# CGI script to return a port range to a BBB server (hostname in the query string).
#
# This is a bit flaky, but it works.  Set a port range based on the
# server's IP address, to separate it from other servers.  We have 100
# IP addresses to pick from.  We assign 100 ports to each address, for
# a total range of 10,000 ports in the 16384-26384 range.  The first host
# is 100, so we add 6384 to 100*hostnum
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

if [ "$REQUEST_METHOD" = "GET" ]; then

    echo "Content-type: text/plain"
    echo ""
    hostnum=$(echo $REMOTE_ADDR | cut -d . -f 4)
    echo $((100*hostnum + 6384))-$((100*hostnum + 6384 + 99))
else
    response_with_html
    exit 0
fi

exit 0
