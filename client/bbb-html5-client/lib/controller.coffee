config = require '../config'
log = require './bbblogger'

moduleDeps = ["MessageBus", "ClientProxy"]

module.exports = class Controller

  constructor: ->
    config.modules.wait moduleDeps, =>
      @messageBus = config.modules.get("MessageBus")
      @clientProxy = config.modules.get("ClientProxy")

      @messageBus.receiveMessages (data) =>
        @processReceivedMessage(data)

  processReceivedMessage: (data, callback) ->
    @clientProxy.sendToClients(data, callback)

  # Processes a message requesting authentication
  processAuthMessage: (data, callback) ->
    log.info({ data: data }, "Sending an authentication request and waiting for reply")
    @messageBus.sendAndWaitForReply data, (err, result) ->
      console.log "\n I am waiting for a reply"
      if err?
        log.error({ reason: err, result: result, original: data }, "Authentication failure")
        callback(err, null)
      else
        if result.payload?.valid
          log.info({ result: result }, "Authentication successful")
          callback(null, result)
        else
          log.info({ result: result }, "Authentication failure")
          callback(new Error("Authentication failure"), null)
        console.log "\n I am no longer waiting for a reply"

    # processEndMessage: (data, callback) ->
    #   @clientProxy.endMeeting()
