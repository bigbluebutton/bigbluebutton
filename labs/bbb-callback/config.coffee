# Global configurations file

# load the local configs
# config = require("./config_local")
config = {}

# BigBlueButton configs
config.bbb = {}
# TODO: move secret to a config_local file
config.bbb.sharedSecret = "33e06642a13942004fd83b3ba6e4104a"
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

# Retry intervals for failed attempts for perform callback calls.
# In ms. Totals to around 5min.
config.hooks.retryIntervals = [
  100, 500, 1000, 2000, 4000, 8000, 10000, 30000, 60000, 60000, 60000, 60000
]

# Redis
config.redis = {}
config.redis.keys = {}
config.redis.keys.hook = (id) -> "bigbluebutton:webhooks:hook:#{id}"
config.redis.keys.hooks = "bigbluebutton:webhooks:hooks"
config.redis.keys.mappings = "bigbluebutton:webhooks:mappings"

config.api = {}
config.api.responses = {}
config.api.responses.failure = (key, msg) ->
  "<response> \
     <returncode>FAILED</returncode> \
     <messageKey>#{key}</messageKey> \
     <message>#{msg}</message> \
   </response>"
config.api.responses.checksumError =
  config.api.responses.failure("checksumError", "You did not pass the checksum security check.")

config.api.responses.hookSuccess = (id) ->
  "<response> \
     <returncode>SUCCESS</returncode> \
     <hookID>#{id}</hookID> \
   </response>"
config.api.responses.hookFailure =
  config.api.responses.failure("createHookError", "An error happened while creating your hook. Check the logs.")
config.api.responses.hookDuplicated = (id) ->
  "<response> \
     <returncode>SUCCESS</returncode> \
     <hookID>#{id}</hookID> \
     <messageKey>duplicateWarning</messageKey> \
     <message>There is already a hook for this callback URL.</message> \
   </response>"

config.api.responses.destroySuccess =
  "<response> \
     <returncode>SUCCESS</returncode> \
     <removed>true</removed> \
   </response>"
config.api.responses.destroyFailure =
  config.api.responses.failure("destroyHookError", "An error happened while removing your hook. Check the logs.")
config.api.responses.destroyNoHook =
  config.api.responses.failure("destroyMissingHook", "The hook informed was not found.")

config.api.responses.missingParamCallbackURL =
  config.api.responses.failure("missingParamCallbackURL", "You must specify a callbackURL in the parameters.")
config.api.responses.missingParamHookID =
  config.api.responses.failure("missingParamHookID", "You must specify a hookID in the parameters.")

module.exports = config
