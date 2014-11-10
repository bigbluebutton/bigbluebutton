request = require("request")
redis = require("redis")

# Class that defines the application.
module.exports = class Application

  constructor: ->
    @subscriber = redis.createClient()
    @client = redis.createClient()

  start: ->
    @_subscribe()

  _subscribe: ->

    @subscriber.on "psubscribe", (channel, count) ->
      console.log "subscribed to " + channel

    @subscriber.on "pmessage", (pattern, channel, message) =>
      console.log "got message [", channel, "]", message

      try
        properties = JSON.parse(message)
      catch e
        properties = null
        # TODO: handle the error properly
        console.log e

      if properties?
        @client.lrange "meeting:" + properties.meetingID + ":subscriptions", 0, -1, (error, reply) =>
          reply.forEach (sid, index) =>
            console.log "subscriber id = " + sid
            @client.hgetall "meeting:" + properties.meetingID + ":subscription:" + sid, (err, rep) ->
              if rep.active is "true"
                properties.meetingID = rep.externalMeetingID
                post_options =
                  uri: rep.callbackURL
                  method: "POST"
                  json: properties

                request post_options, (error, response, body) ->
                  if not error and response.statusCode is 200
                    console.log "Error calling url: [" + post_options.uri + "]"
                    console.log "Error: [" + JSON.stringify(error) + "]"
                    console.log "Response: [" + JSON.stringify(response) + "]"
                  else
                    console.log "Passed calling url: [" + post_options.uri + "]"
                    console.log "Response: [" + JSON.stringify(response) + "]"

    @subscriber.psubscribe "bigbluebutton:*"
