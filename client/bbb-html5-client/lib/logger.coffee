# Pads the nice output to the longest log level.
pad = (str) ->
  max = 0
  i = 0
  l = levels.length

  while i < l
    max = Math.max(max, levels[i].length)
    i++
  return str + new Array(max - str.length + 1).join(" ")  if str.length < max
  str

# Log levels.
levels = [ "error", "warn", "info", "debug" ]

# Colors for log levels.
colors = [ 91, 93, 34, 90 ]

# Logger module, copied and adapted from SocketIO
#
# @method .info(message)
#   Prints an info message
# @method .error(message)
#   Prints an error message
# @method .warn(message)
#   Prints a warning message
# @method .debug(message)
#   Prints a debug message
#
# @see https://github.com/LearnBoost/socket.io
module.exports = class Logger
  @colors = false
  @level = 3
  @enabled = false

  # Saves to log and to req.flash to also show in a view.
  @flash = (req, type) ->
    args = toArray(arguments).slice(2)
    log.apply this, [ type ].concat(args)
    type = "success" if type is "info"
    req.flash type, args.join(" ")

# Generate methods for the types of log we want.
levels.forEach (name) ->
  Logger[name] = ->
    log.apply this, [ name ].concat(toArray(arguments))

# Standard log method.
log = (type) ->
  index = levels.indexOf(type)
  if index > Logger.level or
     not Logger.enabled or process.env.LOGGER_DISABLED
    return Logger
  now = new Date()
  if Logger.colors
    msg = [ "\u001b[" + colors[index] + "m[" + now.toISOString() + "] " + type + ":\u001b[39m" ]
  else
    msg = [ "[" + now.toISOString() + "] " + type + ":" ]
  console.log.apply console, msg.concat(toArray(arguments).slice(1))
  Logger

# Converts an enumerable to an array.
toArray = (enu) ->
  arr = []
  i = 0
  l = enu.length

  while i < l
    arr.push enu[i]
    i++
  arr
