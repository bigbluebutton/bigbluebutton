exploringHapi
=============

This was used as a playground for attempts to validate URL parameters
and to calculate and compare checksum

Keywords: hapi, joi, OAuth, checksum, hmac_sha1

Instructions:
=============
from Terminal:
$ coffee index.coffee
Listening on http://x.x.x.x:PORT

go to the browser, open an MCONF API-MATE window
modify the "server"(id="input-custom-server-url") field to http://x.x.x.x:PORT
click on the link for creating a meeting ("create ...")

In the Terminal window you should see something like:
the checksum from url is 
e8b540ab61a71c46ebc99e7250e2ca6372115d9a and mine is
e8b540ab61a71c46ebc99e7250e2ca6372115d9a
YAY! They match!

or

the checksum from url is 
e8b540ab61a71c46ebc99e7250e2ca6372115d9a and mine is
dkfjhdkjfhlkafhdfklahfkfhfjhkgfeq349492a

The browser window will display
"everything is fine" if the parameter validation was successful
or Error if it was not


LOGGING
  # To use for CLI
  npm install -g bunyan

https://github.com/trentm/node-bunyan

