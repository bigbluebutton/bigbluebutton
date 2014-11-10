request = require("request")

# The representation of a callback URL and its properties, taken from redis.
module.exports = class CallbackURL

  # constructor: ->

  mapFromRedis: (redisData) ->
    @url = redisData?.callbackURL
    @externalMeetingID = redisData?.externalMeetingID
    @active = redisData?.active

  isActive: ->
    @active

  # TODO: use a queue and enqueue the message instead of sending it
  # use another class to manage the queue and make the callback calls
  enqueue: (message) ->
    console.log "CallbackURL: enqueueing message", message
    requestOptions =
      uri: @url
      method: "POST"
      json: message

    request requestOptions, (error, response, body) ->
      if not error and response.statusCode is 200
        console.log "Error calling url: [" + requestOptions.uri + "]"
        console.log "Error: [" + JSON.stringify(error) + "]"
        console.log "Response: [" + JSON.stringify(response) + "]"
      else
        console.log "Passed calling url: [" + requestOptions.uri + "]"
        console.log "Response: [" + JSON.stringify(response) + "]"
