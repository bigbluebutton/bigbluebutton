# Global configurations file

# load the local configs
# config = require("./config_local")
config = {}

# BigBlueButton configs
config.bbb = {}
# TODO: move secret to a config_local file
config.bbb.sharedSecret = "0009786e5fdca882747c29081db64ecd"
config.bbb.apiPath = "/bigbluebutton/api"

# Web server configs
config.server = {}
config.server.port = 3005

# Web hooks configs
config.hooks = {}
config.hooks.pchannel = "bigbluebutton:*"
config.hooks.meetingsChannel = "bigbluebutton:from-bbb-apps:meeting"

# Filters to the events we want to generate callback calls for
config.hooks.events = [
  { channel: "bigbluebutton:from-bbb-apps:meeting", name: "meeting_created_message" },
  { channel: "bigbluebutton:from-bbb-apps:meeting", name: "meeting_destroyed_event" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_joined_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "presenter_assigned_message" },
  { channel: "bigbluebutton:from-bbb-apps:users", name: "user_left_message" }
  # { channel: "bigbluebutton:from-bbb-apps:meeting", name: "user_registered_message" },
]

config.api = {}
config.api.responses = {}
config.api.responses.failure = (key, msg) ->
  "<response> \
     <returncode>FAILED</returncode> \
     <messageKey>" + key + "</messageKey> \
     <message>" + msg + "</message> \
   </response>"
config.api.responses.checksumError =
  config.api.responses.failure("checksumError", "You did not pass the checksum security check.")

config.api.responses.subscribeSuccess = (id) ->
  "<response> \
     <returncode>SUCCESS</returncode> \
     <subscriptionID>#{id}</subscriptionID> \
   </response>"
config.api.responses.subscribeFailure =
  config.api.responses.failure("subscribeEventError", "An error happened while storing your subscription. Check the logs.")

config.api.responses.unsubscribeSuccess =
  "<response> \
     <returncode>SUCCESS</returncode> \
     <unsubscribed>true</unsubscribed> \
   </response>"
config.api.responses.unsubscribeFailure =
  config.api.responses.failure("unsubscribeEventError", "An error happened while unsubscribing. Check the logs.")
config.api.responses.unsubscribeNoSubscription =
  config.api.responses.failure("unsubscribeMissingSubscription", "The subscription informed was not found.")

config.api.responses.missingParamCallbackURL =
  config.api.responses.failure("missingParamCallbackURL", "You must specify a callbackURL in the parameters.")
config.api.responses.missingParamSubscriptionID =
  config.api.responses.failure("missingParamSubscriptionID", "You must specify a subscriptionID in the parameters.")

module.exports = config
