# Utility class with methods used throughout the entire application.
module.exports = class Utils

  # This function is used to parse a variable value from a cookie string.
  # The cookie string has the following format:
  #   'sessionid=IjHl91D3q3bo5Fcn3s1814x7.cO88njbTfRExzv%2BmfsWeGHqPTE0oPLoTlEjRhkgkvrc; meetingid=183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377867869314'
  #
  # @param  {String} cookieStr The cookie to parse.
  # @param  {String} varName         The variable to extract from the cookie.
  # @return {String} The value of the variable extracted.
  @getCookieVar = (cookieStr, varName) ->
    if cookieStr
      cookieItems = cookieStr.split(";")
      for cookieItem in cookieItems
        x = cookieItem.substr(0, cookieItem.indexOf("="))
        y = cookieItem.substr(cookieItem.indexOf("=") + 1)
        x = x.replace(/^\s+|\s+$/g, "")
        return unescape(y) if x is varName
    else
      console.log "Invalid cookie"
      ""
