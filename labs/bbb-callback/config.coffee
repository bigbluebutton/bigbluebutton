# Global configurations file

# load the local configs
# config = require("./config_local")
config = {}

# BigBlueButton configs
config.bbb = {}
# TODO: move secret to a config_local file
config.bbb.sharedSecret = "0009786e5fdca882747c29081db64ecd"
config.bbb.apiPath = "/bigbluebutton/api"

config.bbb.responses = {}
config.bbb.responses.failure = (key, msg) ->
  "<response> \
     <returncode>FAILED</returncode> \
     <messageKey>" + key + "</messageKey> \
     <message>" + msg + "</message> \
   </response>"
config.bbb.responses.checksumError =
  config.bbb.responses.failure("checksumError", "You did not pass the checksum security check.")

# Web server configs
config.server = {}
config.server.port = 3005

# Web hooks configs
config.hooks = {}
config.hooks.pchannel = "bigbluebutton:*"

# Filters to the events we want to generate callback calls for
config.hooks.events = [
  { channel: "bigbluebutton:from-bbb-apps:meeting", name: "meeting_created_message" },
  { channel: "bigbluebutton:from-bbb-apps:meeting", name: "meeting_destroyed_event" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_joined_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "presenter_assigned_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_left_message" }
  # { channel: "bigbluebutton:from-bbb-apps:meeting", name: "user_registered_message" },
]

module.exports = config
