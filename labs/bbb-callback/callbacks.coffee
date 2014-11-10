_ = require("lodash")
async = require("async")
redis = require("redis")

CallbackURL = require("./callback_url")

# Helper class to fetch the list of callbacks from redis.
module.exports = class Callbacks

  constructor: ->
    @subscriber = redis.createClient()
    @client = redis.createClient()
    @meetings = []
    @_subscribe()

  getCallbackUrls: (callback) ->
    tasks = []
    @meetings.forEach (meetingId) =>
      console.log "Callbacks: checking callbacks for the meeting", meetingId
      tasks.push (done) =>

        @client.lrange "meeting:#{meetingId}:subscriptions", 0, -1, (error, subscriptions) =>
          # TODO: treat error
          @_getCallbackUrlsForSubscriptions meetingId, subscriptions, done

    async.series tasks, (errors, result) ->
      result = _.flatten result
      console.log "Callbacks#getCallbackUrls: returning", result
      callback?(errors, result)

  _getCallbackUrlsForSubscriptions: (meetingId, subscriptions, callback) ->
    tasks = []
    subscriptions.forEach (sid, index) =>

      tasks.push (done) =>
        @client.hgetall "meeting:#{meetingId}:subscription:#{sid}", (error, redisData) ->
          # TODO: treat error
          console.log "Callbacks: creating callbackUrl for", redisData
          cb = new CallbackURL()
          cb.mapFromRedis redisData
          done null, cb

    async.series tasks, (errors, result) ->
      console.log "Callbacks#_getCallbackUrlsForSubscriptions: returning", result
      callback?(errors, result)


  # TODO: for now we have to check for all meetings created and store their internal
  # meeting ID so we can read from redis the callbacks registered for these meetings
  _subscribe: ->
    @subscriber.on "subscribe", (channel, count) ->
      console.log "Callbacks: subscribed to " + channel
    @subscriber.on "message", (channel, message) =>
      console.log "Callbacks: got message [", channel, "]", message
      try
        message = JSON.parse(message)

        if message.header?.name is "meeting_created_message"
          @_addMeeting(message.payload?.meeting_id)

        # TODO: remove meetings from the list

      catch e
        # TODO: handle the error properly
        console.log e

    @subscriber.subscribe "bigbluebutton:from-bbb-apps:meeting"

  _addMeeting: (meetingId) ->
    unless _.contains(@meetings, meetingId)
      console.log "Callbacks: adding meeting to the list", meetingId
      @meetings.push meetingId
