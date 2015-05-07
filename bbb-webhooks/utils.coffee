sha1 = require("sha1")
url = require("url")

config = require("./config")

Utils = exports

# Calculates the checksum given a url `fullUrl` and a `salt`, as calculate by bbb-web.
Utils.checksumAPI = (fullUrl, salt) ->
  query = Utils.queryFromUrl(fullUrl)
  method = Utils.methodFromUrl(fullUrl)
  Utils.checksum(method + query + salt)

# Calculates the checksum for a string.
# Just a wrapper for the method that actually does it.
Utils.checksum = (string) ->
  sha1(string)

# Get the query of an API call from the url object (from url.parse())
# Example:
#
# * `fullUrl` = `http://bigbluebutton.org/bigbluebutton/api/create?name=Demo+Meeting&meetingID=Demo`
# * returns: `name=Demo+Meeting&meetingID=Demo`
Utils.queryFromUrl = (fullUrl) ->

  # Returns the query without the checksum.
  # We can't use url.parse() because it would change the encoding
  # and the checksum wouldn't match. We need the url exactly as
  # the client sent us.
  query = fullUrl.replace(/&checksum=[^&]*/, '')
  query = query.replace(/checksum=[^&]*&/, '')
  query = query.replace(/checksum=[^&]*$/, '')
  matched = query.match(/\?(.*)/)
  if matched?
    matched[1]
  else
    ''

# Get the method name of an API call from the url object (from url.parse())
# Example:
#
# * `fullUrl` = `http://mconf.org/bigbluebutton/api/create?name=Demo+Meeting&meetingID=Demo`
# * returns: `create`
Utils.methodFromUrl = (fullUrl) ->
  urlObj = url.parse(fullUrl, true)
  urlObj.pathname.substr (config.bbb.apiPath + "/").length

# Returns the IP address of the client that made a request `req`.
# If can not determine the IP, returns `127.0.0.1`.
Utils.ipFromRequest = (req) ->

  # the first ip in the list if the ip of the client
  # the others are proxys between him and us
  if req.headers?["x-forwarded-for"]?
    ips = req.headers["x-forwarded-for"].split(",")
    ipAddress = ips[0]?.trim()

  # fallbacks
  ipAddress ||= req.headers?["x-real-ip"] # when behind nginx
  ipAddress ||= req.connection?.remoteAddress
  ipAddress ||= "127.0.0.1"
  ipAddress
