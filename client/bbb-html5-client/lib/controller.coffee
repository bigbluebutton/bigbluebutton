bus = require './messagebus'
log = require './bbblogger'

exports.processLoginMessage = (data, callback) ->
  bus.sendMessage(data, (err, result) ->
    if (err)
      errLog = {message: "Authentication Failure", reason: err, data: data}
      log.error(JSON.stringify(errLog))
      callback(err, null)
    else
      console.log("SUCCESS: #{result}")
      if result.error?
        callback(result.error, null) 
      else
        callback(null, result.data)
  )
