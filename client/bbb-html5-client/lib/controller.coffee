log = require './bbblogger'

config = require '../config'

moduleDeps = ["MessageBus"]

module.exports = class Controller

  constructor: ->
    config.modules.wait moduleDeps, =>
      @messageBus = config.modules.get("MessageBus")
      # @clientProxy = config.modules.get("ClientProxy")

  # registerMessageReceiver: (callback) ->
  #   messageReceiver = callback

  processLoginMessage: (data, callback) ->
    @messageBus.sendMessage data, (err, result) ->
      if err?
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

    # processEndMessage: (data, callback) ->
    #   @clientProxy.endMeeting()
