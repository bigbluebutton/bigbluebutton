bus = require './messagebus'
logger = require './bbblogger'

class Controller
  constructor: (clientProxy) ->
    @proxy = clientProxy

  processLoginMessage = (data, callback) ->
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

exports.Controller = Controller