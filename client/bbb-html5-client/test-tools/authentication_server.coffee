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
      timestamp: new Date().getTime()
    payload:
      valid: true
      auth_token: message.payload.auth_token
      fullname: "Richard Alam"
      confname: "Demo Meeting"
      meeting_id: "Demo Meeting"
      external_meeting_id: "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1398367421601"
      user_id: "12345678901234567890234567890"
      external_user_id: "12345678901234567890234567890"
      conference: "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1398367421601"
      room: "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1398367421601"
      voice_bridge: 71234
      dial_number: "613-555-1234"
      web_voice_conf: 71234
      mode: "LIVE"
      record: false
      welcome: "Welcome to my humble meeting."
      logout_url: "http://10.0.3.181"
      default_layout: "NOLAYOUT"
      avatar_url: "http://10.0.3.181/client/avatar.png"

  console.log "Publishing", response, "to", PUBLISH_CHANNEL
  subClient.publish(PUBLISH_CHANNEL, JSON.stringify(response))

client.subscribe(SUBSCRIBE_CHANNEL)
