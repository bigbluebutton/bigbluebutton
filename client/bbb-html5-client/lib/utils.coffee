_ = require("lodash")

Logger = require("./logger")

# Utility class with methods used throughout the entire application.
module.exports = class Utils

  # This function is used to parse a variable value from a cookie string.
  # The cookie string has the following format:
  #   'sessionid=IjHl91D3q3bo5Fcn3s1814x7.cO88njbTfRExzv%2BmfsWeGHqPTE0oPLoTlEjRhkgkvrc; meetingid=183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377867869314'
  #
  # @param cookieStr [string] the cookie to parse.
  # @param varName [String] the variable to extract from the cookie.
  # @return [string] the value of the variable extracted.
  @getCookieVar = (cookieStr, varName) ->
    if cookieStr
      cookieItems = cookieStr.split(";")
      for cookieItem in cookieItems
        x = cookieItem.substr(0, cookieItem.indexOf("="))
        y = cookieItem.substr(cookieItem.indexOf("=") + 1)
        x = x.replace(/^\s+|\s+$/g, "")
        return unescape(y) if x is varName
    else
      Logger.error "Invalid cookie"
      ""

  # Logs a response to a method, using different log messages depending on the error
  # and reply given by the method.
  #
  # @param location [string] where the method was called, e.g. "RedisAction#getAll"
  # @param err [Error] the error returned by the method
  # @param reply [?] the reply, can be anything, but should return true when tested with `if reply`
  # @param message [string] an optional message to be printed together with the rest of the information
  @registerResponse = (location, err, reply, message="") ->
    hasMessage = message? and !_.isEmpty(message)
    if err?
      Logger.error "error on #{location}:(error:#{err})"
      Logger.error "> #{message}" if hasMessage
    else if reply
      Logger.info "success on #{location}:(reply:#{reply})"
      Logger.info "> #{message}" if hasMessage
    else
      Logger.warn "unknown on #{location}:(error:#{err}, reply:#{reply})"
      Logger.warn "> #{message}" if hasMessage
