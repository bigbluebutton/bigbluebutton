# Super simple redis server to simulate the authentication that should be
# made by bbb-apps. Will receive an authentication request and respond to
# the request with the same information plus a success flag.
#
# Run with: `coffee authentication_server.coffee`

redis = require 'redis'

client = redis.createClient()
subClient = redis.createClient()

SUBSCRIBE_CHANNEL = "to-bbb-apps"
PUBLISH_CHANNEL = "from-bbb-apps"
REPLY_MSG_NAME = 'validate_auth_token_reply'
REQUEST_MSG_NAME = 'validate_auth_token_request'

client.on("message", (channel, message) ->
  console.log("Received [channel] = #{channel} [message] = #{message}")

  handleMessage(JSON.parse(message))
)

handleMessage = (message) ->
  if message.header.name?
    switch  message.header.name
      when REQUEST_MSG_NAME
        handleAuthenticateMessage message
      else
        console.log "Received unexpected message"

handleAuthenticateMessage = (message) ->
  console.log "Handling:", message
  response =
    header:
      name: REPLY_MSG_NAME
      correlation_id: message.header.correlation_id
    payload:
      valid: true
      auth_token: message.payload.auth_token
      user_id: message.payload.user_id
      meeting_id: message.payload.meeting_id
  console.log "Publishing", response, "to", PUBLISH_CHANNEL
  subClient.publish(PUBLISH_CHANNEL, JSON.stringify(response))

client.subscribe(SUBSCRIBE_CHANNEL)
