bus = require './messagebus'
log = require './bbblogger'

exports.processLoginMessage = (data, callback) ->
  bus.sendMessage(data, (err, result) ->
    if (err)
      errLog = {reason: err, data: data}
      log.error({error: errLog}, 'Authentication Failure')
      callback(err, null)
    else
      log.info("SUCCESS: #{result}")
      if result.error?
        log.info({error: result.error}, 'Authentication Failure')
        callback(result.error, null) 
      else
        log.info({response: result.data}, 'Authentication Success')
        callback(null, result.data)
  )
